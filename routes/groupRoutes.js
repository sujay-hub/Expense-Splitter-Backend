const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGroup,
  addMember,
  getGroupSettlements
} = require("../controllers/groupController");

router.post("/create", authMiddleware, createGroup);

router.post("/add-member", authMiddleware, addMember);

router.get("/:id/settlements", authMiddleware, getGroupSettlements);

module.exports = router;