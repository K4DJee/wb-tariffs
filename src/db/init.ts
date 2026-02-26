import knex from 'knex';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const config = (await import('../config/knex/knexfile.js')).default;
  const db = knex(config!);

  try {
    const migrationsPath = join(__dirname, '../../dist/db/migrations').replace(/\\/g, '/');
    
    try {
      await fs.access(migrationsPath);
    } catch {
      console.warn('Folder with migration is not found');
      return;
    }

    const files = await fs.readdir(migrationsPath);
    const migrationFiles = files
      .filter(f => f.endsWith('.js'))
      .sort()
      .map(f => join(migrationsPath, f).replace(/\\/g, '/'));

    if (migrationFiles.length === 0) {
      console.warn('No migration files in the folder');
      return;
    }

    const hasMigrationsTable = await db.schema.hasTable('migrations');
    
    if (!hasMigrationsTable) {
      await db.schema.createTable('migrations', (table) => {
        table.increments('id');
        table.string('name');
        table.integer('batch');
        table.timestamp('migration_time').defaultTo(db.fn.now());
      });
    }

    for (const file of migrationFiles) {
      const fileUrl = pathToFileURL(file).href;
      const migration = await import(fileUrl);
      
      const migrationName = file.split(/[\\/]/).pop()!;
      
      const exists = await db('migrations').where('name', migrationName).first();
      if (!exists) {
        await migration.up(db);
        await db('migrations').insert({ name: migrationName, batch: 1 });
        console.log(`Applied: ${migrationName}`);
      }
    }
    
    console.log('All migrations are applied');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await db.destroy();
  }
}

export default runMigrations;