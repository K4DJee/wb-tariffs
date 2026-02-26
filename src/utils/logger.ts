class Logger {
  private format( message: string, meta?: any) {
    const timestamp = new Date().toISOString();

    return JSON.stringify({
      timestamp,
      message,
      ...(meta && { meta }),
    });
  }

  info(message: string, meta?: any): void {
    if (meta !== undefined) {
        console.log("[INFO]", message, meta);
      } else {
        console.log("[INFO]", message);
      }
  }

  error(message: string, error?: unknown): void {
    if (!error) {
        console.error("[ERROR]", message);
        return;
      }
  
      if (error instanceof Error) {
        console.error("[ERROR]", message, {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error("[ERROR]", message, error);
      }
    }
}

export const logger = new Logger();

export default logger;
