export type UserType = "jefatura" | "terreno" | "oferente";

export interface BusStop {
    id: number;
    lat: number;
    lng: number;
    codigo: string;
    description: string;
    visitForms: VisitForm[] | null;
    entries: Entry[] | null;
    departures: Departure[] | null;
};

export interface Entry {
    id: number;
    date: string;
    user_id: number;
    bus_stop_id: number;
    busStop: BusStop | null;
    user: User | null;
};

export interface Departure {
    id: number;
    date: string;
    user_id: number;
    bus_stop_id: number;
    busStop: BusStop | null;
    user: User | null;
};

export interface Route {
    id: number;
    route_points: number[];
    route_points_visited: number[];
    completed: boolean;
    work_order_id: number | null;
    work_order: WorkOrder | null;
    visitForms: VisitForm[] | null;
};

export interface User {
    id: number;
    full_name: string;
    email: string;
    username: string;
    password: string;
    user_type: UserType;
    lat: number | null;
    lng: number | null;
    lastUpdated: string | null;
    entries: Entry[] | null;
    departures: Departure[] | null;
    work_orders: WorkOrder[] | null;
    visitForms: VisitForm[] | null;
};

export interface VisitForm {
    id: number;
    picBeforeURL: string;
    picAfterURL: string | null;
    description: string;
    busStopId: number;
    userId: number | null;
    routeId: number | null;
    creation_date: string;
    completion_date: string | null;
    busStop?: BusStop;
    route: Route | null;
    user: User;
    completed: boolean;
};

export interface WorkOrder {
    id: number;
    completada: boolean;
    creation_date: string;
    complete_date: string;
    user_id: number | null;
    route_id: number | null;
    route: Route | null;
    user_final: User | null;
};