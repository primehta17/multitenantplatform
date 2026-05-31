import * as invoiceService from '../services/invoiceService.js';

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getMyInvoices(req.user);
    res.json(invoices);
  } catch (err) {
    next(err);
  }
};

export const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getAllInvoices(req.user);
    res.json(invoices);
  } catch (err) {
    next(err);
  }
};
