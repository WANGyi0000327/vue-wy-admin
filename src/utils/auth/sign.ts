import { secretKey } from "@/config/sign";
// import md5 from "js-md5";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

function generateUUID(num = 32) {
  return uuidv4();
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  const uuid = [];
  let i;
  num = num || 32;
  for (i = 0; i < num; i++) uuid[i] = chars[0 | (Math.random() * 62)];
  return uuid.join("");
}
function sortObj(obj: { [s: string]: unknown } | ArrayLike<unknown>) {
  const sortedObj = _.sortBy(Object.entries(obj), ([key]) => key);
  return Object.fromEntries(sortedObj);
}

export const encrypt = (
  data: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
  const ttData = JSON.parse(JSON.stringify(data));
  for (let key in data) {
    if (Array.isArray(data[key])) {
      data[key] = JSON.stringify(data[key]);
    }
  }
  let tempData = {};
  const timestamp = new Date().getTime();
  const uuid = generateUUID(32);

  const baseData = sortObj({
    ...ttData,
    timestamp,
  });
  const signData = sortObj({
    ...data,
    nonce: uuid,
    timestamp,
  });

  let signStr = "";
  for (let key in signData) {
    signStr += `${key}=${signData[key]}&`;
  }
  // 在拼接secretKey
  signStr += `key=${secretKey}`;
  // const sign = signStr;
  // const sign = md5(signStr);
  tempData = {
    ...baseData,
    signStr,
  };
  return {
    nonce: uuid,
    timestamp,
    sign: "",
    tempData,
  };
};
