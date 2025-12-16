class Logger {
    static getTimestamp() {
        return new Date().toISOString();
    }

    static log(message) {
        console.log(`[INFO]  ${message}`);
    }

    static warn(message) {
        console.warn(`[WARN]  ${message}`);
    }

    static error(message) {
        console.error(`[ERROR] ${message}`);
    }

    static success(message) {
        console.log(`[OK]    ${message}`);
    }
}

module.exports = Logger;
