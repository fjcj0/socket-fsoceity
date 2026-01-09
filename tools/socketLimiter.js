export function socketRateLimit({ limit, interval }) {
    return (socket, next) => {
        if (!socket.data) {
            socket.data = {};
        }
        if (!socket.data.rateLimit) {
            socket.data.rateLimit = {
                count: 0,
                start: Date.now(),
            };
        }
        const rate = socket.data.rateLimit;
        const now = Date.now();
        if (now - rate.start > interval) {
            rate.count = 0;
            rate.start = now;
        }
        rate.count += 1;
        if (rate.count > limit) {
            socket.emit("error", "Rate limit exceeded");
            socket.disconnect(true);
            return;
        }
        next();
    };
}