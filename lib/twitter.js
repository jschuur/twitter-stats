import Twitter from 'twitter-v2';

import logger from 'util/logger';
import { decrypt } from 'util/misc';

import { RECENT_TWEETS_FETCH } from 'util/config';

const tweetFields =
  'author_id,context_annotations,conversation_id,created_at,entities,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld';
const userFields =
  'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld';

// Authenticate against the Twitter API
async function authTwitter(account) {
  var creds = {
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  };

  // Use per user credentials if available
  if (account?.oauth_access_token && account?.oauth_access_token_secret) {
    logger.debug(`Using account specific Oauth token for ${account.username}`);

    return new Twitter({
      ...creds,
      access_token_key: decrypt(account.oauth_access_token),
      access_token_secret: decrypt(account.oauth_access_token_secret),
    });
  } else {
    logger.debug(`Using bearer token for ${account?.username}`);

    const app = new Twitter(options);

    // TODO: Rewrite for new Twitter library
    try {
      const response = await app.getBearerToken();

      return new Twitter({
        bearer_token: response.access_token,
      });
    } catch (error) {
      throw new Error(unescape(JSON.stringify(error)));
    }
  }
}

async function twitterAPICall({ endpoint, account, parameters, method = 'get'  }) {
  var results;
  const twitter = await authTwitter(account);

  logger.debug(`Twitter API call ${endpoint}${account ? ` as ${account.username}` : ''}`);
  try {
    results = await twitter.get(endpoint, parameters);
  } catch (error) {
    throw new Error(
      `Twitter API error for ${endpoint} (${account.username}): ${unescape(JSON.stringify(error))}`
    );
  }

  // TODO:  for rate limit headers, why does this not work?
  // console.log(JSON.stringify(results._headers, null, 2));

  return results.data;
}

export async function getTwitterProfile(account) {
  // TODO: Conditionally get private fields for oAuth user access (same for getTweets)
  return twitterAPICall({
    endpoint: `users/${account.profile.id}`,
    account,
    parameters: { 'user.fields': userFields},
  });
}

export async function getTweets(account) {
  return twitterAPICall({
    endpoint: `users/${account.profile.id}/tweets`,
    account,
    parameters: { 'tweet.fields': tweetFields , max_results: RECENT_TWEETS_FETCH },
  });
}