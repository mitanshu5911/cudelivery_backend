import cron from "node-cron";
import Request from "../models/Request.js";

const expireOldRequests = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const result = await Request.updateMany(
                {
                     status: "pending",
          createdAt: { $lte: sevenDaysAgo }
                },
                { status: "expired" }
            )

            console.log(`Expired requests updated: ${result.modifiedCount}`);
        } catch (error) {
            console.error("Error expiring requests:", error);
        }
    })
}

export default expireOldRequests;