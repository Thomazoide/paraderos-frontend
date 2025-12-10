import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { EndpointRequestPayload, ResponsePayload } from "@/types/response-payload";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function GetBackendEndpoint(): Promise<string | null> {
    const rawResponse = await fetch("/api/get-backend-endpoint");
    const response = await rawResponse.json() as EndpointRequestPayload;
    return response.endpoint;
}

export async function FastTokenCheck(token: string): Promise<boolean> {
    try {
        const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.authVerifyToken}`;
        const config = GetRequestConfig(METHODS.POST, "JSON", JSON.stringify({token: token}));
        const response: ResponsePayload<boolean> = await (await fetch(endpoint, config)).json();
        if(response.error) throw new Error(response.message);
        return response.data!;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function rejectSession(router: AppRouterInstance, token: string) {
    const isValid = await FastTokenCheck(token);
    if(!isValid) {
        router.push("/");
    }
}