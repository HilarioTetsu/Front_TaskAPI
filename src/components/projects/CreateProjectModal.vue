<script setup lang="ts">
import { ref } from 'vue';
import { useProjectsStore } from '../../stores/projects';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useProjectsStore();

// El backend espera: { name, descripcion, status }
const form = ref({
  name: '',
  descripcion: '',
  status: 1,
});

const submitting = ref(false);
const errorMessage = ref('');

async function submit() {
  submitting.value = true;
  errorMessage.value = '';

  try {
    await store.create({
      name: form.value.name,
      descripcion: form.value.descripcion,
      status: form.value.status,
    });
    emit('close');
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message ?? 'No se pudo crear el proyecto';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
    <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
      <h2 class="text-xl font-semibold text-slate-900 mb-4">
        Crear Proyecto
      </h2>

      <div class="space-y-4">
        <!-- Nombre -->
        <input
          v-model="form.name"
          type="text"
          placeholder="Nombre"
          class="w-full border rounded px-3 py-2 text-sm"
        />

        <!-- Descripción -->
        <textarea
          v-model="form.descripcion"
          placeholder="Descripción"
          class="w-full border rounded px-3 py-2 text-sm"
        />

        <!-- Estatus -->
        <select
          v-model.number="form.status"
          class="w-full border rounded px-3 py-2 text-sm"
        >
          <option
            v-for="(label, id) in store.statuses"
            :key="id"
            :value="Number(id)"
          >
            {{ label }}
          </option>
        </select>
      </div>

      <p v-if="errorMessage" class="mt-3 text-xs text-red-500">
        {{ errorMessage }}
      </p>

      <div class="flex justify-end gap-3 mt-6">
        <button @click="emit('close')" class="px-4 py-2 text-sm">
          Cancelar
        </button>

        <button
          class="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? 'Creando...' : 'Crear' }}
        </button>
      </div>
    </div>
  </div>
</template>
