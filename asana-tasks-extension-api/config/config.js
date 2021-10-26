"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.default = {
    REDIRECT_URI: process.env.REDIRECT_URI,
    SECRET_ID: process.env.ASANA_SECRET_ID,
    CLIENT_ID: Number(process.env.ASANA_CLIENT_ID)
};
