const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getGroups,
  getGroupById,
  createGroup,
  addMember,
  getGroupSettlements
} = require("../controllers/groupController");

router.get("/", authMiddleware, getGroups);

router.get("/:id", authMiddleware, getGroupById);

router.post("/create", authMiddleware, createGroup);

router.post("/add-member", authMiddleware, addMember);

//router.get("/:id/settlements", authMiddleware, getGroupSettlements);

module.exports = router;