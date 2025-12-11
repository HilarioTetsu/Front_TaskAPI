// src/stores/invitations.ts
import { defineStore } from 'pinia';
import api from '../services/api';

export type ProjectRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface InvitationDto {
  id?: string;
  userHostId?: number;
  userGuestId: number;
  projectId: string;
  role: ProjectRole;
  status?: number;
  fechaCreacion?: string;
}

export interface InvitationViewDto {
  id: string;
  usernameHost: string;
  usernameGuest: string;
  project: string;
  projectId: string;
  role: ProjectRole;
  fechaCreacion: string;
}

interface PageMeta {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

interface InvitationsState {
  statuses: Record<number, string>;
  invitations: InvitationViewDto[];
  pageMeta: PageMeta | null;
  loading: boolean;
  error: string | null;
}

export const useInvitationsStore = defineStore('invitations', {
  state: (): InvitationsState => ({
    statuses: {},
    invitations: [],
    pageMeta: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStatuses() {
      this.error = null;
      try {
        const { data } = await api.get<Record<number, string>>('/invitations/statuses');
        this.statuses = data;
      } catch (err: any) {
        console.error('Error cargando estatus de invitaciones', err);
        this.error = err.response?.data?.message ?? 'No se pudo cargar el catálogo de invitaciones';
      }
    },

async fetchMyInvitations(options?: {
  status?: string;
  pagina?: number;
  tamanio?: number;
  sorts?: string;
}) {
  this.loading = true;
  this.error = null;
  try {
    const { data } = await api.get('/invitations', {
      params: {
        status: options?.status ?? 'PENDIENTE',           // 👈 por defecto PENDING
        pagina: options?.pagina ?? 0,
        tamanio: options?.tamanio ?? 5,
        sorts: options?.sorts ?? 'fecha_creacion,desc;',
      },
    });

    this.invitations = data.content as InvitationViewDto[];
    this.pageMeta = {
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      number: data.number,
    };
  } catch (err: any) {
    console.error('Error cargando invitaciones', err);
    this.error =
      err.response?.data?.message ?? 'No se pudieron cargar tus invitaciones';
  } finally {
    this.loading = false;
  }
},

    // OWNER invita a un usuario a un proyecto
    async inviteUserToProject(payload: {
      projectId: string;
      userGuestId: number;
      role: ProjectRole;
    }) {
      this.error = null;
      try {
        const body: InvitationDto = {
          projectId: payload.projectId,
          userGuestId: payload.userGuestId,
          role: payload.role,
        };

        await api.post<InvitationDto>('/invitations', body);
      } catch (err: any) {
        console.error('Error enviando invitación', err);
        this.error = err.response?.data?.message ?? 'No se pudo enviar la invitación';
        throw err;
      }
    },

    // Invitado acepta invitación
    async acceptInvitation(invitationId: string) {
      // 4 = ACCEPTED según el servicio
      await this.confirmInvitation(invitationId, 4);
    },

    // Invitado rechaza invitación
    async rejectInvitation(invitationId: string) {
      // 5 = REJECTED
      await this.confirmInvitation(invitationId, 5);
    },

async confirmInvitation(invitationId: string, status: number) {
  this.error = null;
  try {
    await api.patch(`/invitations/${invitationId}/${status}`);

    await this.fetchMyInvitations({ status: 'PENDIENTE' });
  } catch (err: any) {
    console.error('Error confirmando invitación', err);
    this.error =
      err.response?.data?.message ?? 'No se pudo confirmar la invitación';
    throw err;
  }
},
  },
});
