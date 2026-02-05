import { SinceDate } from "./misc";

export const ENDPOINTS = {
    authLogin: "/auth/v2/login", // POST
    authVerifyToken: "/auth/v1/verificar-token", // POST
    busStops: "/paraderos/v1", // solo GET y POST
    busStopFindOrDelete: (id: number) => `/paraderos/v1/find/${id}`, // solo GET o DELETE
    departures: "/salidas/v1", // solo GET y POST
    departuresByUserID: (id: number) => `/salidas/v1/usuario/${id}`, // GET
    departuresByBusStopID: (id: number) => `/salidas/v1/paradero/${id}`, // GET
    entries: "/entradas/v1", // solo GET y POST
    entriesByUserID: (id: number) => `/entradas/v1/usuario/${id}`, // GET
    entriesByBusStopID: (id: number) => `/entradas/v1/paradero/${id}`, // GET
    workOrders: "/ordenes/v1", // GET y POST
    workOrderByID: (id: number) => `/ordenes/v1/buscar/${id}`, // GET
    workOrderByRouteID: (id: number) => `/ordenes/v1/ruta/${id}`, // GET
    workOrdersByUserID: (id: number) => `/ordenes/v1/buscar/usuario/${id}`,
    deleteWorkOrder: (id: number) => `/ordenes/v1/borrar/${id}`, // DELETE
    routes: "/rutas/v1", // GET y POST
    routeByID: (id: number) => `/rutas/v1/find/${id}`, // GET
    routeByOrderID: (id: number) => `/rutas/v1/orden/${id}`, // GET
    users: "/usuarios/v1", // GET
    userCreate: "/usuarios/v2/registrar", // POST
    userUpdate: "/usuarios/v1/actualizar", // POST
    userChangePassword: "/usuarios/v2/actualizar/clave", // POST
    visitForms: "/formularios/v1", // GET
    visitFormCreate: "/formularios/v1/crear", // POST
    visitFormFinish: (id: number) => `/formularios/v1/cerrar/${id}`, // POST
    visitFormByRouteID: (id: number) => `/formularios/v1/ruta/${id}`, // GET
    visitFormByUserID: (id: number) => `/formularios/v1/usuario/${id}`, // GET
    visitFormPictures: (formID: number) => `/formularios/v2/get-pictures/${formID}`, // GET
    getReports: "/reportes/v1", // GET para obtebner todos los reportes existentes y POST para obtener solo uno
    generateReport: (sinceDate: SinceDate, userID: number) => `/reportes/v1/generar/${sinceDate}/${userID}`, //GET
    getReport: "/reportes/v1/descargar", // POST 
    deleteReport: (reportID: number) => `/reportes/v1/eliminar/${reportID}`, // DELETE
}