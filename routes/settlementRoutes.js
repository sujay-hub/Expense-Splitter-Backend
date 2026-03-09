const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getSettlements } = require("../controllers/settlementController");

router.get("/:groupId", authMiddleware, getSettlements);

module.exports = router;