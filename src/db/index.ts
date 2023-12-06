import { getLogger } from "../utils/logger";
import * as alert from "./alert";
import * as provider from "./provider";
import * as endpoint from "./endpoint";

const logger = getLogger("db");

export default {
  ...alert,
  ...provider,
  ...endpoint,
};
