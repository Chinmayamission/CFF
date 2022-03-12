import React from "react";
import * as DOMPurify from "dompurify";
import juice from "juice";
import nunjucks from "nunjucks";
import moment from "moment";
import { formatPayment } from "./admin/util/formatPayment";

nunjucks.installJinjaCompat();

const env = new nunjucks.Environment();

env.addFilter("format_payment", formatPayment);
env.addFilter("format_date", datestr => {
  // Formats datestring of form YYYY-MM-DD to a locale-friendly datestring.
  return moment(datestr, "YYYY-MM-DD")
    .toDate()
    .toLocaleDateString();
});

const opts = {
  ADD_TAGS: ["iframe"] // Allow iframes to pass sanitization
};
const juiceOpts = {
  removeStyleTags: false
};
const sanitize = (e: any) =>
  DOMPurify.sanitize(juice(e || "", juiceOpts), opts);

export const renderTemplate = (template, context) => {
  return sanitize(env.renderString(template, context));
};

// Renders a HTML template from a given context.
export const Template = ({ template, context }) => {
  const renderedTemplate = renderTemplate(template, context);
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitize(renderedTemplate) }}></div>
  );
};

export default sanitize;
