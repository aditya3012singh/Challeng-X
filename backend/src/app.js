import express from "express";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import testcaseRoutes from "./routes/testcase.route.js";
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);   
app.use("/problem", problemRoutes);
app.use("/testcase", testcaseRoutes);
export default app;
