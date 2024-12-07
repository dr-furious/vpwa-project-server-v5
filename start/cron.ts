import cron from "node-cron";

cron.schedule("* * * * * *", async () => {
  console.log("Hello from cron!");
});
