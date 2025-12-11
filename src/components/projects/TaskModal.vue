<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTasksStore } from '../../stores/tasks';
import api from '../../services/api';

interface SearchUser {
  id: number;
  email: string;
  username: string;
  roles: string[];
}

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const tasksStore = useTasksStore();

// --- formulario básico ---
const form = ref({
  titulo: '',
  descripcion: '',
  id_prioridad: 2 as number,   // MEDIA
  id_tarea_status: 1 as number, // EN PROCESO (ajusta si tu catálogo es distinto)
  fechaLimite: '' as string,    // "yyyy-MM-dd"
});

// --- búsqueda y selección de usuario ---
const searchTerm = ref('');
const searchingUsers = ref(false);
const usersResult = ref<SearchUser[]>([]);
const selectedUser = ref<SearchUser | null>(null);

const selectedUserLabel = computed(() =>
  selectedUser.value
    ? `${selectedUser.value.username} (${selectedUser.value.email})`
    : 'Sin asignar'
);

async function searchUsers() {
  if (!searchTerm.value.trim()) {
    usersResult.value = [];
    return;
  }

  searchingUsers.value = true;
  try {
    const res = await api.get<SearchUser[]>('/usuario/search', {
      params: {
        term: searchTerm.value,
        projectId: props.projectId,
      },
    });

    usersResult.value = res.data;
  } catch (e) {
    console.error('Error buscando usuarios', e);
    usersResult.value = [];
  } finally {
    searchingUsers.value = false;
  }
}

function chooseUser(u: SearchUser) {
  selectedUser.value = u;
  searchTerm.value = u.username;
  usersResult.value = [];
}

// --- submit ---
const submitting = ref(false);
const errorMessage = ref('');

async function submit() {
  submitting.value = true;
  errorMessage.value = '';

  try {
    await tasksStore.createTask({
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      id_prioridad: form.value.id_prioridad,
      id_tarea_status: form.value.id_tarea_status,
      project_id: props.projectId,
      fechaLimite: form.value.fechaLimite || null,
      // 👇 IMPORTANTE: el nombre de la propiedad
      assigneeId: selectedUser.value ? selectedUser.value.id : null,
    });

    emit('created');
    emit('close');
  } catch (e: any) {
    console.error('Error creando tarea', e);
    errorMessage.value =
      e?.response?.data?.message ?? 'Ha ocurrido un error inesperado en el servidor';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-xl shadow-xl">
      <h2 class="text-xl font-semibold text-slate-900 mb-4">
        Nueva tarea
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            v-model="form.titulo"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <!-- Prioridad -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select
              v-model.number="form.id_prioridad"
              class="w-full border rounded px-3 py-2 text-sm"
            >
              <option
                v-for="p in tasksStore.prioridades"
                :key="p.id"
                :value="p.id"
              >
                {{ p.prioridadTipo }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select
              v-model.number="form.id_tarea_status"
              class="w-full border rounded px-3 py-2 text-sm"
            >
              <option
                v-for="s in tasksStore.statuses"
                :key="s.id"
                :value="s.id"
              >
                {{ s.status }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fecha límite -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
          <input
            v-model="form.fechaLimite"
            type="date"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <!-- Asignar a -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Asignar a</label>

          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por usuario o email"
              class="w-full border rounded px-3 py-2 text-sm"
              @input="searchUsers"
            />

            <div
              v-if="searchingUsers"
              class="absolute right-3 top-2.5 text-xs text-slate-400"
            >
              Buscando...
            </div>

            <ul
              v-if="usersResult.length > 0"
              class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm max-h-40 overflow-auto"
            >
              <li
                v-for="u in usersResult"
                :key="u.id"
                class="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                @click="chooseUser(u)"
              >
                <div class="font-medium">{{ u.username }}</div>
                <div class="text-xs text-slate-500">{{ u.email }}</div>
              </li>
            </ul>
          </div>

          <p class="mt-1 text-xs text-slate-500">
            Seleccionado: <span class="font-semibold">{{ selectedUserLabel }}</span>
          </p>

          <p
            v-if="selectedUser"
            class="mt-1 text-xs text-emerald-600"
          >
            Asignado a ID: {{ selectedUser.id }}
          </p>
        </div>
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
        >
          Cancelar
        </button>

        <button
          class="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Guardando...' : 'Guardar tarea' }}
        </button>
      </div>
    </div>
  </div>
</template>
