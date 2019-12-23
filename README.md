# bot-food

Bot Food. A bot that helps you count people to organize lunch at work. **Add @bot-food to your Skype groups** and give it a try.

The bot understand the following commands:
- **@bot-food +1** means that you'll have lunch today.
- **@bot-food -1** means that you changed your mind.
- **@bot-food list** to get the list of people who are ready to have lunch today.

This bot is a quick & dirty tool. Don't expect to see beautiful code here.

## Development

### configure the bot

The bot uses [Microsoft Bot Framework](https://dev.botframework.com/). You need to export the following environment variables:

```sh
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=
BOT_DEFAULT_LOCALE=en
```

### run the bot

Prerequisites: node 6+

```sh
git clone git@github.com:palmerabollo/bot-food.git && cd bot-food
npm install
npm run watch-console # run in console mode
```

You can also run the bot as a HTTP server running as a serverless AWS Lambda function.
