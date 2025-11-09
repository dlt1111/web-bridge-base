class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private formatMessage(message: string): string {
    return `【${this.prefix}】${message}`;
  }

  log(message: string): void {
    console.log(this.formatMessage(message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage(message));
  }

  error(message: string): void {
    console.error(this.formatMessage(message));
  }
}

export default Logger;
