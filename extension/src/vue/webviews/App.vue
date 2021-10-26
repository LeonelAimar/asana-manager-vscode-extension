<template>
    <div v-if="AppState.isLoading" class="loadingContainer">
        Loading...
    </div>
    <div v-else class="loadedContainer">
        <header>
            <h1 class="resourceTitle">{{ Task[0].name }}</h1>
            <button type="button" 
                @click.prevent="openExternal(String(Task[0].permalink_url))"
            >Open in browser</button>
        </header>
        <div class="resourceAdditional"
            :class="{ 'has-subtasks': Task[0].num_subtasks > 0 }"
        >
            <div>
                <div class="lineInfo">
                    <span>Due on:</span>
                    <span 
                        :class="{ 'outDated': AppState.tasks.isOutDate }"
                    >
                        <Warning v-if="AppState.tasks.isOutDate" :width="32" :height="32" />
                        {{ Task[0].due_on }}
                    </span>
                </div>
                <div class="lineInfo project" v-if="Task[0].projects.length! > 0">
                    <span>Project:</span>
                    <span class="projectLine"
                        @click.prevent="openExternal( `https://app.asana.com/0/${Task[0].projects[0].gid}/board` )"
                    >
                        {{ Task[0].projects[0].name }}
                    </span>
                </div>
                <div class="resourceTags" v-if="Task[0].tags.length > 0">
                    <span>Tags:</span>
                    <ul>
                        <li v-for="tag in Task[0].tags">
                            {{ tag.name }}
                        </li>
                    </ul>
                </div>
                <div class="followersContainer">
                    <h2>Followers:</h2>
                    <ul class="followersList">
                        <li v-for="follower in Task[0].followers" 
                            class="followerCard" :data-user-id="follower.gid"
                        >
                            <img v-if="follower.photo" :src="follower.photo.image_60x60" :alt="follower.name" />
                            <div v-else class="skeleton"></div>
                            <h3>{{ follower.name }}</h3>
                        </li>
                    </ul>
                </div>
            </div>
            <div v-if="Task[0].num_subtasks > 0">
                <div class="subtasksTree">
                    <div v-for="subtask in Task[0].subtasks"
                        @click.prevent="openExternal( `${Task[0].permalink_url.slice(0, Task[0].permalink_url.lastIndexOf('/'))}/${subtask.gid}` )"
                    >
                        {{ subtask.name }}
                    </div>
                </div>
            </div>
        </div>
        <div class="resourceDescription">
            <h2>Notes:</h2>
            <span v-html="Task[0].notes ? Task[0].html_notes : '!--- There is no description for the current task'"></span>
        </div>
        <div class="resourcesTable" ref="storiesContainer">
            <div class="resourceMessages" ref="messagesContainer">
                <header>
                    <h1>Messages Storyline:</h1>
                </header>
                <div v-if="AppComputeds.hasMessages && !AppState.tasks.stories.isFetching" 
                    class="messageCard" v-for="message in AppComputeds.storyMessages" 
                >
                    <div class="msgSender">
                        <small>{{ new Date(message.created_at).toLocaleDateString() }} - {{ new Date(message.created_at).toLocaleTimeString() }}</small>
                        <img :src="returnImageSender( message.created_by.gid )" class="image" v-if="returnImageSender( message.created_by.gid )">
                        <div v-else class="image">
                            <svg width="32" height="32" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M16 7.992C16 3.58 12.416 0 8 0S0 3.58 0 7.992c0 2.43 1.104 4.62 2.832 6.09.016.016.032.016.032.032.144.112.288.224.448.336.08.048.144.111.224.175A7.98 7.98 0 0 0 8.016 16a7.98 7.98 0 0 0 4.48-1.375c.08-.048.144-.111.224-.16.144-.111.304-.223.448-.335.016-.016.032-.016.032-.032 1.696-1.487 2.8-3.676 2.8-6.106zm-8 7.001c-1.504 0-2.88-.48-4.016-1.279.016-.128.048-.255.08-.383a4.17 4.17 0 0 1 .416-.991c.176-.304.384-.576.64-.816.24-.24.528-.463.816-.639.304-.176.624-.304.976-.4A4.15 4.15 0 0 1 8 10.342a4.185 4.185 0 0 1 2.928 1.166c.368.368.656.8.864 1.295.112.288.192.592.24.911A7.03 7.03 0 0 1 8 14.993zm-2.448-7.4a2.49 2.49 0 0 1-.208-1.024c0-.351.064-.703.208-1.023.144-.32.336-.607.576-.847.24-.24.528-.431.848-.575.32-.144.672-.208 1.024-.208.368 0 .704.064 1.024.208.32.144.608.336.848.575.24.24.432.528.576.847.144.32.208.672.208 1.023 0 .368-.064.704-.208 1.023a2.84 2.84 0 0 1-.576.848 2.84 2.84 0 0 1-.848.575 2.715 2.715 0 0 1-2.064 0 2.84 2.84 0 0 1-.848-.575 2.526 2.526 0 0 1-.56-.848zm7.424 5.306c0-.032-.016-.048-.016-.08a5.22 5.22 0 0 0-.688-1.406 4.883 4.883 0 0 0-1.088-1.135 5.207 5.207 0 0 0-1.04-.608 2.82 2.82 0 0 0 .464-.383 4.2 4.2 0 0 0 .624-.784 3.624 3.624 0 0 0 .528-1.934 3.71 3.71 0 0 0-.288-1.47 3.799 3.799 0 0 0-.816-1.199 3.845 3.845 0 0 0-1.2-.8 3.72 3.72 0 0 0-1.472-.287 3.72 3.72 0 0 0-1.472.288 3.631 3.631 0 0 0-1.2.815 3.84 3.84 0 0 0-.8 1.199 3.71 3.71 0 0 0-.288 1.47c0 .352.048.688.144 1.007.096.336.224.64.4.927.16.288.384.544.624.784.144.144.304.271.48.383a5.12 5.12 0 0 0-1.04.624c-.416.32-.784.703-1.088 1.119a4.999 4.999 0 0 0-.688 1.406c-.016.032-.016.064-.016.08C1.776 11.636.992 9.91.992 7.992.992 4.14 4.144.991 8 .991s7.008 3.149 7.008 7.001a6.96 6.96 0 0 1-2.032 4.907z"/></svg>
                        </div>
                        <h2>{{ message.created_by.name === Task[0].assignee?.name ? '[You]' : message.created_by.name }}</h2>
                    </div>
                    <span v-html="message.html_text"></span>
                </div>
                <div v-else-if="AppState.tasks.stories.isFetching" class="loadingChats">
                    <LoadingSpinner :width="64" :height="64" />
                    <span>Loading chats...</span>
                </div>
                <div v-else>There's no chats log</div>
            </div>
            <div class="resourceMessages" ref="infoStoryContainer">
                <header>
                    <h1>Task Storyline:</h1>
                </header>
                <div v-if="!AppState.tasks.stories.isFetching && AppComputeds.storyNotMessages.length > 0" 
                    class="messageCard" v-for="message in AppComputeds.storyNotMessages" 
                >
                    <div class="msgSender">
                        <small>{{ new Date(message.created_at).toLocaleDateString() }} - {{ new Date(message.created_at).toLocaleTimeString() }}</small>
                        <img :src="returnImageSender( message.created_by.gid )" class="image" v-if="returnImageSender( message.created_by.gid )">
                        <div v-else class="image">
                            <svg width="32" height="32" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M16 7.992C16 3.58 12.416 0 8 0S0 3.58 0 7.992c0 2.43 1.104 4.62 2.832 6.09.016.016.032.016.032.032.144.112.288.224.448.336.08.048.144.111.224.175A7.98 7.98 0 0 0 8.016 16a7.98 7.98 0 0 0 4.48-1.375c.08-.048.144-.111.224-.16.144-.111.304-.223.448-.335.016-.016.032-.016.032-.032 1.696-1.487 2.8-3.676 2.8-6.106zm-8 7.001c-1.504 0-2.88-.48-4.016-1.279.016-.128.048-.255.08-.383a4.17 4.17 0 0 1 .416-.991c.176-.304.384-.576.64-.816.24-.24.528-.463.816-.639.304-.176.624-.304.976-.4A4.15 4.15 0 0 1 8 10.342a4.185 4.185 0 0 1 2.928 1.166c.368.368.656.8.864 1.295.112.288.192.592.24.911A7.03 7.03 0 0 1 8 14.993zm-2.448-7.4a2.49 2.49 0 0 1-.208-1.024c0-.351.064-.703.208-1.023.144-.32.336-.607.576-.847.24-.24.528-.431.848-.575.32-.144.672-.208 1.024-.208.368 0 .704.064 1.024.208.32.144.608.336.848.575.24.24.432.528.576.847.144.32.208.672.208 1.023 0 .368-.064.704-.208 1.023a2.84 2.84 0 0 1-.576.848 2.84 2.84 0 0 1-.848.575 2.715 2.715 0 0 1-2.064 0 2.84 2.84 0 0 1-.848-.575 2.526 2.526 0 0 1-.56-.848zm7.424 5.306c0-.032-.016-.048-.016-.08a5.22 5.22 0 0 0-.688-1.406 4.883 4.883 0 0 0-1.088-1.135 5.207 5.207 0 0 0-1.04-.608 2.82 2.82 0 0 0 .464-.383 4.2 4.2 0 0 0 .624-.784 3.624 3.624 0 0 0 .528-1.934 3.71 3.71 0 0 0-.288-1.47 3.799 3.799 0 0 0-.816-1.199 3.845 3.845 0 0 0-1.2-.8 3.72 3.72 0 0 0-1.472-.287 3.72 3.72 0 0 0-1.472.288 3.631 3.631 0 0 0-1.2.815 3.84 3.84 0 0 0-.8 1.199 3.71 3.71 0 0 0-.288 1.47c0 .352.048.688.144 1.007.096.336.224.64.4.927.16.288.384.544.624.784.144.144.304.271.48.383a5.12 5.12 0 0 0-1.04.624c-.416.32-.784.703-1.088 1.119a4.999 4.999 0 0 0-.688 1.406c-.016.032-.016.064-.016.08C1.776 11.636.992 9.91.992 7.992.992 4.14 4.144.991 8 .991s7.008 3.149 7.008 7.001a6.96 6.96 0 0 1-2.032 4.907z"/></svg>
                        </div>
                        <h2>{{ message.created_by.name === Task[0].assignee?.name ? '[You]' : message.created_by.name }}</h2>
                    </div>
                    <span v-html="message.html_text"></span>
                </div>
                <div v-else-if="AppState.tasks.stories.isFetching" class="loadingChats">
                    <LoadingSpinner :width="64" :height="64" />
                    <span>Loading task story info...</span>
                </div>
                <div v-else>There's no task actions log</div>
            </div>
        </div>
    </div>
    <DevWatermark />
