import { Exception } from "@adonisjs/core/build/standalone";
import Channel, { ChannelType } from "App/Models/Channel";

class ChannelService {
  // service methods

  // Create channel
  public async createChannel(
    channelName: string,
    channelType: ChannelType,
    createdBy: number,
  ): Promise<Channel> {
    //
    const channel = new Channel();
    channel.name = channelName;
    channel.type = channelType;
    channel.createdBy = createdBy;
    await channel.save();
    return channel;
  }

  // Delete channel
  public async deleteChannel(channelId: number): Promise<void> {
    await (await Channel.findOrFail(channelId)).delete();
  }

  public async isPrivate(channelId: number): Promise<boolean> {
    const channel = await Channel.findOrFail(channelId);
    return channel.type === ChannelType.Private;
  }

  // Checks if channel exists by its ID or name
  public async exists(
    channelId?: number,
    channelName?: string,
  ): Promise<Channel | null> {
    if (!channelId && !channelName) {
      throw new Exception("Channel name or channel id must be specified.", 400);
    }
    let channel: Channel | null;

    if (channelId) {
      channel = await Channel.find(channelId);
    } else {
      channel = await Channel.findBy("name", channelName);
    }

    return channel;
  }
}

export default new ChannelService();
