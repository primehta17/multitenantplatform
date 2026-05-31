import axios from './axios';

export const getMySubscription = () => axios.get('/subscriptions/me');
export const subscribe = (planId) => axios.post('/subscriptions', { planId });
export const changePlan = (id, planId) => axios.put(`/subscriptions/${id}`, { planId });
export const cancelSubscription = (id) => axios.delete(`/subscriptions/${id}`);
