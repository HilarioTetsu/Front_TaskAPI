<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import DashboardCharts from '../components/dashboard/DashboardCharts.vue';

const dashboard = useDashboardStore();

onMounted(() => {
  dashboard.loadSummary();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <header>
      <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p class="text-sm text-slate-500 mt-1">
        Resumen de tus proyectos y tareas.
      </p>
    </header>

    <!-- Estados -->
    <div v-if="dashboard.loading" class="text-sm text-slate-500">
      Cargando resumen...
    </div>

    <div
      v-else-if="dashboard.error"
      class="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
    >
      {{ dashboard.error }}
    </div>

    <!-- Contenido -->
    <template v-else-if="dashboard.summary">
      <!-- Tarjetas principales -->
      <section
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-1"
      >
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase">
            Proyectos activos
          </p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            {{ dashboard.summary.proyectosTotalActivos }}
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase">
            Proyectos como owner
          </p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            {{ dashboard.summary.proyectosComoOwner }}
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase">
            Tareas pendientes
          </p>
          <p class="mt-1 text-2xl font-semibold text-amber-600">
            {{ dashboard.summary.tareasPendientes }}
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p class="text-xs font-medium text-slate-500 uppercase">
            Tareas para hoy
          </p>
          <p class="mt-1 text-2xl font-semibold text-blue-600">
            {{ dashboard.summary.tareasParaHoy }}
          </p>
        </div>
      </section>

      <!-- Gráficos -->
      <DashboardCharts
        :prioridad="dashboard.summary.tareasPorPrioridad"
        :estatus="dashboard.summary.tareasPorEstatus"
      />
    </template>

    <div v-else class="text-sm text-slate-500">
      No hay datos de dashboard disponibles.
    </div>
  </div>
</template>