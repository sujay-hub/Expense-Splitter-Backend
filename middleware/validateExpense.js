const { body } = require("express-validator");

exports.validateExpense = [
  body("groupId").notEmpty().withMessage("Group ID is required"),
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number"),

  body("description")
    .notEmpty()
    .withMessage("Description required"),

  body("paidBy")
    .notEmpty()
    .withMessage("Payer required"),
];