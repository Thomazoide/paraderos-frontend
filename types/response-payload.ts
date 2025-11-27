export interface ResponsePayload<T>{
    message: string;
    data?: T;
    error: boolean;
};

export interface EndpointRequestPayload {
    endpoint: string | null;
};

export interface ApiKeyRequestPayload {
    apiKey: string | null;
};