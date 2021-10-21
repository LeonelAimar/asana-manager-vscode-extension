import asana, { auth } from 'asana';
import axios from 'axios';
import vscode, { DebugConsoleMode } from 'vscode';
import { API_BASE_URL } from './constants';
import { StateManager } from './StateManager';

import { IAsanaCredentials, ICredentialsEncoded } from '../interfaces/CredentialInterface';
import { ITask } from '../interfaces/TaskInterfaces';

export class AsanaClient {
    static client: asana.Client
    static currentUser: asana.resources.Users.Type
    static currentWorkspace: asana.resources.Workspaces.Type | undefined
    static fetchingProjects: asana.resources.Projects.Type[] = []

    static async createOrUpdate(): Promise<boolean> {
        this.currentWorkspace = StateManager.getWorkspace()
        // StateManager.setWorkspace(undefined)

        if ( !StateManager.getToken() || StateManager.getToken() === '' ) {
            this.showAuthPopup()
            return false
        }

        const NOW = Date.now()

        try {
            const authData: ICredentialsEncoded = JSON.parse(StateManager.getToken() as string)
            console.log(authData)
            console.log('Now:', new Date(NOW).toLocaleTimeString())
            console.log('Threshold:', new Date(authData.threshold).toLocaleTimeString())
            console.log('Revokes:', new Date(authData.revokesOn).toLocaleTimeString())

            if ( NOW < authData.revokesOn && !this.client ) {
                const credentialsRequest = await axios.get<IAsanaCredentials>(`${API_BASE_URL}/oauth/get-credentials?token=${authData.credentials}`)
                const credentials = credentialsRequest.data

                this.client = asana.Client.create().useOauth({
                    credentials: {
                        access_token: credentials.access_token,
                        refresh_token: credentials.refresh_token
                    }
                })
            } else if ( NOW > authData.threshold ) {
                console.log('Old Credentials')
                const newCreds = await axios.get<ICredentialsEncoded>(`${API_BASE_URL}/oauth/refresh?token=${authData.credentials}`)
                const credentials = newCreds.data

                this.client = asana.Client.create().useOauth({
                    credentials: {
                        access_token: credentials.accessToken as string
                    }
                })

                delete credentials.accessToken
                
                StateManager.setToken(JSON.stringify(credentials))
            }

            if ( !this.currentUser && this.client ) await this.setUser()

            return true
        } catch (err: any) {
            console.log(err.message)
            this.showAuthPopup()
            return false
        }
    }

    static async setUser() {
        try {
            this.currentUser = await this.client.users.me()
        } catch (err) {
            throw err
        }
    }

    static async getAllTasks() {
        if ( !this.currentUser ) await this.setUser()

        const test = await this.client.userTaskLists.getUserTaskListForUser('me', {
            workspace: this.currentUser.workspaces[0].gid,
            opt_fields: 'id,name,assignee_status,completed,due_on,completed_at,custom_fields,notes'
        }) as any
        // console.log(test)
        const tasks = await this.client.userTaskLists.tasks(test.gid as string, {
            completed_since: 'now',
            opt_fields: 'id,name,assignee_status,completed,due_on,completed_at,custom_fields,notes'
        })
        console.log(tasks)

        return await this.client.tasks.findAll({
            assignee: Number(this.currentUser.gid),
            workspace: this.currentUser.workspaces[0].gid,
            completed_since: 'now',
            opt_fields: 'id,name,assignee_status,completed,due_on,completed_at,custom_fields,notes'
        }, {
            headers: {
                'Asana-Disable': 'new_user_task_lists'
            }
        })
    }

    static async getTaskById( taskGid: string ) {
        const fields = [
            'id','name','projects','assignee_status','completed','due_on','completed_at',
            'custom_fields','notes','html_notes','followers','followers.name','followers.photo',
            'permalink_url','tags'
        ]

        const taskObject: ITask = await AsanaClient.client.tasks.findById(taskGid, {
            opt_fields: fields.join(',')
        })
        return taskObject
    }

    static async getAllProjects(): Promise<asana.resources.Projects.Type[]> {
        await this.paginateProjects()
        return this.fetchingProjects
    }

    static async getUsers( index: number = 0, shortUsersArray: asana.resources.Users.ShortType[], arrayToFill: asana.resources.Users.Type[] ): Promise<asana.resources.Users.Type[] | void> {
        try {
            const user = await this.client.users.findById( shortUsersArray[index].gid )
            arrayToFill.push(user)

            if ( !shortUsersArray[index+1] ) return arrayToFill
            else throw { message: 'intentional' }
        } catch (err) {
            if ( shortUsersArray[index+1] ) return this.getUsers( index + 1, shortUsersArray, arrayToFill )
            return
        }
    }

    static async getStoriesByTask( arrayToFill: asana.resources.Stories.Type[], taskGid: string, nextPage: string | undefined = undefined ): Promise<asana.resources.Stories.Type[] | void> {
        try {
            const params: { offset?: string, opt_fields?: string } = {
                opt_fields: 'html_text,created_by,created_by.name,text,resource_type,resource_subtype,created_at'
            }

            if ( nextPage ) params.offset = nextPage
            
            const storyLine = await this.client.stories.findByTask( taskGid, params )
            arrayToFill.push(...storyLine.data)

            if ( storyLine._response.next_page === null ) return arrayToFill
            else throw { offset: storyLine._response.next_page?.offset }
        } catch ( err: any ) {
            return this.getStoriesByTask( arrayToFill, taskGid, err.offset )
        }
    }

    static async paginateProjects( nextPage: string | undefined = undefined ): Promise<void> {
        try {
            const params: asana.resources.Projects.FindByParams = {
                archived: false
            }

            if ( nextPage ) params.offset = nextPage

            const request = await AsanaClient.client.projects.findByWorkspace(this.currentWorkspace!.gid, params)
            this.fetchingProjects.push(...request.data)

            if ( request._response.next_page === null ) return
            else throw { offset: request._response.next_page?.offset }
        } catch ( err: any ) {
            return this.paginateProjects( err.offset )
        }
    }

    static async setWorkspaceFormShortOne( shortWorkspace: asana.resources.Workspaces.ShortType ) {
        const longWorkspace = await AsanaClient.client.workspaces.findById(shortWorkspace.gid)
        StateManager.setWorkspace(longWorkspace)
        this.currentWorkspace = longWorkspace
    }

    static async showAuthPopup() {
        let answer = await vscode.window.showInformationMessage('Please authenticate with Asana', 'Authenticate', 'Close')
        answer && answer === 'Authenticate' && vscode.commands.executeCommand('asana-manager.auth')
    }
}