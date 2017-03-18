declare module 'apollo-codegen' {
  import {
    GraphQLSchema,
    GraphQLType,
  } from 'graphql';

  export interface Variable {
    name: string,
    type: GraphQLType,
  }

  export interface Field {
    responseName: string,
    fieldName: string,
    type: GraphQLType,
    fields: Field[],
    fragmentSpreads?: string[],
    inlineFragments?: InlineFragment[],
  }

  export interface InlineFragment {
    typeCondition: GraphQLType[],
    possibleTypes: GraphQLType[],
    fields: Field[],
    fragmentSpreads: string[],
  }

  export interface Fragment extends InlineFragment {
    filePath: string,
    fragmentName: string,
    source: string,
    fragmentsReferenced: string[],
    fields: Field[],
  }

  export interface Operation {
    filePath: string,
    operationName: string,
    operationType: 'query' | 'mutation' | 'subscription',
    variables: Variable[],
    fields: Field[],
    fragmentsReferenced: string[],
    fragmentSpreads?: string[],
  }

  export interface Context {
    operations: {[key: string]: Operation},
    fragments: {[key: string]: Fragment},
    typesUsed: GraphQLType[],
    schema: GraphQLSchema,
  }
}

declare module 'apollo-codegen/lib/compilation' {
  import {Context} from 'apollo-codegen';
  import {GraphQLSchema, DocumentNode} from 'graphql';

  export function compileToIR(
    schema: GraphQLSchema,
    document: DocumentNode,
  ): Context;
}
