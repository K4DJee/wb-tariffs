import type { TariffRecord, WBTariffsApiResponse } from "../types/wb-tariffs.types.js";

export function parseRuDecimal(value: string): number | null {
  if (!value || value === "-") return null;
  const normalized = value.replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

export function parseCoefficient(value: string): number | null {
  const parsed = parseRuDecimal(value);
  if (parsed === null) return null;
  return parsed > 10 ? parsed / 100 : parsed;
}

export function mapApiResponseToRecords(
  apiResponse: WBTariffsApiResponse,
  dataDate: Date = new Date()
): TariffRecord[] {
  const { dtTillMax, warehouseList } = apiResponse.response.data;

  return warehouseList.map((item) => ({
    warehouse_name: item.warehouseName,
    geo_name: item.geoName || null,
    delivery_coef: parseCoefficient(item.boxDeliveryCoefExpr) ?? 1,
    delivery_base: parseRuDecimal(item.boxDeliveryBase) ?? 0,
    valid_until: new Date(dtTillMax),
    data_date: dataDate,             
    fetched_at: new Date(),  
  }));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
