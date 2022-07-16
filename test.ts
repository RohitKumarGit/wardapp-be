import { FirebaseController } from "./backend/controllers/fbController";

const fbController = new FirebaseController();
async function test() {
  const userObj = {
    products: ["mps"],
    name: "Rajiv",
    phone: "1939010307123",
    blockChainAddress: "TEST",
  };
  await fbController.registerUser(userObj);
}
test();
