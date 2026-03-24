const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
  try {

    const { groupId, description, amount, splitBetween } = req.body;
    console.log(req.user);

    const expense = new Expense({
      group: groupId,
      description,
      amount,
      paidBy: req.user.userId,
      splitBetween
    });

    await expense.save();

   const populatedExpense = await Expense.findById(expense._id)
  .populate("paidBy", "name email")
  .populate("splitBetween", "name email");

res.status(201).json(populatedExpense);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


exports.getGroupExpenses = async (req, res) => {

  try {

    const expenses = await Expense.find({
      group: req.params.groupId
    })
    .populate("paidBy", "name email")
    .populate("splitBetween", "name email");

    res.json(expenses);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.findByIdAndDelete(id);

    res.json({ message: "Expense deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

