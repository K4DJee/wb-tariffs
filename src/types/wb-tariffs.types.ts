export interface WBTariffsApiResponse {
    response: {
      data: WBTariffsData;
    };
  }

export interface WBTariffsData {
    dtNextBox: string;
    dtTillMax: string;
    warehouseList: WarehouseItem[];
}

export interface WarehouseItem {
    boxDeliveryBase: string;              
    boxDeliveryCoefExpr: string;          
    boxDeliveryLiter: string;             
    boxDeliveryMarketplaceBase: string;   
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceLiter: string;  
    boxStorageBase: string;               
    boxStorageCoefExpr: string;           
    boxStorageLiter: string;              
    geoName: string;                      
    warehouseName: string;                
}

export interface TariffRecord {
    warehouse_name: string;
    geo_name: string | null;
    delivery_coef: number;
    delivery_base: number;
    valid_until: Date;
    data_date: Date;
    fetched_at: Date;
  }