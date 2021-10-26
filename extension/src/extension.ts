import asana from 'asana';
import vscode, { Uri } from 'vscode';
import { StateManager } from './services/StateManager';
import { authenticate } from './services/authenticate';
import { AsanaClient } from './services/AsanaClientManager';

import { ViewPanel } from './services/ViewPanel';
import { sendWorkspace, SidebarPanel } from './services/SidebarPanel';

// Interfaces
import { ITask, IQuickPickTask } from './interfaces/TaskInterfaces'
import { IQuickPickWorkspace } from './interfaces/WorkspaceInterfaces';
import { IProject, IQuickPickProject } from './interfaces/ProjectInterfaces';

export async function activate(context: vscode.ExtensionContext) {
    ViewPanel.extUri = context.extensionUri
    StateManager.globalState = context.globalState
    await AsanaClient.createOrUpdate()
    const commands = []

    const sidebarProvider = new SidebarPanel(context.extensionUri)
    commands.push(
        vscode.window.registerWebviewViewProvider(
            "asana-tasks-sidebar",
            sidebarProvider
        )
    )

    commands.push(vscode.commands.registerCommand('asana-manager.uncompletedTasks', async () => {
        try {
            const clientValid = await AsanaClient.createOrUpdate()

            if ( clientValid ) {
                const input = vscode.window.createQuickPick<IQuickPickTask>()
                input.placeholder = 'Loading...'
                input.busy = true
                input.show()

                const myTasks = await AsanaClient.getAllTasks()
                console.log(myTasks)
    
                const tasks = formatQuickPickTaskItems(myTasks)
                input.items = tasks
                input.placeholder = 'Select a task'
                setTimeout(() => input.busy = false, 1000)

                input.onDidChangeSelection( async (task) => {
                    input.busy = true
                    input.placeholder = 'Opening task...'
                    // const taskObject = await AsanaClient.getTaskById(task[0].gid)
                    // vscode.env.openExternal(Uri.parse(taskObject.permalink_url as string))
                    ViewPanel.resourceId = task[0].gid
                    ViewPanel.createOrShow()
                    input.hide()
                })

                input.onDidHide(() => input.dispose())
            }
        } catch (err: any) {
            console.log(err)
            vscode.window.showErrorMessage(err.message)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.getWorkspaces', async () => {
        try {
            const clientValid = await AsanaClient.createOrUpdate()

            if ( clientValid ) {
                const workspaces = await AsanaClient.client.workspaces.findAll()

                const input = vscode.window.createQuickPick<IQuickPickWorkspace>()
                input.placeholder = 'Loading...'
                input.busy = true
                input.show()

                const formattedWorksapces = workspaces.data.map( workspace => {
                    return {
                        label: workspace.name,
                        detail: workspace.gid,
                        workspace
                    }
                })

                input.items = formattedWorksapces
                input.placeholder = 'Select your workspace'
                setTimeout(() => input.busy = false, 1000)

                input.onDidChangeSelection( async (picked) => {
                    input.busy = true
                    console.log(picked)
                    await AsanaClient.setWorkspaceFormShortOne( picked[0].workspace )
                    input.placeholder = `Nice! ${picked[0].label} setted!`
                    sendWorkspace(sidebarProvider._view)
                    setTimeout(() => input.hide(), 1500)
                })

                input.onDidHide(() => input.dispose())
            }
        } catch (err: any) {
            console.log(err)
            vscode.window.showErrorMessage(err.message)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.getProjects', async () => {
        try {
            const clientValid = await AsanaClient.createOrUpdate()
            const workspace = AsanaClient.currentWorkspace

            if ( clientValid ) {
                const input = vscode.window.createQuickPick<IQuickPickProject>()
                input.placeholder = 'Loading...'
                input.busy = true
                input.show()
                
                if ( !workspace ) {
                    input.placeholder = "First, you've to set up a workspace, pick one below"
                    return setTimeout(() => {
                        vscode.commands.executeCommand('asana-manager.getWorkspaces')
                    }, 2500)
                }

                const projects = await AsanaClient.getAllProjects()

                console.log(projects)

                const formattedProjects = projects.map( project => {
                    return {
                        label: project.name,
                        detail: project.gid
                    }
                })

                input.items = formattedProjects
                input.placeholder = `Select a project (${projects.length} in total)`
                setTimeout(() => input.busy = false, 1000)

                input.onDidChangeSelection( async (picked) => {
                    input.busy = true
                    const project: IProject = await AsanaClient.client.projects.findById(picked[0].detail)
                    // What do i do?
                    vscode.env.openExternal(Uri.parse(project.permalink_url as string))
                    setTimeout(() => input.hide(), 1500)
                })

                input.onDidHide(() => input.dispose())
            }
        } catch (err: any) {
            console.log(err)
            vscode.window.showErrorMessage(err.message)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.todayTasks', async () => {
        try {
            const clientValid = await AsanaClient.createOrUpdate()

            if ( clientValid ) {
                const input = vscode.window.createQuickPick<IQuickPickTask>()
                input.placeholder = 'Cargando...'
                input.busy = true
                input.show()
    
                const myTasks = await AsanaClient.getAllTasks()
                const todayDate = new Date().toLocaleDateString().split('/').reverse().join('-')
                myTasks.data = myTasks.data.filter( task => task.due_on === todayDate )
    
                if ( myTasks.data.length > 0 ) {
                    console.log(myTasks)
                    const tasks = formatQuickPickTaskItems(myTasks)
                    input.items = tasks
                    input.placeholder = 'Select your uncompleted task'
                    setTimeout(() => input.busy = false, 1000)

                    input.onDidChangeSelection( async (task) => {
                        input.busy = true
                        input.placeholder = 'Opening task...'
                        // const taskObject = await AsanaClient.getTaskById(task[0].gid)
                        // vscode.env.openExternal(Uri.parse(taskObject.permalink_url as string))
                        ViewPanel.resourceId = task[0].gid
                        ViewPanel.createOrShow()
                        input.hide()
                    })
                    
                    input.onDidHide(() => input.dispose())
                } else {
                    input.hide()
                    infoMessage('You dont have tasks for today!')
                }
            }
        } catch (err) {
            console.log(err)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.auth', async () => {
        try {
            authenticate(() => {})
        } catch (err) {
            console.log(err)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.whoAmI', async () => {
        if ( !StateManager.getToken() || StateManager.getToken() === '' ) {
            AsanaClient.showAuthPopup()
            return
        }

        try {
            await AsanaClient.createOrUpdate()
            const myUser = AsanaClient.currentUser
            console.log(myUser)

            infoMessage(`Welcome to Asana Manager, ${AsanaClient.currentUser.name}!`)
        } catch ( err: any ) {
            console.log(err)
            AsanaClient.showAuthPopup()
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.authRevoke', async () => {
        try {
            StateManager.setToken('')
            AsanaClient.client = undefined as unknown as asana.Client

            infoMessage(`You have been logged out succesfully!`)
        } catch ( err: any ) {
            console.log(err)
        }
    }))

    commands.push(vscode.commands.registerCommand('asana-manager.deleteWorkspace', async () => {
        StateManager.setWorkspace(undefined as unknown as asana.resources.Workspaces.Type)
    }))

	context.subscriptions.push(...commands);
}

const infoMessage = ( message: string ) => vscode.window.showInformationMessage(message)

const formatQuickPickTaskItems = ( tasks: asana.resources.ResourceList<ITask> ): IQuickPickTask[] => {
    return tasks.data.map( ( task ) => {
        return {
            label: task.name,
            detail: task.notes,
            description: task.due_on || undefined,
            gid: task.gid,
            custom: task.custom_fields,
            task
        }
    })
}

export function deactivate() {}
