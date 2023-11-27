import WebSocketFetcher from "./ws-fetcher";
import WS from "jest-websocket-mock";

describe("HttpFetcher", () => {
  let wsServer: WS;
  let fetcher: WebSocketFetcher<string>;
  const url = "ws://localhost:1234";

  beforeAll(() => {});

  afterAll(() => {
    fetcher.stopFetching();
    WS.clean();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    wsServer = new WS(url);
  });

  afterEach(() => {
    fetcher.stopFetching();
    WS.clean();
  });

  it("should connect", async () => {
    fetcher = new WebSocketFetcher(url, "hello");
    await fetcher.connect();
    expect(fetcher.ws).toBeDefined();
  });

  it("should send string data", async () => {
    fetcher = new WebSocketFetcher(url, "hello");
    await fetcher.startFetching();
    await expect(wsServer).toReceiveMessage("hello");
  });

  it("should send object data", async () => {
    WS.clean();
    wsServer = new WS(url, { jsonProtocol: true });
    const data = { key: "value" };
    fetcher = new WebSocketFetcher(url, JSON.stringify(data));
    await fetcher.startFetching();
    await expect(wsServer).toReceiveMessage(data);
  });

  it("should handle string data", async () => {
    const callback = jest.fn();
    fetcher = new WebSocketFetcher(url, "hello");
    fetcher.onData(callback);
    await fetcher.startFetching();
    wsServer.send("hello");
    expect(callback).toHaveBeenCalledWith("hello");
  });

  it("should handle object data", async () => {
    WS.clean();
    wsServer = new WS(url, { jsonProtocol: true });
    const callback = jest.fn();
    fetcher.onData(callback);
    const data = { key: "value" };
    await fetcher.connect();
    wsServer.send(data);
    expect(callback).toHaveBeenCalledWith(JSON.stringify(data));
  });

  it("should handle fetch error", async () => {
    const error = { code: 0, reason: "Subscribe error", wasClean: false };
    let receivedError;
    fetcher.onError((e) => {
      receivedError = e;
    });
    await fetcher.connect();
    wsServer.error(error);
    expect(receivedError!.type).toEqual("error");
    expect(receivedError!.origin).toEqual("ws://localhost:1234/");
  });

  it("should stop fetching", () => {
    fetcher.stopFetching();
    expect(fetcher.ws).toBeNull();
  });
});
