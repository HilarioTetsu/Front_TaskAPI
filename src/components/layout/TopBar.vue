<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.replace({ name: 'login' });
}
</script>

<template>
  <header
    class="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-slate-200"
  >
    <div class="flex-1 max-w-lg">
      <input
        type="text"
        placeholder="Buscar..."
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        title="Notificaciones"
      >
        🔔
      </button>

      <button
        type="button"
        @click="logout"
        class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
      >
        <span
          class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold"
        >
          U
        </span>
        <span>Salir</span>
      </button>
    </div>
  </header>
</template>
