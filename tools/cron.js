import cron from "cron";
import http from "http";
import https from "https";
const job = new cron.CronJob("*/20 * * * *", function () {
    const url = process.env.API_URL + "/cron";
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log("Cron → /cron request sent successfully");
        } else {
            console.log("Cron → /cron request failed:", res.statusCode);
        }
    }).on("error", (err) => {
        console.error("Cron request error:", err);
    });
});
export default job;