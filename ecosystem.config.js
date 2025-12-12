module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "./services/auth-service/dist/main.js", // Points to the BUILD file
      "cmd": "./services/auth-service",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
        JWT_SECRET: "mySuperSecretKey",
      JWT_REFRESH_EXPIRES_IN: "7d",
      JWT_EXPIRES_IN: "7d",
      MONGODB_URI: "mongodb + srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/auth-service",
      BASE_URL: "140.245.12.83",
      },
    },
    // 3. Order Service - Port 3003
    {
      name: "order-service",
      script: "./services/order-service/dist/main.js",
      env: {
        PORT: 3003,
          NODE_ENV: "production",
          MONGODB_URI: "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/order-service",
          JWT_SECRET: "mySuperSecretKey",
      },
    },
    // 4. Menu Service - Port 3004
    {
      name: "menu-service",
      script: "./services/menu-service/dist/main.js",
      env: {
        PORT: 3004,
          NODE_ENV: "production",
          MONGODB_URI: "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/menu-service",
          JWT_SECRET: "mySuperSecretKey",
      },
    },
    // 5. Restaurant Service - Port 3005
    {
      name: "restaurant-service",
      script: "./services/restaurant-service/dist/main.js",
      env: {
        PORT: 3005,
          NODE_ENV: "production",
          MONGODB_URI: "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/restaurant-service",
          JWT_SECRET: "mySuperSecretKey",
          OWNER_ROLE_ID : "693ab3b0119b4483345478b6",
            AUTH_SERVICE_URL : "http://140.245.12.83:3001",
            MENU_SERVICE_URL : "http://140.245.12.83:3004"
      },
    },
  ],
};
