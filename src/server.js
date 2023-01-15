import express from "express";
import listEndpoints from "express-list-endpoints";
import netflixRouter from "./api/nextflix/index.js";
import filesRouter from "./api/files/index.js";
import { join } from "path";
import cors from "cors";
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorsHandlers.js";

const server = express();
const urllist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || urllist.indexOf(origin) !== -1) {
      // If current origin is in the urllist you can move on
      corsNext(null, true);
    } else {
      // If it is not --> error
      corsNext(createHttpError(400, `Origin ${origin} is not in the urllist!`));
    }
  },
};

const publicFolderPath = join(process.cwd(), "./public");

const port = process.env.PORT;
server.use(express.json());
server.use("/medias", netflixRouter);
server.use("/medias", filesRouter);
server.use(cors());
server.use(express.static(publicFolderPath));

server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notFoundHandler); // 404
server.use(genericErrorHandler); // 500

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("this server is runing on port:", port);
});
