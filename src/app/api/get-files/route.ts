import { getFiles } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const files = await getFiles()
        return NextResponse.json(files)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to get files' }, { status: 500 })
    }
}