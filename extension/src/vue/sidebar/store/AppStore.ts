import { reactive, computed, watch } from 'vue';
import asana from 'asana';

// Interfaces
import { IAppMethods, IAppState, POST_MESSAGES } from '../interfaces/AppInterfaces'
import { IVsCodeApi } from '../interfaces/VsCodeInterfaces';
import { IAsanaUser } from '../interfaces/AsanaUserInterfaces';
import { ITask } from '../interfaces/TaskInterfaces';

declare const tsvscode: IVsCodeApi;

const state = reactive<IAppState>({
    isLogged: false,
    isFetching: false,
    isLoading: true,
    resources: {
        tasks: {
            list: [],
            title: 'Tasks',
            forToday: false,
            showTitle: false,
            isOpening: false
        }
    }
})

const methods: IAppMethods = {
    postMessage( messageType: POST_MESSAGES, payload?: any ) {
        const msgPayload: { type: POST_MESSAGES, value?: any } = {
            type: messageType
        }

        if ( payload ) msgPayload.value = payload

        console.log(msgPayload)

        tsvscode.postMessage(msgPayload)

        if ( messageType === POST_MESSAGES.AUTH_REVOKE ) state.isLogged = false
        if ( messageType === POST_MESSAGES.GET_TASKS ) state.isFetching = true
        if ( messageType === POST_MESSAGES.OPEN_LINK ) {
            state.resources.tasks.isOpening = true
            const latestLabel = state.resources.tasks.title
            state.resources.tasks.title = 'Opening...'
            setTimeout(() => { 
                state.resources.tasks.title = latestLabel
                state.resources.tasks.isOpening = false
            }, 1500)
        }
    },
    setListeners() {
        window.addEventListener('message', async (evt) => {
            const { value, type } = evt.data
            if ( type ) {
                switch ( type ) {
                    case 'setUser': {
                        state.user = value as IAsanaUser
                        state.isLogged = true
                        break;
                    }
                    case 'setTasks': {
                        console.log(value)
                        state.resources.tasks.list = value as ITask[]
                        state.isFetching = false
                        
                        if ( state.resources.tasks.forToday ) {
                            if ( filteredTaskList.value.length === 0 ) state.resources.tasks.title = 'Yay! No tasks for today!'
                            else state.resources.tasks.title = 'Your today tasks'
                        } else {
                            if ( value.length === 0 ) state.resources.tasks.title = 'You have no tasks assigned'
                            else state.resources.tasks.title = 'Uncompleted tasks'
                        }

                        console.log(value)

                        state.resources.tasks.showTitle = true
                        break;
                    }
                    case 'setWorkspace': {
                        state.workspace = value as asana.resources.Workspaces.Type
                        break;
                    }
                }
            }
        })
    },
    async init() {
        this.setListeners()

        this.postMessage(POST_MESSAGES.GET_USER)
        this.postMessage(POST_MESSAGES.GET_WORKSPACE)
    }
}

const filteredTaskList = computed(() => {
    const todayDate = new Date().toLocaleDateString().split('/').reverse().join('-')
    // : state.resources.tasks.list.filter( task => task.assignee_status === 'today' )
    return ( !state.resources.tasks.forToday )
        ? state.resources.tasks.list
        : state.resources.tasks.list.filter( task => task.due_on === todayDate )
})

watch(
    () => state.resources.tasks.forToday,
    ( newVal: boolean ) => {
        if ( newVal ) {
            if ( filteredTaskList.value.length === 0 ) state.resources.tasks.title = 'Yay! No tasks for today!'
            else state.resources.tasks.title = 'Your today tasks'
        } else {
            if ( state.resources.tasks.list.length === 0 ) state.resources.tasks.title = 'You have no tasks assigned'
            else state.resources.tasks.title = 'Uncompleted tasks'
        }
    }
)

const computedProps = {
    filteredTaskList
}

export default {
    state,
    methods,
    computedProps
}