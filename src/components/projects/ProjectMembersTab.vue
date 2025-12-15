<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import api from '../../services/api';
import { useProjectsStore } from '../../stores/projects';
import { useInvitationsStore, type ProjectRole } from '../../stores/invitations';

const props = defineProps<{
  projectId: string;
  isOwner: boolean;
}>();

const projectsStore = useProjectsStore();
const invitationsStore = useInvitationsStore();

// --------- STATE LOCAL ---------
const roles = ref<ProjectRole[]>([]);
const loadingRoles = ref(false);

const searchTerm = ref('');
const searchResults = ref<Array<{ id: number; email: string; username: string; roles: string[] }>>([]);

const selectedUser = ref<{ id: number; email: string; username: string } | null>(null);

const selectedRole = ref<ProjectRole>('VIEWER');

const inviteError = ref('');
const inviteLoading = ref(false);

const members = computed(() => projectsStore.members);

// --------- CARGA INICIAL ---------
onMounted(async () => {
  await projectsStore.getMembers(props.projectId);
  await loadRoles();
});

// Cargar roles desde /projects/roles
async function loadRoles() {
  loadingRoles.value = true;
  try {
    const { data } = await api.get<ProjectRole[]>('/projects/roles');
    roles.value = data;

    const firstRole = roles.value[0];
    if (firstRole && !roles.value.includes(selectedRole.value)) {
      selectedRole.value = firstRole;
    }
  } catch (err) {
    console.error('Error cargando roles de proyecto', err);
    // fallback por si acaso
    roles.value = ['OWNER', 'EDITOR', 'VIEWER'];
    if (!roles.value.includes(selectedRole.value)) {
      selectedRole.value = 'VIEWER';
    }
  } finally {
    loadingRoles.value = false;
  }
}

// --------- BUSCAR USUARIOS PARA INVITAR ---------
watch(
  () => searchTerm.value,
  async (term) => {
    inviteError.value = '';


    if (!term || term.length < 2) {
      searchResults.value = [];
      return;
    }

    if (selectedUser.value) {
        selectedUser.value = null;
    }

    try {
      const data = await projectsStore.searchUsers(term, props.projectId);
      searchResults.value = data;
    } catch (err: any) {
      console.error('Error buscando usuarios', err);
      inviteError.value =
        err?.response?.data?.message ?? 'No se pudo buscar usuarios.';
    }
  }
);


function selectUser(user: any) {
  // 1. Asignamos el usuario seleccionado
  selectedUser.value = {
    id: user.id,
    email: user.email,
    username: user.username
  };
  
  // 2. Limpiamos el término de búsqueda para que el watcher no interfiera
  searchTerm.value = '';
  
  // 3. Vaciamos la lista de resultados
  searchResults.value = [];
}

function clearSelection() {
  selectedUser.value = null;
  searchTerm.value = '';
}

// --------- INVITAR USUARIO ---------
async function sendInvitation() {

  if (!selectedUser.value) { // <--- Cambio aquí
    inviteError.value = 'Selecciona primero un usuario.';
    return;
  }

  inviteLoading.value = true;
  inviteError.value = '';

  try {
    await invitationsStore.inviteUserToProject({
      projectId: props.projectId,
      userGuestId: selectedUser.value.id, // <--- Cambio aquí
      role: selectedRole.value,
    });

    // Reset UI
    clearSelection();

  } catch (err) {
    inviteError.value =
      invitationsStore.error ?? 'No se pudo enviar la invitación.';
  } finally {
    inviteLoading.value = false;
  }
}

// --------- GESTIÓN DE MIEMBROS ---------
async function changeMemberRole(member: any, newRole: ProjectRole) {
  try {
    await projectsStore.updateMember(props.projectId, member.usuarioId, {
      role: newRole,
      status: member.status, // reenviamos el status actual para no romper validaciones
    });
  } catch {
    // el store ya registra error por consola
  }
}

async function removeMember(member: any) {
  if (!confirm('¿Eliminar a este miembro del proyecto?')) return;
  try {
    await projectsStore.removeMember(props.projectId, member.usuarioId);
  } catch {
    // error ya registrado en el store
  }
}

