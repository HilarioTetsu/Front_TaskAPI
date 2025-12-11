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

const hasAnyProject = computed(() => store.owned.length > 0 || store.collaborations.length > 0);

const resolveStatus = (statusId: number) =>
  store.statuses[statusId] ?? '—';

function openProject(pId: string) {
  router.push({ name: 'project-detail', params: { projectId: pId } });
}
</script>

<template>
  <div class="space-y-8"> <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-slate-900">Mis Proyectos</h1>
      <button
        @click="showModal = true"
        class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium"
      >
        Nuevo Proyecto
      </button>
    </div>

    <div v-if="store.loading" class="text-sm text-slate-500">Cargando proyectos...</div>
    <div v-else-if="store.error" class="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {{ store.error }}
    </div>

    <div v-else>
      
      <section v-if="store.owned.length > 0">
        <h2 class="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
          <span class="text-amber-500">👑</span> Proyectos que administras
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="p in store.owned"
            :key="p.idGuid"
            @click="openProject(p.idGuid)"
            class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition hover:border-amber-200"
          >
            <div class="flex justify-between items-start gap-2">
              <h2 class="text-base font-semibold text-slate-900 line-clamp-2">{{ p.name }}</h2>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700">
                {{ resolveStatus(p.status) }}
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-500 line-clamp-3">{{ p.descripcion }}</p>
            <p class="mt-3 text-xs text-slate-400 font-medium">Dueño: Tú</p>
          </div>
        </div>
      </section>

      <div v-if="store.owned.length === 0 && store.collaborations.length === 0" class="text-sm text-slate-500">
        No tienes proyectos activos.
      </div>

      <section v-if="store.collaborations.length > 0" class="mt-10 pt-6 border-t border-slate-200">
        <h2 class="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
          <span class="text-blue-500">🤝</span> Colaboraciones
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="p in store.collaborations"
            :key="p.idGuid"
            @click="openProject(p.idGuid)"
            class="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition hover:bg-white"
          >
            <div class="flex justify-between items-start gap-2">
              <h2 class="text-base font-semibold text-slate-800 line-clamp-2">{{ p.name }}</h2>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-200 text-slate-600">
                Colaborador
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-500 line-clamp-3">{{ p.descripcion }}</p>
            </div>
        </div>
      </section>
      
    </div>

    <CreateProjectModal v-if="showModal" @close="showModal = false" />
  </div>
</template>