import * as builder from 'botbuilder';
import * as logger from 'logops';

export default {
    builder: (session: builder.Session, next: Function) => {
        logger.info(session.sessionState, 'Session');
        next();
    },
    receive: (event: builder.IEvent, next: Function) => {
        logger.info(event, 'Message received');
        next();
    },
    send: (event: builder.IEvent, next: Function) => {
        logger.info(event, 'Message sent');
        next();
    }
} as builder.IMiddlewareMap;
