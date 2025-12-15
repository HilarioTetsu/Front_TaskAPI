<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '../../stores/projects';
import { useUserStore } from '../../stores/user';

import ProjectTasksTab from '../../components/projects/ProjectTasksTab.vue';
import ProjectMembersTab from '../../components/projects/ProjectMembersTab.vue';

const store = useProjectsStore();
const route = useRoute();
const activeTab = ref<'tareas' | 'miembros'>('tareas');
const userStore = useUserStore();
const projectId = computed(() => String(route.params.projectId));


const isOwner = computed(() => {
  if (!store.current) return false;

  // CORRECCIÓN: Accedemos correctamente a 'userStore.me'
  const currentUserId = userStore.me?.id; 

  if (currentUserId == null) return false;

  return store.current.ownerId === currentUserId;
});

onMounted(async () => {
  await store.loadStatuses();
  await store.loadOne(projectId.value); // <- idGuid
});
</script>

<template>
  <div v-if="store.current">
    <h1 class="text-2xl font-semibold text-slate-900 mb-1">
      {{ store.current.name }}
    </h1>

    <p class="text-sm text-slate-500 mb-6">
      {{ store.current.descripcion }}
    </p>

    <!-- Tabs -->
    <div class="flex gap-4 border-b pb-2 mb-6">
      <button
        @click="activeTab = 'tareas'"
        :class="[
          'px-3 py-2 rounded',
          activeTab === 'tareas'
            ? 'bg-blue-600 text-white'
            : 'text-slate-600 hover:bg-slate-200'
        ]"
      >
        Tareas
      </button>

      <button
        @click="activeTab = 'miembros'"
        :class="[
          'px-3 py-2 rounded',
          activeTab === 'miembros'
            ? 'bg-blue-600 text-white'
            : 'text-slate-600 hover:bg-slate-200'
        ]"
      >
        Miembros
      </button>
    </div>

<ProjectTasksTab
  v-if="activeTab === 'tareas'"
  :project-id="projectId"
/>

<ProjectMembersTab
  v-else
  :project-id="projectId"
  :is-owner="isOwner"
/>

  </div>

  <p v-else>Cargando...</p>
</template>
