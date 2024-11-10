import Channel from "App/Models/Channel";

class ChannelService {
  // service methods

  // Delete channel
  public async deleteChannel(channelId: number): Promise<void> {
    await (await Channel.findOrFail(channelId)).delete();
  }
}

export default new ChannelService();
