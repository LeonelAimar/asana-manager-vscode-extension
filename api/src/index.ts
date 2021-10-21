import { config as envConfig } from 'dotenv';
import express from 'express';
import asana from 'asana';
import jwt from 'jsonwebtoken';

import { IAsanaCredentials, ICredentialsEncoded } from './interfaces/CredentialInterface'

envConfig()

const CONFIG = {
    REDIRECT_URI: process.env.REDIRECT_URI,
    SECRET_ID: process.env.ASANA_SECRET_ID,
    CLIENT_ID: Number(process.env.ASANA_CLIENT_ID)
}

const asanaOauthClient = asana.Client.create({
    clientId: CONFIG.CLIENT_ID,
    clientSecret: CONFIG.SECRET_ID,
    redirectUri: CONFIG.REDIRECT_URI
})

class Server {
    public app: express.Application

    constructor() {
        this.app = express()
        this.config()
        this.routes()
    }

    config() {
        // SV Settings
        this.app.set('port', process.env.PORT || 3002)
        // Middlewares
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        // this.app.use(cors())
    }

    routes() {
        this.app.get('/oauth/init', async (req, res) => {
            try {
                return res.json({ url: asanaOauthClient.app.asanaAuthorizeUrl() })
            } catch ( error ) {
                return res.status(500).json({ error })
            }
        })
        
        this.app.get('/oauth/callback', async (req, res) => {
            try {
                const { code } = req.query
                if ( code ) {
                    const credentials = await asanaOauthClient.app.accessTokenFromCode(code as string) as IAsanaCredentials
                    const unixRevokingTime = Date.now() + credentials.expires_in * 1000
        
                    const authData: ICredentialsEncoded = {
                        credentials: jwt.sign(
                            credentials, 
                            String(process.env.JWT_SECRET), 
                            { expiresIn: '1y'}
                        ),
                        iat: Date.now(),
                        revokesOn: unixRevokingTime,
                        threshold: unixRevokingTime - 10*60*1000
                    }
        
                    const token = encodeURIComponent(JSON.stringify(authData))
        
                    return res.redirect(`http://localhost:54321/auth/${token}`)
                } else {
                  // Authorization could have failed. Show an error.
                  res.end('Error getting authorization: ' + req.query.error);
                }
            } catch ( error ) {
                return res.status(500).json({ error })
            }
        })
        
        this.app.get('/oauth/get-credentials', async (req, res) => {
            const { token } = req.query
            if ( !token ) return res.status(400).json({ message: 'Please send token' })
        
            return res.json(jwt.verify(token as string, String(process.env.JWT_SECRET)))
        })
        
        this.app.get('/oauth/refresh', async (req, res) => {
            const { token } = req.query
            if ( !token ) return res.status(400).json({ message: 'Please send token' })
        
            try {
                const oldCreds = jwt.verify(token as string, String(process.env.JWT_SECRET)) as IAsanaCredentials
                
                const newCreds = await asanaOauthClient.app.accessTokenFromRefreshToken(oldCreds.refresh_token!, {
                    redirectUri: CONFIG.REDIRECT_URI
                }) as IAsanaCredentials
        
                const unixRevokingTime = Date.now() + newCreds.expires_in * 1000
                newCreds.refresh_token = oldCreds.refresh_token
        
                const authData: ICredentialsEncoded = {
                    credentials: jwt.sign(
                        newCreds, 
                        String(process.env.JWT_SECRET), 
                        { expiresIn: '1y'}
                    ),
                    iat: Date.now(),
                    revokesOn: unixRevokingTime,
                    threshold: unixRevokingTime - 10*60*1000,
                    accessToken: newCreds.access_token
                }
                
                return res.json(authData)
            } catch (err) {
                console.log(err)
            }
        })
    }

    start() {
        this.app.listen(this.app.get('port'), () => {
            console.log('Server running on port: ', this.app.get('port'))
        })
    }
}

const server = new Server()
server.start()