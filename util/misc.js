import CryptoJS from 'crypto-js';

export const decrypt = (text) =>
  CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

export const encrypt = (text) => CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();

export const buildAccount = ({ id, oauth_access_token, oauth_access_token_secret }) => ({
  profile: { id },
  credentials: { oauth_access_token, oauth_access_token_secret },
});