import type { EventsList } from "@ioc:Adonis/Core/Event";
import ChannelUsersService from "App/Services/ChannelUsersService";

export default class ChannelUser {
  public async onNewUser(data: EventsList[]) {
    // do something
  }

  public async onUserLeftChannel(data: EventsList["user:leftChannel"]) {
    // do something
  }

  public async onKicksIncreased(data: EventsList["user:kicksIncreased"]) {
    const { userId, channelId } = data;
    // Check the number of kicks
    const result = await ChannelUsersService.getNumberOfKicks(
      channelId,
      userId,
    );
    // Hardcode (3) for now :( - and kick user
    if (result["kicks"] >= 15) {
      await ChannelUsersService.kickUser(channelId, userId);
    }
  }
}
