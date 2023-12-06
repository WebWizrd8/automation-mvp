import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Express + TypeScript API",
      version: "1.0.0",
      description: "Documentation for Express + TypeScript Server",
    },
  },
  apis: ["./index.ts"],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
