const Expense = require("../models/Expense");

exports.getSettlements = async (req, res) => {

  try {

    const groupId = req.params.groupId;

    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    for (const expense of expenses) {

      const share = expense.amount / expense.splitBetween.length;

      // payer gets full amount
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

      // each member owes share
      for (const user of expense.splitBetween) {

        balances[user] = (balances[user] || 0) - share;

      }

    }

    const creditors = [];
    const debtors = [];

    for (const user in balances) {

      const balance = balances[user];

      if (balance > 0) {
        creditors.push({ user, amount: balance });
      } 
      else if (balance < 0) {
        debtors.push({ user, amount: -balance });
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