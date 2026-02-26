import knex from "knex";
import config from "../config/knex/knexfile.js";
import type { TariffRecord } from "../types/wb-tariffs.types.js";
import logger from "../utils/logger.js";
import "dotenv/config";
const db = knex(config!);

export class DBService {
  async saveOrUpdateTariffsPerDay(
    tariffs: TariffRecord[],
    dataDate: Date = new Date()
  ) {
    const records = tariffs.map((t) => ({
      warehouse_name: t.warehouse_name,
      geo_name: t.geo_name,
      delivery_coef: t.delivery_coef,
      delivery_base: t.delivery_base,
      valid_until: t.valid_until,
      data_date: dataDate,
      fetched_at: new Date(),
    }));
    try {
      const result = await db("tariffs")
        .insert(records)
        .onConflict(["warehouse_name", "data_date"])
        .merge({
          geo_name: db.raw("EXCLUDED.geo_name"),
          delivery_coef: db.raw("EXCLUDED.delivery_coef"),
          delivery_base: db.raw("EXCLUDED.delivery_base"),
          valid_until: db.raw("EXCLUDED.valid_until"),
          fetched_at: db.raw("EXCLUDED.fetched_at"),
          updated_at: db.raw("NOW()"),
        })
        .returning("id");
      logger.info(
        `${result.length} records processed on ${dataDate.toISOString().split("T")[0]}`
      );
      return result.length;
    } catch (e) {
      if (e instanceof AggregateError) {
        logger.error(`AggregateError: ${e.message}`, e);
        e.errors.forEach((err, i) => {
          logger.error(
            `  [${i}] ${err.name}: ${err.message}, stack: ${err.stack}, code: ${err.code}`
          );
        });
      } else if (e instanceof Error) {
        logger.error("DB Error", e);
      } else {
        logger.error("Unknown error", e);
      }
      throw e;
    }
  }

  async getCurrentTariffs(): Promise<TariffRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await db("tariffs")
      .where("data_date", today)
      .orderBy("delivery_coef", "asc")
      .select("*");
    return rows.map((row) => this.mapRowToRecord(row));
  }

  private mapRowToRecord(row: any): TariffRecord {
    return {
      warehouse_name: row.warehouse_name,
      geo_name: row.geo_name,
      delivery_coef: Number(row.delivery_coef),
      delivery_base: Number(row.delivery_base),
      valid_until:
        row.valid_until instanceof Date
          ? row.valid_until
          : new Date(row.valid_until),
      data_date:
        row.data_date instanceof Date ? row.data_date : new Date(row.data_date),
      fetched_at:
        row.fetched_at instanceof Date
          ? row.fetched_at
          : new Date(row.fetched_at),
    };
  }

  async destroy(): Promise<void> {
    await db.destroy();
    logger.info("The db connection is closed");
  }
}
