import { FirebaseController } from "./backend/controllers/fbController";

const fbController = new FirebaseController();
async function test() {
  const userObj = {
    products: ["mps"],
    name: "Rajiv",
    phone: "1939010307123",
    blockChainAddress: "TEST",
  };
  await fbController.check("0x4491DE7aEEb874fB25F9011B0F03ab0F7C84D07AE");
}
test();
