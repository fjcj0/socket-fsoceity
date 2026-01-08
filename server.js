import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { limiter, speedLimiter } from './tools/DDosProtection.js';
import { socketAuthMiddleware } from './middleware/socket.middlewarew.js';
import { socketRateLimit } from './tools/socketLimiter.js';
const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(limiter);
app.use(speedLimiter);
if (process.env.NODE_ENV !== 'development') {
    job.start();
}
app.get('/cron', (request, response) => {
    return response.status(200).json({
        success: true,
        message: 'cron job started....'
    });
});
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: `http://localhost:3000`,
        credentials: true
    },
    pingTimeout: 20000,
    pingInterval: 25000,
});
io.use(socketAuthMiddleware);
io.on("connection", (socket) => {
    socket.use(
        socketRateLimit({
            limit: 5,
            interval: 3000,
        })
    );
    const userId = socket.user.id;
    socket.join(userId);
    console.log(`User ${userId} joined`);
    console.log("Socket ID: ", socket.id);
    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});