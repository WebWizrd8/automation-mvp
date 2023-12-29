import { findAndHandleActions } from "../../../actions";
import {
  EventFetchRequestRecord,
  EventFetchRequestTriggerFunctionName,
  EventFetchRequestTriggerFunctionRecord,
} from "../../../db/event";
import { getLogger } from "../../../utils/logger";

const logger = getLogger("spot_price/price_match");

export async function handleSpotPriceMatchEvents(
  eventFetchRequestFunctionRecords: EventFetchRequestTriggerFunctionRecord[],
  _eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    for (const eventFetchRequestFunctionRecord of eventFetchRequestFunctionRecords) {
      logger.info(
        "eventFetchRequestFunctionRecord",
        eventFetchRequestFunctionRecord,
      );
      if (
        eventFetchRequestFunctionRecord.function_name ===
        EventFetchRequestTriggerFunctionName.SPOT_PRICE_MATCH
      ) {
        const filter = message;
        await findAndHandleActions([filter], message);
      }
    }
  } catch (error) {
    logger.error("failed to handle message", error);
  }
}
