// class - mint()
// brand steps
import { constants } from "../constants";
import { FirebaseController } from "./fbController";
import { BaseContract, ethers } from "ethers";
import abi from "../../abi.json";
import * as dotenv from "dotenv";
import path from "path";
import { NFTMetaData } from "../../utils";
import config, { NETWORK } from "../../config";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });
// on product sale : mint , transfer , inform ,
const firebaseController = new FirebaseController();
export class NFTController {
  address: string;
  contract: any;
  contractWithSigner: any;
  constructor() {
    this.address =
      config.CREDENTIALS[config.CURRENT_NETWORK].NFT_CONTRACT_ADDRESS;
    const provider = this.getProvider(config.CURRENT_NETWORK);
    this.contract = new ethers.Contract(
      this.address,
      abi[constants.COLLECTION_NAME],
      provider
    );
    const privateKey = config.CREDENTIALS[config.CURRENT_NETWORK].PRIVATE_KEY;
    let wallet = new ethers.Wallet(privateKey, provider);
    this.contractWithSigner = this.contract.connect(wallet);
  }
  getProvider(net: NETWORK) {
    if (net === NETWORK.HARDHAT) {
      return new ethers.providers.JsonRpcProvider();
    } else if (net === NETWORK.POLYGON) {
      return new ethers.providers.AlchemyProvider(
        "maticmum",
        process.env.ALCHEMY_API_KEY
      );
    }
  }
  jsonCreator() {}
  async mint(metaData: NFTMetaData) {
    const tokenId = Math.floor(Math.random() * 1000);
    console.log("meta data", metaData);
    await firebaseController.uploadJSON(tokenId, metaData);
    const det = await this.contractWithSigner.mint(
      metaData.sold_to,
      tokenId,
      1
    );
    return { tokenId, hash: det.hash };
  }
  async transfer(userAddr: string, tokenId: number) {
    await this.contractWithSigner.transfer(
      config.CREDENTIALS[config.CURRENT_NETWORK].ACCOUNT_ADDRESS,
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
// 557
// 0000000000000000000000000000000000000000000000000000000022d.json
// hash : 0xfa347a6215313df7aba91d9630a165774536350f30e967bd89b030932415faa8
// second 999
