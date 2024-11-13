import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany, ManyToMany, manyToMany } from "@ioc:Adonis/Lucid/Orm";
import Message from "App/Models/Message";
import User from "./User";

export enum ChannelType {
  Public = "public",
  Private = "private",
}

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public createdBy: number;

  @column()
  public name: string;

  @column()
  public type: ChannelType;

  @column()
  public numberOfUsers: number;

  @column()
  public numberOfMessages: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => Message, {
    foreignKey: "channelId",
  })
  public messages: HasMany<typeof Message>;

  @manyToMany(() => User, {
    pivotTable: "channel_users",
    pivotForeignKey: "channel_id",
    pivotRelatedForeignKey: "user_id",
    pivotColumns: ["kicks", "user_role", "user_channel_status"],
    pivotTimestamps: true,
  })
  public users: ManyToMany<typeof User>;
}
