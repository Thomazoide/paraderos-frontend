import { EndpointRequestPayload } from "@/types/response-payload";
import { NextResponse } from "next/server";

export async function GET() {
    const backendEndpoint = process.env.BACKEND_ENDPOINT;
    const response: EndpointRequestPayload = {
        endpoint: backendEndpoint ?? null
    };
    return NextResponse.json(response);
};