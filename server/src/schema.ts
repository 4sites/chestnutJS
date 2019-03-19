import { composeWithMongoose } from 'graphql-compose-mongoose'; // Plugin from graphql-compose toolkit
import { GQC } from 'graphql-compose';
import { GraphQLSchema } from 'graphql';
import * as camelcase from 'camelcase';
import { Store } from './store';
import { ChestnutOptions } from '.';

export function initGraphQLSchema(store: Store, options: ChestnutOptions): GraphQLSchema {
    const compositions: any = {};

    Object.keys(store.models).forEach(key => {
        const mongooseModel = store.models[key] as any; // mongooseModel
        const modelName = camelcase(key);
        const modelComposition = composeWithMongoose(mongooseModel, {}); // Mongoose to GraphQL

        compositions[modelName] = modelComposition;

        console.log('compose', {
            key: key,
            modelName: modelName,
        });
        // queries and mutations from graphql-compose ...
        GQC.rootQuery().addFields({
            [modelName + 'ById']: modelComposition.getResolver('findById'),
            [modelName + 'ByIds']: modelComposition.getResolver('findByIds'),
            [modelName + 'One']: modelComposition.getResolver('findOne'),
            [modelName + 'Many']: modelComposition.getResolver('findMany'),
            [modelName + 'Count']: modelComposition.getResolver('count'),
            [modelName + 'Connection']: modelComposition.getResolver('connection'),
            [modelName + 'Pagination']: modelComposition.getResolver('pagination'),
        });

        GQC.rootMutation().addFields({
            [modelName + 'Create']: modelComposition.getResolver('createOne'),
            [modelName + 'UpdateById']: modelComposition.getResolver('updateById'),
            // [modelName + 'UpdateOne']: modelComposition.getResolver('updateOne'),
            // [modelName + 'UpdateMany']: modelComposition.getResolver('updateMany'),
            [modelName + 'RemoveById']: modelComposition.getResolver('removeById'),
            // [modelName + 'RemoveOne']: modelComposition.getResolver('removeOne'),
            // [modelName + 'RemoveMany']: modelComposition.getResolver('removeMany'),
        });
    });

    Object.keys(store.models).forEach(key => {
        const mongooseModel = store.models[key] as any; // mongooseModel
        const modelName = camelcase(key);

        Object.keys(mongooseModel.schema.paths)
            .filter(k => k !== '__v')
            .forEach(p => {
                const property = mongooseModel.schema.paths[p];
                const objProperty = mongooseModel.schema.obj[p];

                if (property.instance === 'String') {
                    // console.log('* ********************** extend regex resolver', {
                    //     path: property.path,
                    //     type: property.instance,
                    // });

                    const extendedResolver = compositions[modelName].getResolver('findMany').addFilterArg({
                        name: property.path + '_regex',
                        type: 'String',
                        description: 'Search by regExp',
                        query: (query, value) => {
                            query[property.path] = new RegExp(value, 'i'); // eslint-disable-line
                        },
                    });
                    extendedResolver.extendedResolver.name = 'findMany';
                    compositions[modelName].addResolver(extendedResolver);
                }

                if (objProperty && objProperty.ref) {
                    const refName = camelcase(objProperty.ref);

                    console.log('addParentRelation', {
                        reference: objProperty ? objProperty.ref : null,
                        name: p,
                        refName: refName,
                        modelName: modelName,
                        propertyName: p,
                    });

                    compositions[modelName].addRelation(refName + 'Ref', {
                        resolver: compositions[refName].getResolver('findById'),
                        prepareArgs: {
                            _id: (source: any) => source[p],
                        },
                        projection: { [p]: 1 },
                    });
                } else if (objProperty && Array.isArray(objProperty) && objProperty.length > 0) {
                    console.log('addChildRelation', {
                        reference: objProperty[0].ref,
                        name: p,
                        modelName: modelName,
                        propertyName: p,
                    });

                    if (objProperty[0].ref !== 'String') {
                        const refName = camelcase(objProperty[0].ref);

                        compositions[modelName].addRelation(refName + 'Refs', {
                            resolver: compositions[refName].getResolver('findByIds'),
                            prepareArgs: {
                                _ids: (source: any) => source[p],
                            },
                            projection: { [p]: 1 },
                        });
                    }
                }
            });
    });

    const graphqlSchema = GQC.buildSchema();
    return graphqlSchema;
}
