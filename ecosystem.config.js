module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "./services/auth-service/dist/main.js", // Points to the BUILD file
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    },
    // You can simply copy-paste the block above for your other services:
    {
      name: "order-service",
      script: "./services/order-service/dist/main.js",
      env: {
        PORT: 3002,
      },
    },
   /
  ],
};
