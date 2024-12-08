import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Channel, { ChannelType } from "App/Models/Channel";
import { DateTime } from "luxon";

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = "name";

    await Channel.updateOrCreateMany(uniqueKey, [
      {
        name: "Football",
        type: ChannelType.Public,
        createdBy: 1,
      },
      {
        name: "Chill",
        type: ChannelType.Public,
        createdBy: 3,
      },
      {
        name: "D&D",
        type: ChannelType.Private,
        createdBy: 3,
      },
      {
        name: "BeerWednesday",
        type: ChannelType.Private,
        createdBy: 3,
      },
      {
        name: "GoT_Fans",
        type: ChannelType.Private,
        createdBy: 3,
      },
      {
        name: "IWillBeGone:(",
        type: ChannelType.Private,
        createdBy: 1,
      },
      {
        name: "IWillBeGoneToo:(",
        type: ChannelType.Private,
        createdBy: 1,
        createdAt: DateTime.fromSQL("2023-12-07 21:00:00.000000 +00:00"),
      },
    ]);
  }
}
