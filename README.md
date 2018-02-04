# foodbot

Food Bot. A bot that helps you organize lunch at work.

## configure the bot

Export the following environment variables:

```sh
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=
BOT_DEFAULT_LOCALE=en
```

## run the bot

Prerequisites: node 6+

```sh
git clone git@github.com:palmerabollo/foodbot.git && cd foodbot
npm install
npm run watch-console # run in console mode
```

You can also run the bot as a HTTP server os as a serverless AWS Lambda function.
