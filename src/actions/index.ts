import { handleActions } from "../action/action_handler";
import { find_matching_actions } from "../db/functions";
import { getLogger } from "../utils/logger";

const logger = getLogger("actions/index");

export async function findAndHandleActions(
  filters: Record<string, unknown>[],
  message: Record<string, unknown>,
) {
  //For each filter, find matching alerts
  for (const filter of filters) {
    try {
      const actions = await find_matching_actions(filter);
      logger.info("Alerts found", actions);
      if (actions) await handleActions(actions, message, filter);
    } catch (error) {
      logger.error("failed to handle message", error);
    }
  }
}
