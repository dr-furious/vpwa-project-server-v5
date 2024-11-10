/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

/**
 * Events are defined in contracts/event.ts for type safety
 *
 * How to listen to Events:
 * Event.on(<eventName>, <action>) OR
 * Event.on(<eventName>, <ListenerClass.action>)
 */

import Event from "@ioc:Adonis/Core/Event";

Event.on("new:user", (user) => {
  console.log(user);
});

Event.on("user:kicksIncreased", "ChannelUser.onKicksIncreased");
