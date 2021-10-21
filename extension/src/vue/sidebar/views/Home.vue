<template>
    <span>Home view</span>
    <router-link to="/tasks">Tasks</router-link>
    <router-link to="/projects">Projects</router-link>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
    setup() {
        const router = useRouter()

        onMounted(() => {
            router.push({
                path: '/tasks'
            })
        })
    }
})
</script>