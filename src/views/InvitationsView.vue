<script setup lang="ts">
import { onMounted } from 'vue';
import { useInvitationsStore } from '../stores/invitations';

const store = useInvitationsStore();

onMounted(async () => {
  await store.fetchStatuses();
  await store.fetchMyInvitations();
});

function accept(id: string) {
  store.acceptInvitation(id).then(() => store.fetchMyInvitations());
}

function reject(id: string) {
  store.rejectInvitation(id).then(() => store.fetchMyInvitations());
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Invitaciones</h1>

    <p v-if="store.loading">Cargando invitaciones...</p>
    <p v-if="store.error" class="text-red-500">{{ store.error }}</p>

    <div v-if="store.invitations.length === 0 && !store.loading">
      No tienes invitaciones pendientes.
    </div>

    <div v-for="inv in store.invitations" :key="inv.id" class="p-4 border rounded mb-3">
      <p class="font-semibold">Proyecto: {{ inv.project }}</p>
      <p class="text-sm text-gray-500">Rol: {{ inv.role }}</p>
      <p class="text-sm text-gray-500">Invitado por: {{ inv.usernameHost }}</p>
      <p class="text-sm">Fecha: {{ inv.fechaCreacion }}</p>

      <div class="mt-2 flex gap-3">
        <button @click="accept(inv.id)" class="px-3 py-1 bg-green-600 text-white rounded">
          Aceptar
        </button>
        <button @click="reject(inv.id)" class="px-3 py-1 bg-red-600 text-white rounded">
          Rechazar
        </button>
      </div>
    </div>
  </div>
</template>
