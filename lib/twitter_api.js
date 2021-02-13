import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';
import queryString from 'query-string';

import logger from 'util/logger';
import { decrypt } from 'util/misc';

// Includes inspiration from https://github.com/HunterLarco/twitter-v2, but I needed
// access to the headers and decided to roll my own Twitter calls

function logRateLimit(headers) {
  if (headers['x-rate-limit-remaining'])
    logger.debug(
      `Rate limit remainng: ${headers['x-rate-limit-remaining'] || 'NA'}/${
        headers['x-rate-limit-limit'] || 'NA'
      }`
    );
}

function buildURL({ method, endpoint, version, parameters }) {
  const baseDir = version ? `${version}/` : '';

  let url = `https://api.twitter.com/${baseDir}${endpoint}`;

  if (parameters && method === 'get') {
    url += `?${queryString.stringify(parameters)}`;
  }

  return url;
}

async function getBearerToken({ consumer_key, consumer_secret }) {
  logger.debug('Twitter API call to oauth2/token (APP_ACCESS)');

  const response = await fetch('https://api.twitter.com/oauth2/token', {
    method: 'post',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: 'grant_type=client_credentials',
  });
  const body = await response.json();
  logRateLimit(response.headers.raw());

  return body.access_token;
}

async function buildCredentials({ username, credentials }) {
  const consumer_key = process.env.TWITTER_API_KEY,
    consumer_secret = process.env.TWITTER_API_SECRET_KEY;
  let response = { consumer_key, consumer_secret };

  if (credentials) {
    logger.debug(`Using account specific Oauth token for ${username}`);

    response.access_token_key = decrypt(credentials.oauth_access_token);
    response.access_token_secret = decrypt(credentials.oauth_access_token_secret);
  } else {
    // TODO: Cache bearer token
    logger.debug(`Using app credentrials (${username})`);

    response.bearer_token = await getBearerToken({ consumer_key, consumer_secret });
  }

  return response;
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

function buildAuthorizationHeader({ url, method, credentials, data, oAuthHeader }) {
  const { access_token_key: key, access_token_secret: secret, bearer_token } = credentials;

  if (!oAuthHeader && bearer_token) return `Bearer ${bearer_token}`;

  const oauth = buildOAuth(credentials);

  return oauth.toHeader(oauth.authorize({ url, method, data }, { key, secret })).Authorization;
}

async function buildRequestData(args) {
  const { account, method = 'get', endpoint, version, oAuthData, parameters, oAuthHeader } = args;

  const credentials = await buildCredentials(account);
  const url = buildURL({ method, endpoint, version, parameters });

  const authHeaderParams = { url, method, credentials, data: oAuthData, oAuthHeader };
  let options = {
    method,
    headers: {
      Authorization: buildAuthorizationHeader(authHeaderParams),
    },
  };

  if (method === 'post' && parameters) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    options.body = queryString.stringify(parameters);
  }

  return { url, options };
}

export async function twitterAPICall(args) {
  const {
    endpoint,
    account: { username },
    responseFormat,
  } = args;

  logger.debug(`Twitter API call ${endpoint} (${username})`);

  const { url, options } = await buildRequestData(args);

  try {
    var response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      `Twitter API error for ${endpoint} (${username}): ${error}`
      // `Twitter API error for ${endpoint} (${username}): ${unescape(JSON.stringify(error))}`
    );
  }

  // TODO: check for an error response from Twitter that didn't trigger an exception
  const results =
    responseFormat === 'querystring'
      ? queryString.parse(await response.text())
      : await response.json();
  const headers = response.headers.raw();

  logRateLimit(headers);

  // return the headers too, since they contain rate limit info
  return { results: results.data || results, headers };
}
