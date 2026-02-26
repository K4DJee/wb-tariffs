import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tariffs', (table) => {
    table.increments('id').primary();
    
    table.string('warehouse_name').notNullable();
    table.string('geo_name').nullable();
    
    table.decimal('delivery_coef', 6, 4).notNullable();
    table.decimal('delivery_base', 10, 2).notNullable(); 
    
    table.date('valid_until').notNullable();
    table.date('data_date').notNullable();
    table.timestamp('fetched_at').defaultTo(knex.fn.now());
    
    table.timestamps(true, true);
    
    table.unique(['warehouse_name', 'data_date']);
    table.index('delivery_coef');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tariffs');
}