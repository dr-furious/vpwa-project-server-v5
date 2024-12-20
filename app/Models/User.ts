import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Channel from "App/Models/Channel";
import Message from "App/Models/Message";

export enum UserStatus {
  Active = "active",
  Offline = "offline",
  DND = "do not disturb",
}

export enum UserNotificationSetting {
  ShowAll = "all",
  ShowMentions = "mentionsOnly",
  Off = "off",
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public email: string;

  @column()
  public fullName: string;

  @column()
  public nickName: string;

  @column()
  public status: UserStatus;

  @column()
  public notificationSetting: UserNotificationSetting;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public rememberMeToken: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => Message, {
    foreignKey: "createdBy",
  })
  public sentMessages: HasMany<typeof Message>;

  @hasMany(() => Message, {
    foreignKey: "id",
  })
  public mentions: HasMany<typeof Message>;

  @manyToMany(() => Channel, {
    pivotTable: "channel_users",
    pivotForeignKey: "user_id",
    pivotRelatedForeignKey: "channel_id",
    pivotColumns: ["kicks", "user_role", "user_channel_status"],
    pivotTimestamps: true,
  })
  public channels: ManyToMany<typeof Channel>;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}
