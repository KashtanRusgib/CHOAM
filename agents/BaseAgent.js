const EventEmitter = require('events');
const Logger = require('../utils/logger');

class BaseAgent extends EventEmitter {
    constructor(id, name) {
        super();
        this.id = id;
        this.name = name;
    }

    connect(observer) {
        observer.registerAgent(this);
    }

    speak(observer, content) {
        observer.processMessage({
            senderId: this.id,
            content: content
        });
    }

    listen(message) {
        // Placeholder for AI processing logic
        Logger.log(`Agent ${this.id} received message from ${message.senderId}`);
    }
}

module.exports = { BaseAgent };
