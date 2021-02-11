import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';

import logger from 'util/logger';
import { decrypt } from 'util/misc';

import { RECENT_TWEETS_FETCH } from 'util/config';

const tweetFields =
  'author_id,context_annotations,conversation_id,created_at,entities,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld';
const userFields =
  'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld';

// Includes inspiration from https://github.com/HunterLarco/twitter-v2, but I needed
// access to the headers and decided to roll my own Twitter calls

function buildURL({ endpoint, parameters }) {
  let url = `https://api.twitter.com/2/${endpoint}`;

  if (parameters) {
    let queryString = Object.keys(parameters)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(parameters[k]))
      .join('&');
    url += `?${queryString}`;
  }

  return url;
}

function buildCredentials({ username, oauth_access_token, oauth_access_token_secret }) {
  let creds = {
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  };

  if (oauth_access_token && oauth_access_token_secret) {
    logger.debug(`Using account specific Oauth token for ${username}`);

    creds.access_token_key = decrypt(oauth_access_token);
    creds.access_token_secret = decrypt(oauth_access_token_secret);
  }
  // TODO: Use bearer token if no user credentials

  return creds;
}

function buildOAuth({ consumer_key: key, consumer_secret: secret }) {
  return OAuth({
    consumer: { key, secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });
}

function buildAuthorizationHeader({
  oauth,
  url,
  access_token_key: key,
  access_token_secret: secret,
}) {
  return oauth.toHeader(oauth.authorize({ url, method: 'get' }, { key, secret })).Authorization;
}

async function twitterAPICall({ endpoint, parameters, account }) {
  logger.debug(`Twitter API call ${endpoint}${account ? ` as ${account.username}` : ''}`);

  const credentials = buildCredentials(account);
  const url = buildURL({ endpoint, parameters });

  // TODO: handle bearer token based auth
  const oauth = buildOAuth(credentials);
  const authHeader = buildAuthorizationHeader({ oauth, url, ...credentials });

  try {
    var response = await fetch(url, { headers: { Authorization: authHeader } });
  } catch (error) {
    throw new Error(
      `Twitter API error for ${endpoint} (${account.username}): ${unescape(JSON.stringify(error))}`
    );
  }

  // TODO: check for an error response from Twitter that didn't trigger an exception
  const results = await response.json();
  const headers = response.headers.raw();

  logger.debug(
    `Rate limit remainng: ${headers['x-rate-limit-remaining']}/${headers['x-rate-limit-limit']}`
  );

  // return the headers too, since they contain rate limit info
  return { results: results.data, headers: response.headers };
}

export async function getTwitterProfile(account) {
  return twitterAPICall({
    endpoint: `users/${account.profile.id}`,
    account,
    parameters: { 'user.fields': userFields },
  });
}

export async function getTweets(account) {
  return twitterAPICall({
    endpoint: `users/${account.profile.id}/tweets`,
    account,
    parameters: { 'tweet.fields': tweetFields , max_results: RECENT_TWEETS_FETCH },
  });
}