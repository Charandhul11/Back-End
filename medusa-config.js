const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: `medusa-payment-razorpay-poorvika`,
    options: {
      key_id: process.env.RAZORPAY_ID || "rzp_test_JKR9HgQjIJTBTo",
      key_secret: process.env.RAZORPAY_SECRET || "gbn6kNfOvxg6zXjjdOovXdOC",
      razorpay_account: process.env.RAZORPAY_ACCOUNT || "OGXPEx1npg8vLS",
      automatic_expiry_period: 30 /*any value between 12 minutes and 30 days expressed in minutes*/,
      manual_expiry_period: 20,
      refund_speed: "normal",
      webhook_secret: process.env.RAZORPAY_SECRET || "gbn6kNfOvxg6zXjjdOovXdOC",
    },
  },
  {
    resolve: `medusa-file-cloudinary`,
    options: {
      cloud_name: process.env.YOUR_CLOUD_NAME,
      api_key: process.env.YOUR_API_KEY,
      api_secret: process.env.YOUR_API_SECRET,
      secure: true,
    },
  },
  {
    resolve: `medusa-plugin-algolia`,
    options: {
      applicationId: process.env.ALGOLIA_APP_ID,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description"],
            attributesToRetrieve: [
              "id",
              "title",
              "description",
              "handle",
              "thumbnail",
              "variants",
              "variant_sku",
              "options",
              "collection_title",
              "collection_handle",
              "images",
            ],
          },
          transformer: (product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            handle: product.handle,
            thumbnail: product.thumbnail,
            variants: product.variants,
            variant_sku: product.variant_sku,
            options: product.options,
            collection_title: product.collection_title,
            collection_handle: product.collection_handle,
            images: product.images,
          }),
        },
      },
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      serve: process.env.NODE_ENV === "development",
      serve: true,
      autoRebuild: true,
      path: "/app",
      outDir: "build",
      develop: {
        // open: process.env.OPEN_BROWSER !== "false",
        open: true,
        port: 7001,
        logLevel: "error",
        stats: "normal",
        allowedHosts: "auto",
        webSocketURL: undefined,
        // other options...
      },
    },
  },
];

const modules = {
  // eventBus: {
  //   resolve: "@medusajs/event-bus-redis",
  //   options: {
  //     redisUrl: REDIS_URL
  //   }
  // },
  // cacheService: {
  //   resolve: "@medusajs/cache-redis",
  //   options: {
  //     redisUrl: REDIS_URL
  //   }
  // },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  worker_mode: process.env.MEDUSA_WORKER_MODE,
  // Uncomment the following lines to enable REDIS
  redis_url: REDIS_URL,
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
  modules: {
    // ...
    cacheService: {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: REDIS_URL,
        ttl: 30,
      },
    },

    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: REDIS_URL,
      },
    },
  },
};
