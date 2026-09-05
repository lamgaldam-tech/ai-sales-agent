import type { Response } from "express";

class ApiError {
  status: number;
  error: string;
  constructor(status: number, error: string) {
    this.status = status;
    this.error = error;
  }
}

const sendError = (res: Response, error: any) => {
  if (error instanceof ApiError)
    return sendResponse(res, error.status, { error: error.error });
  if (error instanceof Error)
    return sendResponse(res, 400, { error: error.message });
  return sendResponse(res, error?.status, { error });
};

const sendResponse = (res: Response, status: number, payload?: any) => {
  res.status(status);
  if (payload) res.json(payload);
  return res;
};

export { ApiError, sendError, sendResponse };
