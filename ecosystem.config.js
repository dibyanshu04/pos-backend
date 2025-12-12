
module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "./services/auth-service/dist/main.js", // Points to the BUILD file
      "cmd": "./services/auth-service",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    },
    // 3. Order Service - Port 3003
    {
      name: "order-service",
      script: "./services/order-service/dist/main.js",
      env: {
        PORT: 3003,
        NODE_ENV: "production",
      },
    },
    // 4. Menu Service - Port 3004
    {
      name: "menu-service",
      script: "./services/menu-service/dist/main.js",
      env: {
        PORT: 3004,
        NODE_ENV: "production",
      },
    },
    // 5. Restaurant Service - Port 3005
    {
      name: "restaurant-service",
      script: "./services/restaurant-service/dist/main.js",
      env: {
        PORT: 3005,
        NODE_ENV: "production",
      },
    },
  ],
};
