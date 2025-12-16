const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const Logger = require('./utils/logger');

const RULES_PATH = path.join(__dirname, 'config', 'rules.json');

class HierarchicalObserver extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = config;
        this.id = config.id || 'ROOT_OBSERVER';
        this.agents = new Map();
        this.rules = [];
        this.isRunning = false;
        this.loadRules();
        Logger.success("Hierarchical Observer initialized.");
    }

    loadRules() {
        try {
            if (fs.existsSync(RULES_PATH)) {
                const data = fs.readFileSync(RULES_PATH, 'utf8');
                this.rules = JSON.parse(data);
                Logger.success(`Loaded ${this.rules.length} rules from configuration.`);
            } else {
                Logger.warn("Rules configuration file not found. Defaulting to empty.");
            }
        } catch (error) {
            Logger.error(`Failed to load rules: ${error.message}`);
        }
    }

    start() {
        if (this.isRunning) {
            Logger.log("Observer is already running.");
            return;
        }
        Logger.log("Starting Hierarchical Observer...");
        this.isRunning = true;
        Logger.success("Observer is now actively monitoring the environment.");
    }

    stop() {
        if (!this.isRunning) {
            Logger.log("Observer is already stopped.");
            return;
        }
        Logger.log("Stopping Hierarchical Observer...");
        this.isRunning = false;
        Logger.log("Observer stopped.");
    }

    registerAgent(agent) {
        if (!agent.id) {
            Logger.warn("Attempted to register agent without ID.");
            return;
        }
        if (this.agents.has(agent.id)) {
            Logger.warn(`Agent ${agent.id} is already registered.`);
            return;
        }
        this.agents.set(agent.id, agent);
        Logger.success(`Agent ${agent.id} registered.`);

        // Recursive bubbling check: If agent is an EventEmitter (Sub-Observer), listen to it.
        if (typeof agent.on === 'function') {
            Logger.log(`Registered Sub-Observer ${agent.id}. Attaching recursive listeners.`);
            agent.on('message_approved', (msg) => {
                // Re-emit (bubble) with context
                this.emit('message_approved', msg);
            });
        }
    }

    unregisterAgent(agentId) {
        if (this.agents.delete(agentId)) {
            Logger.success(`Agent ${agentId} unregistered.`);
        } else {
            Logger.warn(`Attempted to unregister non-existent agent ${agentId}.`);
        }
    }

    processMessage(message) {
        if (!this.isRunning) {
            Logger.error("Observer is not running. Message rejected.");
            return false;
        }
        if (!message || !message.senderId || !message.content) {
            Logger.error("Invalid message structure.");
            return false;
        }
        if (!this.agents.has(message.senderId)) {
            Logger.error(`Agent ${message.senderId} not registered.`);
            return false;
        }

        Logger.log(`Processing message from ${message.senderId}: ${message.content.substring(0, 50)}...`);

        // Enforce Rules
        for (const rule of this.rules) {
            if (!this.enforceRule(rule, message)) {
                Logger.warn(`Message blocked by rule: ${rule.name}`);
                return false;
            }
        }

        // If we get here, message is valid
        this.emit('message_approved', message);
        Logger.success(`Message accepted and broadcast: ${message.content.substring(0, 50)}...`);
        return true;
    }

    enforceRule(rule, context) {
        switch (rule.type) {
            case 'restriction':
                if (rule.params && rule.params.limit && context.content.length > rule.params.limit) {
                    Logger.warn(`Violation: Message exceeds limit of ${rule.params.limit}.`);
                    return false;
                }
                break;
            case 'censorship':
                if (rule.params && rule.params.tokens) {
                    for (const token of rule.params.tokens) {
                        if (context.content.includes(token)) {
                            Logger.warn(`Violation: Message contains forbidden token '${token}'.`);
                            return false;
                        }
                    }
                }
                break;
            default:
                // Unknown rule type, fail open (log warning but allow)
                Logger.warn(`Unknown rule type: ${rule.type}`);
        }
        return true;
    }
}

module.exports = { HierarchicalObserver };
