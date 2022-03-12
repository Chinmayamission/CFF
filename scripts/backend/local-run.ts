import AWS from "aws-sdk";
import { sheets } from "./sheets";

/*
 * Run backend google sheets sync function locally, used for testing.
 *
 */

AWS.config.update({ region: "us-east-1" });

sheets({}, {});
