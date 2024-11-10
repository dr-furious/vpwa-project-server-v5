import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService from "App/Services/ChannelUsersService";

export default class ChannelUsersController {
  // Directly destructuring the http context (passed automatically to each controller by adonis)
  async updateStatus({ auth, params, request, response }: HttpContextContract) {
    const channelId = Number(params["channel_id"]);
    const userId = Number(params["user_id"]);

    const { user_channel_status } = request.only(["user_channel_status"]);

    // Check if user is trying to leave the channel he is member of
    if (user_channel_status == "left_channel") {
      if (auth.user?.id !== Number(userId)) {
        return response
          .status(403)
          .json({ error: "You can only leave the channel yourself" });
      }

      await ChannelUsersService.leaveChannel(userId, channelId);
      return response.status(200).json({ message: "Left was seccessful" });
    } else if (user_channel_status == "kicked_out") {
      if (auth.user!.id === userId) {
        return response.status(403).json({ message: "Cannot kick yourself" });
      }
      await ChannelUsersService.handleKick(auth.user!.id, userId, channelId);
      return response.status(200).json({ message: "Kick was successful" });
    }

    return response.status(400).json({ error: "Invalid status value" });
  }
}
