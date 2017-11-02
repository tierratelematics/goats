export enum LogTextColor {
    RESET = "\x1b[0m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    BRIGHT = "\x1b[1m",
    DIM = "\x1b[2m",
    BLACK = "\x1b[30m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m"
}

export function colorize(message: string, color: LogTextColor): string {
    return `${color} ${message} ${LogTextColor.RESET}`;
}