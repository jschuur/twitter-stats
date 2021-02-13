import express from 'express';
import open from 'open';

import { getOAuthRequestToken, getOAuthAccessToken } from 'lib/twitter';
import { addAccount } from 'lib/db';
import { encrypt } from 'util/misc';

import { CLI_EXPRESS_PORT } from 'util/config';

var oauth_token, oauth_token_secret;

async function authRoute(req, res) {
  const { oauth_verifier } = req.query;

  // Step 3: Get the actual access token
  const { results } = await getOAuthAccessToken({
    oauth_token,
    oauth_token_secret,
    oauth_verifier,
  });

  // Add this account to the database
  await addAccount({
    id: results.user_id,
    oauth_access_token: encrypt(results.oauth_token),
    oauth_access_token_secret: encrypt(results.oauth_token_secret),
  });

  res.send('You can close this window now');

  // TODO: Verify not already added
  console.log('Account added');

  process.exit(0);
}

export default async function addTwitterAccount() {
  const app = express();

  app.get('/auth/twitter', authRoute);
  app.listen(CLI_EXPRESS_PORT);

  // 3-lagged OAuth flow:
  // https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens

  // Step 1: Get a OAuth 1 request token
  const { results: oAuthRequest } = await getOAuthRequestToken({
    oauth_callback: `http://localhost:${CLI_EXPRESS_PORT}/auth/twitter`,
  });

  // Remember these for when we get an access token in Step 3
  oauth_token_secret = oAuthRequest.oauth_token_secret;
  oauth_token = oAuthRequest.oauth_token;

  // Step 2: User authorises access via the Twitter web site
  const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oAuthRequest.oauth_token}`;
  console.log(
    `To add a new Twitter account, authorise it in the page that just opened, or use this link:\n${authUrl}`
  );

  await open(authUrl);
}
