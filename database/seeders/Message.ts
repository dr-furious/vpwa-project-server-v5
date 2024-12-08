import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Message from "App/Models/Message";
import { DateTime } from "luxon";

export default class extends BaseSeeder {
  public async run() {
    await Message.createMany([
      {
        createdBy: 1,
        channelId: 1,
        content: "Hello, this is message 1!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "This is message 2!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "Hey, this is message 3!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Message 4 coming through!",
      },
      {
        createdBy: 1,
        channelId: 1,
        content: "This is message 5 in a different channel!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "Message 6, new channel, same user!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "Seventh message here!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Message 8 reporting in!",
      },
      {
        createdBy: 1,
        channelId: 1,
        content: "Message 9 from user 1 in channel 3!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "Message 10 here!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "This is message 11 in channel 3!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Twelfth message, back in channel 1!",
      },
      {
        createdBy: 1,
        channelId: 1,
        content: "Lucky number 13 from user 1!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "Fourteenth message!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "Message 15, second channel!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Sweet sixteen!",
      },
      {
        createdBy: 1,
        channelId: 1,
        content: "Message 17, back to channel 1!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "Eighteenth message in the second channel!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "Message 19 from user 3 in channel 1!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Twentieth message, channel 1!",
      },
      {
        createdBy: 1,
        channelId: 1,
        content: "Message 21 coming through!",
      },
      {
        createdBy: 2,
        channelId: 1,
        content: "Twenty-second message!",
      },
      {
        createdBy: 3,
        channelId: 1,
        content: "Message 23 here!",
      },
      {
        createdBy: 4,
        channelId: 1,
        content: "Message 24 from user 4!",
      },

      // channel2 messages
      {
        createdBy: 1,
        channelId: 2,
        content: "Another message here!",
      },

      // only message in channel that will cause that it will be deleted
      {
        createdBy: 1,
        channelId: 6,
        content: "Hasta la vista baby",
        createdAt: DateTime.fromSQL("2023-12-07 22:00:00.000000 +00:00"),
      },
    ]);
  }
}
