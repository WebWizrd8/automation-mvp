import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTriggerRequestFromId = async (id: number) => {
  const triggerRequest = await prisma.triggerRequest.findUnique({
    where: {
      id,
    },
    include: {
      trigger: true,
    },
  });
  if (!triggerRequest) {
    throw new Error(`Trigger request with id ${id} not found`);
  }
  return triggerRequest;
};
