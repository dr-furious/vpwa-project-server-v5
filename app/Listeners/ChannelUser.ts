import type { EventsList } from "@ioc:Adonis/Core/Event";
import ChannelUsersService from "App/Services/ChannelUsersService";
import ChannelService from "App/Services/ChannelService";

export default class ChannelUser {
  public async onNewUser(data: EventsList[]) {
    // do something
  }

  public async onUserLeftChannel(
    data: EventsList["user:leftChannel"],
  ): Promise<void> {
    // If user was admin we should delete the channel
    const { userId, channelId, isAdmin } = data;

    if (!isAdmin) {
      return;
    }

    await ChannelService.deleteChannel(channelId);
  }

  public async onKicksIncreased(
    data: EventsList["user:kicksIncreased"],
  ): Promise<void> {
    const { userId, channelId } = data;
    // Check the number of kicks
    const result = await ChannelUsersService.getNumberOfKicks(
      channelId,
      userId,
    );
    // Hardcode (3) for now :( - and kick user
    if (result["kicks"] >= 3) {
      await ChannelUsersService.kickUser(channelId, userId);
    }
  }
}
