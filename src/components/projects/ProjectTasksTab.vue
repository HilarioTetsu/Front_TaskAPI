<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';
import { useUserStore } from '../../stores/user';
import TaskModal from '../../components/projects/TaskModal.vue';


const props = defineProps<{
  projectId: string;
}>();

const canCreateTask = computed(() => {
  const currentProject = project.value;
  const myUserId = userStore.me?.id;

  if (!currentProject || !myUserId) return false;

  // Si soy Owner -> TRUE
  if (currentProject.ownerId === myUserId) return true;

  // Buscamos rol
  const memberRecord = projectsStore.members.find(
    (m: any) => Number(m.usuarioId) === Number(myUserId)
  );

  // Si soy Viewer -> FALSE, cualquier otro -> TRUE
  if (memberRecord && memberRecord.role === 'VIEWER') return false;

  return true; // Por defecto (Editor, etc)
});

const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const userStore = useUserStore();

const showNewTaskModal = ref(false);

onMounted(async () => {
  await tasksStore.loadCatalogs();
  await projectsStore.getMembers(props.projectId);
  if (!userStore.me) {
    await userStore.loadMe();
  }
});

const project = computed(() => projectsStore.current);

const tasks = computed(() => project.value?.listTask ?? []);



// Helpers para labels
const prioridadLabel = (id?: number | null) => tasksStore.prioridadLabel(id ?? undefined);
const statusLabel = (id?: number | null) => tasksStore.statusLabel(id ?? undefined);


function onTaskCreated() {
  // Estrategia simple: recargar el proyecto para traer la nueva lista de tareas
  if (project.value) {
    projectsStore.loadOne(project.value.idGuid);
  }
  showNewTaskModal.value = false;
}

function handleNewTaskClick() {
  const currentProject = project.value;
  const myUserId = userStore.me?.id;

  console.log("--- DEBUG PERMISOS ---");
  console.log("Mi ID:", myUserId);
  console.log("Dueño Proyecto ID:", currentProject?.ownerId);
  console.log("Lista Miembros:", projectsStore.members);

  if (!currentProject || !myUserId) {
    console.warn("Faltan datos de proyecto o usuario, abriendo modal por defecto...");
    showNewTaskModal.value = true;
    return;
  }

  // A) Si soy el OWNER del proyecto, pase directo
  if (currentProject.ownerId === myUserId) {
    console.log("Soy OWNER -> Acceso concedido");
    showNewTaskModal.value = true;
    return;
  }

  // B) Si soy MIEMBRO, busco mi rol
  // Nota: Aseguramos que la comparación sea segura (Number vs Number)
  const memberRecord = projectsStore.members.find((m: any) => Number(m.usuarioId) === Number(myUserId));
  console.log("Registro de miembro encontrado:", memberRecord);

  // Si me encontraron y soy VIEWER -> BLOQUEAR
  if (memberRecord && memberRecord.role === 'VIEWER') {
    console.log("Rol es VIEWER -> Acceso denegado");
    window.alert("⛔ ACCESO DENEGADO\n\nTu rol de 'VIEWER' no te permite crear tareas en este proyecto.");
    return; // <--- Importante: Aquí se detiene y NO abre el modal
  }

  // C) Si soy EDITOR (o cualquier otro caso), abrir
  console.log("Soy EDITOR o no encontrado -> Acceso concedido");
  showNewTaskModal.value = true;
}


</script>

<template>
  <div class="space-y-4">

    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-slate-900">
        Tareas del proyecto
      </h2>

      <button v-if="canCreateTask"
        class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        @click="showNewTaskModal = true">
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

      <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
            <tr v-for="t in tasks" :key="t.idGuid" class="border-t border-slate-100 hover:bg-slate-50">
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

    <TaskModal v-if="showNewTaskModal && project" :project-id="project.idGuid" @close="showNewTaskModal = false"
      @created="onTaskCreated" />
  </div>
</template>
