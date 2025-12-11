<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const identifier = ref('');
const password = ref('');

async function login() {
  await auth.login(identifier.value, password.value);
  if (auth.token) {
    router.push('/');
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-slate-100">
      <h1 class="text-2xl font-bold text-slate-800 mb-4">Iniciar sesión</h1>

      <form @submit.prevent="login" class="space-y-4">
        <input
          v-model="identifier"
          type="text"
          placeholder="Usuario o email"
          class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-sm"
        >
          Entrar
        </button>
      </form>

      <p v-if="auth.error" class="text-red-500 text-sm mt-3">
        {{ auth.error }}
      </p>
    </div>
  </div>
</template>
