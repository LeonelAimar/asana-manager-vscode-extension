import { computed, reactive, ref } from 'vue'
import { AppState, IAppMethods, POST_MESSAGES, ResourceTypes } from '../interfaces/AppInterfaces'
import { IVsCodeApi } from '../interfaces/VsCodeInterfaces';

declare const tsvscode: IVsCodeApi;

const refs = {
    storiesContainer: ref<HTMLDivElement | null>(null),
    messagesContainer: ref<HTMLDivElement | null>(null),
    infoStoryContainer: ref<HTMLDivElement | null>(null)
}

const state = reactive<AppState>({
    isLoading: false,
    tasks: {
        isOutDate: false,
        isFetching: false,
        task: [],
        stories: {
            isFetching: true,
            list: []
        },
        usersInvolved: {
            isFetching: true,
            list: []
        }
    },
    additional: {
        storyInfoPxToTop: 500,
        windowYScroll: 0,
        innerWidth: window.innerWidth
    }
})

const methods: IAppMethods = {
    postMessage( messageType: POST_MESSAGES, payload?: any ) {
        const msgPayload: { type: POST_MESSAGES, value?: any } = {
            type: messageType
        }

        if ( payload ) msgPayload.value = payload

        tsvscode.postMessage(msgPayload)

        if ( messageType === POST_MESSAGES.GET_TASK ) state.tasks.isFetching = true
        if ( messageType === POST_MESSAGES.GET_STORYLINE ) state.tasks.stories.isFetching = true
    },
    setListeners() {
        window.addEventListener('message', async (evt) => {
            const { value, type } = evt.data
            if ( type ) {
                switch ( type ) {
                    case 'setTask': {
                        console.log(value)
                        state.tasks.task.push(value)
                        state.tasks.isOutDate = new Date().toISOString().split('T')[0] > value.due_on

                        // this.postMessage(POST_MESSAGES.GET_USERS, {
                        //     users: value.followers,
                        //     taskFollowers: true
                        // })
                        
                        state.tasks.usersInvolved.list.push(...value.followers)
                        this.postMessage(POST_MESSAGES.GET_STORYLINE, state.tasks.task[0].gid)
                        state.tasks.isFetching = false
                        state.isLoading = false
                        break;
                    }
                    case 'setResourceType': {
                        state.resourceType = value
                        value === ResourceTypes.TASK && this.postMessage(POST_MESSAGES.GET_TASK)
                        break;
                    }
                    case 'setUsers': {
                        state.tasks.usersInvolved.list.push(...value.users)
                        if ( value.taskFollowers ) {
                            state.tasks.task[0].followers = value.users
                            this.postMessage(POST_MESSAGES.GET_STORYLINE, state.tasks.task[0].gid)
                        }
                        break;
                    }
                    case 'setTaskStoryLine': {
                        console.log(value)
                        state.tasks.stories.list = value
                        state.tasks.stories.isFetching = false
                        this.checkForNewUsersInvolved()                
                        break;
                    }
                }
            }
        })

        window.addEventListener('scroll', () => {
            state.additional.windowYScroll = window.scrollY
            if ( 
                refs.messagesContainer.value && 
                refs.infoStoryContainer.value &&
                state.additional.innerWidth > 1024
            ) {
                const messagesIsHigher = refs.messagesContainer.value.offsetHeight > refs.infoStoryContainer.value.offsetHeight
                const refToBePersisted = messagesIsHigher ? refs.infoStoryContainer.value : refs.messagesContainer.value
                const pxToTop = state.additional.storyInfoPxToTop - (window.scrollY + 40)
                if ( pxToTop < 0 && refToBePersisted.offsetHeight < window.innerHeight ) refToBePersisted.setAttribute('style', `top: ${-pxToTop}px; position: relative;`)
                else refToBePersisted.removeAttribute('style')
            }
        })
    },
    checkForNewUsersInvolved() {
        if ( state.tasks.stories.list.length > 0 ) {
            const usersInvolved = Array.from(
                new Set(state.tasks.stories.list.map( story => story.created_by.gid ))
            )
            const newUsers: { gid: string }[] = []
            
            usersInvolved.forEach( (userId, index) => {
                const exists = state.tasks.usersInvolved.list.find( user => user.gid === userId )
                if ( !exists ) newUsers.push({ gid: userId })
            })

            if ( newUsers.length > 0 ) 
                this.postMessage(POST_MESSAGES.GET_USERS, {
                    users: newUsers,
                    taskFollowers: false
                })
        }
    },
    async init() {
        state.isLoading = true
        this.setListeners()
        this.postMessage(POST_MESSAGES.GET_RESOURCE_TYPE)
    }
}

/* START COMPUTEDS */
const hasMessages = computed(() => {
    return (
        state.tasks.stories.list.length > 0 &&
        state.tasks.stories.list.filter(story => story.resource_subtype === 'comment_added').length > 0
    ) ? true : false
})

const storyMessages = computed(() => {
    return state.tasks.stories.list.filter(story => story.resource_subtype === 'comment_added') || []
})

const storyNotMessages = computed(() => {
    return state.tasks.stories.list.filter(story => story.resource_subtype !== 'comment_added') || []
})

const freezeStoryContainer = computed(() => (state.additional.windowYScroll + 40) > state.additional.storyInfoPxToTop)
/* END COMPUTEDS */

const computeds = reactive({
    hasMessages,
    storyMessages,
    storyNotMessages,
    freezeStoryContainer
})

export default {
    state,
    methods,
    computeds,
    refs
}