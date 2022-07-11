// brand activities
// list product , property -> sold or not sold , if sold add one token
// issue nft
// view registered users and search , user just has one address , list of products or serial numbers
import { Blob } from "node:buffer";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { convertToPaddedToken, getID, NFTMetaData } from "../../utils";
import axios from "axios";
import { constants } from "../constants";
import * as dotenv from "dotenv";
import path from "path";
import { docParser } from "../../Routes";
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });
initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://dewarr-923ad.firebaseio.com",
});
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://woxpdvfthtmznhwvymeo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveHBkdmZ0aHRtem5od3Z5bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTc1NDYyNjcsImV4cCI6MTk3MzEyMjI2N30.2qk8sP3h0Zz_G0MvBeizGatPUfSSnInCX1PAKoQjC0o"
);
export class Product {
  serial_no?: string; // key
  name: string;
  description: string;
  isSold: boolean;
  token_id: number;
  brand_id: string;
}
export class User {
  products: string[]; // list of serial nos
  name: string;
  phone: string; // key
  blockChainAddress: string;
  constructor(body) {
    this.products = [];
    this.name = body.name;
    this.phone = body.phone;
    this.blockChainAddress = body.blockChainAddress;
  }
}
export class Token {
  token_id: number;
  serial_no: string;
}
export class FirebaseController {
  db: Firestore;
  constructor() {
    this.db = getFirestore();
  }
  async uploadJSON(tokenId: number, file: NFTMetaData) {
    const paddedToken = convertToPaddedToken(tokenId);
    var blob = Buffer.from(JSON.stringify(file), "utf-8");
    let resp = await supabase.storage
      .from("nfts")
      .upload(paddedToken + ".json", blob);
    if (resp.error) {
      // update file
      resp = await supabase.storage
        .from("nfts")
        .update(paddedToken + ".json", blob);
    }
    console.log("saved token with hex id", paddedToken, " normal", tokenId);
  }
  async getTokenIdFromBinId(tokenId: number) {
    return await this.db.collection;
  }
  async updateJSON(tokenId: number, file) {}
  async listProduct(product: Product) {
    await this.db
      .collection(constants.COLLECTIONS.PRODUCTS)
      .doc(product.serial_no)
      .set(product);
  }
  async updateProduct(updatedProduct: any | Product) {
    await this.db
      .collection(constants.COLLECTIONS.PRODUCTS)
      .doc(updatedProduct.serial_no)
      .update(updatedProduct);
  }
  async registerUser(user: User) {
    const userObj = {
      products: user.products,
      name: user.name,
      phone: user.phone,
      blockChainAddress: user.blockChainAddress,
    };
    const resp = this.db
      .collection(`${constants.COLLECTIONS.USERS}`)
      .doc(user.phone);
    if ((await resp.get()).exists) {
    } else {
      const resp = await this.db
        .collection(`${constants.COLLECTIONS.USERS}`)
        .doc(user.phone);
      resp.set(userObj);
    }
  }
  async updateUserInfo(updatedUser: User | any) {
    console.log(updatedUser.phone);
    await this.db
      .collection(constants.COLLECTIONS.USERS)
      .doc(updatedUser.phone)
      .update(updatedUser);
  }
  async getUser(phone) {
    let doc = await this.db
      .collection(constants.COLLECTIONS.USERS)
      .doc(phone)
      .get();
    return doc.data() as User;
  }
  async getProduct(serial_no) {
    let doc = await this.db
      .collection(constants.COLLECTIONS.PRODUCTS)
      .doc(serial_no)
      .get();
    return doc.data() as Product;
  }
  async getAllProducts() {
    return await this.db.collection(constants.COLLECTIONS.PRODUCTS).get();
  }
}
