import Twitter from 'twitter-lite';

import logger from 'util/logger';
import { decrypt } from 'util/misc';

// Authenticate against the Twitter API
async function authTwitter(account) {
  // Use per user credentials if available
  if (account.oauth_access_token && account.oauth_access_token_secret) {
    logger.debug(`Using account specific Oauth token for ${account.screen_name}`);

    return new Twitter({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET_KEY,
      access_token_key: decrypt(account.oauth_access_token),
      access_token_secret: decrypt(account.oauth_access_token_secret),
    });
  } else {
    logger.debug(`Using bearer token for ${account.screen_name}`);

    const app = new Twitter({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET_KEY,
    });

    try {
      const response = await app.getBearerToken();

      return new Twitter({
        bearer_token: response.access_token,
      });
    } catch (error) {
      throw new Error(error.errors[0].message);
    }
  }
}

export async function getTwitterProfile(account) {
  const { screen_name } = account;
  const twitter = await authTwitter(account);

  try {
    var profile = twitter.get('users/show', { screen_name });
  } catch (error) {
    throw new Error(`Unable to get profile for Twitter user ${account.screen_name} (${error})`);
  }

  return profile;
}
