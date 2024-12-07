import type { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";
import User, { UserNotificationSetting, UserStatus } from "App/Models/User";

export default class ChannelController {
  async updateStatus(
    { socket }: WsContextContract,
    nickName: string,
    newStatus: UserStatus,
  ) {
    const user = await User.findBy("nickName", nickName);
    if (user) {
      user.status = newStatus;
      await user.save();
      socket.broadcast.emit("statusChanged");
      return;
    }

    socket.emit("error", `No user found with nick ${nickName}`);
  }

  async updateNottificationSettings(
    { socket }: WsContextContract,
    nickName: string,
    newSettings: UserNotificationSetting,
  ) {
    const user = await User.findBy("nickName", nickName);
    if (user) {
      user.notificationSetting = newSettings;
      await user.save();
      socket.emit("settingsChanged");
      return;
    }

    socket.emit("error", `No user found with nick ${nickName}`);
  }
}
