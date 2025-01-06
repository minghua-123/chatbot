import { streamText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { pc } from '@/lib/pinecone';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 读取content
  const lastMessage = messages[messages.length - 1]

  const content = await getContent(lastMessage.content)

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: 'You are a helpful assistant, here is the context: ' + content,
    messages,
  });

  return result.toDataStreamResponse();
}

const getContent = async (content: string) => {

  const model = 'multilingual-e5-large'
  // Convert the query into a numerical vector that Pinecone can search with
  const queryEmbedding = await pc.inference.embed(
    model,
    [content],
    { inputType: 'query' }
  );

  // Search the index for the three most similar vectors
  const queryResponse = await pc.index('chatbot').query({
    topK: 3,
    vector: queryEmbedding[0].values!,
    includeValues: false,
    includeMetadata: true
  });


  return queryResponse.matches.map(m => m.metadata?.text).join(' ')
}