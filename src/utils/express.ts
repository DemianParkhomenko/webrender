import express, { RequestHandler } from "express";
import { json } from "body-parser";
import { log as logToConsole, error } from "./log";

export const PORT = process.env.PORT_WEBRENDER || 80;

const app = express();

app.use(json());

app.listen(PORT, () => {
  logToConsole(`API is listening on port ${PORT}.`);
});

export const registerEndpoint = ({
  method,
  path,
  handler,
  log = true,
}: {
  method: "GET" | "POST";
  path: string;
  handler: RequestHandler;
  log?: boolean;
}) => {
  const handle = method === "GET" ? app.get : app.post;

  logToConsole(`Registered ${method} ${path} (log: ${log})`);

  handle.bind(app)(path, async function (...args) {
    const now = Date.now();
    const res = args[1];
    try {
      if (log) {
        logToConsole(`>> ${method} ${path}`);
      }
      await handler(...args);
    } catch (e) {
      error(`|| ${method} ${path} ${e?.stack || e}`);
      res.status(500).send({
        error: `Unable to handle ${path}: ${e?.message || e}`,
      });
    }
    if (!res.headersSent) {
      res.status(204).end();
    }
    if (log) {
      logToConsole(
        `<< ${method} ${path} ${res.statusCode || 500} (${Date.now() - now}ms)`
      );
    }
  });
};
