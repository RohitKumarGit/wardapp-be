export class NFTMetaData {
  serial_No: string; // mentioned on product
  sold_to: string; // hex address of buying user
  purchase_date: string; // UNIX format time
  warranty_valid_uptill: string; // UNIX format time
  brand_id: string; // refers to brand
  constructor(data) {
    this.serial_No = data.serial_no;
    this.sold_to = data.blockChainAddress;
    this.purchase_date = data.purchase_date;
    this.warranty_valid_uptill = data.warranty_valid_uptill;
    this.brand_id = data.brand_id;
  }
}
import { v4 as uuidv4 } from "uuid";
export const getID = () => {
  return uuidv4();
};
export const convertToPaddedToken = function (tokenId: number) {
  return (
    "00000000000000000000000000000000000000000000000000000000" +
    tokenId.toString(16)
  ).slice(-64);
};
export class Deewarr {
  mint() {}
  transfer() {}
}
