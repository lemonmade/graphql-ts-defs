import {
  isLeafType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql';

import {Field, Context} from 'apollo-codegen';

export interface Type {
  types?: Type[],
  name?: string,
  properties?: Property[],
  nullable: boolean,
  array: boolean,
}

export interface Property {
  name: string,
  type: Type,
}

export interface Interface {
  name: string,
  extend?: string[],
}

type AnyField = Field;

export function propertiesFromFields(
  context: Context,
  fields: AnyField[],
  forceNullable?: boolean,
  includeObject?: boolean,
): Property[] {
  return (fields || []).map((field) => propertyFromField(context, field, forceNullable, includeObject));
}

export function propertyFromField(
  context: Context,
  field: AnyField,
  forceNullable?: boolean,
  includeObject?: boolean,
): Property {
  const {
    name,
    type,
    responseName,
    fragmentSpreads,
    fields: subFields,
    inlineFragments,
  } = field as Field & {name?: string};
  const propertyType = includeObject || isLeafType(type)
    ? typeFromGraphQLType(context, type, forceNullable)
    : {
      types: (fragmentSpreads || []).map((spread) => ({name: spread} as Type)),
      array: (type instanceof GraphQLNonNull) && (type.ofType instanceof GraphQLList),
      nullable: !(type instanceof GraphQLNonNull),
    } as Type;

  propertyType.types = propertyType.types || [];

  if (subFields != null || inlineFragments != null) {
    const propertiesFromInlineFragments = inlineFragments && inlineFragments.length > 0
      ? ([] as Property[]).concat(...inlineFragments.map((inlineFragment) => {
        return propertiesFromFields(context, inlineFragment.fields, true);
      }))
      : [];

    (propertyType.types as Type[]).push({
      nullable: false,
      array: false,
      properties: [
        ...propertiesFromFields(context, subFields),
        ...propertiesFromInlineFragments,
      ],
    });
  }

  return {
    type: propertyType,
    name: name || responseName,
  };
}

const builtInScalarMap = {
  [GraphQLString.name]: 'string',
  [GraphQLInt.name]: 'number',
  [GraphQLFloat.name]: 'number',
  [GraphQLBoolean.name]: 'boolean',
  [GraphQLID.name]: 'string',
}

export function typeFromGraphQLType(
  context: Context,
  type: GraphQLType,
  forceNullable?: boolean,
): Type {
  const nullable = forceNullable == null ? !(type instanceof GraphQLNonNull) : forceNullable;

  if (type instanceof GraphQLNonNull) {
    return {
      types: [typeFromGraphQLType(context, type.ofType, false)],
      array: false,
      nullable,
    };
  }

  if (type instanceof GraphQLList) {
    return {
      types: [typeFromGraphQLType(context, type.ofType)],
      nullable,
      array: true,
    };
  } else if (type instanceof GraphQLScalarType) {
    return {
      name: builtInScalarMap[type.name] || ((context as any).passthroughCustomScalars ? `${(context as any).customScalarsPrefix || ''}${type.name}` : 'string'),
      array: false,
      nullable,
    };
  } else {
    return {
      name: type.name,
      array: false,
      nullable,
    };
  }
}
