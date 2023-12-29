import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  // Error handling middleware functionality
  console.log(`Middleware error ${error.message}`); // log the error
  const status = 400;
  // send back an easily understandable error message to the caller
  response.status(status).send(error.message);
};
