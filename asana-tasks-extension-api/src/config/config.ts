import { config as envConfig } from 'dotenv';

envConfig()

export default {
    REDIRECT_URI: process.env.REDIRECT_URI,
    SECRET_ID: process.env.ASANA_SECRET_ID,
    CLIENT_ID: Number(process.env.ASANA_CLIENT_ID)
}