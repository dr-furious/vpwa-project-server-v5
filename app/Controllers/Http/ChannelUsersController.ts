import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService from "App/Services/ChannelUsersService";
import User from "App/Models/User";
import Channel from "App/Models/Channel";
import InviteResponseValidator from "App/Validators/InviteResponseValidator";

export default class ChannelUsersController {
  // Directly destructuring the http context (passed automatically to each controller by adonis)

  async resolveInvite({ auth, request, response }: HttpContextContract) {
    const data = await request.validate(InviteResponseValidator);
    const accept = data.accept; // true or false
    const channelId = data.channelId;

    const user = await User.find(auth.user?.id);
    const channel = await Channel.find(channelId);

    if (accept) {
      await ChannelUsersService.acceptInvite(user!, channel!);
      return response
        .status(200)
        .json({ message: "Invitation accepted successfully" });
    } else {
      await ChannelUsersService.declineInvite(user!, channel!);
      return response
        .status(200)
        .json({ message: "Invitation declined successfully" });
    }
  }

  async getUserChannels({ auth }: HttpContextContract) {
    return await ChannelUsersService.getUserChannels(auth.user!);
  }
}
