import type { EventsList } from "@ioc:Adonis/Core/Event";

export default class ChannelUser {
  public async onNewUser(user: EventsList[]) {
    // do something
  }

  public async onUserLeftChannel(user: EventsList["user:leftChannel"]) {
    // do something
  }

  public async onKicksIncreased(user: EventsList["user:kicksIncreased"]) {
    // do something
  }
}
