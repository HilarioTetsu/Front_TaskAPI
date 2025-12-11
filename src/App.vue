<script setup lang="ts">
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useInvitationsStore } from './stores/invitations';
import AppShell from './components/layout/AppShell.vue';

const route = useRoute();
const auth = useAuthStore();
const invitationsStore = useInvitationsStore();


// Cada vez que cambie el estado de autenticación
// y también inmediatamente al montar la app
watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      try {
        await invitationsStore.fetchMyInvitations({
          status: 'PENDIENTE',   // solo pendientes
          tamanio: 10,
        });
      } catch (e) {
        // opcional: log
        console.error('Error cargando invitaciones pendientes', e);
      }
    } else {
      // limpiar al cerrar sesión
      invitationsStore.invitations = [];
      invitationsStore.pageMeta = null;
    }
  },
  { immediate: true }  // 🔑 se ejecuta también en el primer render (F5)
);
</script>

<template>
  <!-- Rutas públicas (login, etc.) -->
  <div v-if="route.name === 'login' || !auth.isAuthenticated">
    <router-view />
  </div>

  <!-- Rutas privadas con layout enterprise -->
  <AppShell v-else>
    <router-view />
  </AppShell>
</template>