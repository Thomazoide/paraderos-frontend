import { EndpointRequestPayload } from "@/types/response-payload";

export async function GetBackendEndpoint(): Promise<string | null> {
    const rawResponse = await fetch("/api/get-backend-endpoint");
    const response = await rawResponse.json() as EndpointRequestPayload;
    return response.endpoint;
}