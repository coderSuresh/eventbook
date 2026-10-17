import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRouter from "./routes"
import { authenticateJwt, authorizeRoles } from "./middlewares/auth.middleware";

const PORT = process.env["PORT"] || 3000;

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
}))

app.use(express.json());

app.get("/status", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/api/v1", apiRouter);

app.get('/protected', authenticateJwt, authorizeRoles("USER"), (_, res) => {
    res.json({ message: "This is a protected route" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});