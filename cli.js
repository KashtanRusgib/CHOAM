const readline = require('readline');
const { HierarchicalObserver } = require('./index');
const { BaseAgent } = require('./agents/BaseAgent');
const Logger = require('./utils/logger');

const observer = new HierarchicalObserver();
const userAgent = new BaseAgent('USER_01', 'Human');

observer.start();
userAgent.connect(observer);

console.log("------------------------------------------------");
console.log("RHOAM CLI CHAT INITIALIZED");
console.log("Type a message and press Enter. Type 'exit' to quit.");
console.log("------------------------------------------------");

observer.on('message_approved', (msg) => {
    console.log(`\n[${msg.senderId}]: ${msg.content}`);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You> '
});

rl.prompt();

rl.on('line', (input) => {
    const trimmed = input.trim();
    
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log("\nExiting chat...");
        userAgent.disconnect();
        observer.stop();
        rl.close();
        process.exit(0);
    }
    
    if (trimmed) {
        userAgent.speak(observer, trimmed);
    }
    
    rl.prompt();
});

rl.on('SIGINT', () => {
    console.log("\n\nReceived interrupt signal. Exiting...");
    userAgent.disconnect();
    observer.stop();
    rl.close();
    process.exit(0);
});
