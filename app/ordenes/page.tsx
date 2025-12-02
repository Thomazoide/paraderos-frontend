"use client"

import Sidebar from "@/components/sidebar";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { WorkOrder } from "@/types/entities";
import { ResponsePayload } from "@/types/response-payload";
import { GetBackendEndpoint } from "@/utils/utilities";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function WorkOrdersPage() {
    const { user, logout, accessToken } = useAuth();
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>();
    const [errorFetching, setErrorFetching] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect( () => {
        const GetWorkOrders = async () => {
            setLoading(true);
            const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.workOrders}`;
            const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            try {
                const response: ResponsePayload<WorkOrder[]> = await (await fetch(endpoint, config)).json();
                if(response.error) throw new Error(response.message);
                setWorkOrders(response.data);
            } catch (err) {
                setErrorFetching(err as Error);
            } finally {
                setLoading(false);
            }
        }
        if(accessToken){
            GetWorkOrders();
        }
    }, [] );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar
            fullName={user?.full_name || "usuario"}
            userType={user?.user_type || "oferente"}
            onLogout={logout}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="md:hidden h-16"/>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Órdenes de trabajo</h1>
                    </div>
                    <div className="flex flex-row justify-evenly h-fit bg-white shadow-md rounded p-4 w-full">
                        {
                            !loading && workOrders && workOrders?.length !== 0 ?
                            <div className="text-gray-800 w-fit h-fit flex-row justify-start">
                            <div className="w-3 h-3 rounded-full bg-orange-400"/>
                            <p>{workOrders.filter( (wo) => !wo.completada ).length} sin completar</p>
                            </div>
                            :
                            !loading && !workOrders ?
                            <div className="flex flex-row w-full justify-between">
                                <p className="text-gray-800 text-2xl">Sin órdenes creadas...</p>
                                <button className="bg-blue-700 rounded-md shadow-md hover:cursor-pointer hover:scale-[105%] transition-[2s]" >
                                    <div className="flex flex-row p-2 justify-start w-full">
                                        <Plus/>
                                        <p className="text-white">
                                            Crear orden de trabajo
                                        </p>
                                    </div>
                                </button>
                            </div>
                            :
                            loading ?
                            <div></div>
                            :
                            null
                        }
                    </div>
                </main>
            </div>
        </div>
    )
}