const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
});

redisClient.on("connect", () => {
  console.log("Connected To Redis");
});

redisClient.connect(); //Connect Here

redisClient.on("error", (err) => {
  console.log("Redis Connection Error");
});

module.exports = redisClient;
