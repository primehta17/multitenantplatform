import axios from './axios';

export const getUsers = () => axios.get('/users');
export const inviteUser = (data) => axios.post('/users/invite', data);
export const changeRole = (id, role) => axios.patch(`/users/${id}/role`, { role });
