import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import Channel from "App/Models/Channel";
import User from "App/Models/User";
import { Exception } from "@adonisjs/core/build/standalone";
import ChannelUsersService, {
  UserChannelStatus,
} from "App/Services/ChannelUsersService";

export default class ChannelController {
  async updateStatus(
    { auth, socket, params }: WsContextContract,
    nickName: string,
    userChannelStatus: UserChannelStatus,
  ) {
    const channelName = params.name;

    const user = await User.findBy("nickName", nickName);
    const loggedUser = await User.find(auth.user?.id);
    const channel = await Channel.findBy("name", channelName);

    // Check if user is trying to leave the channel he is member of
    if (userChannelStatus == UserChannelStatus.LeftChannel) {
      if (auth.user?.id !== user?.id) {
        throw new Exception("You can only leave the channel yourself", 403);
      }

      await ChannelUsersService.leaveChannel(user!, channel!);
      socket.broadcast.emit("channelListModified", channelName);
      return;
    } else if (userChannelStatus == UserChannelStatus.KickedOut) {
      if (loggedUser!.id === user!.id) {
        throw new Exception("Cannot kick yourself", 403);
      }
      await ChannelUsersService.handleKick(loggedUser!, user!, channel!);
      socket.broadcast.emit("channelListModified", channelName);
      return;
    }

    throw new Exception("Invalid user status value", 400);
  }

  async create(
    { auth, socket }: WsContextContract,
    nickName: string,
    channelName: string,
  ) {
    const user = await User.findBy("nickName", nickName); // invited user
    const inviter = await User.find(auth.user?.id); // who is trying to invite somebody
    const channel = await Channel.findBy("name", channelName); // channel to invite to

    await ChannelUsersService.handleInvite(inviter!, user!, channel!);

    //console.log("Broadcasting userInvited to namespace:", socket.nsp.name);
    socket.broadcast.emit("userInvited", user?.nickName);
    //console.log("complete");
  }
}
