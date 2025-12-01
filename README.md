# Paraderos Frontend - Sistema de Gestión de Paraderos (Puente Alto)

## Descripción General
Este proyecto es una plataforma web diseñada para la administración eficiente de la infraestructura de transporte público (paraderos de buses) en la comuna de Puente Alto. El sistema facilita la gestión de inventario, visualización geoespacial y la planificación operativa para tareas de limpieza y mantenimiento.

El objetivo principal es permitir a los administradores y equipos operativos gestionar el ciclo de vida de los paraderos, desde su catastro hasta la ejecución de órdenes de trabajo en terreno.

## Estado del Proyecto
El proyecto se encuentra en una fase avanzada de desarrollo, utilizando tecnologías modernas como **Next.js 15** y la última versión de la **Google Maps Platform**.

### Funcionalidades Implementadas

#### 1. Gestión de Paraderos (`/paraderos`)
- **Mapa Interactivo**: Visualización de paraderos utilizando *Advanced Markers* de Google Maps.
- **Integración con Google Places**:
  - Búsqueda automática de paraderos cercanos basada en la ubicación del mapa.
  - Funcionalidad "Click-to-Search" (activable) para buscar paraderos en puntos específicos.
  - Importación directa de datos desde Google Places al sistema backend.
- **Gestión de paraderos**:
  - Creación manual de paraderos (código, descripción, coordenadas).
  - Listado tabular de todos los paraderos registrados.
  - Indicadores visuales de estado (ej. "Visitado recientemente" vs "Sin visitas").
- **Navegación**: Botones de acción rápida para centrar el mapa en paraderos específicos.

#### 2. Dashboard (`/dashboard`)
- Vista consolidada de la ubicación de paraderos y usuarios del sistema.
- Filtrado visual de marcadores.

#### 3. Órdenes de Trabajo y Rutas (Core del Negocio)
- Capacidad para crear órdenes de trabajo asignadas a equipos.
- Definición de rutas lógicas que agrupan múltiples paraderos.
- Objetivo: Optimizar los recorridos para labores de limpieza y mantenimiento preventivo/correctivo.

## Stack Tecnológico

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Estilos**: Tailwind CSS
- **Mapas y Geolocalización**: 
  - Google Maps JavaScript API
  - Places Library
  - Advanced Marker Elements
- **Iconografía**: Lucide React
- **Lenguaje**: TypeScript
- **Gestor de Paquetes**: pnpm

## Instalación y Despliegue

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Variables de Entorno**:
   Asegúrese de configurar las claves de API necesarias para el backend y Google Maps.

4. **Ejecutar en desarrollo**:
   ```bash
   pnpm dev
   ```

## Estructura de Carpetas Clave

- `app/paraderos`: Lógica principal de gestión, búsqueda y creación de paraderos.
- `app/dashboard`: Panel de visualización general.
- `utils/google-maps.ts`: Cargador personalizado para la API de Google Maps (optimizado para Next.js).
- `components`: Elementos de UI reutilizables (Sidebar, StatusMessageBox).
- `types`: Definiciones de entidades (BusStop, User) y payloads de API.

---
*Proyecto desarrollado para la mejora continua del servicio de transporte y mantenimiento urbano en Puente Alto.*
