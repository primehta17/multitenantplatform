import axios from './axios';

export const getMyInvoices = () => axios.get('/invoices/me');
export const getAllInvoices = () => axios.get('/invoices');
