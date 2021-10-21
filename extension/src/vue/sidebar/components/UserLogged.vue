<template>
    <AsanaWordIcon class="asanaLogo" />
    <button @click="methods.postMessage(POST_MESSAGES.AUTH_REVOKE)" 
        class="revokeAuthBtn"
    >
        <SignOut :width="32" :height="32" />
        <span>Logout</span>
    </button>

    <div class="headerLogged mt-2" :class="{ 'text-center': !state.workspace }">
        <img :src="state.user?.photo.image_128x128" />
        <h1>{{ !state.workspace ? 'Welcome to Asana Manager,' : 'Welcome back,' }} {{ state.user?.name }}</h1>
    </div>
    <div v-if="!state.workspace" class="noWorkspaceContainer mt-2">
        <h2>First, you need to set up a workspace to work with</h2>
        <button class="mt-2" @click="methods.postMessage(POST_MESSAGES.SET_WORKSPACE)">
            <svg width="32" height="32" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M14.5 4H11V2.5l-.5-.5h-5l-.5.5V4H1.5l-.5.5v8l.5.5h13l.5-.5v-8l-.5-.5zM6 3h4v1H6V3zm8 2v.76L10 8v-.5L9.51 7h-3L6 7.5V8L2 5.71V5h12zM9 8v1H7V8h2zm-7 4V6.86l4 2.29v.35l.5.5h3l.5-.5v-.31l4-2.28V12H2z"/></svg>
        </button>
        Pick one
    </div>
    <slot v-else></slot>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

// Store
import AppStore from '../store/AppStore';

// Interfaces
import { POST_MESSAGES } from '../interfaces/AppInterfaces'

// Components
/* Icons */
import AsanaWordIcon from './Icons/AsanaWordIcon.vue'
import SignOut from './Icons/SignOut.vue'
/* END Icons */

export default defineComponent({
    components: {
        AsanaWordIcon,
        SignOut
    },
    setup() {
        
        return {
            state: AppStore.state,
            methods: AppStore.methods,
            POST_MESSAGES,
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
</style>