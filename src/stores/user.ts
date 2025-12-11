import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    me: null as any,
  }),
  actions: {
    async loadMe() {
      const res = await api.get('/usuario/me');
      this.me = res.data;
    },
  },
});
