import { Request, Response } from "express";

function getEventFetchRequests(req: Request, res: Response) {
  const { id } = req.params;
  res.status(200).json({ id, body: "Event fetched" });
}

export default { getEventFetchRequests };
