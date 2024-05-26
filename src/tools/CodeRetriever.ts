import { createRetrieverTool } from 'langchain/tools/retriever';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OpenAIEmbeddings } from '@langchain/openai';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';

const loader = new DirectoryLoader(
  process.env.APP_PATH,
  {
    '.js': (path) => new TextLoader(path),
    '.json': (path) => new TextLoader(path),
    '.ts': (path) => new TextLoader(path),
  },
  true,
  'ignore',
);
const javascriptSplitter = RecursiveCharacterTextSplitter.fromLanguage('js', {
  chunkSize: 2000,
  chunkOverlap: 200,
});

const description = `Search for information about the codebase. Use this tool
to search the codebase using natural language. It will give you the most
similar to your query string results.`;

const buildCodeRetriever = async () => {
  const docs = await loader.load();
  const texts = await javascriptSplitter.splitDocuments(docs);

  let vectorstore: Awaited<ReturnType<(typeof HNSWLib)['fromDocuments']>>;

  try {
    vectorstore = await HNSWLib.load(process.env.VECTORSTORE_PATH, new OpenAIEmbeddings());
  } catch {
    vectorstore = await HNSWLib.fromDocuments(texts, new OpenAIEmbeddings({ apiKey: process.env.API_KEY }));
    await vectorstore.save(process.env.VECTORSTORE_PATH);
  }

  const retriever = vectorstore.asRetriever();

  return createRetrieverTool(retriever, {
    name: 'retrieve-code-info',
    description,
  });
};

export const codeRetriever = buildCodeRetriever();
