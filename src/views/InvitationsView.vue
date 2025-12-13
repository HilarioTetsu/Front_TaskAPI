<script setup lang="ts">
import { onMounted,ref} from 'vue'; 
import { useInvitationsStore } from '../stores/invitations';

const store = useInvitationsStore();

const showToast = ref(false);
const toastMessage = ref('');

onMounted(async () => {
  await store.fetchStatuses();
  // Mantenemos esta llamada para refrescar inmediatamente al entrar a la vista
  await store.fetchMyInvitations(); 
});



function accept(id: string, projectName: string) {
  store.acceptInvitation(id).then(() => {
    // Recargar la lista
    store.fetchMyInvitations();
    
    // Configurar y mostrar el mensaje
    toastMessage.value = `¡Genial! Ahora eres miembro del proyecto "${projectName}"`;
    showToast.value = true;

    // Ocultar automáticamente después de 4 segundos
    setTimeout(() => {
      showToast.value = false;
    }, 4000);
  });
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
  <div class="relative min-h-[50vh]"> <h1 class="text-2xl font-semibold mb-6 text-slate-800">Invitaciones</h1>

    <p v-if="store.loading" class="text-sm text-slate-500">Cargando invitaciones...</p>
    <p v-if="store.error" class="text-sm text-red-500 bg-red-50 p-2 rounded mb-4">{{ store.error }}</p>

    <div v-if="store.invitations.length === 0 && !store.loading" class="text-slate-500 italic">
      No tienes invitaciones pendientes.
    </div>

    <div v-for="inv in store.invitations" :key="inv.id" class="p-5 border border-slate-200 rounded-xl mb-4 bg-white shadow-sm hover:shadow-md transition duration-200">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-lg text-slate-900 mb-1">
            Proyecto: <span class="text-blue-600">{{ inv.project }}</span>
          </p>
          <div class="text-sm space-y-1 text-slate-600">
            <p>Te invitan como: <span class="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs uppercase">{{ inv.role }}</span></p>
            <p>Invitado por: <span class="font-medium text-slate-800">{{ inv.usernameHost }}</span></p>
            <p class="text-xs text-slate-400 mt-2">Fecha: {{ formatDate(inv.fechaCreacion) }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <button @click="accept(inv.id, inv.project)" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm">
          Aceptar
        </button>
        <button @click="reject(inv.id)" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
          Rechazar
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div v-if="showToast" class="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border-l-4 border-emerald-500 shadow-xl rounded-lg pointer-events-auto overflow-hidden">
        <div class="p-4 flex items-start gap-3">
          <div class="flex-shrink-0 text-emerald-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1 w-0">
            <p class="text-sm font-medium text-slate-900">¡Bienvenido!</p>
            <p class="mt-1 text-sm text-slate-500 leading-snug">{{ toastMessage }}</p>
          </div>
          <button @click="showToast = false" class="text-slate-400 hover:text-slate-500">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>