import CryptoJS from 'crypto-js';

export const decrypt = (text) =>
  CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

export const encrypt = (text) => CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();

export const buildAccount = ({ id, oauth_access_token, oauth_access_token_secret }) => ({
  profile: { id },
  credentials: { oauth_access_token, oauth_access_token_secret },
});

// updates an array to track growth since the start of the array for the value
export function transformIntervalStartDelta(array) {
  return array.map((el) => ({ ...el, value: el.value - array[0].value }));
}

// updates an array to track the difference from its preceiding element for the value
export function transformPreviousDelta(array) {
  return array.reduce(
    (acc, el, i) =>
      i > 0 ? [...acc, { ...array[i], value: array[i].value - array[i - 1].value }] : acc,
    [{ ...array[0], value: 0 }]
  );
}