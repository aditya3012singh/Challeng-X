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

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (...args) => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset}`,
      ...args
    );
  },

  error: (...args) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset}`,
      ...args
    );
  },

  warn: (...args) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset}`,
      ...args
    );
  },

  debug: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset}`,
        ...args
      );
    }
  },

  success: (...args) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset}`,
      ...args
    );
  },
};