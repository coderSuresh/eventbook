import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import apiRouter from "./routes/index.js";
import { authenticateJwt, authorizeRoles } from "./middlewares/auth.middleware.js";

const PORT = process.env["PORT"] || 3000;

const app = express();

app.set("trust proxy", 1); 

app.use(cors({
    credentials: true,
    origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
}))

app.use(express.json());
app.use(cookieParser());

app.get("/status", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/api/v1", apiRouter);

app.get('/protected', authenticateJwt, authorizeRoles("USER"), (_, res) => {
    res.json({ message: "This is a protected route" });
});

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

export { app, startServer };