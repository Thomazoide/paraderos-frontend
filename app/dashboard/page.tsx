"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { GetBackendEndpoint } from "@/utils/utilities";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { User, WorkOrder, VisitForm, BusStop } from "@/types/entities";
import { ResponsePayload, ApiKeyRequestPayload } from "@/types/response-payload";
import StatusMessageBox from "@/components/status-message-box";
import Sidebar from "@/components/sidebar";

export default function Dashboard() {
  const { user, accessToken, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [visitForms, setVisitForms] = useState<VisitForm[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      try {
        setLoadingData(true);
        const backendUrl = await GetBackendEndpoint();

        // Fetch Google API Key
        const keyRes = await fetch("/api/get-google-api-key");
        const keyData: ApiKeyRequestPayload = await keyRes.json();
        if (keyData.apiKey) setApiKey(keyData.apiKey);

        // Fetch Data
        const [usersRes, ordersRes, formsRes, stopsRes] = await Promise.all([
          fetch(`${backendUrl}${ENDPOINTS.users}`, GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken)),
          fetch(`${backendUrl}${ENDPOINTS.workOrders}`, GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken)),
          fetch(`${backendUrl}${ENDPOINTS.visitForms}`, GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken)),
          fetch(`${backendUrl}${ENDPOINTS.busStops}`, GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken))
        ]);

        const usersData: ResponsePayload<User[]> = await usersRes.json();
        const ordersData: ResponsePayload<WorkOrder[]> = await ordersRes.json();
        const formsData: ResponsePayload<VisitForm[]> = await formsRes.json();
        const stopsData: ResponsePayload<BusStop[]> = await stopsRes.json();

        if (usersData.data) setUsers(usersData.data);
        if (ordersData.data) setWorkOrders(ordersData.data);
        if (formsData.data) setVisitForms(formsData.data);
        if (stopsData.data) setBusStops(stopsData.data);

      } catch (err) {
        console.error(err);
        setError(new Error("Error al cargar los datos del dashboard"));
      } finally {
        setLoadingData(false);
      }
    };

    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

  // Load Map
  useEffect(() => {
    if (apiKey && !loadingData && mapRef.current && !mapInstance.current) {
      const loadMap = async () => {
        if (!(window as any).google) {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        } else {
          initMap();
        }
      };
      loadMap();
    }
  }, [apiKey, loadingData]);

  const initMap = () => {
    if (!mapRef.current) return;

    // Santiago de Chile coordinates
    const santiago = { lat: -33.4489, lng: -70.6693 };

    mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
      center: santiago,
      zoom: 11,
    });

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    // Filter users type "terreno"
    const terrenoUsers = users.filter(u => u.user_type === "terreno" && u.lat && u.lng);

    terrenoUsers.forEach(u => {
      if (u.lat && u.lng) {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: u.lat, lng: u.lng },
          map: mapInstance.current,
          title: u.full_name,
          label: u.username.substring(0, 1).toUpperCase()
        });
        
        const infoWindow = new (window as any).google.maps.InfoWindow({
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

  // Update markers when users change
  useEffect(() => {
    if (mapInstance.current) {
      updateMarkers();
    }
  }, [users]);

  if (authLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Usuarios", value: users.length, color: "bg-blue-500" },
    { label: "Usuarios en Terreno", value: users.filter(u => u.user_type === "terreno").length, color: "bg-green-500" },
    { label: "Paraderos", value: busStops.length, color: "bg-yellow-500" },
    { label: "Órdenes de Trabajo", value: workOrders.length, color: "bg-purple-500" },
    { label: "Formularios Completados", value: visitForms.filter(f => f.completed).length, color: "bg-indigo-500" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        fullName={user?.full_name || "Usuario"} 
        userType={user?.user_type || "oferente"} 
        onLogout={logout} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header spacer */}
        <div className="md:hidden h-16" /> 

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard General</h1>
            </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    {/* Icon placeholder */}
                    <div className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ubicación de Usuarios en Terreno</h2>
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-lg border border-gray-200"
            style={{ minHeight: "500px" }}
          />
        </div>

        {/* Recent Activity or Lists could go here */}
        
        {error && (
          <StatusMessageBox 
            message={error.message} 
            type="error" 
            closeError={setError} 
            value={error} 
          />
        )}
        </main>
      </div>
    </div>
  );
}
