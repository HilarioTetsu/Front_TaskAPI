<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';
import TaskModal from '../../components/projects/TaskModal.vue';

const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const showNewTaskModal = ref(false);

onMounted(async () => {
  await tasksStore.loadCatalogs();
});

const project = computed(() => projectsStore.current);

const tasks = computed(() => project.value?.listTask ?? []);

// Helpers para labels
const prioridadLabel = (id?: number | null) =>
  tasksStore.prioridadLabel(id ?? undefined);
const statusLabel = (id?: number | null) =>
  tasksStore.statusLabel(id ?? undefined);

function onTaskCreated() {
  // Estrategia simple: recargar el proyecto para traer la nueva lista de tareas
  if (project.value) {
    projectsStore.loadOne(project.value.idGuid);
  }
  showNewTaskModal.value = false;
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-slate-900">
        Tareas del proyecto
      </h2>

      <button
        class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        @click="showNewTaskModal = true"
      >
        Nueva tarea
      </button>
    </div>

    <div v-if="!project" class="text-sm text-slate-500">
      No hay proyecto cargado.
    </div>

    <div v-else>
      <div v-if="tasks.length === 0" class="text-sm text-slate-500">
        Este proyecto aún no tiene tareas.
      </div>

      <div
        v-else
        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th class="px-4 py-2 text-left">Título</th>
              <th class="px-4 py-2 text-left">Prioridad</th>
              <th class="px-4 py-2 text-left">Estado</th>
              <th class="px-4 py-2 text-left">Fecha límite</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in tasks"
              :key="t.idGuid"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-4 py-2 align-top">
                <div class="font-medium text-slate-800">
                  {{ t.titulo }}
                </div>
                <div class="text-xs text-slate-500 line-clamp-2">
                  {{ t.descripcion }}
                </div>
              </td>
              <td class="px-4 py-2 align-top">
                {{ prioridadLabel(t.id_prioridad) }}
              </td>
              <td class="px-4 py-2 align-top">
                {{ statusLabel(t.id_tarea_status) }}
              </td>
              <td class="px-4 py-2 align-top">
                {{
                  t.fechaLimite
                    ? new Date(t.fechaLimite).toLocaleDateString()
                    : '—'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TaskModal
      v-if="showNewTaskModal && project"
      :project-id="project.idGuid"
      @cancel="showNewTaskModal = false"
      @created="onTaskCreated"
    />
  </div>
</template>
