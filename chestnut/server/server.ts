import * as express from 'express';
import * as bodyParser from 'body-parser';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { initGraphQLSchema } from './app/schema';
const WS_GQL_PATH = '/subscriptions';
import * as mongoose from 'mongoose';
import * as bluePromise from 'bluebird';

(<any>mongoose).Promise = bluePromise;

export type ChestnutOptions = {
    port: number;
    models: any;
    mongoDb: string;
};

export type Chestnut = {
    expressApp: any;
};

export async function initChestnut(options: ChestnutOptions): Promise<Chestnut> {
    const app = express();

    app.use('/graphql', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    const connection = await mongoose.createConnection(options.mongoDb, {
        useMongoClient: true,
        /* other options */
    });

    console.log(connection, 'mongoose connection');

    const schema = initGraphQLSchema(options.models, connection);

    app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
    app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

    app.listen(options.port, () => console.log(`chestnut-server listening on port ${options.port}`));

    return { expressApp: app };
}