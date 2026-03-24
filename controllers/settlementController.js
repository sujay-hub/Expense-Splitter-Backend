const Expense = require("../models/Expense");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getSettlements = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // 1. Fetching all expenses for the group
    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    // 2. Building balances
    for (const expense of expenses) {
      const share = expense.amount / expense.splitBetween.length;

      const paidBy = expense.paidBy.toString();

      // Payer gets full amount
      balances[paidBy] = (balances[paidBy] || 0) + expense.amount;

      // Each member owes share
      for (const user of expense.splitBetween) {
        const userId = user.toString();
        balances[userId] = (balances[userId] || 0) - share;
      }
    }

    // 3. Separating creditors and debtors
    const creditors = [];
    const debtors = [];

    for (const user in balances) {
      const balance = balances[user];

      if (balance > 0) {
        creditors.push({ user, amount: balance });
      } else if (balance < 0) {
        debtors.push({ user, amount: -balance });
      }
    }

    // 4. Settlement algorithm
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

    // 5. Fetch user names
    const userIds = Object.keys(balances).map(
      id => new mongoose.Types.ObjectId(id)
    );

    const users = await User.find({
      _id: { $in: userIds }
    }).select("name");

    // 6. Create map: userId → name
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.name;
    });

    // 7. Replacing IDs with names
    const settlementsWithNames = settlements.map(s => ({
      from: userMap[s.from] || s.from,
      to: userMap[s.to] || s.to,
      amount: s.amount
    }));

    // 8. Sending final response
    res.json(settlementsWithNames);

  } catch (error) {
    console.error("SETTLEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};