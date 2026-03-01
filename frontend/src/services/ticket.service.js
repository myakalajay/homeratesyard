import api from './api';

export const ticketService = {
    getAll: async () => {
        const res = await api.get('/tickets');
        return res.data;
    },
    create: async (data) => {
        const res = await api.post('/tickets', data);
        return res.data;
    },
    reply: async (id, message, newStatus) => {
        const res = await api.post(`/tickets/${id}/reply`, { message, newStatus });
        return res.data;
    }
};