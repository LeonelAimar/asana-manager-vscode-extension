export enum ResourceTypes {
    VIEW = 'view',
    PROJECT = 'project',
    WORKSPACE = 'workspace',
    TASK = 'task'
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

export enum POST_MESSAGES_WV {
    GET_RESOURCE_TYPE = 'getResourceType',
    GET_RESOURCE_DATA = 'getResourceData',
    GET_TASK = 'getTask',
    GET_USERS = 'getUsers',
    OPEN_LINK = 'openLink',
    GET_STORYLINE = 'getStoryLine'
}