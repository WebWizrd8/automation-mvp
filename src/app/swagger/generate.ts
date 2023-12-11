import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger.spec.json";
const endpointsFiles = ["../index.ts", "../routes/*.route.ts"];

const swaggerOptions = {
  info: {
    title: "Express + TypeScript API",
    version: "1.0.0",
    description: "Documentation for Express + TypeScript Server",
  },
  host: "localhost:8080",
  tags: [],
  schemes: ["http", "https"],
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions);
