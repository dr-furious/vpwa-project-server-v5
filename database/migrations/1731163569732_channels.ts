import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Channels extends BaseSchema {
  protected tableName = "channels";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.integer("created_by").notNullable().unique();
      table.string("name").notNullable().unique();
      table.enum("type", ["private", "public"]).defaultTo("public");
      table.integer("number_of_users").defaultTo(1);
      table.integer("number_of_messages").defaultTo(0);
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
