<script setup lang="ts">
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useInvitationsStore } from './stores/invitations';
import { useUserStore } from './stores/user';
import AppShell from './components/layout/AppShell.vue';

const route = useRoute();
const auth = useAuthStore();
const invitationsStore = useInvitationsStore();
const userStore = useUserStore();



watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      try {
       
        userStore.loadMe(); 

        await invitationsStore.fetchMyInvitations({
          status: 'PENDIENTE',
          tamanio: 10,
        });
      } catch (e) {
        console.error('Error cargando datos iniciales', e);
      }
    } else {
      
      invitationsStore.invitations = [];
      invitationsStore.pageMeta = null;
      userStore.me = null; 
    }
  },
  { immediate: true }
);
</script>

<template>
  
  <div v-if="route.name === 'login' || !auth.isAuthenticated">
    <router-view />
  </div>

 
  <AppShell v-else>
    <router-view />
  </AppShell>
</template>