</template>


<script lang="ts">
import { defineComponent, watch, ref, toRefs } from 'vue'

import AppStore from './store/AppStore'

import { POST_MESSAGES } from './interfaces/AppInterfaces'

import LoadingSpinner from './components/Icons/LoadingSpinner.vue'
import DevWatermark from './components/DevWatermark.vue'
import Warning from './components/Icons/Warning.vue'

export default defineComponent({
    components: {
        LoadingSpinner, Warning,
        DevWatermark
    },
    setup() {
        watch(
            () => AppStore.state.isLoading,
            ( newVal ) => {                
                if ( AppStore.refs.storiesContainer.value && 
                    AppStore.refs.storiesContainer.value.getBoundingClientRect().top > 450 && 
                    !newVal 
                ) AppStore.state.additional.storyInfoPxToTop = AppStore.refs.storiesContainer.value!.getBoundingClientRect().top
            }
        )
        
        AppStore.methods.init()

        const openExternal = ( taskLink: string ) => {
            AppStore.methods.postMessage(POST_MESSAGES.OPEN_LINK, taskLink)
        }

        const returnImageSender = ( senderGid: string ) => {
            const user = AppStore.state.tasks.usersInvolved.list.filter( user => user.gid === senderGid )
            return ( user[0] && user[0].photo ) ? user[0].photo.image_60x60 : ''
        }

        return {
            AppState: AppStore.state,
            AppComputeds: AppStore.computeds,
            Task: AppStore.state.tasks.task,
            additional: AppStore.state.additional,
            ...toRefs(AppStore.refs),
            openExternal,
            returnImageSender
        }
    }
})
</script>

