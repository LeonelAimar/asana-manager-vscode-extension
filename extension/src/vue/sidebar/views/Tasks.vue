<template>
    <div class="resourcesContainer mt-2 flex-center-column" 
        :class="{ 'resourcesLoading': state.isFetching }"
    >
        <button @click="methods.postMessage(POST_MESSAGES.GET_TASKS)">
            <Search :width="25" :height="25" />
            <span>{{ state.isFetching ? 'Loading...' : 'Look for uncompleted tasks' }}</span>
        </button>
        <h1 v-if="state.isFetching" class="mt-2">
            <LoadingSpinner :width="64" :height="64" />
        </h1>
        <div class="filterBox" v-if="!state.isFetching">
            <label for="forTodayCheckbox">Filter: For today</label>
            <input type="checkbox" name="forToday" id="forTodayCheckbox" v-model="taskState.forToday">
            <Check v-if="!taskState.forToday" 
                :height="30" :width="30" 
                @click="taskState.forToday = true"
            />
            <PassFilled :height="32" :width="32" v-else 
                @click="taskState.forToday = false" 
            />
        </div>
        <div v-if="taskState.showTitle" class="resourceTitleContainer"
            :class="{ 
                'nothingForToday': computedProps.filteredTaskList.length === 0,
                'opening': taskState.isOpening
            }"
        >
            <Paperlist v-if="computedProps.filteredTaskList.length > 0" />
            <h1>{{ taskState.title }}</h1>
            <template v-if="computedProps.filteredTaskList.length === 0">
                <RunningMan class="runningMan" />
                <span>You're going fast! Keep it up!</span>
            </template>
        </div>
        <div v-if="computedProps.filteredTaskList.length > 0" class="resourcesListContainer mt-2">
            <ul class="flex-center-column">
                <TaskItem v-for="task in computedProps.filteredTaskList" 
                    @openExternal="openTask" 
                    :task="task" :key="task.gid"
                />
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

// Store
import AppStore from '../store/AppStore';

// Interfaces
import { POST_MESSAGES, ResourceTypes } from '../interfaces/AppInterfaces'

// Components
/* Icons */
import LoadingSpinner from '../components/Icons/LoadingSpinner.vue'
import AsanaWordIcon from '../components/Icons/AsanaWordIcon.vue'
import Paperlist from '../components/Icons/Paperlist.vue'
import PassFilled from '../components/Icons/PassFilled.vue'
import Check from '../components/Icons/Check.vue'
import Lightning from '../components/Icons/Lightning.vue'
import Search from '../components/Icons/Search.vue'
import SignOut from '../components/Icons/SignOut.vue'
import RunningMan from '../components/Icons/RunningMan.vue'
/* END Icons */
import TaskItem from '../components/TaskItem.vue'

export default defineComponent({
    components: {
        LoadingSpinner, AsanaWordIcon, Paperlist,
        PassFilled, Check, Lightning,
        Search, SignOut, TaskItem, RunningMan
    },
    setup() {
        const computedProps = reactive(AppStore.computedProps)
        
        const openTask = ( eventData: string ) => {
            AppStore.methods.postMessage(POST_MESSAGES.OPEN_RESOURCE, {
                resourceType: ResourceTypes.TASK,
                resourceId: eventData
            })
        }

        return {
            state: AppStore.state,
            methods: AppStore.methods,
            taskState: AppStore.state.resources.tasks,
            computedProps,
            POST_MESSAGES,
            openTask
        }
    }
})
</script>

<style lang="scss" scoped>
.headerLogged {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
        border-radius: 100px;
        width: 150px;
        margin-bottom: 1rem;
    }
}

.resourceTitleContainer {
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    margin-top: 1rem;

    &.nothingForToday {
        text-align: center;
        border: 2px solid var(--vscode-button-background);
        border-radius: 10px;
        padding: 1rem;
        flex-direction: column;
        justify-content: center;
    }

    &.opening {
        justify-content: center;
        h1 { margin-left: 1rem; }
    }
}
.resourcesContainer {
    max-height: 60vh;
    width: 100%;

    ul {
        padding-left: 0 !important;
    }

    li {
        cursor: pointer;
        list-style: none;
        padding: 1rem 0rem 1rem 1rem;
        width: 90%;
        border-radius: 50px;
        padding: 15px;
        margin-top: .5rem;

        &:last-child { margin-bottom: .5rem; }

        &:hover {
            background: var(--vscode-button-background);
        }
    }

    button:not(:first-child){
        margin-top: 1rem;
    }

    button {
        display: flex;
        align-items: center;
        padding: 1rem;
        justify-content: space-evenly;
        border-radius: 5rem;

        span {
            font-size: 1.2rem;
        }
    }

    &.resourcesLoading {
        button {
            justify-content: center;
            span { margin-left: 1rem; }
        }
    }

    .resourcesListContainer {
        // max-height: 65vh;
        overflow-y: scroll;
        border: 1px solid var(--vscode-button-background);
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }
}

.revokeAuthBtn {
    // width: auto !important;
    // position: absolute;
    // bottom: 0;
    // right: 2rem;
    // padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 98%;
    position: absolute;
    bottom: 0.5rem;
    right: 1%;
    border-radius: 4px;
    padding: .5rem;

    span {
        font-size: 1.1rem;
        margin-left: .25rem;
    }
}

.asanaLogo {
    z-index: 1;
    pointer-events: none;
    position: absolute;
    bottom: 8%;
    left: 50%;
    transform: scale(2) translateX(-25%);
    opacity: .25;
}

.noWorkspaceContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    button {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: .75rem;
        border-radius: 100px;
        width: auto !important;
    }
}

.filterBox {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    padding: .5rem;
    justify-content: flex-end;

    label {
        position: absolute;
        right: 2.5rem;
        top: 1rem;
        font-size: 1.2rem;
        margin-right: 1rem;
        cursor: pointer;
    }

    svg {
        cursor: pointer;
    }

    #forTodayCheckbox {
        display: none;
    }
}
</style>