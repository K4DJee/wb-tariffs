import runMigrations from "./db/init.js";
import { SchedulerService } from "./services/scheduler.service.js";

async function main(): Promise<void> {
    (async ()=>{
        try {
            await runMigrations();
            const scheduler = new SchedulerService();
            scheduler.start();
            
            await new Promise(() => {});
        } catch (err) {
            console.error('Fatal error:', err);
            process.exit(1);
        }
    })();
}   

main();