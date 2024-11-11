import { Exception } from "@adonisjs/core/build/standalone";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService, {
  UserChannelStatus,
  UserRole,
} from "App/Services/ChannelUsersService";
import ChannelService from "App/Services/ChannelService";
import CreateChannelValidator from "App/Validators/CreateChannelValidator";
import CreateChannelUserValidator from "App/Validators/CreateChannelUserValidator";
import UpdateUserStatusValidator from "App/Validators/UpdateUserStatusValidator";
import User from "App/Models/User";
import Channel from "App/Models/Channel";

export default class ChannelUsersController {
  // Directly destructuring the http context (passed automatically to each controller by adonis)
  async updateStatus({ auth, params, request, response }: HttpContextContract) {
    const data = await request.validate(UpdateUserStatusValidator);
    const channelName = data.channelName;
    const nickName = data.nickName;

    const userChannelStatus = data.userChannelStatus;

    const user = await User.findBy("nickName", nickName);
    const loggedUser = await User.find(auth.user?.id);
    const channel = await Channel.findBy("name", channelName);

    // Check if user is trying to leave the channel he is member of
    if (userChannelStatus == "left_channel") {
      if (auth.user?.id !== user?.id) {
        throw new Exception("You can only leave the channel yourself", 403);
      }

      await ChannelUsersService.leaveChannel(user!, channel!);
      return response.status(200).json({ message: "Left was seccessful" });
    } else if (userChannelStatus == "kicked_out") {
      if (loggedUser!.id === user!.id) {
        throw new Exception("Cannot kick yourself", 403);
      }
      await ChannelUsersService.handleKick(loggedUser!, user!, channel!);
      return response.status(200).json({ message: "Kick was successful" });
    }

    throw new Exception("Invalid user status value", 400);
  }

  async create({ auth, params, request, response }: HttpContextContract) {
    const data = await request.validate(CreateChannelUserValidator);

    return { data: data };
  }
}
