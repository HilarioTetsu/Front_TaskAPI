// src/stores/projects.ts
import { defineStore } from 'pinia';
import api from '../services/api';


export interface TaskSummary {
  idGuid: string;
  titulo: string;
  descripcion: string;
  id_tarea_status: number;
  id_prioridad: number;
  project_id: string;
  listTag: any[] | null;
  fechaLimite: string;
  status: number;
}

export interface Project {
  idGuid: string;
  name: string;
  descripcion: string;
  ownerId: number;
  status: number;
  listTask: TaskSummary[] | null;
}

interface ProjectsState {
  owned: Project[];
  collaborations: Project[];

  statuses: Record<number, string>;
  loading: boolean;
  error: string | null;
  current: Project | null;

  // 👇 nombres que realmente estás usando en state y actions
  members: any[];                       // miembros del proyecto
  inviteStatuses: Record<number, string>; // catálogo de estatus de invitaciones
  pendingInvitations: any[];           // invitaciones (paginadas o no)
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    owned: [],          // Inicializar vacío
    collaborations: [], // Inicializar vacío
    statuses: {},
    loading: false,
    error: null,
    current: null,
    members: [],
    inviteStatuses: {},
    pendingInvitations: [],
  }),

  getters: {
    // para usar en el detalle luego
    statusLabel: (state) => {
      return (statusId: number | undefined) =>
        statusId != null ? state.statuses[statusId] ?? '—' : '—';
    },
  },

  actions: {
    async loadStatuses() {
      try {
        const res = await api.get('/projects/statuses');
        const data = res.data;

        const map: Record<number, string> = {};

        // Soportamos tanto un objeto tipo { "1": "Activo" } como un array
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const id =
              item.id ??
              item.code ??
              item.value ??
              item.statusId ??
              item.status ??
              null;
            const label =
              item.name ??
              item.nombre ??
              item.label ??
              item.descripcion ??
              item.statusDesc ??
              String(item);
            if (id != null) map[Number(id)] = label;
          });
        } else if (data && typeof data === 'object') {
          Object.entries(data).forEach(([k, v]) => {
            map[Number(k)] = String(v);
          });
        }

        this.statuses = map;
      } catch (e) {
        console.error('Error cargando /projects/statuses', e);
      }
    },

    async loadAll() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get<{ owned: Project[], collaborations: Project[] }>('/projects');
        
        this.owned = res.data.owned;
        this.collaborations = res.data.collaborations;

      } catch (e: any) {

        console.error('Error cargando /projects', e);
        this.error =
          e?.response?.data?.message ?? 'No se pudieron cargar los proyectos';
        this.owned = [];
        this.collaborations = [];

      } finally {
        this.loading = false;
      }
    },

    async loadOne(idGuid: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get<Project>(`/projects/${idGuid}`);
        this.current = res.data;
      } catch (e: any) {
        console.error('Error cargando /projects/{id}', e);
        this.error =
          e?.response?.data?.message ?? 'No se pudo cargar el proyecto';
        this.current = null;
      } finally {
        this.loading = false;
      }
    },

    async create(data: { name: string; descripcion: string; status: number }) {
      await api.post('/projects', data);
      await this.loadAll();
    },

    async update(idGuid: string, data: any) {
      await api.put(`/projects/${idGuid}`, data);
      await this.loadOne(idGuid);
    },

    async remove(idGuid: string) {
      await api.delete(`/projects/${idGuid}`);
      await this.loadAll();
    },

    async getMembers(projectId: string) {
      const { data } = await api.get(`/projects/${projectId}/members`);
      this.members = data;
    },

    async updateMember(projectId: string, userId: number, payload: any) {
      const { data } = await api.patch(`/projects/${projectId}/members/${userId}`, payload);
      await this.getMembers(projectId);
      return data;
    },

    async removeMember(projectId: string, userId: number) {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      await this.getMembers(projectId);
    },

    //--------------------------------------------------
    // INVITACIONES
    //--------------------------------------------------

    async loadInvitationStatuses() {
      const { data } = await api.get('/invitations/statuses');
      this.inviteStatuses = data;
    },

    async inviteUser(payload: any) {
      const { data } = await api.post('/invitations', payload);
      return data;
    },

    async listInvitations() {
      const { data } = await api.get('/invitations');
      this.pendingInvitations = data.content;
    },

    async confirmInvitation(invitationId: string, status: number) {
      await api.patch(`/invitations/${invitationId}/${status}`);
      await this.listInvitations();
    },

    //--------------------------------------------------
    // BUSCAR USUARIOS PARA INVITAR
    //--------------------------------------------------

    async searchUsers(term: string, projectId: string) {
      const { data } = await api.get(
        '/usuario/search/by-username-or-email',
        {
          params: { term, projectId },
        }
      );
      return data;
    }
  },
});