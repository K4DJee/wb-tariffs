import { google } from "googleapis";
import logger from "../utils/logger.js";
import path from "path";
import "dotenv/config";
import type { TariffRecord } from "../types/wb-tariffs.types.js";
import { formatDate } from "../utils/parse.js";

export class GoogleSheetsService {
  private sheets;
  constructor() {
    if (process.env.GOOGLE_SHEETS_ENABLED !== "true") {
      logger.error("Google Sheets is not enabled.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    logger.info("Auth in GoogleSheets has been confirmed.");
  }

  async updateAllSheets(tariffs: TariffRecord[]) {
    if (!this.sheets) return;

    const spreadsheetIds =
      process.env.GOOGLE_SHEETS_SPREADSHEET_IDS!.split(",");
    for (const id of spreadsheetIds) {
      await this.updateSheet(id.trim(), tariffs);
    }
  }

  async updateSheet(spreadsheetId: string, tariffs: TariffRecord[]) {
    if (!this.sheets) return;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME!;

    const values: (string | number | null)[][] = [
      [
        "Warehouse",
        "Geo",
        "Delivery Coef",
        "Delivery Base",
        "Valid Until",
        "Data Date",
        "Fetched At",
      ],
      ...tariffs.map((t) => this.formatTariffRow(t)),
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    logger.info(`Sheet ${spreadsheetId} updated`);
  }

  formatTariffRow(t: TariffRecord) {
    return [
      t.warehouse_name,
      t.geo_name,
      t.delivery_coef,
      t.delivery_base,
      formatDate(t.valid_until),
      formatDate(t.data_date),
      formatDate(t.fetched_at),
    ];
  }

  sortTariffsByCoefficient(tariffs: TariffRecord[]) {
    return tariffs.sort((a, b) => a.delivery_coef - b.delivery_coef);
  }

  async tariffsToValue(tariffs: TariffRecord[]) {
    return tariffs.map((t) => this.formatTariffRow(t));
  }
}
