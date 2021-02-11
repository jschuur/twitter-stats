# Twitter Stats Collection and Analysis

Self-hosted performance tracking for your Twitter followers and tweets.

Twittercounter went away and I wanted a fun side project for the different [Twitter](https://twitter.com/martiansoil) [accounts](https://twitter.com/lunarsoil) [that](https://twitter.com/LearnChineseCLB) I [run](https://twitter.com/joostschuur).

Stack: Next.js/React and MongoDB, based on the [nextjs-with-mongodb](https://github.com/kukicado/nextjs-with-mongodb) template. Thanks to generous free tiers, you can run all this for free.

## Setup

1. Install Node dependencies: `npm install`.
2. Set up a MongoDB database with collections for `accounts` and `snapshots`. The free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) sandbox works fine for this.
3. [Create a Twitter application](https://developer.twitter.com/en/portal/dashboard) and generate an API key and secret.
4. Create a `.env.local` file based on `.env.local.sample` and configure as needed, including the Twitter and MondoDB credentials.
5. For now, manually add the accounts you want to track into the `accounts` DB collection with a `username` field alone with `oauth_access_token` and `oauth_access_token_secret` for [per account API access](https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens).
6. Run `npm run dev` and visit the local [update API endpoint](http://localhost:3000/api/update) to trigger a manual update.
7. View your account stats on the [home page](http://localhost:3000).

## Deployment

1. Recommended host: [Vercel](https://vercel.com/docs). Run `npm deploy` if you're using them. Set up [environment variables](https://vercel.com/docs/environment-variables) there for the production environment.
2. A GitHub Action in `.github/workflows/update.yml` is set to update Twitter stats and redeploy the site every 6 hours. Set up [secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) in your GitHub repo for the fields in your `.env.local` file (but use your live database credentials) for this to work. Alternatively you could use something like [EasyCron](https://easycron.com/) to hit the `/api/update/` endpoint, but this could eventually become problematic if you are on the free Vercel tier which has a 10 second [time limit](https://vercel.com/docs/platform/limits) for API calls.

## More Info
* [Todo list](https://github.com/jschuur/twittter-stats/projects/1)
* [Twitter API](https://developer.twitter.com/en/docs/twitter-api)
* [How to Integrate MongoDB Into Your Next.js App](https://developer.mongodb.com/how-to/nextjs-with-mongodb/)

\- [Joost Schuur](https://twitter.com/joostschuur/)