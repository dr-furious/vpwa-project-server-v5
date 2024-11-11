import { Exception } from "@adonisjs/core/build/standalone";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService, {
  UserChannelStatus,
  UserRole,
} from "App/Services/ChannelUsersService";
import ChannelService from "App/Services/ChannelService";
import CreateChannelValidator from "App/Validators/CreateChannelValidator";

export default class ChannelUsersController {
  // Directly destructuring the http context (passed automatically to each controller by adonis)
  async updateStatus({ auth, params, request, response }: HttpContextContract) {
    const channelId = Number(params["channel_id"]);
    const userId = Number(params["user_id"]);

    const { user_channel_status } = request.only(["user_channel_status"]);

    // Check if user is trying to leave the channel he is member of
    if (user_channel_status == "left_channel") {
      if (auth.user?.id !== Number(userId)) {
        throw new Exception("You can only leave the channel yourself", 403);
      }

      await ChannelUsersService.leaveChannel(userId, channelId);
      return response.status(200).json({ message: "Left was seccessful" });
    } else if (user_channel_status == "kicked_out") {
      if (auth.user!.id === userId) {
        throw new Exception("Cannot kick yourself", 403);
      }
      await ChannelUsersService.handleKick(auth.user!.id, userId, channelId);
      return response.status(200).json({ message: "Kick was successful" });
    }

    throw new Exception("Invalid user status value", 400);
  }

  async create({ auth, params, request, response }: HttpContextContract) {
    const data = await request.validate(CreateChannelValidator);
    const channelName = data.channelName;
    const channelType = data.channelType;

    const channel = await ChannelService.exists(undefined, channelName);
    if (channel) {
      // handle join
      return await ChannelUsersService.handleJoin(auth.user!, channel);
    } else {
      // handle create
      const newChannel = await ChannelService.createChannel(
        channelName,
        channelType,
        auth.user!.id,
      );
      await ChannelUsersService.join(
        auth.user!,
        newChannel,
        UserRole.Admin,
        UserChannelStatus.InChannel,
      );
      return newChannel;
    }
  }
}
