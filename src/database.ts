import * as logger from 'logops';
import * as AWS from 'aws-sdk';

const doc = new AWS.DynamoDB.DocumentClient();

const TTL_SECONDS = 4 * 60 * 60; // TTL is managed by DynamoDB

export interface User {
    id: string;
    name: string;
    conversation: string;
}

export class FoodOrganizer {
    public add(user: User): Promise<void> {
        let params = {
            TableName: 'botfood',
            Item: {
                id: user.id + '__' + user.conversation,
                name: user.name,
                ttl: Math.round(Date.now() / 1000) + TTL_SECONDS
            }
        };

        return new Promise((resolve, reject) => {
            doc.put(params, (err, data) => {
                if (err) {
                    logger.error(err, 'unable to save user in dynamodb');
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    public all(): Promise<User[]> {
        let params = {
            TableName: 'botfood',
            Limit: 500
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
                        name: element.name
                    } as User;
                });

                return resolve(users);
            });
        });
    }

    public remove(user: User): Promise<void> {
        // TODO
        return Promise.resolve();
    }

    public count(): number {
        // TODO
        return 0;
    }
}
