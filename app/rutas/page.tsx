"use client"

import Sidebar from "@/components/sidebar";
import CreateRouteModal from "@/components/create-route-modal";
import RouteDetailsModal from "@/components/route-details-modal";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { Route, BusStop } from "@/types/entities";
import { ResponsePayload } from "@/types/response-payload";
import { GetBackendEndpoint, rejectSession } from "@/utils/utilities";
import { Plus, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoutesPage() {
    const { user, logout, accessToken } = useAuth();

    const [routes, setRoutes] = useState<Route[]>([]);
    const [busStops, setBusStops] = useState<BusStop[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [busStopsLoading, setBusStopsLoading] = useState<boolean>(false);
    
    // Creation state
    const [isCreating, setIsCreating] = useState(false);
    
    // Details state
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const router = useRouter();

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.routes}`;
            const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            const response: ResponsePayload<Route[]> = await (await fetch(endpoint, config)).json();
            if(response.error) throw new Error(response.message);
            setRoutes(response.data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBusStops = async () => {
        setBusStopsLoading(true);
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.busStops}`;
            const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            const response: ResponsePayload<BusStop[]> = await (await fetch(endpoint, config)).json();
            if(response.error) throw new Error(response.message);
            setBusStops(response.data || []);
        } catch (err) {
            console.error("Error fetching bus stops:", err);
        } finally {
            setBusStopsLoading(false);
        }
    };

    useEffect(() => {
        if(accessToken && user) {
            rejectSession(router, accessToken);
            fetchRoutes();
        }
    }, [accessToken, user]);

    useEffect(() => {
        if ((isCreating || isDetailsOpen) && busStops.length === 0) {
            fetchBusStops();
        }
    }, [isCreating, isDetailsOpen]);

    const handleCreateRoute = async (selectedIds: number[], routeName: string) => {
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.routes}`;
            const payload = JSON.stringify({
                route_points: selectedIds,
                route_name: routeName
            });
            const config = GetRequestConfig(METHODS.POST, "JSON", payload, accessToken!);
            const response: ResponsePayload<Route> = await (await fetch(endpoint, config)).json();
            
            if(response.error) throw new Error(response.message);
            
            setIsCreating(false);
            fetchRoutes(); // Refresh list
        } catch (err) {
            alert("Error al crear la ruta: " + (err as Error).message);
            throw err; // Re-throw to let modal know it failed
        }
    };

    const handleUpdateRoute = async (id: number, selectedIds: number[], routeName: string) => {
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.routes}`;
            const payload = JSON.stringify({
                id: id,
                route_points: selectedIds,
                route_name: routeName
            });
            const config = GetRequestConfig(METHODS.POST, "JSON", payload, accessToken!);
            const response: ResponsePayload<Route> = await (await fetch(endpoint, config)).json();
            
            if(response.error) throw new Error(response.message);
            
            setIsDetailsOpen(false);
            setSelectedRoute(null);
            fetchRoutes(); // Refresh list
        } catch (err) {
            alert("Error al actualizar la ruta: " + (err as Error).message);
        }
    };

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
                        <h1 className="text-2xl font-semibold text-gray-900">Rutas</h1>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Nueva Ruta
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">Cargando rutas...</div>
                    ) : routes.length === 0 ? (
                        <div className="bg-white shadow rounded-lg p-10 text-center">
                            <Map className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay rutas</h3>
                            <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva ruta seleccionando paraderos.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Crear Ruta
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {routes.map((route) => (
                                <div key={route.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {route.route_name ? route.route_name : `Ruta #${route.id}`}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {route.route_points.length} paraderos
                                        </p>
                                    </div>
                                    <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Estado: <span className={route.completed ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                                                {route.completed ? "Completada" : "Activa"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedRoute(route);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <CreateRouteModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                busStops={busStops}
                onCreate={handleCreateRoute}
                isLoadingBusStops={busStopsLoading}
            />

            <RouteDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedRoute(null);
                }}
                route={selectedRoute}
                busStops={busStops}
                onUpdate={handleUpdateRoute}
                isLoadingBusStops={busStopsLoading}
            />
        </div>
    );
}