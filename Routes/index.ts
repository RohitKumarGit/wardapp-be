import express from "express";
import {
  FirebaseController,
  Product,
  User,
} from "../backend/controllers/fbController";

import { NFTController } from "../backend/controllers/nftController";
import * as dotenv from "dotenv";
import path from "path";
import { v4 as uuid } from "uuid";
import { convertToPaddedToken, NFTMetaData } from "../utils";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
import multer from "multer";
import axios from "axios";
import { constants } from "../backend/constants";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fbController = new FirebaseController();
const nftController = new NFTController();
let router = express.Router();
export const docParser = function (products: any) {
  const res = [];
  products.forEach((product) => {
    let pr = {};
    Object.keys(product._fieldsProto).forEach((key) => {
      pr[key] = product._fieldsProto[key][product._fieldsProto[key].valueType];
    });
    res.push(pr);
  });
  return res;
};
const createGiftTokenForAUser = async (
  user: User
): Promise<{ hash: string }> => {
  const { hash } = await nftController.createGiftTokenForAUser(
    user.blockChainAddress
  );
  console.log(hash);
  return hash;
};
router.post("/product", upload.single("image"), async (req: any, res) => {
  let product: any = {};
  console.log(req.body);
  const { serial_no, description, name, brand_id } = req.body;
  product.serial_no = serial_no;
  product.description = description;
  product.name = name;
  product.isSold = false;
  product.token_id = null;
  product.brand_id = brand_id;
  if (req.file && req.file.buffer) {
    product.image = uuid() + ".jpeg";
    await fbController.uploadFile(product.image, req.file.buffer);
  }
  await fbController.listProduct(product);
  res.send({ productListed: true });
  console.log("[product listed]");
});
router.get("/products", async (req, res) => {
  try {
    const products = await fbController.getAllProducts();
    res.send(docParser(products.docs));
  } catch (error) {
    console.log(error.message);
    res.send({ error: error.message }).status(400);
  }
});
router.get("/allnfts", async (req, res) => {
  const tokens = docParser(await fbController.getAllTokens());
  res.send(tokens);
});
router.post("/user", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  await fbController.registerUser(user);
  res.send({ created: true });
});
router.post("/nft", async (req, res) => {
  // phone and blockchain address are unique
  console.log("minting....", req.body);
  const metaData = new NFTMetaData(req.body);
  const tokenId = Math.floor(Math.random() * 1000);
  const { hash } = await nftController.mint(
    metaData,
    tokenId,
    nftController.contractWithSigner
  );
  await fbController.mintToken(tokenId, metaData.serial_No);
  const getUser = await fbController.getUser(req.body.blockChainAddress);
  const getProduct = await fbController.getProduct(metaData.serial_No);
  getProduct.isSold = true;
  getUser.products.push(metaData.serial_No);
  getProduct.token_id = tokenId;
  console.log("get User", getUser);
  await fbController.updateUserInfo({
    products: getUser.products,
    blockChainAddress: getUser.blockChainAddress,
  });
  await fbController.updateProduct({
    isSold: getProduct.isSold,
    token_id: getProduct.token_id,
    serial_no: getProduct.serial_no,
  });
  console.log("Minted ", tokenId, "to account address", metaData.sold_to);
  console.log("creating gift token for user", metaData.sold_to);
  const giftHash = await createGiftTokenForAUser(getUser);
  res.send({ productCreated: true, hash, giftHash });
});
const getProduct = async (serial_no) => {
  const product = await fbController.getProduct(serial_no);
  return product;
};
router.get("/user", async (req: any, res) => {
  let user = (await fbController.getUser(req.query.address)) as User;
  console.log(user);
  user.products = await Promise.all(
    user.products.map(async (stringValue) => {
      const product = await getProduct(stringValue);
      const { data } = await axios.get(
        constants.META_DATA_SERVER +
          convertToPaddedToken(product.token_id) +
          ".json"
      );
      return { ...product, metaData: data };
    })
  );

  console.log(user);
  res.send(user);
});
router.get("/product", async (req, res) => {
  console.log(req.query);
  const product = await getProduct(req.query.serial_no);
  res.send(product);
});
router.get("/allusers", async (req, res) => {
  const users = docParser(await fbController.getAllUsers()) as any[];
  console.log(users);
  for (let i = 0; i < users.length; i++) {
    users[i].products = await Promise.all(
      users[i].products.values.map(async ({ stringValue }) => {
        const product = await getProduct(stringValue);
        console.log(product);
        const { data } = await axios.get(
          constants.META_DATA_SERVER +
            convertToPaddedToken(product.token_id) +
            ".json"
        );
        return { ...product, metaData: data };
      })
    );
  }
  res.send(users);
});
export const burnToken = async (tokenId, metaData: NFTMetaData) => {
  console.log(metaData);
  const getProduct = await fbController.getProduct(metaData.serial_No);
  await fbController.updateProduct({
    token_id: null,
    serial_no: getProduct.serial_no,
  });
  await nftController.burn(metaData.sold_to, tokenId);
  console.log("Token with id", tokenId, "Burnt!!");
};

export default router;
