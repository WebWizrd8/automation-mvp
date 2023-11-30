import { WebhookClient } from "discord.js";

export const getWebhook = (url: string) => {
  const client = new WebhookClient({ url });
  return client;
};

export const sendWebhookMessage = async (
  webhook: WebhookClient,
  data: string,
) => {
  await webhook.send({
    content: data,
  });
};
