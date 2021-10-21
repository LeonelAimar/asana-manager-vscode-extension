import vscode, { Uri } from "vscode";

import { getNonce } from "./getNonce";

import { POST_MESSAGES_WV, ResourceTypes } from "../interfaces/ViewsInterfaces";
import { AsanaClient } from "./AsanaClientManager";

export class ViewPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static extUri: vscode.Uri;
    public static showResource: ResourceTypes | undefined;
    public static resourceId: string | number | undefined;
    public static listenersSetted: boolean = false


    public static currentPanel: ViewPanel | undefined;

    public static readonly viewType = 'view-panel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri = this.extUri ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (ViewPanel.currentPanel) {
            ViewPanel.currentPanel._panel.reveal(column);
            ViewPanel.currentPanel._update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ViewPanel.viewType,
            'Asana Manager',
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "media"),
                    // vscode.Uri.joinPath(extensionUri, "out/compiled"),
                ],
            }
        );

        ViewPanel.currentPanel = new ViewPanel(panel, extensionUri);
    }

    public static kill() {
        ViewPanel.currentPanel?.dispose();
        ViewPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ViewPanel.currentPanel = new ViewPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // // Handle messages from the webview
        // this._panel.webview.onDidReceiveMessage(
        //   (message) => {
        //     switch (message.command) {
        //       case "alert":
        //         vscode.window.showErrorMessage(message.text);
        //         return;
        //     }
        //   },
        //   null,
        //   this._disposables
        // );
    }

    public dispose() {
        ViewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop()
            x && x.dispose()
        }
    }

    private async _update() {
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);
        if ( !ViewPanel.listenersSetted ) {
            webview.onDidReceiveMessage(async (data) => {
                await AsanaClient.createOrUpdate()
                
                switch (data.type) {
                    case 'onInfo':
                        if (!data.value) return;
                        vscode.window.showInformationMessage(data.value);
                        break;
                    case 'onError':
                        if (!data.value) return;
                        vscode.window.showErrorMessage(data.value);
                        break;
                    case POST_MESSAGES_WV.GET_RESOURCE_DATA:
                        let resourceData
                        if ( ViewPanel.showResource === ResourceTypes.TASK ) {
                            resourceData = await AsanaClient.getTaskById(ViewPanel.resourceId as string)
                        }
    
                        this._panel.webview.postMessage({
                            type: 'setResource',
                            value: resourceData
                        })
                        break;
                    case POST_MESSAGES_WV.GET_TASK:
                        const task = await AsanaClient.getTaskById(ViewPanel.resourceId as string)
    
                        this._panel.webview.postMessage({
                            type: 'setTask',
                            value: task
                        })
                        break;
                    case POST_MESSAGES_WV.GET_RESOURCE_TYPE:
                        console.log(data)
                        this._panel.webview.postMessage({
                            type: 'setResourceType',
                            value: ViewPanel.showResource
                        })
                        break;
                    case POST_MESSAGES_WV.GET_USERS:
                        console.log(data)
                        const { taskFollowers } = data.value
                        const users = await AsanaClient.getUsers( 0, data.value.users, [] )
                        this._panel.webview.postMessage({
                            type: 'setUsers',
                            value: {
                                users,
                                taskFollowers
                            }
                        })
                        break;
                    case POST_MESSAGES_WV.OPEN_LINK:
                        vscode.env.openExternal(Uri.parse(data.value as string))
                        const test = await AsanaClient.client.stories.findByTask( ViewPanel.resourceId as string )
                        console.log(test)
                        break;
                    case POST_MESSAGES_WV.GET_STORYLINE:
                        const stories = await AsanaClient.getStoriesByTask( [], data.value as string )
                        this._panel.webview.postMessage({
                            type: 'setTaskStoryLine',
                            value: stories
                        })
                        break;
                }
            })

            ViewPanel.listenersSetted = true
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'VueWebview.js')
        );

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'reset.css'
        ))
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this._extensionUri,
            'media',
            'vscode.css'
        ))
        // const cssUri = webview.asWebviewUri(
        //     vscode.Uri.joinPath(this._extensionUri, "out", "compiled/swiper.css")
        // );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <!--
                        Use a content security policy to only allow loading images from https or from our extension directory,
                        and only allow scripts that have a specific nonce.
                    -->
                    <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' 
                    ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${stylesResetUri}" rel="stylesheet">
                    <link href="${stylesMainUri}" rel="stylesheet">
                    <script nonce="${nonce}">
                        const tsvscode = acquireVsCodeApi()
                    </script>
                </head>
                <body>
                    <div id="WebviewApp"></div>
                    <script src="${scriptUri}" nonce="${nonce}"></script>
                </body>
                </html>`;
    }
}