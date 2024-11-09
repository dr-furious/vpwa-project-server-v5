import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import Message from "App/Models/Message";

enum ChannelType {
  PUBLIC = "public",
  PRIVATE = "private",
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
}
