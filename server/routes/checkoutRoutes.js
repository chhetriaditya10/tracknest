import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { verifyToken, verifyPremium } from "../middlewares/middleware.js";

const router = express.Router();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const plans = {
  premium_monthly: {
    amount: 29900,
    label: "Premium Monthly",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || null,
  },
  premium_yearly: {
    amount: 199900,
    label: "Premium Yearly",
    interval: "year",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || null,
  },
  ultra_monthly: {
    amount: 39900,
    label: "Ultra Monthly",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ULTRA_MONTHLY || null,
  },
  ultra_yearly: {
    amount: 299900,
    label: "Ultra Yearly",
    interval: "year",
    stripePriceId: process.env.STRIPE_PRICE_ULTRA_YEARLY || null,
  },
};

const getPlanKey = (plan) => {
  if (!plan) return "premium_yearly";
  if (plan === "premium") return "premium_yearly";
  if (plan === "ultra") return "ultra_yearly";
  if (plans[plan]) return plan;
  return "premium_yearly";
};

const normalizePlan = (planMetadata) => {
  if (!planMetadata) return "premium";
  if (planMetadata.startsWith("ultra")) return "ultra";
  return "premium";
};

const getOrCreateStripeCustomer = async (user) => {
  if (!stripe || !user) return null;

  if (user.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (existing && !existing.deleted) return existing;
    } catch (error) {
      console.warn("Failed to retrieve stored Stripe customer, creating a new one:", error.message);
      user.stripeCustomerId = "";
      await user.save();
    }
  }

  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  if (customers.data?.length > 0) {
    const found = customers.data[0];
    user.stripeCustomerId = found.id;
    await user.save();
    return found;
  }

  const created = await stripe.customers.create({
    email: user.email,
    name: user.username,
  });
  user.stripeCustomerId = created.id;
  await user.save();
  return created;
};

router.post("/create-session", verifyToken, async (req, res) => {
  const { plan } = req.body;
  const normalizedPlan = getPlanKey(plan);
  const selectedPlan = plans[normalizedPlan];

  if (!selectedPlan) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in the server environment." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const customer = await getOrCreateStripeCustomer(user);
    if (!customer) {
      return res.status(500).json({ error: "Failed to create or retrieve Stripe customer." });
    }

    const origin = req.headers.origin || "http://localhost:5173";
    const lineItem = selectedPlan.stripePriceId
      ? { price: selectedPlan.stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: "npr",
            product_data: {
              name: selectedPlan.label,
              description: "TrackNest subscription",
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      metadata: {
        userId: user._id.toString(),
        plan: normalizedPlan,
      },
      line_items: [lineItem],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create Stripe checkout session." });
  }
});

router.get("/subscription-status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      subscriptionStatus: user.subscriptionStatus,
      plan: user.plan,
      premiumExpiresAt: user.premiumExpiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/confirm-subscription", verifyToken, async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID required" });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in the server environment." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.mode !== "subscription" || !session.subscription) {
      return res.status(400).json({ error: "Invalid Stripe subscription session." });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const plan = normalizePlan(session.metadata?.plan);
    const subscriptionStatus = ["active", "trialing", "past_due", "unpaid", "canceled"].includes(subscription.status)
      ? subscription.status
      : "active";

    user.subscriptionStatus = subscriptionStatus;
    user.plan = plan;
    user.stripeSubscriptionId = subscription.id;
    if (subscription.customer) {
      user.stripeCustomerId = subscription.customer.toString();
    }
    if (subscription.current_period_end) {
      user.premiumExpiresAt = new Date(subscription.current_period_end * 1000);
    }
    await user.save();

    return res.json({ success: true, plan: user.plan, subscriptionStatus: user.subscriptionStatus });
  } catch (error) {
    console.error("Confirm subscription error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const findUserByStripeSubscription = async (subscription) => {
  if (!subscription?.id) return null;
  let user = await User.findOne({ stripeSubscriptionId: subscription.id });
  if (user) return user;

  if (subscription.customer) {
    user = await User.findOne({ stripeCustomerId: subscription.customer.toString() });
    if (user) return user;

    try {
      const customer = await stripe.customers.retrieve(subscription.customer.toString());
      if (customer?.email) {
        user = await User.findOne({ email: customer.email });
        if (user) {
          user.stripeCustomerId = subscription.customer.toString();
          await user.save();
          return user;
        }
      }
    } catch (error) {
      console.warn("Could not retrieve Stripe customer for fallback email lookup:", error.message);
    }
  }

  return null;
};

const findUserFromSession = async (session) => {
  if (session.metadata?.userId) {
    const user = await User.findById(session.metadata.userId);
    if (user) return user;
  }

  if (session.customer_email) {
    const user = await User.findOne({ email: session.customer_email });
    if (user) return user;
  }

  if (session.customer) {
    const user = await User.findOne({ stripeCustomerId: session.customer.toString() });
    if (user) return user;
  }

  return null;
};

const retrieveSubscription = async (subscriptionRef) => {
  if (!stripe || !subscriptionRef) return null;
  if (typeof subscriptionRef === "object") return subscriptionRef;
  try {
    return await stripe.subscriptions.retrieve(subscriptionRef);
  } catch (error) {
    console.warn("Could not retrieve Stripe subscription:", error.message);
    return null;
  }
};

const updateUserSubscription = async (subscription, planOverride = null, statusOverride = null) => {
  if (!subscription) {
    return null;
  }

  const resolvedSubscription = typeof subscription === "string" ? await retrieveSubscription(subscription) : subscription;
  const user = await findUserByStripeSubscription(resolvedSubscription || { id: subscription, customer: subscription.customer });
  if (!user) {
    return null;
  }

  const status = statusOverride || resolvedSubscription?.status || subscription?.status || user.subscriptionStatus || "active";
  user.subscriptionStatus = status;

  if (planOverride) {
    user.plan = planOverride;
  } else if (["active", "trialing"].includes(status)) {
    if (user.plan !== "ultra" && user.plan !== "premium" && user.plan !== "admin") {
      user.plan = "premium";
    }
  } else if (["canceled", "unpaid", "past_due"].includes(status)) {
    user.plan = "free";
  }

  user.stripeSubscriptionId = resolvedSubscription?.id || user.stripeSubscriptionId;
  if (resolvedSubscription?.customer) {
    user.stripeCustomerId = resolvedSubscription.customer.toString();
  }
  if (resolvedSubscription?.current_period_end) {
    user.premiumExpiresAt = new Date(resolvedSubscription.current_period_end * 1000);
  }

  if (["canceled", "unpaid"].includes(status)) {
    user.premiumExpiresAt = null;
  }

  await user.save();
  return user;
};

export const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).send("Stripe is not configured.");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const plan = normalizePlan(session.metadata?.plan);
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const user = await findUserFromSession(session);
        if (!user) {
          console.warn("Stripe webhook could not locate user for session", {
            sessionId: session.id,
            metadata: session.metadata,
            customer_email: session.customer_email,
            customer: session.customer,
          });
          break;
        }

        user.stripeSubscriptionId = subscription.id;
        user.subscriptionStatus = subscription.status;
        user.plan = plan;
        if (session.customer) {
          user.stripeCustomerId = session.customer.toString();
        }
        if (subscription.current_period_end) {
          user.premiumExpiresAt = new Date(subscription.current_period_end * 1000);
        }
        await user.save();
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await updateUserSubscription(subscription);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await updateUserSubscription(subscription);
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    res.status(500).send(`Webhook processing error: ${error.message}`);
  }
};

export default router;
