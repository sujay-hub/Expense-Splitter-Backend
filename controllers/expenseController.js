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

    res.status(201).json(expense);

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

exports.getGroupSettlements = async (req, res) => {
  try {

    const groupId = req.params.id;

    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    for (const expense of expenses) {

      const share = expense.amount / expense.splitBetween.length;

      // payer balance
      balances[expense.paidBy] =
        (balances[expense.paidBy] || 0) + expense.amount;

      // each member share
      for (const user of expense.splitBetween) {

        balances[user] =
          (balances[user] || 0) - share;

      }
    }

    const creditors = [];
    const debtors = [];

    for (const user in balances) {

      const amount = balances[user];

      if (amount > 0) {
        creditors.push({ user, amount });
      } else if (amount < 0) {
        debtors.push({ user, amount: -amount });
      }

    }

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {

      const debtor = debtors[i];
      const creditor = creditors[j];

      const payment = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: payment
      });

      debtor.amount -= payment;
      creditor.amount -= payment;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    res.json(settlements);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};