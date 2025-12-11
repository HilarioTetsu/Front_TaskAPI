import { defineStore } from 'pinia';
import api from '../services/api';

export interface DashboardSummary {
  usuarioId: number;
  username: string;
  proyectosTotalActivos: number;
  proyectosComoOwner: number;
  tareasPendientes: number;
  tareasVencidas: number;
  tareasParaHoy: number;
  tareasPorPrioridad: Record<string, number>;
  tareasPorEstatus: Record<string, number>;
}

interface State {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): State => ({
    summary: null,
    loading: false,
    error: null,
  }),

  actions: {
    async loadSummary() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get<DashboardSummary>('/projects/summary');
        this.summary = res.data;
      } catch (err: any) {
        console.error('Error cargando /projects/summary', err);
        this.error =
          err?.response?.data?.message ??
          'No se pudo cargar el resumen de proyectos.';
      } finally {
        this.loading = false;
      }
    },
  },
});
