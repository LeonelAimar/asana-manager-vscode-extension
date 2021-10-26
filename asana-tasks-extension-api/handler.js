"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const asana_1 = __importDefault(require("asana"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config/config"));
const asanaOauthClient = asana_1.default.Client.create({
    clientId: config_1.default.CLIENT_ID,
    clientSecret: config_1.default.SECRET_ID,
    redirectUri: config_1.default.REDIRECT_URI
});
class Server {
    app;
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        // SV Settings
        this.app.set('port', process.env.PORT || 3000);
        // Middlewares
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
    }
    routes() {
        this.app.get('/oauth/init', async (req, res) => {
            try {
                return res.json({ url: asanaOauthClient.app.asanaAuthorizeUrl() });
            }
            catch (error) {
                return res.status(500).json({ error });
            }
        });
        this.app.get('/oauth/callback', async (req, res) => {
            try {
                const { code } = req.query;
                if (code) {
                    const credentials = await asanaOauthClient.app.accessTokenFromCode(code);
                    const unixRevokingTime = Date.now() + credentials.expires_in * 1000;
                    const authData = {
                        credentials: jsonwebtoken_1.default.sign(credentials, String(process.env.JWT_SECRET), { expiresIn: '1y' }),
                        iat: Date.now(),
                        revokesOn: unixRevokingTime,
                        threshold: unixRevokingTime - 10 * 60 * 1000
                    };
                    const token = encodeURIComponent(JSON.stringify(authData));
                    return res.redirect(`http://localhost:54321/auth/${token}`);
                }
                else {
                    // Authorization could have failed. Show an error.
                    res.end('Error getting authorization: ' + req.query.error);
                }
            }
            catch (error) {
                return res.status(500).json({ error });
            }
        });
        this.app.get('/oauth/get-credentials', async (req, res) => {
            const { token } = req.query;
            if (!token)
                return res.status(400).json({ message: 'Please send token' });
            return res.json(jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET)));
        });
        this.app.get('/oauth/refresh', async (req, res) => {
            const { token } = req.query;
            if (!token)
                return res.status(400).json({ message: 'Please send token' });
            try {
                const oldCreds = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET));
                const newCreds = await asanaOauthClient.app.accessTokenFromRefreshToken(oldCreds.refresh_token, {
                    redirectUri: config_1.default.REDIRECT_URI
                });
                const unixRevokingTime = Date.now() + newCreds.expires_in * 1000;
                newCreds.refresh_token = oldCreds.refresh_token;
                const authData = {
                    credentials: jsonwebtoken_1.default.sign(newCreds, String(process.env.JWT_SECRET), { expiresIn: '1y' }),
                    iat: Date.now(),
                    revokesOn: unixRevokingTime,
                    threshold: unixRevokingTime - 10 * 60 * 1000,
                    accessToken: newCreds.access_token
                };
                return res.json(authData);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    start() {
        this.app.listen(this.app.get('port'), () => {
            console.log('Server running on port: ', this.app.get('port'));
        });
    }
}
const server = new Server();
// server.start()
const handler = (0, serverless_http_1.default)(server.app);
exports.handler = handler;
