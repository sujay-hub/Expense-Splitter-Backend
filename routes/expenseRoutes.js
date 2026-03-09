const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { validateExpense } = require("../middleware/validateExpense");
const validateRequest = require("../middleware/validateRequest");

const {
  addExpense,
  getGroupExpenses
} = require("../controllers/expenseController");

router.post("/add", authMiddleware, addExpense);

router.get("/:groupId", authMiddleware, getGroupExpenses);

router.post(
  "/add",
  authMiddleware,
  validateExpense,
  validateRequest,
  addExpense
);

module.exports = router;