/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async () => {
  return { hello: "world" };
}).middleware("auth");

Route.group(() => {
  Route.post("register", "AuthController.register");
  Route.post("login", "AuthController.login");
  Route.post("logout", "AuthController.logout").middleware("auth");
  Route.get("me", "AuthController.me").middleware("auth");
  Route.post("update", "AuthController.update").middleware("auth");
}).prefix("auth");

Route.group(() => {
  Route.patch("channels/users/status", "ChannelUsersController.updateStatus");
  Route.post("channels/join", "ChannelsController.create"); // to join / create a channel
  Route.post("channels/invite/resolve", "ChannelUsersController.resolveInvite"); // to accept / decline invitation
  Route.get("channel/users", "ChannelsController.getUsers");
  Route.get("channels/pending", "ChannelsController.getPendingChannels");
  Route.get("channels", "ChannelUsersController.getUserChannels");
}).middleware("auth");
