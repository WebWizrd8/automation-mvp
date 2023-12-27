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
      chainId: 1,
      conditions: ["Condition"],
      destinations: ["Destination"],
      loopRules: "LoopRules",
    },
    LoopRules: {
      loop: false,
      loopConfig: '{"maxExecutions": 5}',
    },
    EventFetchRequest: {
      eventFetchRequestId: 1,
      functionName: "SPOT_PRICE_MATCH",
      functionArgs: null,
      addedBy: "test_user",
      actions: ["Action"],
    },
    SmartAccount: {
      id: 1,
      userAddress: "0x000",
      accountAddress: "0x000",
      factoryAddress: "0x000",
      chainId: 1,
    },
    RegisterSessionKey: {
      sessionKeyAddress: "0x000",
      smartAccountAddress: "0x000",
      chainId: 1,
      approvedCallTargets: ["0x000"],
      nativeTokenLimit: 0.5,
      startDate: "2021-01-01T00:00:00.000Z",
      expirationDate: "2021-01-01T00:00:00.000Z",
    },
    RegisterUser: {
      userAddress: "0x000",
      address_type: "wallet",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, swaggerOptions);
