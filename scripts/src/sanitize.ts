import * as DOMPurify from "dompurify";
import juice from "juice";

export default (e: any) => DOMPurify.sanitize(juice(e || ""));
