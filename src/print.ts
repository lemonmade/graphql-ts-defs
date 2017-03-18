import {relative, dirname} from 'path';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLType,
} from 'graphql';
import {Operation, Fragment, Context} from 'apollo-codegen';

import CodeGenerator from './generator';
import {propertiesFromFields, Type, Property, Interface} from './ast';

type Block = () => void;

interface ImportMap {
  [key: string]: string[],
}

interface File {
  path: string,
  operation?: Operation,
  fragment?: Fragment,
}

export function printFile(
  generator: CodeGenerator,
  {operation, fragment}: File,
  context: Context,
) {
  if (operation == null && fragment == null) {
    return '';
  }

  generator.printOnNewline('// This file was generated and should not be edited.');
  generator.printOnNewline('// tslint-disable');
  generator.printNewline();
  generator.printOnNewline("import {DocumentNode} from 'graphql';");
  generator.printNewline();

  if (operation != null) {
    printImportsForOperation(generator, operation, context);
    printVariablesInterfaceFromOperation(generator, operation, context);
    printInterfaceFromOperation(generator, operation, context);
  }

  if (fragment != null) {
    printImportsForOperation(generator, fragment, context);
    printInterfaceFromFragment(generator, fragment, context);
  }

  generator.printOnNewline('declare const document: DocumentNode;');
  generator.printOnNewline('export default document;');
  generator.printNewline();

  generator.printOnNewline('// tslint-enable');

  return generator.output;
}

export function printImportsForOperation(
  generator: CodeGenerator,
  {fragmentsReferenced, filePath}: Operation | Fragment,
  context: Context,
) {
  const fragmentImports = fragmentsReferenced.reduce((imports: ImportMap, fragmentName) => {
    const fragment = context.fragments[fragmentName];
    const fileImports = imports[fragment.filePath] || [];

    fileImports.push(fragmentName);
    imports[fragment.filePath] = fileImports;

    return imports;
  }, {} as ImportMap);

  Object.keys(fragmentImports).forEach((fragmentFilePath) => {
    const fragmentsToImport = fragmentImports[fragmentFilePath];

    let relativePath = relative(dirname(filePath), fragmentFilePath);
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }

    generator.printOnNewline(`import {${fragmentsToImport.join(', ')}} from '${relativePath}';`);
  });

  if (Object.keys(fragmentImports).length) {
    generator.printNewline();
  }
}

export function printVariablesInterfaceFromOperation(
  generator: CodeGenerator,
  {operationName, variables}: Operation,
  context: Context,
) {
  if (variables == null || variables.length === 0) {
    return;
  }

  const types = new Set();

  function addTypeToList(type: GraphQLType) {
    if (types.has(type)) { return; }

    if (type instanceof GraphQLEnumType) {
      types.add(type);
    } else if (type instanceof GraphQLInputObjectType) {
      types.add(type);

      const fields = type.getFields();
      Object
        .keys(fields)
        .map((fieldName) => fields[fieldName])
        .forEach((typeField) => addTypeToList(typeField.type));
    } else if (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
      addTypeToList(type.ofType);
    }
  }

  variables.forEach((variable) => {
    addTypeToList(variable.type);
  });

  Array.from(types).reverse().forEach((type) => {
    generator.printNewline();
    printGraphQLType(generator, type, context);
  });

  printExport(generator, () => {
    printInterface(generator, {
      name: `${operationName}Variables`,
    }, () => {
      propertiesFromFields(context, variables as any, undefined, true).forEach((property) => printProperty(generator, property));
    });
  });

  generator.printNewline();
}

export function printGraphQLType(
  generator: CodeGenerator,
  type: GraphQLType,
  context: Context,
) {
  const {name} = type as {name: string};

  if (type instanceof GraphQLInputObjectType) {
    printInterface(generator, {name}, () => {
      const fields = type.getFields();
      propertiesFromFields(context, (Object.keys(fields) as any).map((fieldName: any) => fields[fieldName]), undefined, true).forEach((property) => {
        printProperty(generator, property);
      });
    });
    generator.printNewline();
  } else if (type instanceof GraphQLEnumType) {
    const values = type.getValues();
    generator.print(`type ${name} = `);
    values.forEach((value, index) => {
      generator.print(`'${value.value}'`);
      generator.print(index !== values.length - 1 && ' | ');
    });
    generator.print(';');
    generator.printNewline();
  }
}

export function printInterfaceFromFragment(
  generator: CodeGenerator,
  fragment: Fragment,
  context: Context,
) {
  const {
    fragmentName,
    fields,
    fragmentSpreads,
  } = fragment;

  printExport(generator, () => {
    printInterface(generator, {
      name: fragmentName,
      extend: fragmentSpreads,
    }, () => {
      propertiesFromFields(context, fields).forEach((property) => printProperty(generator, property));
    });
  });

  generator.printNewline();
}

export function printInterfaceFromOperation(generator: CodeGenerator, operation: Operation, context: Context) {
  const {
    operationName,
    fields,
    fragmentSpreads,
  } = operation;

  printExport(generator, () => {
    printInterface(generator, {
      name: operationName,
      extend: fragmentSpreads,
    }, () => {
      propertiesFromFields(context, fields).forEach((property) => printProperty(generator, property));
    });
  });

  generator.printNewline();
}

export function printProperty(generator: CodeGenerator, {type, name}: Property) {
  generator.printOnNewline(`${name}: `);
  printType(generator, type);
  generator.print(',');
}

export function printType(generator: CodeGenerator, {name, types, array, nullable, properties}: Type) {
  const hasMultipleTypes = Boolean(types && (types.length > 1));
  const needsParens = (array && (hasMultipleTypes || (types && types[0].nullable)));

  generator.print(needsParens && '(');

  if (types && types.length) {
    types.forEach((type, index) => {
      printType(generator, type);
      generator.print(index !== types.length - 1 && ' & ');
    });
  } else if (properties && properties.length) {
    generator.withinBlock(() => {
      properties.forEach((property) => {
        printProperty(generator, property);
      });
    });
  } else if (name) {
    generator.print(name);
  }

  generator.print(needsParens && ')');
  generator.print(array && '[]');
  generator.print(nullable && ' | null');
}

export function printExport(generator: CodeGenerator, exported: Block) {
  generator.printOnNewline('export ');
  exported();
}

export function printInterface(generator: CodeGenerator, {name, extend = []}: Interface, body: Block) {
  generator.print(`interface ${name} `);

  if (extend.length) {
    generator.print(`extends ${extend.join(', ')} `);
  }

  generator.withinBlock(body);
}
