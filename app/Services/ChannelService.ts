import Channel from "App/Models/Channel";

class ChannelService {
  // service methods

  // Delete channel
  public async deleteChannel(channelId: number): Promise<void> {
    Channel.query().where("id", channelId).delete();
  }
}

export default new ChannelService();
