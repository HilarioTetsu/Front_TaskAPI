import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Inicializamos token recuperando de localStorage
    token: localStorage.getItem('jwt') as string | null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    
    // Nuevo Getter: Verifica matemáticamente si el token ya venció
isTokenExpired: (state): boolean => {
      if (!state.token) return true;
      try {
        const base64Url = state.token.split('.')[1];
        
        // CORRECCIÓN: Validamos que exista la parte del payload
        if (!base64Url) return true; 

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);
        const now = Math.floor(Date.now() / 1000);

        return payload.exp < now;
      } catch (e) {
        return true;
      }
    }
  },
  actions: {
    async login(data: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/login', { data, password });
        this.token = res.data.jwt;
        if (this.token) {
           localStorage.setItem('jwt', this.token);
        }
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Error al iniciar sesión';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      localStorage.removeItem('jwt');
      // Opcional: recargar la página para limpiar estados de otras stores
      // window.location.reload(); 
    },
    
    // Acción útil para llamar al iniciar la app
    checkAuth() {
      if (this.token && this.isTokenExpired) {
        this.logout();
      }
    }
  },
});