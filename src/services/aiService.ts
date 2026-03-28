import api from '../api/axios';

export type AIRewriteMode = 'professional' | 'shorter' | 'cleaner' | 'bullets' | 'tasks';

export const aiService = {
  summarize: async (content: string) => {
    const { data } = await api.post('/ai/summarize', { content });
    return data.result;
  },
  generateTitle: async (content: string) => {
    const { data } = await api.post('/ai/generate-title', { content });
    return data.result;
  },
  generateTags: async (content: string) => {
    const { data } = await api.post('/ai/generate-tags', { content });
    return data.result;
  },
  format: async (content: string) => {
    const { data } = await api.post('/ai/format', { content });
    return data.result;
  },
  rewrite: async (content: string, mode: AIRewriteMode) => {
    const { data } = await api.post('/ai/rewrite', { content, mode });
    return data.result;
  },
  extractTasks: async (content: string) => {
    const { data } = await api.post('/ai/extract-tasks', { content });
    return data.result;
  },
  extractReminders: async (content: string) => {
    const { data } = await api.post('/ai/extract-reminders', { content });
    return data.result;
  },
  generateDiagram: async (content: string, type: 'flowchart' | 'sequence' = 'flowchart') => {
    const { data } = await api.post('/ai/diagram', { content, type });
    return data.result;
  }
};
