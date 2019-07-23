"use strict";

/*
 * Rewrites requests -- give back a 404 response if not requesting an actual file from an S3 bucket.
 * Adapted from https://keita.blog/2019/07/05/hosting-a-single-page-application-with-an-api-with-cloudfront-and-s3
 */

const path = require("path");

module.exports.hello = (evt, context, cb) => {
  const { request } = evt.Records[0].cf;

  // /2.1.0/abc.html
  const uriParts = request.uri.split("/");

  if (
    // Root resource with a file extension.
    uriParts.length === 3 &&
    path.extname(uriParts[2]) !== ""
  ) {
    // serve the original request to S3
  } else {
    // change the request to index.html
    const version = uriParts[1];
    request.uri = [uriParts[0], version, `index.${version}.html`].join("/");
  }

  cb(null, request);
};
