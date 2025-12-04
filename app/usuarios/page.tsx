"use client"

import Sidebar from "@/components/sidebar";
import UserModal from "@/components/user-modal";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types/entities";
import { ApiKeyRequestPayload, ResponsePayload } from "@/types/response-payload";
import { initGoogleMaps } from "@/utils/google-maps";
import { GetBackendEndpoint } from "@/utils/utilities";
import { Edit, List, Map as MapIcon, Plus, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function UsersPage() {
    const { user, accessToken, logout } = useAuth();
    
    // Data States
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [oferentUsers, setOferentUsers] = useState<User[]>([]);
    const [terrainUsers, setTerrainUsers] = useState<User[]>([]);
    const [chiefUsers, setChiefusers] = useState<User[]>([]);
    
    // UI States
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<Error | null>(null);
    const [activeTab, setActiveTab] = useState<'crud' | 'map'>('crud');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Map States
    const [apiKey, setApiKey] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const AdvancedMarkerElementRef = useRef<typeof google.maps.marker.AdvancedMarkerElement>(null);
    const PinElementRef = useRef<typeof google.maps.marker.PinElement>(null);

    const fetchUsers = async () => {
        try{
            setLoading(true);
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.users}`;
            const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            const response: ResponsePayload<User[]> = await (await fetch(endpoint, config)).json();
            
            if(response.error) throw new Error(response.message);
            
            if(response.data) {
                setAllUsers(response.data);
                setChiefusers(response.data.filter( (u) => u.user_type === "jefatura" ));
                setOferentUsers(response.data.filter( (u) => u.user_type === "oferente" ));
                setTerrainUsers(response.data.filter( (u) => u.user_type === "terreno" ));
            }
        } catch(err) {
            setFetchError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiKey = async () => {
        try {
            const keyRes = await fetch("/api/get-google-api-key");
            const keyData: ApiKeyRequestPayload = await keyRes.json();
            if (keyData.apiKey) setApiKey(keyData.apiKey);
        } catch (error) {
            console.error("Error fetching API key:", error);
        }
    };

    useEffect(() => {
        if(accessToken) {
            fetchUsers();
            fetchApiKey();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    // Map Initialization
    useEffect(() => {
        const init = async () => {
            if (activeTab === 'map' && apiKey && mapRef.current && !mapInstance.current) {
                initGoogleMaps(apiKey);
                try {
                    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
                    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
                    
                    AdvancedMarkerElementRef.current = AdvancedMarkerElement;
                    PinElementRef.current = PinElement;

                    const puenteAlto = { lat: -33.6117, lng: -70.5757 };

                    mapInstance.current = new Map(mapRef.current, {
                        center: puenteAlto,
                        zoom: 13,
                        mapId: "DEMO_MAP_ID",
                    });

                    updateMarkers();
                } catch (e) {
                    console.error("Error loading Google Maps:", e);
                }
            }
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, apiKey]);

    // Update Markers
    const updateMarkers = () => {
        if (!mapInstance.current || !AdvancedMarkerElementRef.current || !PinElementRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.map = null);
        markersRef.current = [];

        terrainUsers.forEach(u => {
            if (u.lat && u.lng) {
                const pin = new PinElementRef.current!({
                    glyph: u.username.substring(0, 1).toUpperCase(),
                    background: "#3B82F6",
                    borderColor: "#FFFFFF",
                    glyphColor: "#FFFFFF",
                });

                const marker = new AdvancedMarkerElementRef.current!({
                    position: { lat: u.lat, lng: u.lng },
                    map: mapInstance.current,
                    title: u.full_name,
                    content: pin.element,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="color: black;">
                            <h3 style="font-weight: bold;">${u.full_name}</h3>
                            <p>Usuario: ${u.username}</p>
                            <p>Email: ${u.email}</p>
                            <p>Última actualización: ${u.lastUpdated ? new Date(u.lastUpdated).toLocaleString() : 'N/A'}</p>
                        </div>
                    `
                });

                marker.addListener("click", () => {
                    infoWindow.open(mapInstance.current, marker);
                });

                markersRef.current.push(marker);
            }
        });
    };

    useEffect(() => {
        if (activeTab === 'map' && mapInstance.current) {
            updateMarkers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [terrainUsers, activeTab]);


    // CRUD Operations
    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            const backendUrl = await GetBackendEndpoint();
            let endpoint = "";
            let method = METHODS.POST;
            let body = { ...userData };

            if (editingUser) {
                endpoint = `${backendUrl}${ENDPOINTS.userUpdate}`;
            } else {
                endpoint = `${backendUrl}${ENDPOINTS.userCreate}`;
            }
            
            const payload = {
                ...body,
                id: editingUser ? editingUser.id : undefined
            };

            const config = GetRequestConfig(method, "JSON", JSON.stringify(payload), accessToken!);
            const response: ResponsePayload<User> = await (await fetch(endpoint, config)).json();

            if (response.error) throw new Error(response.message);

            await fetchUsers();
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            alert("Error al guardar usuario: " + (error as Error).message);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
        
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.users}`; 
            const config = GetRequestConfig(METHODS.DELETE, "JSON", JSON.stringify({ id: userId }), accessToken!);
            
            const response: ResponsePayload<boolean> = await (await fetch(endpoint, config)).json();
            
            if (response.error) throw new Error(response.message);
            
            await fetchUsers();
        } catch (error) {
            alert("Error al eliminar usuario: " + (error as Error).message);
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
                <div className="md:hidden h-16" />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
                        <button 
                            onClick={() => {
                                setEditingUser(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Nuevo Usuario
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('crud')}
                                className={`${
                                    activeTab === 'crud'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <List size={18} />
                                Listado de Usuarios
                            </button>
                            <button
                                onClick={() => setActiveTab('map')}
                                className={`${
                                    activeTab === 'map'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <MapIcon size={18} />
                                Mapa en Tiempo Real (Terreno)
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    {activeTab === 'crud' ? (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
                            ) : allUsers.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No hay usuarios registrados.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {allUsers.map((u) => (
                                        <li key={u.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <UserIcon size={20} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{u.full_name}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                        <div className="text-xs text-gray-400">@{u.username} • {u.user_type}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(u);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-4 h-[600px] relative">
                            <div 
                                ref={mapRef} 
                                className="w-full h-full rounded-lg"
                            />
                            {terrainUsers.length === 0 && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg text-center">
                                    <p className="text-gray-500">No hay usuarios de terreno con ubicación activa.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                userToEdit={editingUser}
                onSave={handleSaveUser}
            />
        </div>
    );
}