"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.OPENAI_API_KEY = exports.DATABASE_URL = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables once at startup
(0, dotenv_1.config)({ path: '.env' });
const databaseUrl = process.env.DATABASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}
if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
exports.DATABASE_URL = databaseUrl;
exports.OPENAI_API_KEY = openaiApiKey;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
//# sourceMappingURL=env.js.map