import * as logger from 'logops';
import * as AWS from 'aws-sdk';

const doc = new AWS.DynamoDB.DocumentClient();

const TTL_SECONDS = 5 * 60 * 60; // TTL is managed by DynamoDB

export interface User {
    id: string;
    conversation: string;
    name?: string;
    guests?: number;
}

export class FoodOrganizer {
    public add(user: User): Promise<void> {
        let params = {
            TableName: 'botfood',
            Item: {
                id: user.id + '__' + user.conversation,
                conversation: user.conversation,
                name: user.name,
                ttl: Math.round(Date.now() / 1000) + TTL_SECONDS,
                guests: user.guests
            }
        };

        return new Promise((resolve, reject) => {
            doc.put(params, (err) => {
                if (err) {
                    logger.error(err, 'unable to save user in dynamodb');
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    public all(conversation: string): Promise<User[]> {
        let params = {
            TableName: 'botfood',
            Limit: 500,
            FilterExpression: 'conversation = :conversation',
            ExpressionAttributeValues: {
                ':conversation': conversation
            }
        };

        return new Promise((resolve, reject) => {
            doc.scan(params, (err, data) => {
                if (err) {
                    logger.error(err, 'unable to get users from dynamodb');
                    return reject(err);
                }

                let users = data.Items.map(element => {
                    logger.debug(element, 'element from database scan');
                    return {
                        id: element.id.split(':')[0],
                        conversation: element.id.split(':')[1],
                        name: element.name,
                        guests: element.guests
                    } as User;
                });

                return resolve(users);
            });
        });
    }

    public remove(user: User): Promise<void> {
        let params = {
            TableName: 'botfood',
            Key: {
                id: user.id + '__' + user.conversation
            }
        };

        return new Promise((resolve, reject) => {
            // XXX get is here for debugging purposes, it is not needed
            doc.get(params, (err, data) => {
                if (err) {
                    logger.error('item not found', err);
                } else {
                    logger.debug('item found', data);
                }

                doc.delete(params, (err) => {
                    if (err) {
                        logger.error(err, 'unable to remove user in dynamodb');
                        return reject(err);
                    }
                    return resolve();
                });
            });
        });
    }
}
