import CryptoJS from 'crypto-js';

export const decrypt = (text) =>
  CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
