import AWS from "aws-sdk";
import { hello } from "./handler";

/*
 * Run backend google sheets sync function locally, used for testing.
 *
 */

AWS.config.update({ region: "us-east-1" });

hello({}, {});
