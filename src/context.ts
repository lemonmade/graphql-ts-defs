import {readFileSync, readJSONSync} from 'fs-extra';
import {
  Source,
  parse,
  concatAST,
  buildClientSchema,
} from 'graphql';
import {compileToIR} from 'apollo-codegen/lib/compilation';

export interface Options {
  schemaFile: string,
  graphQLFiles: string[],
}

export default function buildContext({
  schemaFile,
  graphQLFiles,
}: Options) {
  const schemaJSON = readJSONSync(schemaFile);
  const schema = buildClientSchema(schemaJSON.data);

  const sources = graphQLFiles.map((file) => {
    const body = readFileSync(file, 'utf8');
    return new Source(body, file);
  });
  const ast = concatAST(sources.map((source) => parse(source)));
  return compileToIR(schema, ast);
}