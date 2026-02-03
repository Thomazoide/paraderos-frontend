export interface LoginPayload {
    username: string;
    password: string;
}

export interface VerifyTokenPayload {
    token: string;
}

export interface ReportFileRequest {
    fileURL: string;
}