<style lang="scss">
#WebviewApp {
    position: relative;
}

@keyframes skeleton {
    0% { background-color: #ccc; }
    100% { background-color: #646464; }
}

.loadedContainer {
    padding: 2rem;

    > header {
        margin-bottom: 2rem;
        padding: 0 0 .5rem 1rem;
        border-bottom: 1px solid #ccc;
        border-bottom-left-radius: 1rem;
        display: flex;

        .resourceTitle {
            font-size: 2.5rem;
            flex-grow: 1;
        }

        button {
            width: auto;
            padding: 1rem;
            border-radius: 1rem;
        }
    }

    .resourceAdditional {
        margin-bottom: 1.5rem;
        display: grid;
        grid-template-columns: 1fr;

        &.has-subtasks { 
            grid-template-columns: 1fr 1fr;

            > div:last-of-type {
                position: relative;
                &::before {
                    position: absolute;
                    content: "Subtasks Tree";
                    width: auto;
                    font-size: 1.8rem;
                    bottom: 45%;
                    left: -7rem;
                    transform: rotate(-90deg);
                }
            }
        }

        .subtasksTree {
            padding: 1.5rem;
            border-left: 1px solid #ccc;

            > div {
                font-size: 1.2rem;
                padding: .5rem;
                cursor: pointer;
                border-radius: 1rem;
                position: relative;
                margin-top: .5rem;

                &::before {
                    content: '';
                    position: absolute;
                    background-color: #ccc;
                    left: -1.5rem;
                    bottom: 50%;
                    width: 1rem;
                    height: 1px;
                }

                &:hover {
                    background-color: var(--vscode-button-background);
                }
            }
        }


        .lineInfo {
            display: flex;
            font-size: 1.5rem;
            span:first-of-type { 
                text-decoration: underline; 
                margin-right: 1rem;
            }

            .outDated {
                display: flex;
                max-width: max-content;
                align-items: center;
                background-color: rgb(177, 10, 10);
                border-radius: 1rem;
                padding: .25rem;
            }

            
            &.project {
                display: flex;
                align-items: center;
                margin: .25rem 0;

                .projectLine {
                    padding: .5rem;
                    cursor: pointer;
                    border-radius: 1rem;
                    &:hover {
                        background-color: var(--vscode-button-background);
                    }
                }
            }

        }

        .followersContainer {
            display: flex;
            align-items: center;
            flex-direction: row;

            > h2 {
                text-decoration: underline;
            }
        }

        .followersList {
            display: flex;
            margin: 1rem .1rem;
        }

        .followerCard {
            cursor: pointer;
            list-style: none;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            padding: .75rem;
            border: 1px solid var(--vscode-button-background);
            border-radius: 1rem;
            margin-right: 1rem;

            img {
                border-radius: 100%;
                width: 75px;
                margin-right: .5rem;
            }

            .skeleton {
                width: 75px;
                height: 75px;
                border-radius: 100%;
                margin-right: .5rem;
                background-color: #ccc;
                animation: skeleton 1s linear infinite alternate;
            }

            &:hover {
                background-color: var(--vscode-button-background);
            }
        }
    }

    .resourceDescription {
        border: 1px solid var(--vscode-button-background);
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1rem;

        h2 { 
            text-decoration: underline;
            margin-bottom: .5rem;
        }

        span {
            font-size: 1.5rem;
        }
    }

    .resourceTags {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: row;

        span {
            text-decoration: underline;
        }

        ul {
            padding-left: .5rem;
            display: flex;
            flex-direction: row;
        }

        li {
            list-style: none;
            margin-right: .75rem;
        }
    }

    .resourcesTable {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1.4fr .8fr;
        margin-bottom: 1rem;
    }

    .resourceMessages {
        // width: 49%;
        border: 1px solid var(--vscode-button-background);
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        height: fit-content;

        &:last-of-type {
            overflow-y: scroll;
        }

        header > h1 { 
            text-decoration: underline;
            margin-bottom: .5rem;
        }

        .loadingChats {
            width: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
        }

        .messageCard {
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--vscode-button-background);
            padding: 1.25rem;
            border-radius: 1rem;
            position: relative;

            > span {
                font-size: 1.1rem;
            }

            .msgSender {
                position: relative;
                display: flex;
                flex-direction: row;
                align-items: center;
                max-height: 50px;
                margin-bottom: .5rem;

                .image {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 100%;
                    height: 50px;
                    width: 50px;
                    background-color: #6f6f6f;
                    margin-right: .75rem;
                }

                h2 {
                    font-size: 1.5rem;
                    margin-right: .75rem;

                    span {
                        font-size: 1rem;
                    }
                }

                small {
                    position: absolute;
                    top: 0;
                    right: 0;
                }

            }
        }
    }
}

@media screen and (max-width: 1024px) {
    .resourceMessages {
        width: 100% !important;
    }

    .followersList {
        overflow-x: scroll;
        margin-left: 1rem;

        .followerCard {
            min-width: fit-content;
        }
    }
}

@media screen and (max-width: 956px) {
    .resourceMessages {
        width: 100% !important;
    }

    .resourcesTable {
        grid-template-columns: auto !important;
    }
}
</style>