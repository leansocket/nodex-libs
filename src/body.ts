"use strict";

import cobody from "co-body";
import multer from "multer";
import formidable from 'formidable';
const symbolUnparsed = Symbol.for("unparsedBody");

export default function (opts?: any) {
  opts = opts || {};
  opts.onError = "onError" in opts ? opts.onError : false;
  opts.patchNode = "patchNode" in opts ? opts.patchNode : false;
  opts.patchKoa = "patchKoa" in opts ? opts.patchKoa : true;
  opts.multipart = "multipart" in opts ? opts.multipart : false;
  opts.urlencoded = "urlencoded" in opts ? opts.urlencoded : true;
  opts.json = "json" in opts ? opts.json : true;
  opts.text = "text" in opts ? opts.text : true;
  opts.encoding = "encoding" in opts ? opts.encoding : "utf-8";
  opts.jsonLimit = "jsonLimit" in opts ? opts.jsonLimit : "1mb";
  opts.jsonStrict = "jsonStrict" in opts ? opts.jsonStrict : true;
  opts.formLimit = "formLimit" in opts ? opts.formLimit : "56kb";
  opts.queryString = "queryString" in opts ? opts.queryString : null;
  opts.multer = "multer" in opts ? opts.multer : {};
  opts.formidable = 'formidable' in opts ? opts.formidable : { multiples: true };
  opts.uploadMiddleware = 'uploadMiddleware' in opts ? opts.uploadMiddleware : 'multer';
  opts.includeUnparsed =
    "includeUnparsed" in opts ? opts.includeUnparsed : false;
  opts.textLimit = "textLimit" in opts ? opts.textLimit : "56kb";
  opts.parsedMethods =
    "parsedMethods" in opts ? opts.parsedMethods : ["POST", "PUT", "PATCH"];

  return function (ctx, next) {
    let bodyPromise = getBodyPromise(ctx, opts);

    bodyPromise = bodyPromise || Promise.resolve({});

    return bodyPromise
      .catch(function (err) {
        if (typeof opts.err === "function") {
          opts.onError(err, ctx);
        } else {
          throw err;
        }
        return next();
      })
      .then(function (body) {
        let patch = function (req, body) {
          if (opts.multipart && ctx.is("multipart")) {
            req.body = body.fields;
            req.files = body.files;
          } else if (opts.includeUnparsed) {
            req.body = body.parsed || {};
            if (!ctx.is("text")) {
              req.body[symbolUnparsed] = body.raw;
            }
          } else {
            req.body = body;
          }
        };

        if (opts.patchNode) {
          patch(ctx.req, body);
        }
        if (opts.patchKoa) {
          patch(ctx.request, body);
        }

        return next();
      });
  };
}

const getBodyPromise = function (ctx, opts) {
  if (opts.parsedMethods.indexOf(ctx.method.toUpperCase()) < 0) {
    return null;
  }

  if (opts.json && ctx.is("json")) {
    return cobody.json(ctx, {
      encoding: opts.encoding,
      limit: opts.jsonLimit,
      strict: opts.jsonStrict,
      returnRawBody: opts.includeUnparsed,
    });
  } else if (opts.urlencoded && ctx.is("urlencoded")) {
    return cobody.form(ctx, {
      encoding: opts.encoding,
      limit: opts.formLimit,
      queryString: opts.queryString,
      returnRawBody: opts.includeUnparsed,
    });
  } else if (opts.text && ctx.is("text")) {
    return cobody.text(ctx, {
      encoding: opts.encoding,
      limit: opts.textLimit,
      returnRawBody: opts.includeUnparsed,
    });
  } else if (opts.multipart && ctx.is("multipart")) {
    return createMultipartPromise(ctx, opts);
  } else {
    return cobody.text(ctx, {
      encoding: opts.encoding,
      limit: opts.textLimit,
      returnRawBody: opts.includeUnparsed,
    });
  }
};

const createMultipartPromise = function (ctx, opts) {
  const req = ctx.req;
  const res = ctx.res;
  req.params = ctx.params;

  return new Promise(function (resolve, reject) {
    if (opts.uploadMiddleware === 'multer') {
      const upload = multer({
        limits: opts.multer.limits,
        fileFilter: opts.multer.filter,
        storage: multer.diskStorage({
          destination: opts.multer.destination,
          filename: opts.multer.filename,
        }),
      });
      const middleware = opts.ignoreFiles ? upload.fields() : upload.any();
      middleware(req, res, function (err) {
        if (err) {
          return reject(err);
        }
        return resolve({
          fields: req.body,
          files: req.files,
        });
      });
    }
    if (opts.uploadMiddleware === 'formidable') {
      /**
       * encoding {string} - default 'utf-8';
       * uploadDir {string} - default os.tmpdir();
       * keepExtensions {boolean} - default false;
       * maxFileSize {number} - default 200 * 1024 * 1024 (200mb);
       * maxFields {number} - default 1000;
       * maxFieldsSize {number} - default 20 * 1024 * 1024 (20mb);
       * hash {boolean} - default false;
       * multiples {boolean} - default false;
       */
      const form = formidable(opts.formidable);
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          fields,
          files,
        });
      })
    }
  });
};
