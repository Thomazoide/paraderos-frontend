import { ApiKeyRequestPayload } from "@/types/response-payload";
import { NextResponse } from "next/server";

export async function GET() {
    const key = process.env.GOOGLE_API_KEY;
    const response: ApiKeyRequestPayload = {
        apiKey: key ?? null
    };
    return NextResponse.json(response);
};