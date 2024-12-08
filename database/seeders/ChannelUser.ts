import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Database from "@ioc:Adonis/Lucid/Database";

enum user_role {
  Admin = "admin",
  Member = "member",
}

enum user_channel_status {
  PendingInvite = "pending_invite",
  InChannel = "in_channel",
  LeftChannel = "left_channel",
  KickedOut = "kicked_out",
}

export default class extends BaseSeeder {
  public async run() {
    // Inserting into pivot table to form relationship (for dev purposes only!!!)
    await Database.table("channel_users").multiInsert([
      {
        user_id: 1,
        channel_id: 1,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
        kicks: 0,
      },
      {
        user_id: 1,
        channel_id: 2,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 1,
        channel_id: 3,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.LeftChannel,
      },
      {
        user_id: 2,
        channel_id: 1,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 2,
        channel_id: 2,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 2,
        channel_id: 3,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 3,
        channel_id: 2,
        kicks: 0,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 3,
        channel_id: 3,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 4,
        channel_id: 1,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 4,
        channel_id: 2,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.KickedOut,
      },
      {
        user_id: 4,
        channel_id: 3,
        kicks: 0,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 3,
        channel_id: 4,
        kicks: 0,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 1,
        channel_id: 4,
        kicks: 0,
        user_role: user_role.Member,
        user_channel_status: user_channel_status.PendingInvite,
      },
      {
        user_id: 1,
        channel_id: 6,
        kicks: 0,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
      },
      {
        user_id: 1,
        channel_id: 7,
        kicks: 0,
        user_role: user_role.Admin,
        user_channel_status: user_channel_status.InChannel,
      },
    ]);
  }
}

/**
 * 
 * 
 * 
 
 * 
 * 
 */
