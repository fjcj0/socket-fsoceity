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
import { create_like, save_post } from './io/post.controller.js';
import { SendNotification } from './io/notification.controller.js';
import { send_contact_message } from './io/chat-contact.controller.js';
import job from './tools/cron.js';
const onlineUsers = new Set();
const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
    origin: process.env.SERVER,
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
        origin: process.env.SERVER,
        credentials: true
    },
    transports: ["websocket"],
});
io.use(socketAuthMiddleware);
io.on("connection", (socket) => {
    socket.use(socketRateLimit({ limit: 10, interval: 3000 }));
    const userId = socket.user.id;
    socket.join(userId);
    onlineUsers.add(userId);
    socket.on("get-online-users", () => {
        socket.emit("online-users", Array.from(onlineUsers));
    });
    console.log(`User ${userId} joined...`);
    console.log("Socket ID: ", socket.id);
    save_post(socket, io);
    create_like(socket, io);
    SendNotification(socket, io);
    send_contact_message(socket, io);
    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("online-users", Array.from(onlineUsers));
        console.log("User disconnected: ", socket.id);
    });
});
server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});