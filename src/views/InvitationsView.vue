<script setup lang="ts">
import { onMounted} from 'vue'; 
import { useInvitationsStore } from '../stores/invitations';

const store = useInvitationsStore();



onMounted(async () => {
  await store.fetchStatuses();
  // Mantenemos esta llamada para refrescar inmediatamente al entrar a la vista
  await store.fetchMyInvitations(); 
});



function accept(id: string) {
  store.acceptInvitation(id).then(() => store.fetchMyInvitations());
}

function reject(id: string) {
  store.rejectInvitation(id).then(() => store.fetchMyInvitations());
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  
  
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short', 
  }).format(date);

}

</script>

<template>
  <div v-for="inv in store.invitations" :key="inv.id" class="p-4 border rounded mb-3 bg-white shadow-sm">
      <p class="font-semibold text-lg text-slate-800">Proyecto: {{ inv.project }}</p>
      <p class="text-sm text-slate-600">Rol: {{ inv.role }}</p>
      <p class="text-sm text-slate-600">Invitado por: <span class="font-medium">{{ inv.usernameHost }}</span></p>
      
      <p class="text-sm text-slate-500 mt-1 mb-3">
        Fecha: {{ formatDate(inv.fechaCreacion) }}
      </p>

      <div class="mt-2 flex gap-3">
        <button @click="accept(inv.id)" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition">
          Aceptar
        </button>
        <button @click="reject(inv.id)" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition">
          Rechazar
        </button>
      </div>
    </div>
    
  </template>