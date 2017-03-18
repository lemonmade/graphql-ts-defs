import {writeFileSync} from 'fs-extra';
import {Operation, Fragment, Context} from 'apollo-codegen';

import buildContext, {Options} from './context';
import Generator from './generator';
import {printFile} from './print';

export default function graphQLToTypeScriptDefinitions(options: Options) {
  const context = buildContext(options);
  const fileMap = groupQueriesAndFragmentsByFile(context);

  Object.keys(fileMap).forEach((path) => {
    const file = fileMap[path];
    const generator = new Generator();

    const content = printFile(generator, file, context);
    if (!content) { return; }

    const newFile = `${file.path}.d.ts`;
    writeFileSync(newFile, content);
  });
}

interface File {
  path: string,
  operation?: Operation,
  fragment?: Fragment,
}

interface FileMap {
  [key: string]: File,
}

function groupQueriesAndFragmentsByFile({operations, fragments}: Context): FileMap {
  const map: FileMap = {};

  Object
    .keys(operations)
    .forEach((name) => {
      const operation = operations[name];
      map[operation.filePath] = {
        path: operation.filePath,
        operation,
      };
    });
  
  Object
    .keys(fragments)
    .forEach((name) => {
      const fragment = fragments[name];
      map[fragment.filePath] = {
        path: fragment.filePath,
        fragment,
      };
    });
  
  return map;
}
