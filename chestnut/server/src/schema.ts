import { composeWithMongoose } from 'graphql-compose-mongoose';
import { GQC } from 'graphql-compose';
import { GraphQLSchema } from 'graphql';
import * as mongoose from 'mongoose';

export function initGraphQLSchema(
    models: any,
    connection: mongoose.Connection,
    prefix?: string
): { schema: GraphQLSchema; models: any } {
    const mongooseModels = {};

    Object.keys(models).forEach(key => {
        const model = models[key]; // Typegoose
        const modelName = key.toLowerCase();

        const mongooseModel: mongoose.Model<any> = new model().getModelForClass(model, {
            existingConnection: connection,
        }); // Typegoose to Mongoose

        mongooseModels[key] = mongooseModel;

        const options: any = {};
        if (prefix) options.schemaOptions = { collection: `${prefix}_${modelName}s` };

        const modelComposition = composeWithMongoose(mongooseModel, options); // Mongoose to GraphQL

        // console.log(mongooseModel, 'mongooseModel');
        // console.log(modelComposition, 'modelComposition');
        //console.log(modelComposition.getResolver('createOne'), 'createOne');

        GQC.rootQuery().addFields({
            [modelName + 'ById']: modelComposition.getResolver('findById'),
            [modelName + 'ByIds']: modelComposition.getResolver('findByIds'),
            [modelName + 'One']: modelComposition.getResolver('findOne'),
            [modelName + 'Many']: modelComposition.getResolver('findMany'),
            [modelName + 'Count']: modelComposition.getResolver('count'),
            [modelName + 'Connection']: modelComposition.getResolver('connection'),
            [modelName + 'Pagination']: modelComposition.getResolver('pagination'),
        });

        const createOne = user => mongooseModel.create(user);

        GQC.rootMutation().addFields({
            [modelName + 'Create']: modelComposition.getResolver('createOne'),
            [modelName + 'UpdateById']: modelComposition.getResolver('updateById'),
            [modelName + 'UpdateOne']: modelComposition.getResolver('updateOne'),
            [modelName + 'UpdateMany']: modelComposition.getResolver('updateMany'),
            [modelName + 'RemoveById']: modelComposition.getResolver('removeById'),
            [modelName + 'RemoveOne']: modelComposition.getResolver('removeOne'),
            [modelName + 'RemoveMany']: modelComposition.getResolver('removeMany'),
        });
    });
    const graphqlSchema = GQC.buildSchema();
    return { schema: graphqlSchema, models: mongooseModels };
}