import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    console.log(process.argv);
    const whitelist = [process.env.FRONTEND_URL];

    if (process.argv[2] === "--api") {
      whitelist.push(undefined);
    }

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error"));
    }
  },
};
