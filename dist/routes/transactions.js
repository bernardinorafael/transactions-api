"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  transactionsRoutes: () => transactionsRoutes
});
module.exports = __toCommonJS(transactions_exports);
var import_node_crypto = __toESM(require("crypto"));
var import_zod2 = require("zod");

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["production", "development", "test"]).default("production"),
  DATABASE_URL: import_zod.z.string({ required_error: "DATABASE_URL not provided." }),
  PORT: import_zod.z.number({ required_error: "Server PORT not provided." }).default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid enviroment variables.", _env.error.format());
  throw new Error("Invalid enviroment variables.");
}
var env = _env.data;

// src/database.ts
var knexConfig = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  },
  useNullAsDefault: true
};
var knex = (0, import_knex.knex)(knexConfig);

// src/middlewares/check-id-on-cookies.ts
async function checkIdOnCookies(req, reply) {
  const cookie = req.cookies;
  if (!cookie.sessionId) {
    return reply.status(401).send({
      error: "Unauthorized"
    });
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app) {
  app.get("/", { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const cookie = req.cookies;
    const transactions = await knex("transactions").select("*").where({ session_id: cookie.sessionId });
    return reply.status(200).send({ transactions });
  });
  app.get(
    "/summary",
    { preHandler: [checkIdOnCookies] },
    async (req, reply) => {
      const cookie = req.cookies;
      const summary = await knex("transactions").where({
        type: "credit",
        session_id: cookie.sessionId
      }).sum({ amount_credit: "amount" }).first();
      return reply.status(200).send(summary);
    }
  );
  app.get("/:id", { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const paramsSchema = import_zod2.z.object({ id: import_zod2.z.string().uuid() });
    const params = paramsSchema.parse(req.params);
    const cookie = req.cookies;
    const transaction = await knex("transactions").where({
      id: params.id,
      session_id: cookie.sessionId
    }).first();
    return reply.status(200).send(transaction);
  });
  app.post("/", { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const transactionBody = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const body = transactionBody.parse(req.body);
    const cookie = req.cookies;
    if (!cookie.sessionId) {
      const sessionId = import_node_crypto.default.randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // 7 days
      });
    }
    await knex("transactions").insert({
      id: import_node_crypto.default.randomUUID(),
      title: body.title,
      amount: body.amount,
      type: body.type,
      session_id: cookie.sessionId
    });
    return reply.status(201).send();
  });
  app.delete("/:id", { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const paramsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const cookie = req.cookies;
    const params = paramsSchema.parse(req.params);
    await knex("transactions").where({
      id: params.id,
      session_id: cookie.sessionId
    }).del();
    return reply.status(200).send();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transactionsRoutes
});
