<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useProjectsStore } from '../../stores/projects';
import CreateProjectModal from '../../components/projects/CreateProjectModal.vue';
import { useRouter } from 'vue-router';

const store = useProjectsStore();
const router = useRouter();
const showModal = ref(false);

onMounted(async () => {
  await store.loadStatuses();
  await store.loadAll();
});

const hasProjects = computed(() => store.list.length > 0);

const resolveStatus = (statusId: number) =>
  store.statuses[statusId] ?? '—';

function openProject(pId: string) {
  router.push({ name: 'project-detail', params: { projectId: pId } });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-slate-900">Proyectos</h1>

      <button
        @click="showModal = true"
        class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium"
      >
        Nuevo Proyecto
      </button>
    </div>

    <div v-if="store.loading" class="text-sm text-slate-500">
      Cargando proyectos...
    </div>

    <div
      v-else-if="store.error"
      class="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
    >
      {{ store.error }}
    </div>

    <div
      v-else-if="hasProjects"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <div
        v-for="p in store.list"
        :key="p.idGuid"
        @click="openProject(p.idGuid)"
        class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition"
      >
        <div class="flex justify-between items-start gap-2">
          <h2 class="text-base font-semibold text-slate-900 line-clamp-2">
            {{ p.name }}
          </h2>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700"
          >
            {{ resolveStatus(p.status) }}
          </span>
        </div>

        <p class="mt-2 text-sm text-slate-500 line-clamp-3">
          {{ p.descripcion }}
        </p>

        <p class="mt-3 text-xs text-slate-400">
          {{ p.listTask?.length ?? 0 }} tareas
        </p>
      </div>
    </div>

    <p v-else class="text-sm text-slate-500">
      No hay proyectos.
    </p>

    <CreateProjectModal v-if="showModal" @close="showModal = false" />
  </div>
</template>