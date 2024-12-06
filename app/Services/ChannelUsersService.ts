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

  // Handles user joing channel
  public async handleJoin(user: User, channel: Channel): Promise<void> {
    // Can join only channel he is not in
    if (await this.isInChannel(user, channel)) {
      throw new Exception(
        "Cannot join a channel you are already member of.",
        403,
      );
    }

    // Can join only public channel
    if (channel.type === ChannelType.Private) {
      throw new Exception("Cannot join a private channel.", 403);
    }

    const userChannelStatus = await this.getUserChannelStatus(user, channel);
    // Can join only if was not kicked before
    if (userChannelStatus === UserChannelStatus.KickedOut) {
      throw new Exception("Cannot join a channel you were kicked out of.", 403);
    }

    // If user left channel before, join him back in
    if (userChannelStatus === UserChannelStatus.LeftChannel) {
      await this.changeUserStatus(channel, user, UserChannelStatus.InChannel);

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

  // Joins user to channel
  public async join(
    user: User,
    channel: Channel,
    userRole: UserRole,
    userChannelStatus: UserChannelStatus,
  ): Promise<void> {
    await user.related("channels").attach({
      [channel.id]: {
        user_role: userRole,
        user_channel_status: userChannelStatus,
      },
    });
  }

  // Handles invitation to a channel
  public async handleInvite(
    inviter: User,
    user: User,
    channel: Channel,
  ): Promise<void> {
    //console.log("\n\nBeginning check\n");
    // Inviter must belong to the channel he invites to
    if (!(await this.isInChannel(inviter, channel))) {
      throw new Exception(
        "You must belong to the channel in order to invite others.",
        403,
      );
    }

    // User cannot be invited to private channel by regular member
    if (
      (await ChannelService.isPrivate(channel)) &&
      !(await this.isAdmin(inviter, channel))
    ) {
      throw new Exception(
        "Only admin can invite others to a private channel.",
        403,
      );
    }

    // User cannot belong to the channel to be invited
    if (await this.isInChannel(user, channel)) {
      throw new Exception(
        "This user is already a member of this channel.",
        403,
      );
    }

    const userChannelStatus = await this.getUserChannelStatus(user, channel);
    // If user was kicked from the channel, only admin can invite him back
    if (
      userChannelStatus === UserChannelStatus.KickedOut &&
      !(await this.isAdmin(inviter, channel))
    ) {
      throw new Exception(
        "This user was kicked out of this channel and only admin can invite him back.",
        403,
      );
    }

    //console.log("\n\nAfter check\n");

    // If user was already invited
    if (userChannelStatus === UserChannelStatus.PendingInvite) {
      throw new Exception(
        "This user was already invited to this channel.",
        403,
      );
    }

    // Invite user to the channel
    this.invite(user, channel);
  }

  public async acceptInvite(user: User, channel: Channel): Promise<void> {
    // If user is not invited
    if (
      (await this.getUserChannelStatus(user, channel)) !==
      UserChannelStatus.PendingInvite
    ) {
      throw new Exception("You were not invited to this channel", 403);
    }

    // Accept invitation
    await this.changeUserStatus(channel, user, UserChannelStatus.InChannel);
  }

  public async declineInvite(user: User, channel: Channel): Promise<void> {
    // If user is not invited
    if (
      (await this.getUserChannelStatus(user, channel)) !==
      UserChannelStatus.PendingInvite
    ) {
      throw new Exception("You were not invited to this channel", 403);
    }

    // Decline invitation
    await user.related("channels").detach([channel!.id]);
  }

  // Handles kick from a channel
  public async handleKick(
    kicker: User,
    user: User,
    channel: Channel,
  ): Promise<void> {
    // In private channels only admin can kick
    if (
      (await ChannelService.isPrivate(channel)) &&
      !(await this.isAdmin(kicker, channel))
    ) {
      throw new Exception(
        "Only admin can kick out users in private channel.",
        403,
      );
    }

    if (!(await this.isInChannel(kicker, channel))) {
      // User must be part of the channel to be able to kick another user
      throw new Exception(
        "Cannot kick a user from channel you are not member of",
        403,
      );
    }

    // User must be part of the channel so he can be kicked
    if (!(await this.isInChannel(user, channel))) {
      throw new Exception(
        "Cannot kick a user from channel he does not belong to",
        403,
      );
    }

    // Admin cannot be kicked
    if (await this.isAdmin(user, channel)) {
      throw new Exception("Cannot kick admin", 403);
    }

    // If admin is kicking someone, kick immediatelly
    if (await this.isAdmin(kicker, channel)) {
      await this.kickUser(channel, user);
      return;
    }

    // If member is kicking someone, increase kick count
    await this.updateKickCount(channel, user);
  }

  // Leave channel
  public async leaveChannel(user: User, channel: Channel): Promise<void> {
    // User must be part of the channel so he can leave
    if (!(await this.isInChannel(user, channel))) {
      throw new Exception("Cannot leave a channel you do not belong to", 403);
    }

    await this.changeUserStatus(channel, user, UserChannelStatus.LeftChannel);
    Event.emit("user:leftChannel", {
      channel: channel,
      isAdmin: await this.isAdmin(user, channel),
    });
  }

  // Get the number of kicks for user in channel
  public async getNumberOfKicks(channel: Channel, user: User): Promise<number> {
    return await user
      .related("channels")
      .pivotQuery()
      .where("channel_id", channel.id)
      .firstOrFail();
  }

  // Kick user from channel
  public async kickUser(channel: Channel, user: User): Promise<void> {
    await this.changeUserStatus(channel, user, UserChannelStatus.KickedOut);
  }

  // Checks if user is in channel
  public async isInChannel(user: User, channel: Channel): Promise<boolean> {
    const exists = await user
      ?.related("channels")
      .pivotQuery()
      .where("channel_id", channel.id)
      .andWhere("user_channel_status", UserChannelStatus.InChannel)
      .first();
    return !!exists;
  }

  // Gets all channels for given user
  public async getUserChannels(user: User): Promise<Channel[]> {
    await user.load("channels", (query) => {
      query.wherePivot("user_channel_status", "in_channel");
    });

    return user.channels;
  }

  /**
   *
   * PRIVATE METHODS
   */

  // Invite user to channel
  private async invite(user: User, channel: Channel): Promise<void> {
    if (
      (await this.getUserChannelStatus(user, channel)) ===
      UserChannelStatus.KickedOut
    ) {
      await this.changeUserStatus(
        channel,
        user,
        UserChannelStatus.PendingInvite,
      );
      return;
    }

    await user.related("channels").attach({
      [channel.id]: {
        user_role: UserRole.Member,
        user_channel_status: UserChannelStatus.PendingInvite,
      },
    });
  }

  // Update number of kicks
  private async updateKickCount(channel: Channel, user: User): Promise<void> {
    const userChannelPivot = await this.getNumberOfKicks(channel, user);
    const currentKicks = userChannelPivot["kicks"] || 0; // Get current kicks or default to 0
    await user
      .related("channels")
      .pivotQuery()
      .where("channel_id", channel.id)
      .update("kicks", currentKicks + 1); // Increment kicks by 1

    // Emit event
    Event.emit("user:kicksIncreased", {
      user: user,
      channel: channel,
    });
  }

  // Checks if user is admin in channel - help by ChatGPT to construct the correct query
  private async isAdmin(user: User, channel: Channel): Promise<boolean> {
    const userRole = await User.query()
      .where("id", user.id)
      .whereHas("channels", (channelQuery) => {
        channelQuery
          .where("channel_id", channel.id)
          .wherePivot("user_role", UserRole.Admin);
      })
      .first();

    return !!userRole;
  }

  // Changes user status in channel
  private async changeUserStatus(
    channel: Channel,
    user: User,
    newStatus: UserChannelStatus,
  ): Promise<void> {
    await user
      .related("channels")
      .pivotQuery()
      .where("channel_id", channel.id)
      .update("user_channel_status", newStatus);
  }

  // Gets user status in channel or return null if user is not in channel
  private async getUserChannelStatus(
    user: User,
    channel: Channel,
  ): Promise<UserChannelStatus | null> {
    const record = await user
      .related("channels")
      .pivotQuery()
      .where("channel_id", channel.id)
      .first();
    if (record) {
      return record["user_channel_status"];
    }
    return null;
  }
}

export default new ChannelUsersService();
