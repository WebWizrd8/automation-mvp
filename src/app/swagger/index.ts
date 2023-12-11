import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.spec.json";

export default function route(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
