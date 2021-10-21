import asana from 'asana'
import { IAsanaUser } from './AsanaUserInterfaces';
import { ITask } from './TaskInterfaces';

export interface IAppState {
    isLogged:       boolean;
    workspace?:     asana.resources.Workspaces.Type;
    isLoading:      boolean;
    isFetching:     boolean;
    user?:          IAsanaUser;
    resources:      IResources;
}

export interface ITaskState {
    list:           ITask[];
    title:          string;
    forToday:       boolean;
    showTitle:      boolean;
    isOpening:      boolean;
}

export interface IResources {
    tasks:         ITaskState;
}

export enum POST_MESSAGES {
    AUTH_BEGIN = 'authBegin',
    AUTH_REVOKE = 'authRevoke',
    GET_TASKS = 'getTasks',
    GET_USER = 'getUser',
    GET_WORKSPACE = 'getWorkspace',
    SET_WORKSPACE = 'setWorkspace',
    OPEN_LINK = 'openLink',
    OPEN_RESOURCE = 'openResource'
}

export enum ResourceTypes {
    VIEW = 'view',
    PROJECT = 'project',
    WORKSPACE = 'workspace',
    TASK = 'task'
}

export interface IAppMethods {
    postMessage:    ( messageType: POST_MESSAGES, payload?: any ) => void;
    setListeners: () => void;
    init:         () => Promise<void>;
}