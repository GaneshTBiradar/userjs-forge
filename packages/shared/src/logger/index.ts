import { type LogEntry, type LoggerConfig, LogLevel } from "./types";

export class Logger {
  private readonly level: LogLevel;
  private readonly prefix: string;
  private readonly timestampFormat: string;
  private readonly history: LogEntry[] = [];
  private readonly maxHistorySize = 100;

  constructor(config: LoggerConfig) {
    this.level = LogLevel[config.level];
    this.prefix = config.prefix;
    this.timestampFormat = config.timestampFormat;
  }

  private getTimestamp(): string {
    const now = new Date();
    switch (this.timestampFormat) {
      case "ISO":
        return now.toISOString();
      case "locale":
        return now.toLocaleString();
      default:
        return "";
    }
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = this.getTimestamp();
    const timestampStr = timestamp ? `[${timestamp}] ` : "";
    const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : "";
    return `${timestampStr}${this.prefix} [${level}] ${message}${dataStr}`;
  }

  private addToHistory(level: LogLevel, message: string, data?: unknown): void {
    this.history.push({
      level,
      message,
      timestamp: new Date(),
      data,
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage("DEBUG", message, data));
      this.addToHistory(LogLevel.DEBUG, message, data);
    }
  }

  info(message: string, data?: unknown): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage("INFO", message, data));
      this.addToHistory(LogLevel.INFO, message, data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage("WARN", message, data));
      this.addToHistory(LogLevel.WARN, message, data);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.level <= LogLevel.ERROR) {
      const errorData =
        error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(this.formatMessage("ERROR", message, errorData));
      this.addToHistory(LogLevel.ERROR, message, errorData);
    }
  }

  getHistory(): ReadonlyArray<LogEntry> {
    return [...this.history];
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  exportLogs(): string {
    return this.history
      .map((entry) => {
        const timestamp = entry.timestamp.toISOString();
        const level = LogLevel[entry.level];
        const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
        return `[${timestamp}] [${level}] ${entry.message}${data}`;
      })
      .join("\n");
  }
}

export { LogLevel, type LoggerConfig, type LogEntry };
