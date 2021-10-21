import asana from 'asana';
import { ITask } from "./TaskInterfaces";

export enum POST_MESSAGES {
    GET_RESOURCE_TYPE = 'getResourceType',
    GET_RESOURCE_DATA = 'getResourceData',
    GET_TASK = 'getTask',
    GET_USERS = 'getUsers',
    OPEN_LINK = 'openLink',
    GET_STORYLINE = 'getStoryLine'
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
    checkForNewUsersInvolved: () => void;
    init:         () => Promise<void>;
}

export interface StoriesState {
    isFetching:     boolean;
    list:           asana.resources.Stories.Type[];
}

export interface UsersInvolvedState {
    isFetching:     boolean;
    list:           asana.resources.Users.Type[];
}

export interface TaskState {
    isOutDate:      boolean;
    isFetching:     boolean;
    task:           ITask[];
    stories:        StoriesState;
    usersInvolved:  UsersInvolvedState;
} 

export interface AdditionalState {
    storyInfoPxToTop:       number;
    windowYScroll:          number;
    innerWidth:             number;
}

export interface AppState {
    isLoading:       boolean;
    tasks:           TaskState;
    resourceType?:   ResourceTypes;
    additional:      AdditionalState;
}