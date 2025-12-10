"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { GetBackendEndpoint, rejectSession } from "@/utils/utilities";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { BusStop } from "@/types/entities";
import { ResponsePayload, ApiKeyRequestPayload } from "@/types/response-payload";
import StatusMessageBox from "@/components/status-message-box";
import Sidebar from "@/components/sidebar";
import { Plus, MapPin, Crosshair, MousePointerClick } from "lucide-react";
import { initGoogleMaps } from "@/utils/google-maps";

interface GooglePlace {
  name: string;
  vicinity: string;
  geometry: {
    location: google.maps.LatLng;
  };
  place_id: string;
}

export default function ParaderosPage() {
  const { user, accessToken, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<GooglePlace[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [addingStop, setAddingStop] = useState<string | null>(null); // place_id being added
  const [successAdding, setSuccessAdding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'suggested' | 'manual'>('suggested');
  const [manualForm, setManualForm] = useState({
    codigo: '',
    description: '',
    lat: '',
    lng: ''
  });
  const [creatingManual, setCreatingManual] = useState(false);
  const [isClickSearchMode, setIsClickSearchMode] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const placesMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const searchCenterMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const PlaceLibraryRef = useRef<typeof google.maps.places.Place>(null);
  const AdvancedMarkerElementRef = useRef<typeof google.maps.marker.AdvancedMarkerElement>(null);
  const PinElementRef = useRef<typeof google.maps.marker.PinElement>(null);
  const busStopsRef = useRef<BusStop[]>([]);

  useEffect(() => {
    busStopsRef.current = busStops;
  }, [busStops]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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

        // Fetch Bus Stops
        const stopsRes = await fetch(`${backendUrl}${ENDPOINTS.busStops}`, GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken));
        const stopsData: ResponsePayload<BusStop[]> = await stopsRes.json();

        if (stopsData.data) setBusStops(stopsData.data);

      } catch (err) {
        console.error(err);
        setError(new Error("Error al cargar los paraderos"));
      } finally {
        setLoadingData(false);
      }
    };

    if (user && accessToken) {
      rejectSession(router, accessToken);
      fetchData();
    }
  }, [user, accessToken]);

  // Load Map
  useEffect(() => {
    const init = async () => {
      if (apiKey && !loadingData && mapRef.current && !mapInstance.current) {
        
        initGoogleMaps(apiKey);

        try {
          const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
          const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
          const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
          
          PlaceLibraryRef.current = Place;
          AdvancedMarkerElementRef.current = AdvancedMarkerElement;
          PinElementRef.current = PinElement;

          const puenteAlto = { lat: -33.6117, lng: -70.5757 };

          mapInstance.current = new Map(mapRef.current, {
            center: puenteAlto,
            zoom: 13,
            mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
          });

          updateMarkers();
          
        } catch (e) {
          console.error("Error loading Google Maps:", e);
        }
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, loadingData]);

  const isVisitedRecently = (stop: BusStop) => {
    // Check if visited in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hasRecentVisitForm = stop.visitForms?.some(f => {
      return new Date(f.creation_date) > sevenDaysAgo;
    });
    
    const hasRecentEntry = stop.entries?.some(e => new Date(e.date) > sevenDaysAgo);
    const hasRecentDeparture = stop.departures?.some(d => new Date(d.date) > sevenDaysAgo);

    return hasRecentVisitForm || hasRecentEntry || hasRecentDeparture;
  };

  const updateMarkers = () => {
    if (!mapInstance.current || !AdvancedMarkerElementRef.current || !PinElementRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    busStopsRef.current.forEach(stop => {
      const visited = isVisitedRecently(stop);
      
      // Create a pin element
      const pin = new PinElementRef.current!({
        background: visited ? "#10B981" : "#EF4444",
        borderColor: "#FFFFFF",
        glyphColor: "#FFFFFF",
        scale: 1.2,
      });

      const marker = new AdvancedMarkerElementRef.current!({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstance.current,
        title: stop.description,
        content: pin.element,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black;">
            <h3 style="font-weight: bold;">${stop.codigo}</h3>
            <p>${stop.description}</p>
            <p>Estado: ${visited ? "Visitado recientemente" : "Sin visitas recientes"}</p>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const searchNearbyBusStops = async (locationOverride?: google.maps.LatLng) => {
    console.log("Starting searchNearbyBusStops...");
    if (!mapInstance.current || !window.google || !PlaceLibraryRef.current) {
      console.warn("Dependencies not ready:", { 
        map: !!mapInstance.current, 
        google: !!window.google, 
        placeLib: !!PlaceLibraryRef.current 
      });
      return;
    }

    const center = locationOverride || mapInstance.current.getCenter();
    if (!center) return;

    // Place a marker at the search center if it's a manual click search
    if (locationOverride && AdvancedMarkerElementRef.current && PinElementRef.current) {
      if (searchCenterMarkerRef.current) {
        searchCenterMarkerRef.current.map = null;
      }

      const pin = new PinElementRef.current({
        background: "#3B82F6", // Blue-500
        borderColor: "#1E40AF", // Blue-800
        glyphColor: "#FFFFFF",
        scale: 1.1,
      });

      searchCenterMarkerRef.current = new AdvancedMarkerElementRef.current({
        position: center,
        map: mapInstance.current,
        title: "Centro de búsqueda",
        content: pin.element,
      });
    }

    const request = {
      fields: ['displayName', 'location', 'formattedAddress', 'id'],
      locationRestriction: {
        center: { lat: center.lat(), lng: center.lng() },
        radius: 800, // 800 meters radius
      },
      includedPrimaryTypes: ['bus_stop', 'bus_station'],
      maxResultCount: 20
    };

    console.log("Places API Request:", request);

    try {
      if (!PlaceLibraryRef.current) return;
      const response = await PlaceLibraryRef.current.searchNearby(request);
      console.log("Places API Response:", response);
      
      const { places } = response;

      if (places) {
        const newPlaces = places.filter((place) => {
          if (!place.location) return false;
          
          // Check if any existing bus stop is very close (e.g., within 20 meters)
          return !busStopsRef.current.some(stop => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(stop.lat, stop.lng),
              place.location!
            );
            return distance < 20;
          });
        }).map((place) => ({
            name: place.displayName,
            vicinity: place.formattedAddress,
            geometry: { location: place.location },
            place_id: place.id
        }));

        setNearbyPlaces(newPlaces as GooglePlace[]);
        updatePlacesMarkers(newPlaces as GooglePlace[]);
      }
    } catch (e) {
      console.error("Error searching places:", e);
    }
  };

  const updatePlacesMarkers = (places: GooglePlace[]) => {
    if (!mapInstance.current || !AdvancedMarkerElementRef.current) return;

    placesMarkersRef.current.forEach(marker => marker.map = null);
    placesMarkersRef.current = [];

    places.forEach(place => {
      const iconImg = document.createElement('img');
      iconImg.src = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/bus-71.png";
      iconImg.style.width = "20px";
      iconImg.style.height = "20px";
      iconImg.style.opacity = "0.7";

      const marker = new AdvancedMarkerElementRef.current!({
        map: mapInstance.current,
        position: place.geometry.location,
        title: place.name,
        content: iconImg,
      });

      // Create content for InfoWindow
      const contentDiv = document.createElement('div');
      contentDiv.style.color = 'black';
      
      const infoHtml = `
        <h3 style="font-weight: bold;">${place.name}</h3>
        <p>${place.vicinity}</p>
        <p style="font-size: 0.8em; color: gray;">Sugerido por Google Places</p>
      `;
      
      const btn = document.createElement('button');
      btn.textContent = "Agregar este paradero";
      btn.style.marginTop = "8px";
      btn.style.backgroundColor = "#2563EB";
      btn.style.color = "white";
      btn.style.padding = "6px 12px";
      btn.style.borderRadius = "4px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.width = "100%";
      
      btn.onclick = () => {
          handleAddBusStop(place);
          infoWindow.close();
      };

      contentDiv.innerHTML = infoHtml;
      contentDiv.appendChild(btn);

      const infoWindow = new google.maps.InfoWindow({
        content: contentDiv
      });

      marker.addListener("click", () => {
        console.log("Marker clicked:", place.name);
        infoWindow.open(mapInstance.current, marker);
      });

      placesMarkersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapInstance.current) return;

    const handleClick = (e: google.maps.MapMouseEvent) => {
        if (isClickSearchMode && e.latLng) {
            searchNearbyBusStops(e.latLng);
        }
    };

    const clickListener = mapInstance.current.addListener("click", handleClick);

    return () => {
        google.maps.event.removeListener(clickListener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance.current, isClickSearchMode]);

  // Cleanup search marker when mode is disabled
  useEffect(() => {
    if (!isClickSearchMode && searchCenterMarkerRef.current) {
      searchCenterMarkerRef.current.map = null;
      searchCenterMarkerRef.current = null;
    }
  }, [isClickSearchMode]);

  const handleCenterMap = (location: google.maps.LatLng) => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(location);
      mapInstance.current.setZoom(18);
    }
  };

  const GetBusStopCode = (name: string): string => {
    if(name.length === 0) return "";
    return name.split("-")[0];
  }

  const handleAddBusStop = async (place: GooglePlace) => {
    if (!accessToken) return;
    setAddingStop(place.place_id);
    
    try {
      const backendUrl = await GetBackendEndpoint();
      const newStop: Partial<BusStop> = {
        codigo: GetBusStopCode(place.name), 
        description: place.name + " - " + place.vicinity,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      const res = await fetch(`${backendUrl}${ENDPOINTS.busStops}`, GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(newStop), accessToken));
      const data: ResponsePayload<BusStop> = await res.json();

      if (data.error) throw new Error(data.message);

      setSuccess(`Paradero ${newStop.description} agregado correctamente.`);
      setSuccessAdding(true);
      if (data.data) {
        const newData = data.data;
        setBusStops(prev => [...prev, newData]);
        busStopsRef.current = [...busStopsRef.current, newData];
        setNearbyPlaces(prev => prev.filter(p => p.place_id !== place.place_id));
      }
      
      updateMarkers();

    } catch (err) {
      console.error(err);
      setError(new Error("Error al agregar el paradero"));
    } finally {
      setAddingStop(null);
    }
  };

  const handleCreateManualStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    
    setCreatingManual(true);
    try {
      const backendUrl = await GetBackendEndpoint();
      const newStop = {
        codigo: manualForm.codigo,
        description: manualForm.description,
        lat: parseFloat(manualForm.lat),
        lng: parseFloat(manualForm.lng)
      };

      const res = await fetch(`${backendUrl}${ENDPOINTS.busStops}`, GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(newStop), accessToken));
      const data: ResponsePayload<BusStop> = await res.json();

      if (data.error) throw new Error(data.message);

      setSuccess(`Paradero ${newStop.description} creado correctamente.`);
      setSuccessAdding(true);
      if (data.data) {
        const newData = data.data;
        setBusStops(prev => [...prev, newData]);
        busStopsRef.current = [...busStopsRef.current, newData];
        setManualForm({ codigo: '', description: '', lat: '', lng: '' });
      }
      
      updateMarkers();

    } catch (err) {
      console.error(err);
      setError(new Error("Error al crear el paradero"));
    } finally {
      setCreatingManual(false);
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
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Paraderos</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 relative">
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setIsClickSearchMode(!isClickSearchMode)}
                  className={`p-2 rounded-md shadow-md transition-colors ${
                    isClickSearchMode 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title={isClickSearchMode ? "Desactivar búsqueda por clic" : "Activar búsqueda por clic"}
                >
                  <MousePointerClick className="h-5 w-5" />
                  {
                    isClickSearchMode ?
                    (<p>Buscando paraderos cercanos</p>)
                    :
                    (<p>Comenzar a buscar paraderos</p>)
                  }
                </button>
              </div>
              <div 
                ref={mapRef} 
                className="w-full h-[600px] rounded-lg border border-gray-200"
              />
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Visitado recientemente</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Sin visitas recientes</span>
                </div>
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element*/}
                  <img src="https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/bus-71.png" className="w-4 h-4 mr-2 opacity-70" alt="bus icon" />
                  <span>Sugerido (Google Places)</span>
                </div>
              </div>
            </div>

            {/* Sidebar List Section */}
            <div className="bg-white shadow rounded-lg p-4 flex flex-col h-[600px]">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`flex-1 py-2 px-4 text-center text-sm font-medium ${activeTab === 'suggested' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('suggested')}
                >
                  Sugeridos
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center text-sm font-medium ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Crear Manual
                </button>
              </div>

              {activeTab === 'suggested' ? (
                <>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                    Paraderos cercanos
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Estos paraderos fueron encontrados cerca del centro del mapa y no están en tu base de datos.
                  </p>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {nearbyPlaces.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        Mueve el mapa para buscar paraderos cercanos...
                      </div>
                    ) : (
                      nearbyPlaces.map((place) => (
                        <div key={place.place_id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-gray-900 text-sm">{place.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{place.vicinity}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCenterMap(place.geometry.location)}
                              className="flex-1 flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Crosshair className="mr-1 h-3 w-3" /> Centrar
                            </button>
                            <button
                              onClick={() => handleAddBusStop(place)}
                              disabled={addingStop === place.place_id}
                              className="flex-1 flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {addingStop === place.place_id ? (
                                "Agregando..."
                              ) : (
                                <>
                                  <Plus className="mr-1 h-3 w-3" /> Agregar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={handleCreateManualStop} className="flex flex-col h-full">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Nuevo Paradero</h2>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div>
                      <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
                      <input
                        type="text"
                        id="codigo"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={manualForm.codigo}
                        onChange={(e) => setManualForm({...manualForm, codigo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                      <input
                        type="text"
                        id="description"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={manualForm.description}
                        onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="lat" className="block text-sm font-medium text-gray-700">Latitud</label>
                        <input
                          type="number"
                          step="any"
                          id="lat"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={manualForm.lat}
                          onChange={(e) => setManualForm({...manualForm, lat: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="lng" className="block text-sm font-medium text-gray-700">Longitud</label>
                        <input
                          type="number"
                          step="any"
                          id="lng"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={manualForm.lng}
                          onChange={(e) => setManualForm({...manualForm, lng: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Tip: Puedes hacer clic derecho en el mapa para copiar las coordenadas (funcionalidad pendiente de implementar).
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={creatingManual}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {creatingManual ? "Creando..." : "Crear Paradero"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Paraderos Guardados
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Lista de todos los paraderos registrados en el sistema.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {busStops.map((stop) => (
                    <tr key={stop.id || stop.codigo} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stop.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stop.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isVisitedRecently(stop) ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Visitado
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Sin visitas
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            if (window.google && window.google.maps) {
                              handleCenterMap(new google.maps.LatLng(stop.lat, stop.lng));
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                        >
                          <Crosshair className="h-4 w-4 mr-1" /> Centrar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {busStops.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay paraderos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <StatusMessageBox 
              message={error.message} 
              type="error" 
              closeError={setError} 
              value={error} 
            />
          )}
          
          {successAdding && (
            <StatusMessageBox 
              message={success!} 
              type="success"
              closeAction={setSuccessAdding}
              value={successAdding} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
