import buildContext, {Options} from './context';
import Generator from './generator';
import {
  printImportsForOperation,
  printVariablesInterfaceFromOperation,
  printInterfaceFromOperation,
} from './print';

export default function graphQLToTypeScriptDefinitions(options: Options) {
  const context = buildContext(options);
  const generator = new Generator();
  generator.printOnNewline('// This file was generated and should not be edited.');
  generator.printOnNewline('// tslint-disable');
  generator.printNewline();

  printImportsForOperation(generator, context.operations.HomeQuery, context);
  printVariablesInterfaceFromOperation(generator, context.operations.HomeQuery, context);
  printInterfaceFromOperation(generator, context.operations.HomeQuery, context);

  generator.printOnNewline('export default {} as any;');
  generator.printNewline();

  generator.printOnNewline('// tslint-enable');

  return generator.output;
}
