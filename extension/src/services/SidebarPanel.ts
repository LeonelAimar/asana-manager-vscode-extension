import vscode, { Uri } from 'vscode';
import { ITask } from '../interfaces/TaskInterfaces';
import { POST_MESSAGES, ResourceTypes } from '../interfaces/ViewsInterfaces';
import { AsanaClient } from './AsanaClientManager';
import { authenticate } from './authenticate';
import { getNonce } from './getNonce';
import { ViewPanel } from './ViewPanel';

export class SidebarPanel implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        }

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            await AsanaClient.createOrUpdate()
            
            switch (data.type) {
                case 'onInfo': {
                    if ( !data.value ) return
                    vscode.window.showInformationMessage(data.value)
                    break;
                }
                case 'onError': {
                    if ( !data.value ) return
                    vscode.window.showErrorMessage(data.value)
                    break;
                }
                case POST_MESSAGES.GET_USER: {
                    sendUser(this._view)
                    break;
                }
                case POST_MESSAGES.AUTH_BEGIN: {
                    authenticate(() => sendUser(this._view))
                    break;
                }
                case POST_MESSAGES.AUTH_REVOKE: {
                    vscode.commands.executeCommand('asana-manager.authRevoke')
                    break;
                }
                case POST_MESSAGES.GET_TASKS: {
                    sendTasks( this._view, data.value )
                    break;
                }
                case POST_MESSAGES.GET_WORKSPACE: {
                    sendWorkspace(this._view)
                    break;
                }
                case POST_MESSAGES.SET_WORKSPACE: {
                    vscode.commands.executeCommand('asana-manager.getWorkspaces')
                    break;
                }
                case POST_MESSAGES.OPEN_LINK: {
                    console.log(data.value)
                    const task = await AsanaClient.getTaskById(data.value)
                    vscode.env.openExternal(Uri.parse(task.permalink_url as string))
                    break;
                }
                case POST_MESSAGES.OPEN_RESOURCE: {
                    ViewPanel.showResource = data.value.resourceType as ResourceTypes
                    ViewPanel.resourceId = data.value.resourceId as ResourceTypes
                    // ViewPanel.kill()
                    ViewPanel.createOrShow()
                    break;
                }
            }
        })
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        )

        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        )

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'VueSidebar.js')
        )
        const scriptUri1 = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', '224.VueSidebar.js')
        )
        const scriptUri2 = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', '876.VueSidebar.js')
        )

        // const styleMainUri = webview.asWebviewUri(
        //     vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css')
        // )
        
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        
        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <!--
                        Use a content security policy to only allow loading images from https or from our extension directory,
                        and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
                webview.cspSource
            }; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    <script nonce="${nonce}">
                        const tsvscode = acquireVsCodeApi()
                    </script>
                </head>
                <body>
                    <div id="SidebarApp"></div>
                    <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
                    <script nonce="${nonce}" type="module" src="${scriptUri1}"></script>
                    <script nonce="${nonce}" type="module" src="${scriptUri2}"></script>
                </body>
                </html>`;
    }
}

export const sendUser = async ( ctxWebview: vscode.WebviewView | undefined ) => {
    await AsanaClient.createOrUpdate()
    
    ctxWebview && AsanaClient.currentUser && ctxWebview.webview.postMessage({
        type: 'setUser',
        value: AsanaClient.currentUser
    })
}

export const sendWorkspace = async ( ctxWebview: vscode.WebviewView | undefined ) => {
    await AsanaClient.createOrUpdate()
    
    ctxWebview && AsanaClient.currentWorkspace && ctxWebview.webview.postMessage({
        type: 'setWorkspace',
        value: AsanaClient.currentWorkspace
    })
}

export const sendTasks = async ( ctxWebview: vscode.WebviewView | undefined, forToday: boolean ) => {
    const myTasks = await AsanaClient.getAllTasks()
    const todayDate = new Date().toLocaleDateString().split('/').reverse().join('-')
    if ( forToday ) {
        // myTasks.data = myTasks.data.filter( task => task.assignee_status === 'today' )
        myTasks.data = myTasks.data.filter( task => task.due_on === todayDate )
    }


    ctxWebview && ctxWebview.webview.postMessage({
        type: 'setTasks',
        value: myTasks.data
    })
}