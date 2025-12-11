<!-- src/components/dashboard/DashboardCharts.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const props = defineProps<{
  prioridad: Record<string, number>;
  estatus: Record<string, number>;
}>();

const prioridadLabels = computed(() => Object.keys(props.prioridad));
const prioridadValues = computed(() => Object.values(props.prioridad));

const estatusLabels = computed(() => Object.keys(props.estatus));
const estatusValues = computed(() => Object.values(props.estatus));

const doughnutData = computed(() => ({
  labels: prioridadLabels.value,
  datasets: [
    {
      data: prioridadValues.value,
      backgroundColor: ['#2563eb', '#22c55e', '#eab308', '#ef4444', '#6366f1'],
    },
  ],
}));

const barData = computed(() => ({
  labels: estatusLabels.value,
  datasets: [
    {
      label: 'Tareas',
      data: estatusValues.value,
      backgroundColor: '#2563eb',
      borderRadius: 6,
    },
  ],
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <!-- Dona: prioridades -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">
        Tareas por prioridad
      </h3>
      <div class="h-64">
        <Doughnut :data="doughnutData" :options="options" />
      </div>
    </div>

    <!-- Barras: estatus -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">
        Tareas por estado
      </h3>
      <div class="h-64">
        <Bar :data="barData" :options="options" />
      </div>
    </div>
  </div>
</template>
