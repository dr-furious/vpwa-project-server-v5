import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Channel, { ChannelType } from "App/Models/Channel";

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = "name";

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: "Football",
        type: ChannelType.Public,
        createdBy: 1,
        numberOfUsers: 4,
        numberOfMessages: 19,
      },
      {
        name: "Chill",
        type: ChannelType.Public,
        createdBy: 2,
        numberOfUsers: 4,
        numberOfMessages: 14,
      },
      {
        name: "D&D",
        type: ChannelType.Private,
        createdBy: 3,
        numberOfUsers: 4,
        numberOfMessages: 17,
      },
      {
        name: "Beer Wednesday",
        type: ChannelType.Private,
        createdBy: 3,
        numberOfUsers: 1,
        numberOfMessages: 0,
      },
      {
        name: "GoT Fans",
        type: ChannelType.Private,
        createdBy: 3,
        numberOfUsers: 1,
        numberOfMessages: 0,
      },
    ]);
  }
}
