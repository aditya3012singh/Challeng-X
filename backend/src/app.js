import express from "express";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import testcaseRoutes from "./routes/testcase.route.js";
import submissionRoutes from "./routes/submission.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(cors({ // frontend
  credentials: true,               // 🔥 REQUIRED for cookies
}));

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);   
app.use("/problem", problemRoutes);
app.use("/testcase", testcaseRoutes);
app.use("/submissions", submissionRoutes);
export default app;
