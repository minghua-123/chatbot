import { NextResponse } from 'next/server'
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { pc } from '@/lib/pinecone';
import { Md5 } from 'ts-md5'
import { insertFile } from '@/db';

export async function POST(req: Request) {
    try {

        const formData = await req.formData()
        const file = formData.get('file') as File

        // 1. 分割成docs
        const buffer = await file.arrayBuffer()
        // Create a Blob from the buffer
        const blob = new Blob([buffer], { type: "application/pdf" });

        const loader = new WebPDFLoader(blob, {
            // required params = ...
            // optional params = ...
        });

        const docs = await loader.load()
        // 2. split docs
        const splitDocs = await Promise.all(docs.map(doc => splitDoc(doc)))

        // 3. 上传到向量库
        const res = await Promise.all(splitDocs.map(embedChunks))

        // 4. 保存到数据库
        await insertFile(file.name, Md5.hashStr(file.name))


        return NextResponse.json({ message: 'File uploaded successfully' })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'File uploaded failed' })
    }

}

const splitDoc = async (doc: Document) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 0,
    });
    const texts = await textSplitter.splitText(doc.pageContent);
    return texts
}

const embedChunks = async (chunks: string[]) => {
    const model = 'multilingual-e5-large';

    const embeddings = await pc.inference.embed(
        model,
        chunks,
        { inputType: 'passage', truncate: 'END' }
    );

    const records = chunks.map((c, i) => ({
        id: Md5.hashStr(c),
        values: embeddings[i].values!,
        metadata: { text: c }
    }));


    return await pc.index('chatbot').upsert(records)

}