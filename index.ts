import express from "express";
import cors from "cors";
import router, { burnToken, docParser } from "./Routes";
import cron from "node-cron";
import {
  FirebaseController,
  Product,
} from "./backend/controllers/fbController";
import moment from "moment";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config();
import { convertToPaddedToken, NFTMetaData } from "./utils";
import axios from "axios";
import { NFTController } from "./backend/controllers/nftController";
const fbController = new FirebaseController();
const nftController = new NFTController();
let app = express();
app.use(express.json());
app.use(cors());
app.use(router);
var job = cron.schedule("0 0 0 * * *", async function () {
  const products = docParser(await fbController.getAllProducts()) as Product[];
  products.forEach(async (product) => {
    let uri = await nftController.getURI();
    uri = uri.replace("{id}", convertToPaddedToken(product.token_id));
    const data = await axios.get(uri);
    const metaData: NFTMetaData = data.data;
    if (moment() > moment(metaData.warranty_valid_uptill)) {
      await burnToken(product.brand_id, metaData);
    }
  });
});
const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("The server is running");
});
