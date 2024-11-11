import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ChannelUsersService, {
  UserChannelStatus,
  UserRole,
} from "App/Services/ChannelUsersService";
import ChannelService from "App/Services/ChannelService";
import CreateChannelValidator from "App/Validators/CreateChannelValidator";

export default class ChannelsController {
  async create({ auth, request }: HttpContextContract) {
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
