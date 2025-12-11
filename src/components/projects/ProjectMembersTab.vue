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
const selectedUserId = ref<number | null>(null);
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
    selectedUserId.value = null;

    if (!term || term.length < 2) {
      searchResults.value = [];
      return;
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

function selectUser(userId: number) {
  selectedUserId.value = userId;
}

// --------- INVITAR USUARIO ---------
async function sendInvitation() {
  if (!selectedUserId.value) {
    inviteError.value = 'Selecciona primero un usuario.';
    return;
  }

  inviteLoading.value = true;
  inviteError.value = '';

  try {
    await invitationsStore.inviteUserToProject({
      projectId: props.projectId,
      userGuestId: selectedUserId.value,
      role: selectedRole.value,
    });

    // Reset UI
    searchTerm.value = '';
    searchResults.value = [];
    selectedUserId.value = null;
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
  <div
    v-for="m in members"
    :key="m.id"
    class="flex items-center justify-between px-4 py-3"
  >
    <!-- Bloque izquierda: Avatar + nombre + rol -->
    <div class="flex items-center gap-3">
      <!-- Avatar con inicial -->
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 uppercase"
      >
        {{ (m.username || 'U').charAt(0) }}
      </div>

      <div>
        <p class="text-sm font-medium text-slate-900">
          {{ m.username }}
        </p>

        <div class="flex items-center gap-2 mt-0.5">
          <!-- Badge de rol -->
          <span
            class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
          >
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
      <select
        v-if="isOwner"
        class="border rounded px-2 py-1 text-xs text-slate-700"
        :value="m.role"
        @change="changeMemberRole(m, ($event.target as HTMLSelectElement).value as ProjectRole)"
      >
        <option v-for="r in roles" :key="r" :value="r">
          {{ roleLabel(r) }}
        </option>
      </select>

      <button
        v-if="isOwner"
        class="text-xs font-medium text-red-600 hover:text-red-700"
        @click="removeMember(m)"
      >
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
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Buscar usuario (username o email)
          </label>
          <input v-model="searchTerm" type="text" class="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej: juan, juan@example.com" />
        </div>

        <div v-if="searchResults.length > 0" class="border rounded max-h-40 overflow-y-auto">
          <button v-for="u in searchResults" :key="u.id" type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
            :class="selectedUserId === u.id ? 'bg-blue-50' : ''" @click="selectUser(u.id)">
            <div>
              <div class="font-medium text-slate-800">
                {{ u.username }}
              </div>
              <div class="text-xs text-slate-500">
                {{ u.email }}
              </div>
            </div>
            <div class="text-[10px] uppercase tracking-wide text-slate-400">
              {{ u.roles.join(', ') }}
            </div>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">
              Rol en el proyecto
            </label>
            <select v-model="selectedRole" class="border rounded px-2 py-1 text-sm">
              <option v-for="r in roles" :key="r" :value="r">
                {{ roleLabel(r) }}
              </option>
            </select>
          </div>

          <button
            class="ml-auto px-4 py-2 rounded text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60"
            :disabled="inviteLoading || !selectedUserId" @click="sendInvitation">
            {{ inviteLoading ? 'Enviando...' : 'Enviar invitación' }}
          </button>
        </div>

        <p v-if="inviteError" class="text-sm text-red-600">
          {{ inviteError }}
        </p>

        <p class="text-xs text-slate-500">
          Las invitaciones se envían vía
          <code class="bg-slate-100 px-1 rounded text-[10px]">
            POST /invitations
          </code>
          y el usuario invitado las acepta o rechaza desde su bandeja usando
          <code class="bg-slate-100 px-1 rounded text-[10px]">
            PATCH /invitations/{id}/{status}
          </code>.
        </p>
      </div>
    </section>
  </div>
</template>
