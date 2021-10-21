import axios from 'axios';
import vscode, { Uri } from 'vscode';
import { API_BASE_URL } from './constants';
import polka from 'polka';
import { StateManager } from './StateManager';

export const authenticate = async ( fn: () => void ) => {
    const app = polka()

    app.get('/auth/:token', async (req, res) => {
        const { token } = req.params
        if ( !token ) {
            res.end('<h1>Something went wrong</h1>')
            return
        }

        await StateManager.setToken(decodeURIComponent(token))
        fn()

        res.end('<h1>Login went successful, now you can close this tab.</h1>')
        app.server?.close()
    })

    app.listen(54321, async ( error: Error ) => {
        try {
            if ( error ) {
                vscode.window.showErrorMessage(error.message)
            } else {
                const loginAuthUri = await axios.get<{ url: string }>(`${API_BASE_URL}/oauth/init`)
                vscode.env.openExternal(Uri.parse(loginAuthUri.data.url))
            }
        } catch (err: any) {
            vscode.window.showErrorMessage(err.message)
        }
    })
}