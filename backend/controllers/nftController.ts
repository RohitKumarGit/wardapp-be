// class - mint()
// brand steps
import { constants } from "../constants";
import { FirebaseController } from "./fbController";
import { ethers } from "ethers";
import abi from "../../abi.json";
import * as dotenv from "dotenv";
import path from "path";
import { NFTMetaData } from "../../utils";
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// on product sale : mint , transfer , inform ,
const firebaseController = new FirebaseController();

export class NFTController {
  address: string;
  contract: any;
  contractWithSigner: any;
  constructor(_address: string) {
    this.address = _address;
    const provider = this.getProvider(constants.NETWORK);
    this.contract = new ethers.Contract(
      this.address,
      abi[constants.COLLECTION_NAME],
      provider
    );
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    this.contractWithSigner = this.contract.connect(wallet);
  }
  getProvider(net: string) {
    if (net == "localhost") {
      return new ethers.providers.JsonRpcProvider();
    }
  }
  jsonCreator() {}
  async mint(metaData: NFTMetaData) {
    const tokenId = Math.floor(Math.random() * 1000);

    await firebaseController.uploadJSON(tokenId, metaData);
    await this.contractWithSigner.mint(metaData.sold_to, tokenId, 1);
    return tokenId;
  }
  async transfer(userAddr: string, tokenId: number) {
    await this.contractWithSigner.transfer(
      process.env.DEEWARR_ACCOUNT,
      userAddr,
      tokenId,
      1
    );
  }
  async updateMetaData(tokenId: number, metaData: NFTMetaData) {
    // this updates the json file
    await firebaseController.updateJSON(tokenId, metaData);
  }
  async getURI(): Promise<string> {
    return await this.contract.uri(1);
  }
  async burn(from: string, tokenId: number, amount = 1) {
    await this.contractWithSigner.burn(from, tokenId, amount);
  }
}
