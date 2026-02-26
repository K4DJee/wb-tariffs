import logger from "../utils/logger.js";
import { CronJob } from "cron";
import { DBService } from "./db.service.js";
import { GoogleSheetsService } from "./google-sheets.service.js";
import { WBTariffsService } from "./wb-api.service.js";

export class SchedulerService {
  private wbService: WBTariffsService;
  private dbService: DBService;
  private sheetsService: GoogleSheetsService;
  private job: CronJob | null = null;

  constructor() {
    this.wbService = new WBTariffsService();
    this.dbService = new DBService();
    this.sheetsService = new GoogleSheetsService();
  }

  async runTask() {
    logger.info("Starting a task");
    try {
      const tariffs = await this.wbService.fetchTariffs();

      await this.dbService.saveOrUpdateTariffsPerDay(tariffs);

      const currentTariffs = await this.dbService.getCurrentTariffs();

      const sorted =
        this.sheetsService.sortTariffsByCoefficient(currentTariffs);

      await this.sheetsService.updateAllSheets(sorted);

      logger.info("Task completed", {
        durationMs: 1240,
        records: 82,
      });
    } catch (e) {
      logger.error("Error: ", e);
    }
  }

  start(): void {
    logger.info("Scheduler is running");
    this.runTask().catch((err) => logger.error("Initial run error:", err));

    this.job = new CronJob(
      process.env.CRON_SCHEDULE!,
      () => this.runTask(),
      null,
      true,
      "UTC"
    );
  }

  stop(): void {
    this.job?.stop();
    this.dbService.destroy();
    logger.info("Scheduler is stopped");
  }
}
