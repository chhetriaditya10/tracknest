import GoalModel from "../models/Goal.js";

export const addGoal = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || !goal.title || !goal.targetAmount) {
      return res.status(400).json({ success: false, message: "Missing required goal fields" });
    }

    const newGoal = new GoalModel({
      ...goal,
      userId: req.user.id,
      savedAmount: goal.savedAmount || 0,
    });

    const savedGoal = await newGoal.save();
    return res.status(201).json({ success: true, data: savedGoal });
  } catch (error) {
    console.error("Error in addGoal:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchGoals = async (req, res) => {
  try {
    const goals = await GoalModel.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, goals });
  } catch (error) {
    console.error("Error fetching goals:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching goals" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await GoalModel.findById(req.params.id);
    if (!goal || goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, category, targetAmount, savedAmount, dueDate, isActive, description } = req.body;
    if (title !== undefined) goal.title = title;
    if (category !== undefined) goal.category = category;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (savedAmount !== undefined) goal.savedAmount = savedAmount;
    if (dueDate !== undefined) goal.dueDate = dueDate;
    if (isActive !== undefined) goal.isActive = isActive;
    if (description !== undefined) goal.description = description;

    await goal.save();
    return res.status(200).json({ success: true, data: goal });
  } catch (error) {
    console.error("Error updating goal:", error.message);
    return res.status(500).json({ success: false, message: "Server error updating goal" });
  }
};

export const completeGoal = async (req, res) => {
  try {
    const goal = await GoalModel.findById(req.params.id);
    if (!goal || goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    goal.isActive = false;
    await goal.save();
    return res.status(200).json({ success: true, data: goal });
  } catch (error) {
    console.error("Error completing goal:", error.message);
    return res.status(500).json({ success: false, message: "Server error completing goal" });
  }
};

export const getGoalSummary = async (req, res) => {
  try {
    const goals = await GoalModel.find({ userId: req.user.id });
    const activeGoals = goals.filter((goal) => goal.isActive);
    const totalTarget = activeGoals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
    const totalSaved = activeGoals.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0);
    const nextGoal = activeGoals.sort((a, b) => (a.dueDate || new Date(9999, 0, 1)) - (b.dueDate || new Date(9999, 0, 1)))[0] || null;

    return res.status(200).json({
      success: true,
      summary: {
        totalTarget,
        totalSaved,
        activeGoals: activeGoals.length,
        nextGoal,
      },
    });
  } catch (error) {
    console.error("Error fetching goal summary:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching goal summary" });
  }
};
