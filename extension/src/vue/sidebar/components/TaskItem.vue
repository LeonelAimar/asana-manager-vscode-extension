<template>
<li :data-link="task.permalink_url"
    @click="$emit('openExternal', task.gid)"
>
    {{ task.due_on }} | {{ task.name }}
</li> 
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

// Interfaces
import { ITask } from 'interfaces/TaskInterfaces'

export default defineComponent({
    props: {
        task: {
            type: Object as PropType<ITask>,
            required: true
        }
    },
    setup() {
        
    }
})
</script>