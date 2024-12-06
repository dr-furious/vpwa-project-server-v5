import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import User, { UserStatus, UserNotificationSetting } from "App/Models/User";

export default class extends BaseSeeder {
  public async run() {
    const uniqueKey = "email";

    await User.updateOrCreateMany(uniqueKey, [
      {
        fullName: "John Doe",
        nickName: "johny123",
        email: "john@example.com",
        password: "1234",
        status: UserStatus.Active,
        notificationSetting: UserNotificationSetting.ShowAll,
      },
      {
        fullName: "Freddy Mercury",
        nickName: "fredthebest",
        email: "fred@example.com",
        password: "1234",
        status: UserStatus.Active,
        notificationSetting: UserNotificationSetting.ShowMentions,
      },
      {
        fullName: "Harry Potter",
        nickName: "expeliarmus7",
        email: "harry@example.com",
        password: "1234",
        status: UserStatus.Offline,
        notificationSetting: UserNotificationSetting.ShowAll,
      },
      {
        fullName: "Cristiano Ronaldo",
        nickName: "CR7",
        email: "ronaldo@example.com",
        password: "1234",
        status: UserStatus.DND,
        notificationSetting: UserNotificationSetting.ShowAll,
      },
    ]);
  }
}
