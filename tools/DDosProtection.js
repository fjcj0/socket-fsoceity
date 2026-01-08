import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests",
    },
});
export const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 500,
});
const allowedAgents = [
    /Chrome/i,
    /Firefox/i,
    /Edg/i,
    /OPR/i,
    /Safari/i,
    /Android/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /wv/i,
    /Mobile/i,
];
const blockedAgents = [
    /curl/i,
    /wget/i,
    /postman/i,
    /insomnia/i,
    /httpclient/i,
    /bot/i,
    /spider/i,
    /crawl/i,
];
export const browserOnly = (request, response, next) => {
    const ua = request.headers["user-agent"] || "";
    if (blockedAgents.some((b) => b.test(ua))) {
        return response.status(403).json({
            success: false,
            message: "Bots or scripts are not allowed",
        });
    }
    if (!allowedAgents.some((a) => a.test(ua))) {
        return response.status(403).json({
            success: false,
            message: "Only browsers and mobile webviews are allowed",
        });
    }
    if (!request.headers["accept"] || !request.headers["accept-language"]) {
        return response.status(403).json({
            success: false,
            message: "Invalid browser request",
        });
    }
    next();
};