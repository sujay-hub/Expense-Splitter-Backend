const Group = require("../models/Group");

exports.getGroups = async (req, res) => {
  try {

    const groups = await Group.find({
      members: [req.user.id]
    });

    res.json(groups);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email"); // important

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createGroup = async (req, res) => {
  try {
    console.log("REQ.USER1", req.user);
    const { name } = req.body;

    const group = new Group({
      name,
      createdBy: req.user.id,
      members: [req.user.id]
    });
    await group.save();

    res.status(201).json(group);
    console.log("REQ.USER2", req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addMember = async (req, res) => {
  try {

    const { groupId, userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      // return res.status(404).json({ message: "Group not found" });
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    await group.save();

    res.json(group);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




const Expense = require("../models/Expense");

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