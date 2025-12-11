<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'; // Importar ciclos de vida
import { useInvitationsStore } from '../../stores/invitations'; // Importar store
import SidebarNav from './SidebarNav.vue';
import TopBar from './TopBar.vue';

const invitationsStore = useInvitationsStore();
let polling: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // 1. Carga inicial inmediata por si acaso
  invitationsStore.fetchMyInvitations({ status: 'PENDIENTE' });

  // 2. Configurar el intervalo global (ej. cada 10 segundos)
  polling = setInterval(() => {
    // Al actualizar el store aquí, el contador del Sidebar reaccionará automáticamente
    invitationsStore.fetchMyInvitations({ status: 'PENDIENTE' });
  }, 10000); 
});

onUnmounted(() => {
  // 3. Limpieza al salir (ej. Logout)
  if (polling) clearInterval(polling);
});
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-800">
    <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <span class="font-semibold tracking-tight text-lg">
          Task<span class="text-amber-400">Enterprise</span>
        </span>
      </div>
      <SidebarNav class="flex-1 overflow-y-auto" />
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main class="flex-1 px-8 py-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>