function roleLabel(role: ProjectRole) {
  switch (role) {
    case 'OWNER':
      return 'Owner';
    case 'EDITOR':
      return 'Editor';
    case 'VIEWER':
      return 'Viewer';
    default:
      return role;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- MIEMBROS ACTUALES -->
    <section>
      <h3 class="text-slate-900 font-semibold mb-3">Miembros del proyecto</h3>

      <p v-if="projectsStore.loading" class="text-sm text-slate-500">
        Cargando miembros...
      </p>

      <p v-else-if="members.length === 0" class="text-sm text-slate-500">
        Este proyecto todavía no tiene miembros (además del propietario).
      </p>

      <div v-else class="bg-white rounded-lg shadow-sm divide-y divide-slate-100">
        <div v-for="m in members" :key="m.id" class="flex items-center justify-between px-4 py-3">
          <!-- Bloque izquierda: Avatar + nombre + rol -->
          <div class="flex items-center gap-3">
            <!-- Avatar con inicial -->
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 uppercase">
              {{ (m.username || 'U').charAt(0) }}
            </div>

            <div>
              <p class="text-sm font-medium text-slate-900">
                {{ m.username }}
              </p>

              <div class="flex items-center gap-2 mt-0.5">
                <!-- Badge de rol -->
                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {{ roleLabel(m.role) }}
                </span>

                <!-- ID como texto secundario (opcional) -->
                <span class="text-[11px] text-slate-400">
                  ID: {{ m.usuarioId }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bloque derecha: acciones -->
          <div class="flex items-center gap-2">
            <select v-if="isOwner" class="border rounded px-2 py-1 text-xs text-slate-700" :value="m.role"
              @change="changeMemberRole(m, ($event.target as HTMLSelectElement).value as ProjectRole)">
              <option v-for="r in roles" :key="r" :value="r">
                {{ roleLabel(r) }}
              </option>
            </select>

            <button v-if="isOwner" class="text-xs font-medium text-red-600 hover:text-red-700" @click="removeMember(m)">
              Eliminar
            </button>
          </div>
        </div>
      </div>

    </section>

    <!-- INVITAR MIEMBRO (solo OWNER) -->
    <section v-if="isOwner" class="border-t pt-4">
      <h3 class="text-slate-900 font-semibold mb-3">Invitar nuevo miembro</h3>

<div class="bg-white rounded-lg shadow-sm p-4 space-y-3">

        <label class="block text-xs font-medium text-slate-600 mb-1">
          Buscar usuario (username o email)
        </label>

        <div v-if="!selectedUser" class="relative">
          <input 
            v-model="searchTerm" 
            type="text"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Ej: juan, juan@example.com" 
          />

          <div v-if="searchResults.length > 0"
            class="absolute z-10 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <button 
              v-for="u in searchResults" 
              :key="u.id" 
              type="button"
              class="w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              @click="selectUser(u)">
              <div>
                <div class="font-medium text-slate-800">{{ u.username }}</div>
                <div class="text-xs text-slate-500">{{ u.email }}</div>
              </div>
              <span v-if="u.roles.length" class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                {{ u.roles[0] }}
              </span>
            </button>
          </div>
        </div>

        <div v-else class="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
              {{ selectedUser.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ selectedUser.username }}</p>
              <p class="text-xs text-slate-500">{{ selectedUser.email }}</p>
            </div>
          </div>

          <button @click="clearSelection" class="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Cambiar usuario">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 mt-4 pt-2 border-t border-slate-100">
          
          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Rol</label>
            <select v-model="selectedRole" class="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500">
              <option v-for="r in roles" :key="r" :value="r">
                {{ roleLabel(r) }}
              </option>
            </select>
          </div>

          <button
            class="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-white transition shadow-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="inviteLoading || !selectedUser" 
            @click="sendInvitation">
            {{ inviteLoading ? 'Enviando...' : 'Enviar invitación' }}
          </button>
        </div>
        
        <p v-if="inviteError" class="text-sm text-red-600 mt-2">
          {{ inviteError }}
        </p>

      </div>
    </section>
  </div>
</template>
