import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { limiter, speedLimiter } from './tools/DDosProtection.js';
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
});
io.on("connection", (socket) => {
    socket.join(socket.handshake.query.userId);
    console.log(`User ${userId} has been joined`);
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});