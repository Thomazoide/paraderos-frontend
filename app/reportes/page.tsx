"use client";

import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { Report } from "@/types/entities";
import { ResponsePayload } from "@/types/response-payload";
import { ReportFileRequest } from "@/types/request-payloads";
import { GetBackendEndpoint } from "@/utils/utilities";
import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import type { SinceDate } from "@/constants/misc";
import Sidebar from "@/components/sidebar";

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { accessToken, user, logout } = useAuth();
    const GetReports = async () => {
        try{
            setLoading(true);
            if(!accessToken) throw new Error("Sin token de acceso");
            const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.getReports}`;
            const reqConfig = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken);
            const response = await (await fetch(endpoint, reqConfig)).json() as ResponsePayload<Report[]>;
            if(response.error || !response.data) throw new Error(response.message || "Error desconocido");
            setReports(response.data);
        }catch(e){
            console.log(e);
        }finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        GetReports();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [since, setSince] = useState<SinceDate>('day');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleGenerate = async () => {
        try{
            if(!user) throw new Error("Sin datos de usuario");
            if(!accessToken) throw new Error("Sin token de acceso");
            const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.generateReport(since, user.id!)}`;
            const reqConfig = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken);
            const response = await (await fetch(endpoint, reqConfig)).json() as ResponsePayload<string>;
            if(response.error || !response.data) throw new Error(response.message || "Error desconocido");
            GetReports();
            setIsModalOpen(false);
        }catch(e){
            console.log(e);
        }
    };

    const handleDownload = async (fileURL: string) => {
        try {
            if(!accessToken) throw new Error("Sin token de acceso");
            const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.getReport}`;
            const payload: ReportFileRequest = { fileURL };
            const reqConfig = GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(payload), accessToken);

            const res = await fetch(endpoint, reqConfig);
            const data = await res.json() as ResponsePayload<string>;
            if(data.error || !data.data) throw new Error(data.message || "Error desconocido");

            const base64String = data.data;

            // Helper to convert base64 (or data URL) to blob and trigger download
            const downloadBase64File = (base64OrDataUrl: string, filename = `reporte-${Date.now()}.csv`) => {
                const matches = base64OrDataUrl.match(/^data:(.+);base64,(.*)$/);
                const mime = matches ? matches[1] : 'text/csv';
                const rawBase64 = matches ? matches[2] : base64OrDataUrl;

                const sliceSize = 512;
                const byteCharacters = atob(rawBase64);
                const byteArrays: Uint8Array[] = [];

                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    const slice = byteCharacters.slice(offset, offset + sliceSize);
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    byteArrays.push(new Uint8Array(byteNumbers));
                }
                //@ts-ignore
                const blob = new Blob(byteArrays, { type: mime });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            };

            // Derivar nombre de archivo desde fileURL si es posible
            let filename = `reporte-${Date.now()}.csv`;
            try {
                const parsed = new URL(fileURL);
                const parts = parsed.pathname.split('/').filter(Boolean);
                const last = parts[parts.length - 1];
                if (last) filename = last;
            } catch (_) {
                // fileURL might not be a full URL; fallback to default
            }

            downloadBase64File(base64String, filename);

        } catch (e) {
            console.error(e);
            alert((e as Error).message || "Error al descargar el reporte");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar
                fullName={user?.full_name || "Usuario"}
                userType={user?.user_type || "oferente"}
                onLogout={logout}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="md:hidden h-16" />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-semibold">Reportes</h1>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer"
                                onClick={openModal}
                            >
                                <Plus size={14} />
                                Generar Reporte
                            </button>
                        </div>

                        {loading ? (
                            <p className="text-gray-600">Cargando reportes...</p>
                        ) : reports.length === 0 ? (
                            <p className="text-gray-600">No hay reportes disponibles.</p>
                        ) : (
                            <div className="grid gap-4">
                                {reports.map((r: Report) => (
                                    <div key={r.id} className="border rounded-md p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="mb-3 md:mb-0">
                                            <p className="text-sm text-gray-500">ID: {r.id}</p>
                                            <p className="font-medium">Usuario: {r.userName} <span className="text-gray-500">(ID: {r.userId})</span></p>
                                            <p className="text-sm text-gray-500">Creado: {new Date(r.createdAt).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">Tipo de reporte: {r.reportType}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                onClick={() => handleDownload(r.fileURL)}
                                            >
                                                <Download size={14} />
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal} />
                            <div className="z-10 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                                <h2 className="text-lg font-semibold mb-4">Generar Reporte</h2>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                                <select
                                    value={since}
                                    onChange={(e) => setSince(e.target.value as SinceDate)}
                                    className="w-full border rounded-md px-3 py-2 mb-4"
                                >
                                    <option value="day">Hoy</option>
                                    <option value="week">Esta semana</option>
                                    <option value="month">Este mes</option>
                                </select>

                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:cursor-pointer">Cancelar</button>
                                    <button type="button" onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:cursor-pointer">Generar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};