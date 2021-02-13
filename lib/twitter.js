import { twitterAPICall } from './twitter_api';

import { RECENT_TWEETS_FETCH } from 'util/config';

const tweetFields =
  'author_id,context_annotations,conversation_id,created_at,entities,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld';
const userFields =
  'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld';

export async function getTwitterProfile(account) {
  return twitterAPICall({
    endpoint: `users/${account.profile.id}`,
    version: 2,
    parameters: { 'user.fields': userFields },
    account,
  });
}

export async function getTweets(account) {
  return twitterAPICall({
    endpoint: `users/${account.profile.id}/tweets`,
    version: 2,
    parameters: { 'tweet.fields': tweetFields, max_results: RECENT_TWEETS_FETCH },
    account,
  });
}

export async function getOAuthRequestToken(oAuthdata) {
  return twitterAPICall({
    endpoint: 'oauth/request_token',
    method: 'post',
    oAuthHeader: true,
    oAuthdata,
    responseFormat: 'querystring',
    account: { username: 'APP_ACCESS' },
  });
}

export async function getOAuthAccessToken(oAuthdata) {
  return twitterAPICall({
    endpoint: 'oauth/access_token',
    method: 'post',
    oAuthHeader: true,
    oAuthdata,
    parameters: oAuthdata,
    responseFormat: 'querystring',
    account: { username: 'APP_ACCESS' },
  });
}
