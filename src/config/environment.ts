import "dotenv/config";

const ENV = process.env;

const env = {
  NODE_ENV: ENV["NODE_ENV"] ? ENV["NODE_ENV"] : "development",
  HOST: ENV["HOST"] ? ENV["HOST"] : "localhost",
  PORT: ENV["PORT"] ? ENV["PORT"] : "3000",
};

export default env;
