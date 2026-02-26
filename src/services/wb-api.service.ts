import axios from "axios";
import logger from "../utils/logger.js";
import * as dotenv from 'dotenv';
import { mapApiResponseToRecords } from "../utils/parse.js";
dotenv.config();


export class WBTariffsService{
    private readonly apiToken: string;
    private readonly endpoint: string;
    constructor(){
        this.apiToken = process.env.WB_API_TOKEN!;
        this.endpoint = process.env.WB_TARIFFS_ENDPOINT!;
    }


    async fetchTariffs(){
        try{
            const dateStr = new Date().toISOString().split('T')[0];
            const endpointForCurrentDay = `${this.endpoint}?date=${dateStr}`;
            const response = await axios.get(endpointForCurrentDay, {
                headers:{
                    'Authorization': this.apiToken,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            logger.info(`Received data of tariffs from ${endpointForCurrentDay}`);
            const records = mapApiResponseToRecords(response.data)
            return records;
        }
        catch(e){
            logger.error("Error when receiving data: ", e)
            throw new Error(`Failed to fetch WB tariffs: ${e instanceof Error ? e.message : 'Unknown error'}`)
        }
    }
}