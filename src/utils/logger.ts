interface ILogger {
  prefix?: string;
  isOpen?: boolean;
}

class Logger {
  private prefix?: string;
  private isOpen?: boolean;

  constructor(params: ILogger = {}) {
    this.setOptions(params);
  }

  public setOptions(params: ILogger = {}) {
    const { prefix, isOpen } = params;
    if (prefix != null) this.prefix = prefix;
    if (prefix != null) this.isOpen = isOpen;
  }

  public log(message: string): void {
    if (!this.isOpen) return;
    console.log(this.formatMessage(message));
  }

  public warn(message: string): void {
    if (!this.isOpen) return;
    console.warn(this.formatMessage(message));
  }

  public error(message: string): void {
    if (!this.isOpen) return;
    console.error(this.formatMessage(message));
  }

  private formatMessage(message: string): string {
    return `【${this.prefix}】${message}`;
  }
}

export default Logger;
