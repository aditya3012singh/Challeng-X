// Simple logger utility for debugging and logging

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

class Logger {
  static getTimestamp() {
    return new Date().toISOString();
  }

  static info(...args) {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${colors.bright}[${this.getTimestamp()}]${colors.reset}`,
      ...args
    );
  }

  static error(...args) {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}[${this.getTimestamp()}]${colors.reset}`,
      ...args
    );
  }

  static warn(...args) {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}[${this.getTimestamp()}]${colors.reset}`,
      ...args
    );
  }

  static debug(...args) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}[${this.getTimestamp()}]${colors.reset}`,
        ...args
      );
    }
  }

  static success(...args) {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}[${this.getTimestamp()}]${colors.reset}`,
      ...args
    );
  }
}

export default Logger;