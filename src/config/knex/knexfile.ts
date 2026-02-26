import 'dotenv/config';
import type { Knex } from 'knex';

function getConnectionConfig() {
    return {
        host: process.env.POSTGRES_HOST!,
        port: Number(process.env.POSTGRES_PORT!),
        database: process.env.POSTGRES_DB!,
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
    };
}

const NODE_ENV = process.env.NODE_ENV ?? "development";

const config: {[key:string]:Knex.Config} = {
    development: {
        client: "pg",
        connection: {
            ...getConnectionConfig(),
            ssl:false

        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: 'src/config/knex/migration.stub.js',
            directory: "./src/postgres/migrations",
            tableName: "migrations",
            extension: "ts",
        },
        seeds: {
            stub: 'src/config/knex/seed.stub.js',
            directory: "./src/postgres/seeds",
            extension: "js",
        },
    },
    production: {
        client: "pg",
        connection: {
            ...getConnectionConfig(),
            ssl:false

        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: 'dist/config/knex/migration.stub.js',
            directory: "./dist/postgres/migrations",
            tableName: "migrations",
            extension: "js",
        },
        seeds: {
            stub: 'src/config/knex/seed.stub.js',
            directory: "./dist/postgres/seeds",
            extension: "js",
        },
    },
};


export default config[NODE_ENV]