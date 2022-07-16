import * as dotenv from "dotenv";
dotenv.config();
export enum NETWORK {
  POLYGON,
  HARDHAT,
}
const config = {
  CREDENTIALS: {
    [NETWORK.HARDHAT]: {
      PRIVATE_KEY: process.env.PRIVATE_KEY_DEV,
      ACCOUNT_ADDRESS: process.env.DEEWARR_ACCOUNT_DEV,
      NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS_DEV,
    },
    [NETWORK.POLYGON]: {
      PRIVATE_KEY: process.env.PRIVATE_KEY,
      ACCOUNT_ADDRESS: process.env.DEEWARR_ACCOUNT,
      NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS,
    },
  },
  CURRENT_NETWORK: NETWORK.POLYGON,
};
export default config;
