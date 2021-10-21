import asana from 'asana';
import vscode from 'vscode'

const TOKEN_KEY = 'asana-task-credentials'
const WORKSPACE_KEY = 'asana-task-workspace'

export class StateManager {
    static globalState: vscode.Memento;
    
    static setToken( token: string ) {
        return this.globalState.update(TOKEN_KEY, token)
    }

    static getToken(): string | undefined {
        return this.globalState.get(TOKEN_KEY)
    }

    static setWorkspace( workspace: asana.resources.Workspaces.Type ) {
    // static setWorkspace( workspace: any ) {
        return this.globalState.update(WORKSPACE_KEY, workspace)
    }

    static getWorkspace(): asana.resources.Workspaces.Type | undefined {
        return this.globalState.get(WORKSPACE_KEY)
    }
}