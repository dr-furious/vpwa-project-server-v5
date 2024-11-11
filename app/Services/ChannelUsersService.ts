// import Channel from "App/Models/Channel";
import User from "App/Models/User";
import Event from "@ioc:Adonis/Core/Event";
import { Exception } from "@adonisjs/core/build/standalone";
import ChannelService from "./ChannelService";
import Channel, { ChannelType } from "App/Models/Channel";

export enum UserRole {
  Admin = "admin",
  Member = "member",
}

export enum UserChannelStatus {
  PendingInvite = "pending_invite",
  InChannel = "in_channel",
  LeftChannel = "left_channel",
  KickedOut = "kicked_out",
}

class ChannelUsersService {
  // service methods

  /**
   *
   * PUBLIC METHODS
   */

  public async handleJoin(user: User, channel: Channel): Promise<void> {
    // Can join only channel he is not in
    if (await this.isInChannel(user.id, channel.id)) {
      throw new Exception(
        "Cannot join a channel you are already member of.",
        403,
      );
    }

    // Can join only public channel
    if (channel.type === ChannelType.Private) {
      throw new Exception("Cannot join a private channel.", 403);
    }

    const userChannelStatus = await this.getUserChannelStatus(
      user.id,
      channel.id,
    );
    // Can join only if was not kicked before
    if (userChannelStatus === UserChannelStatus.KickedOut) {
      throw new Exception("Cannot join a channel you were kicked out of.", 403);
    }

    // If user left channel before, join him back in
    if (userChannelStatus === UserChannelStatus.LeftChannel) {
      await this.changeUserStatus(
        channel.id,
        user.id,
        UserChannelStatus.InChannel,
      );

      return;
    }

    // Join the channel
    await this.join(
      user,
      channel,
      UserRole.Member,
      UserChannelStatus.InChannel,
    );
  }

  public async join(
    user: User,
    channel: Channel,
    userRole: UserRole,
    userChannelStatus: UserChannelStatus,
  ): Promise<void> {
    //
    await user.related("channels").attach({
      [channel.id]: {
        user_role: userRole,
        user_channel_status: userChannelStatus,
      },
    });
  }

  public async invite(
    inviterId: number,
    userId: number,
    channelId: number,
  ): Promise<void> {
    // User cannot belong to the channel to be invited
    // Inviter must belong to the channel he invites to
    // User cannot be invited to private channel by regular member
    // If user was kicked from the channel, only admin can invite him back
  }

  public async handleKick(
    kickerId: number,
    userId: number,
    channelId: number,
  ): Promise<void> {
    // In private channels only admin can kick
    if (
      (await ChannelService.isPrivate(channelId)) &&
      !(await this.isAdmin(kickerId, channelId))
    ) {
      throw new Exception(
        "Only admin can kick out users in private channel.",
        403,
      );
    }

    if (!(await this.isInChannel(kickerId, channelId))) {
      // User must be part of the channel to be able to kick another user
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
    if (await this.isAdmin(kickerId, channelId)) {
      await this.kickUser(channelId, userId);
      return;
    }

    // If member is kicking someone, increase kick count
    await this.updateKickCount(userId, channelId);
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

  // Kick user from channel
  public async kickUser(channelId: number, userId: number): Promise<void> {
    await this.changeUserStatus(channelId, userId, UserChannelStatus.KickedOut);
  }

  /**
   *
   * PRIVATE METHODS
   */

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
      .andWhere("user_channel_status", UserChannelStatus.InChannel)
      .first();
    return !!exists;
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

  private async getUserChannelStatus(
    userId: number,
    channelId: number,
  ): Promise<UserChannelStatus | null> {
    const record = await (await User.findOrFail(userId))
      .related("channels")
      .pivotQuery()
      .where("channel_id", channelId)
      .first();
    if (record) {
      return record["user_channel_status"];
    }
    return null;
  }
}

export default new ChannelUsersService();
