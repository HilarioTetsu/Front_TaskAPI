// src/stores/tasks.ts
import { defineStore } from 'pinia';
import api from '../services/api';

export interface PrioridadTarea {
  id: number;
  prioridadTipo: string;
}

export interface TareaStatus {
  id: number;
  status: string;
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    prioridades: [] as PrioridadTarea[],
    statuses: [] as TareaStatus[],
    loadingCatalogs: false,
    error: null as string | null,
  }),

  getters: {
    prioridadLabel: (state) => (id?: number | null) => {
      if (id == null) return '—';
      return state.prioridades.find((p) => p.id === id)?.prioridadTipo ?? '—';
    },
    statusLabel: (state) => (id?: number | null) => {
      if (id == null) return '—';
      return state.statuses.find((s) => s.id === id)?.status ?? '—';
    },
  },

  actions: {
    async loadCatalogs() {
      this.loadingCatalogs = true;
      this.error = null;
      try {
        const [prior, stat] = await Promise.all([
          api.get<PrioridadTarea[]>('/tareas/prioridades'),
          api.get<TareaStatus[]>('/tareas/tarea-status'),
        ]);

        this.prioridades = prior.data;
        this.statuses = stat.data;
      } catch (e: any) {
        console.error('Error cargando catálogos de tareas', e);
        this.error =
          e?.response?.data?.message ?? 'No se pudieron cargar catálogos.';
      } finally {
        this.loadingCatalogs = false;
      }
    },

    async createTask(payload: {
      titulo: string;
      descripcion: string;
      id_prioridad: number;
      id_tarea_status: number;
      project_id: string;
      fechaLimite?: string | null;
      assigneeId?: number | null; // <– ID del usuario seleccionado
    }) {
      // sacamos assigneeId para NO mandarlo al POST /tareas
      const { assigneeId, ...rest } = payload;

      const fecha =
        rest.fechaLimite && rest.fechaLimite.length === 10
          ? `${rest.fechaLimite}T00:00:00`
          : rest.fechaLimite ?? null;

      // 1) Crear la tarea
      type TaskCreatedResponse = { idGuid: string };

      const res = await api.post<TaskCreatedResponse>('/tareas', {
        ...rest,
        fechaLimite: fecha,
        status: 1, // activo
      });

      const tareaId = res.data.idGuid;
      console.log('Tarea creada con idGuid:', tareaId, 'assigneeId:', assigneeId);

      // 2) Si hay usuario seleccionado, llamar al endpoint de asignación
      if (assigneeId != null) {
        await api.post(`/tareas/${tareaId}/assign`, [assigneeId]);
        console.log('Asignación enviada a /tareas/' + tareaId + '/assign', [assigneeId]);
      }
    },
  },
});
