const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const { loginLimiter } = require("./middleware/rateLimiter");

dotenv.config();

const app = express();

/* connect database */
connectDB();

/* middleware */
app.use(helmet());
app.use(cors());
app.use(express.json());

/* rate limiter */
app.use("/api/auth/login", loginLimiter);

/* routes */
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const groupRoutes = require("./routes/groupRoutes");
app.use("/api/groups", groupRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

const settlementRoutes = require("./routes/settlementRoutes");
app.use("/api/settlements", settlementRoutes);

/* error handler */
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

/* test route */
app.get("/", (req, res) => {
  res.send("Expense Splitter API running");
});

/* start server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});