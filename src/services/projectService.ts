import api from './api';

export const projectService = {
  getSummary() {
    return api.get('/projects/summary');
  },
};
