import * as path from 'path';
import * as logger from 'logops';
import * as builder from 'botbuilder';

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

    let command = cleanInput(session.message.text);
    let conversation = session.message.address.conversation.id;

    const confirmations = [
        'Okie dokie',
        'Yes, sir',
        'Yes, ma\'am',
        'Done',
        'Ok',
        'Okey',
        'Understood',
        'Sure',
        'Your wish is my command'
    ];

    if (['+1', '+2', '+3', '+4', 'ok', '👍', 'yes', 'add', 'in', 'i\'m in'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .add({
                id: session.message.user.id,
                name: session.message.user.name,
                conversation: conversation,
                guests: guests(command)
            })
            .then(() => organizer.all(conversation))
            .then(users => {
                let count = users.reduce((sum, current) => sum + current.guests + 1, 0);
                let confirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
                session.endDialog(`${confirmation}. Total ${count}`);
            })
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else if (['list', 'all', 'total', 'who'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .all(conversation)
            .then((users => {
                let count = users.reduce((sum, current) => sum + current.guests + 1, 0);
                let list = users.map(user => {
                    return user.guests > 1 ? `${user.name} (+${user.guests})` : user.name;
                }).join('\n');
                session.endDialog(list + `\nTotal ${count}`);
            }))
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else if (['-1', 'no', '🐔', '👎', 'remove', 'delete'].indexOf(command) >= 0) {
        let organizer = new FoodOrganizer();
        organizer
            .remove({
                id: session.message.user.id,
                conversation: conversation
            })
            .then(() => organizer.all(conversation))
            .then(users => {
                let confirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
                session.endDialog(`${confirmation}. Total ${users.length}`);
            })
            .catch(() => {
                session.endDialog(`Sorry ${session.message.user.name}, I am still learning`);
            });
    } else if (['call', 'reserve', 'book', 'phone'].indexOf(command) >= 0) {
        session.endDialog('This feature will be ready soon.\nGasolinera 983 48 86 98.\nComo en Casa 983 54 83 91');
    } else if (['help', 'about', 'bug'].indexOf(command) >= 0) {
        session.endDialog('More info about me at https://github.com/palmerabollo/bot-food');
    } else {
        session.endDialog('I only understand "+1" (up to +4), "-1", "list" and "reserve"');
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

function cleanInput(input: string) {
    return input
        .replace('@bot-food', '')
        .replace('bot-food', '')
        .trim();
}

function guests(input: string) {
    switch (input) {
        case '+1': return 0;
        case '+2': return 1;
        case '+3': return 2;
        case '+4': return 3;
        default: return 0;
    }
}
