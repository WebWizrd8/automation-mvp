import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger.spec.json";
const endpointsFiles = ["../index.ts"];

const swaggerOptions = {
  info: {
    title: "Express + TypeScript API",
    version: "1.0.0",
    description: "Documentation for Express + TypeScript Server",
  },
  host: "localhost:8080",
  tags: [],
  schemes: ["http", "https"],
  definitions: {
    Condition: {
      operator: "eq",
      value: '"UP"',
      field: '$."direction"',
    },
    Destination: {
      destinationType: "telegram",
      destinationConfig:
        '{"template":"ETH Price:","telegramChatId":"6200972469","telegramUserId":"LakshyaSky"}',
    },
    Action: {
      userId: "test_user",
      name: "test_action",
      chainId: 2,
      conditions: ["Condition"],
      destinations: ["Destination"],
    },
    EventFetchRequest: {
      eventFetchRequestId: 1,
      functionName: "SPOT_PRICE_MATCH {% now 'unix', '' %}",
      functionArgs: null,
      addedBy: "test_user",
      actions: ["Action"],
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions);
