import * as path from 'path';
import * as logger from 'logops';
import * as builder from 'botbuilder';
import * as restify from 'restify';

const lambda = require('botbuilder-aws-lambda');

import { FoodOrganizer } from './database';

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
    session.sendTyping();

    let command = session.message.text
        .replace('@bot-food', '')
        .replace('bot-food', '')
        .trim();

    if (['+1', 'ok', '👍', 'yes'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .add({
                id: session.message.user.id,
                name: session.message.user.name,
                conversation: session.message.address.conversation.id
            })
            .then(() => organizer.all())
            .then(users => session.endDialog(`Done. Total ${users.length}`))
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else if (['list', 'all', 'total'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .all()
            .then((users => {
                session.send(users.map(user => user.name).join('  \n'));  // XXX skype line break
                session.endDialog(`Total ${users.length}`);
            }))
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else if (['-1', 'yo no', 'no', '👎'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .remove({
                id: session.message.user.id,
                name: session.message.user.name,
                conversation: session.message.address.conversation.id
            })
            .then(() => organizer.all())
            .then(users => session.endDialog(`Done. Total ${users.length}`))
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else {
        session.endDialog('I only understand "+1", "-1" or "list"');
    }
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
