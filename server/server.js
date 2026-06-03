const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");
const startOverdueJob = require("./src/jobs/overdueJob");
const paymentController = require("./src/controllers/paymentController");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://learning-management-system-sand-mu.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Stripe webhook must be before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.paymentWebhook
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Library Management System API running");
});

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/books", require("./src/routes/bookRoutes"));
app.use("/api/borrowings", require("./src/routes/borrowRoutes"));
app.use("/api/reservations", require("./src/routes/reservationRoutes"));
app.use("/api/reviews", require("./src/routes/reviewRoutes"));
app.use("/api/reports", require("./src/routes/reportRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/payments", require("./src/routes/paymentRoutes"));

startOverdueJob();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});