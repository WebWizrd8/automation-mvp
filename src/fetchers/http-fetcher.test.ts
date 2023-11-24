// import HttpFetcher from "./http-fetcher";
// import mockAxios from "jest-mock-axios";
//
// describe("HttpFetcher", () => {
//   let fetcher: HttpFetcher<object>;
//   const url = "http://test.com";
//   const cronPattern = "* * * * * *";
//
//   beforeEach(() => {
//     const axoisConfig = { url, method: "GET" };
//     fetcher = new HttpFetcher(axoisConfig, cronPattern);
//   });
//
//   afterEach(() => {
//     fetcher.stopFetching();
//     mockAxios.reset();
//   });
//
//   it("should construct properly", () => {
//     expect(fetcher.axoisConfig.url).toBe(url);
//     expect(fetcher.cronPattern).toBe(cronPattern);
//     expect(fetcher.eventEmitter).toBeDefined();
//     expect(fetcher.task).toBeNull();
//   });
//
//   it("should start fetching", () => {
//     fetcher.startFetching();
//     expect(fetcher.task).toBeDefined();
//   });
//
//   it("should fetch data", async () => {
//     const data = { key: "value" };
//     mockAxios.mockResolvedValue({ data });
//     const callback = jest.fn();
//     fetcher.onData(callback);
//     await fetcher.startFetching();
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     expect(callback).toHaveBeenCalledWith(data);
//   });
//
//   it("should fetch data immidiately if no cron pattern is provided", async () => {
//     fetcher = new HttpFetcher({ url, method: "GET" });
//     const data = { key: "value" };
//     mockAxios.mockResolvedValue({ data });
//     const callback = jest.fn();
//     fetcher.onData(callback);
//     await fetcher.startFetching();
//     expect(callback).toHaveBeenCalledWith(data);
//   });
//
//   it("should handle fetch error", async () => {
//     const error = new Error("Fetch error");
//     mockAxios.mockRejectedValue(error);
//     const callback = jest.fn();
//     fetcher.onError(callback);
//     await fetcher.startFetching();
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     expect(callback).toHaveBeenCalledWith(error);
//   });
//
//   it("should stop fetching", async () => {
//     await fetcher.startFetching();
//     fetcher.stopFetching();
//     expect(fetcher.task).toBeNull();
//   });
// });
