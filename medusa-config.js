 
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
const ADMIN_CORS =process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";
const BACKEND_URL = process.env.BACKEND_URL || "localhost:9000"
const ADMIN_URL = process.env.ADMIN_URL || "localhost:7000"
const STORE_URL = process.env.STORE_URL || "localhost:8000"
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const GoogleClientId = process.env.GOOGLE_CLIENT_ID || "60792650364-b6lsqabkk0okdhm2kg9jhopgicigjq96.apps.googleusercontent.com"
const GoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "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"

const sendGridParameters = {
  api_key: process.env?.SENDGRID_API_KEY,
  from: process.env?.SENDGRID_FROM,
  gift_card_created_template: "Thank you for your test gift card",
  order_placed_template: process.env.SENDGRID_GUID_ORDER_PLACED ||"d-f7332e6651f14eb4ad26b069e8e1d6c9",
  order_cancelled_template: "This is a test order cancelled card",
  order_shipped_template: "This is a test order shipped card",
  order_completed_template: "This is a test order completed card",
  user_password_reset_template: "This is a test user password reset card",
  customer_password_reset_template:
      "This is a test customer password reset card"
  /* localization: {
"de-DE": { // locale key
gift_card_created_template: [used on gift_card.created],
order_placed_template: [used on order.placed],
order_cancelled_template: [used on order.cancelled],
order_shipped_template: [used on order.shipment_created],
order_completed_template: [used on order.completed],
user_password_reset_template: [used on user.password_reset],
customer_password_reset_template: [used on customer.password_reset],
}*/
};

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
    resolve: "medusa-plugin-auth",
    /** @type {import('medusa-plugin-auth').AuthOptions} */
    options: [
      {
        type: "google",
        // strict: "all", // or "none" or "store" or "admin"
        strict: "none",
        identifier: "google",
        clientID: GoogleClientId,
        clientSecret: GoogleClientSecret,
        admin: {
          callbackUrl: `${BACKEND_URL}/admin/auth/google/cb`,
          failureRedirect: `${ADMIN_URL}/login`,
          // The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
          // This query param will have the priority over this configuration
          successRedirect: `${ADMIN_URL}/`
          // authPath: '/admin/auth/google',
          // authCallbackPath: '/admin/auth/google/cb',
          // expiresIn: 24 * 60 * 60 * 1000,
          // verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
          //    // implement your custom verify callback here if you need it
          // },
        },
        store: {
          callbackUrl: `${BACKEND_URL}/store/auth/google/cb`,
          failureRedirect: `${STORE_URL}/login`,
          // The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
          // This query param will have the priority over this configuration
          successRedirect: `${STORE_URL}/`
          // authPath: '/store/auth/google',
          // authCallbackPath: '/store/auth/google/cb',
          // expiresIn: 24 * 60 * 60 * 1000,
          // verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
          //    // implement your custom verify callback here if you need it
          // },
        }
      }
    ]
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
  {
    resolve: `@rsc-labs/medusa-store-analytics`,
    options: {
      enableUI: true
    }
  },

  {
    resolve: "medusa-plugin-sendgrid",
    options: sendGridParameters
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

