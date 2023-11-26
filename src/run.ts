import "dotenv/config";

const run = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
};

run()
  .then(() => {})
  .catch((e) => console.log(e))
  .finally(() => process.exit(0));
