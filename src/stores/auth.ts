import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') as string | null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(data: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/login', { data, password });
        this.token = res.data.jwt;
        localStorage.setItem('jwt', this.token!);
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Error al iniciar sesión';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      localStorage.removeItem('jwt');
    },
  },
});
