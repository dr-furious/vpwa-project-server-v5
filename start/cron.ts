import { DateTime } from "luxon";
import Channel from "App/Models/Channel";
import cron from "node-cron";
import ChannelService from "App/Services/ChannelService";

// This function was created with help of chatGPT
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toSQL();

  // callback is mandatory
  const channelsWithoutMessages = await Channel.query()
    .whereDoesntHave("messages", () => {})
    .andWhere("createdAt", "<", thirtyDaysAgo);

  const channels = await Channel.query()
    .whereHas("messages", (query) => {
      query.where("createdAt", "<", thirtyDaysAgo);
    })
    .preload("messages", (query) => {
      query.orderBy("createdAt", "desc").limit(1);
    });

  console.log("--------------------");
  console.log("--- old messages ---");
  channels.forEach((channel) => {
    console.log(channel.name);
    ChannelService.deleteChannel(channel);
  });

  console.log("--- no messages  ---");
  channelsWithoutMessages.forEach((channel) => {
    console.log(channel.name);
    ChannelService.deleteChannel(channel);
  });
  console.log("--------------------\n");
});
