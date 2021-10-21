<template>
    <UserLogged v-if="state.isLogged">
        <router-view></router-view>
    </UserLogged>
    <UserUnlogged v-else />
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Store
import AppStore from './store/AppStore';

// Components
import UserLogged from './components/UserLogged.vue'
import UserUnlogged from './components/UserUnlogged.vue'

export default defineComponent({
    components: {
        UserLogged,
        UserUnlogged
    },
    setup() {
        // Running on initial
        AppStore.methods.init()

        return {
            state: AppStore.state,
        }
    }
})
</script>

<style lang="scss">
.text-center {
    text-align: center;
}

.mt-2 {
    margin-top: 2rem;
}

.mb-2 {
    margin-bottom: 2rem;
}

.my-2 {
    margin-top: 2rem;
    margin-bottom: 2rem;
}

.mx-2 {
    margin-left: 2rem;
    margin-right: 2rem;
}

.flex-center-column {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}

body {
	background-color: var(--vscode-titleBar-activeBackground);
}
</style>