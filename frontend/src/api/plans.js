import axios from './axios';

export const getPlans = () => axios.get('/plans');
export const createPlan = (data) => axios.post('/plans', data);
export const updatePlan = (id, data) => axios.put(`/plans/${id}`, data);
export const deactivatePlan = (id) => axios.patch(`/plans/${id}/deactivate`);
