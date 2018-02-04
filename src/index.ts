import * as path from 'path';
import * as logger from 'logops';
import * as builder from 'botbuilder';
import * as restify from 'restify';

const lambda = require('botbuilder-aws-lambda');

import loggerMiddleware from './middlewares/logger';

let connector: builder.ConsoleConnector | builder.ChatConnector;

if (process.env.BOT_CONSOLE) {
    connector = new builder.ConsoleConnector().listen(); // stdin
} else {
    // chat connector enables communication with the MS Bot Framework Service
    connector = new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    });

    exports.handler = lambda(connector);
}

const bot = new builder.UniversalBot(connector, (session) => {
    session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
});

bot.set('localizerSettings', {
    botLocalePath: path.join(__dirname, '..', 'locale'),
    defaultLocale: process.env.BOT_DEFAULT_LOCALE || 'en'
});

bot.on('conversationUpdate', (message) => {
    // https://github.com/Microsoft/BotBuilder-Samples/tree/master/Node/core-GetConversationMembers
    logger.debug(message, 'converstation update');
});

bot.endConversationAction('cancel', 'cancel', {matches: /(^cancel$)|(^never mind$)|(^forget it$)/i});

loadBotMiddlewares(bot);

////////

function loadBotMiddlewares(bot: builder.UniversalBot) {
    bot.use(loggerMiddleware);
    bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));
}
