import InvestmentModel from "../models/Investments.js";

export const addInvestment = async (req, res) => {
  try {
    const { investment } = req.body;
    if (!investment || !investment.name || !investment.amount || !investment.date) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const newInvestment = new InvestmentModel({
      ...investment,
      userId: req.user.id,
      date: new Date(investment.date),
    });

    const savedInvestment = await newInvestment.save();
    return res.status(201).json({ success: true, data: savedInvestment });
  } catch (error) {
    console.error("Error in addInvestment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchInvestments = async (req, res) => {
  try {
    const investments = await InvestmentModel.find({ userId: req.user.id }).sort({ date: -1 });
    return res.status(200).json({ success: true, investments });
  } catch (error) {
    console.error("Server error during fetching investments:", error.message);
    return res.status(500).json({ success: false, message: "Server error during fetching investments" });
  }
};

export const fetchInvestmentSummary = async (req, res) => {
  try {
    const investments = await InvestmentModel.find({ userId: req.user.id });
    const total = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const grouped = investments.reduce((acc, item) => {
      const category = item.category || "Other";
      acc[category] = (acc[category] || 0) + Number(item.amount || 0);
      return acc;
    }, {});

    return res.status(200).json({ success: true, summary: { total, grouped, count: investments.length } });
  } catch (error) {
    console.error("Server error during investment summary:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching investment summary" });
  }
};
