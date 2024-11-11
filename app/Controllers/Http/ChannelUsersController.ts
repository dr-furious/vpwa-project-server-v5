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

export default class ChannelUsersController {
  // Directly destructuring the http context (passed automatically to each controller by adonis)
  async updateStatus({ auth, params, request, response }: HttpContextContract) {
    const channelId = Number(params["channel_id"]);
    const userId = Number(params["user_id"]);

    if (isNaN(channelId) || isNaN(userId)) {
      throw new Exception("Invalid parameters", 422);
    }

    const userChannelStatus = (
      await request.validate(UpdateUserStatusValidator)
    ).userChannelStatus;

    // Check if user is trying to leave the channel he is member of
    if (userChannelStatus == "left_channel") {
      if (auth.user?.id !== Number(userId)) {
        throw new Exception("You can only leave the channel yourself", 403);
      }

      await ChannelUsersService.leaveChannel(userId, channelId);
      return response.status(200).json({ message: "Left was seccessful" });
    } else if (userChannelStatus == "kicked_out") {
      if (auth.user!.id === userId) {
        throw new Exception("Cannot kick yourself", 403);
      }
      await ChannelUsersService.handleKick(auth.user!.id, userId, channelId);
      return response.status(200).json({ message: "Kick was successful" });
    }

    throw new Exception("Invalid user status value", 400);
  }

  async create({ auth, params, request, response }: HttpContextContract) {
    const data = await request.validate(CreateChannelUserValidator);

    return { data: data };
  }
}
