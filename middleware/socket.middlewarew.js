import 'dotenv/config';
import { jwtVerify } from 'jose';
import cookie from 'cookie';
import { prisma } from '../lib/prisma.js';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
export async function socketAuthMiddleware(socket, next) {
    try {
        const rawCookie = socket.handshake.headers.cookie;
        if (!rawCookie) {
            return next(new Error('No cookies found'));
        }
        const cookies = cookie.parse(rawCookie);
        const token = cookies.token;
        if (!token) {
            return next(new Error('No auth token'));
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = payload.user;
        if (!user?.id) {
            return next(new Error('Invalid or expired token'));
        }
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!dbUser) {
            return next(new Error('User not found'));
        }
        socket.user = dbUser;
        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
}