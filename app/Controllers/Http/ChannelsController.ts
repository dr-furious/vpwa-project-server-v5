import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService, {
  UserChannelStatus,
  UserRole,
} from "App/Services/ChannelUsersService";
import ChannelService from "App/Services/ChannelService";
import CreateChannelValidator from "App/Validators/CreateChannelValidator";
import RetrieveChannelUsersValidator from "App/Validators/RetrieveChannelUsersValidator";
import Channel from "App/Models/Channel";
import User from "App/Models/User";
import { Exception } from "@adonisjs/core/build/standalone";

export default class ChannelsController {
  async create({ auth, request, response }: HttpContextContract) {
    const data = await request.validate(CreateChannelValidator);
    const channelName = data.channelName;
    const channelType = data.channelType;

    const channel = await ChannelService.exists(undefined, channelName);
    if (channel) {
      // handle join
      await ChannelUsersService.handleJoin(auth.user!, channel);
      return response.status(200).json({ message: "Join was successful" });
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
      return response
        .status(201)
        .json({ message: "Channel was successfully created." });
    }
  }

  async getUsers({ auth, request, response }: HttpContextContract) {
    //
    const data = await request.validate(RetrieveChannelUsersValidator);

    const channelName = data.channelName;
    const channel = await Channel.findBy("name", channelName);

    // if user is not from this channel, dont allow it
    if (
      !(await ChannelUsersService.isInChannel(
        auth.user!,
        channel!,
        UserChannelStatus.InChannel,
      ))
    ) {
      throw new Exception("Logged user is not from this channel.", 403);
    }
    // Retrieve users in the specified channel with status "InChannel" - following query was constructed with help of ChatGPT
    const channelUsers = await User.query().whereHas("channels", (query) => {
      query
        .where("channel_id", channel!.id)
        .wherePivot("user_channel_status", UserChannelStatus.InChannel);
    });

    // Return the users in the response
    return response.status(200).json({ users: channelUsers });
  }
}
