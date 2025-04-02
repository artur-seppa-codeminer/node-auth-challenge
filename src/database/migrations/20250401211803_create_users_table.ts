import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enum('role', ['admin', 'dealership']).notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();

    table.integer('dealershipId')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('dealerships')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}