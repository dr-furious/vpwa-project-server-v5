// import Channel from "App/Models/Channel";
import User from "App/Models/User";
import Event from "@ioc:Adonis/Core/Event";
import { Exception } from "@adonisjs/core/build/standalone";

enum UserRole {
  Admin = "admin",
  Member = "member",
}

enum UserChannelStatus {
  PendingInvite = "pending_invite",
  InChannel = "in_channel",
  LeftChannel = "left_channel",
  KickedOut = "kicked_out",
}

class ChannelUsersService {
  // service methods

  public async handleKick(
    kickerId: number,
    userId: number,
    channelId: number,
  ): Promise<void> {
    // User must be part of the channel to be able to kick another user
    if (!(await this.isInChannel(kickerId, channelId))) {
      throw new Exception(
        "Cannot kick a user from channel you are not member of",
        403,
      );
    }

    // User must be part of the channel so he can be kicked
    if (!(await this.isInChannel(userId, channelId))) {
      throw new Exception(
        "Cannot kick a user from channel he does not belong to",
        403,
      );
    }

    // Admin cannot be kicked
    if (await this.isAdmin(userId, channelId)) {
      throw new Exception("Cannot kick admin", 403);
    }

    // If admin is kicking someone, kick immediatelly
    if (await this.isAdmin(userId, channelId)) {
      this.kickUser(channelId, userId);
      return;
    }

    // If member is kicking someone, increase kick count
    this.updateKickCount(userId, channelId);
  }

  // Leave channel
  public async leaveChannel(userId: number, channelId: number): Promise<void> {
    // User must be part of the channel so he can leave
    if (!(await this.isInChannel(userId, channelId))) {
      throw new Exception("Cannot leave a channel you do not belong to", 403);
    }

    await this.changeUserStatus(
      channelId,
      userId,
      UserChannelStatus.LeftChannel,
    );
    Event.emit("user:leftChannel", {
      channelId: channelId,
      isAdmin: await this.isAdmin(userId, channelId),
    });
  }

  public async getNumberOfKicks(
    channelId: number,
    userId: number,
  ): Promise<number> {
    return await (await User.findOrFail(userId))
      .related("channels")
      .pivotQuery()
      .where("channel_id", channelId)
      .firstOrFail();
  }

  // Update number of kicks
  private async updateKickCount(
    channelId: number,
    userId: number,
  ): Promise<void> {
    const userChannelPivot = await this.getNumberOfKicks(channelId, userId);
    const currentKicks = userChannelPivot["kicks"] || 0; // Get current kicks or default to 0
    await (
      await User.findOrFail(userId)
    )
      .related("channels")
      .pivotQuery()
      .where("channel_id", channelId)
      .update("kicks", currentKicks + 1); // Increment kicks by 1

    // Emit event
    Event.emit("user:kicksIncreased", { userId: userId, channelId: channelId });
  }

  // Checks if user is admin in channel - help by ChatGPT to construct the correct query
  private async isAdmin(userId: number, channelId: number): Promise<boolean> {
    const userRole = await User.query()
      .where("id", userId)
      .whereHas("channels", (channelQuery) => {
        channelQuery
          .where("channel_id", channelId)
          .wherePivot("user_role", UserRole.Admin);
      })
      .first();

    return !!userRole;
  }

  private async isInChannel(
    userId: number,
    channelId: number,
  ): Promise<boolean> {
    const exists = await (await User.find(userId))
      ?.related("channels")
      .pivotQuery()
      .where("channel_id", channelId)
      .where("user_channel_status", UserChannelStatus.InChannel)
      .first();
    return exists;
  }

  // Kick user from channel
  public async kickUser(channelId: number, userId: number): Promise<void> {
    await this.changeUserStatus(channelId, userId, UserChannelStatus.KickedOut);
  }

  private async changeUserStatus(
    channelId: number,
    userId: number,
    newStatus: UserChannelStatus,
  ): Promise<void> {
    await (await User.findOrFail(userId))
      .related("channels")
      .pivotQuery()
      .where("channel_id", channelId)
      .update("user_channel_status", newStatus);
  }
}

export default new ChannelUsersService();
