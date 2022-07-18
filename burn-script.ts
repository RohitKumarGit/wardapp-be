import { NFTController } from "./backend/controllers/nftController";
import { burnToken } from "./Routes";

const burnTokenId = [112, 4, 150, 2];
const userId = "0xdecDA2E6c6fD9a6C570C2cBf14041Ccd46fFf2c9";
const t = new NFTController();
burnTokenId.forEach(async (tokenId) => {
  try {
    const tx = await t.burn(userId, tokenId);
    console.log(tx);
  } catch (error) {
    console.log(error.message);
  }
});
