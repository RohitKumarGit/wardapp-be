import express from "express";
import { FirebaseController, User } from "../backend/controllers/fbController";
import { NFTController } from "../backend/controllers/nftController";
import * as dotenv from "dotenv";
import path from "path";
import { NFTMetaData } from "../utils";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const fbController = new FirebaseController();
const nftController = new NFTController(process.env.NFT_CONTRACT_ADDRESS);
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
router.post("/product", async (req, res) => {
  console.log(req.body);
  let product: any = {};
  const { serial_no, description, name, brand_id } = req.body;
  product.serial_no = serial_no;
  product.description = description;
  product.name = name;
  product.isSold = false;
  product.token_id = null;
  product.brand_id = brand_id;
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
router.post("/nft", async (req, res) => {
  console.log("minting....");
  const metaData = new NFTMetaData(req.body);
  const user = new User(req.body);
  const tokenId = await nftController.mint(metaData);
  await fbController.registerUser(user);
  const getUser = await fbController.getUser(user.phone);
  const getProduct = await fbController.getProduct(metaData.serial_No);
  getProduct.isSold = true;
  getUser.products.push(metaData.serial_No);
  getProduct.token_id = tokenId;
  await fbController.updateUserInfo({
    products: getUser.products,
    phone: getUser.phone,
  });
  await fbController.updateProduct({
    isSold: getProduct.isSold,
    token_id: getProduct.token_id,
    serial_no: getProduct.serial_no,
  });
  console.log("Minted ", tokenId, "to", metaData.sold_to);
  res.send({ productCreated: true });
});
// on burning
// find product with serial number and remove token - signifies expiry of token Id - done
// burn token from blockchain

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
