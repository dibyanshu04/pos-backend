module.exports = {
  apps: [
    /* =========================
       AUTH SERVICE
    ========================== */
    {
      name: "auth-service",
      script: "dist/main.js",
      cwd: "./services/auth-service",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 3001,
        NODE_ENV: "production",

        JWT_SECRET: "mySuperSecretKey",
        JWT_EXPIRES_IN: "7d",
        JWT_REFRESH_EXPIRES_IN: "7d",

        MONGODB_URI:
          "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/auth-service",

        BASE_URL: "https://api.nishchint.in",
      },
    },

    /* =========================
       ORDER SERVICE
    ========================== */
    {
      name: "order-service",
      script: "dist/main.js",
      cwd: "./services/order-service",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 3003,
        NODE_ENV: "production",

        JWT_SECRET: "mySuperSecretKey",
        MONGODB_URI:
          "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/order-service",
      },
    },

    /* =========================
       MENU SERVICE
    ========================== */
    {
      name: "menu-service",
      script: "dist/main.js",
      cwd: "./services/menu-service",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 3004,
        NODE_ENV: "production",

        JWT_SECRET: "mySuperSecretKey",
        MONGODB_URI:
          "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/menu-service",
      },
    },

    /* =========================
       RESTAURANT SERVICE
    ========================== */
    {
      name: "restaurant-service",
      script: "dist/main.js",
      cwd: "./services/restaurant-service",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 3005,
        NODE_ENV: "production",

        JWT_SECRET: "mySuperSecretKey",
        OWNER_ROLE_ID: "693ab3b0119b4483345478b6",

        MONGODB_URI:
          "mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/restaurant-service",

        /* 🔥 INTERNAL SERVICE CALLS */
        AUTH_SERVICE_URL: "http://localhost:3001",
        MENU_SERVICE_URL: "http://localhost:3004",

        /* 🔥 PUBLIC API */
        PUBLIC_API_URL: "https://api.nishchint.in",
      },
    },
  ],
};
