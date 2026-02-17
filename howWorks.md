# ¿Cómo Funciona Paraderos? - Guía del Usuario

Bienvenido a **Paraderos**, tu plataforma integral para la gestión y mantenimiento de paradas de autobús en Puente Alto. Esta guía te explica paso a paso cómo usar cada módulo del sistema.

---

## 📋 Tabla de Contenidos

1. [Inicio de Sesión](#inicio-de-sesión)
2. [Dashboard](#dashboard)
3. [Paraderos](#paraderos)
4. [Órdenes de Trabajo](#órdenes-de-trabajo)
5. [Rutas](#rutas)
6. [Formularios de Visita](#formularios-de-visita)
7. [Reportes](#reportes)
8. [Usuarios](#usuarios)
9. [Mi Cuenta](#mi-cuenta)

---

## 🔐 Inicio de Sesión

### ¿Qué es?
Es la puerta de entrada al sistema. Aquí verificamos tu identidad para asegurar que solo personas autorizadas accedan a la plataforma.

### ¿Cómo usarlo?

1. **Ingresa tu usuario**: Escribe el nombre de usuario que te proporcionó tu administrador
2. **Ingresa tu contraseña**: Digita tu contraseña de forma segura
3. **Opción "Recordar usuario"**: Si marcas esta casilla, la próxima vez que ingreses aparecerá tu usuario guardado (opcional)
4. **Haz clic en "Ingresar"**: Se verificarán tus credenciales
5. **Acceso al sistema**: Una vez autenticado, irás al Dashboard

### Tipos de Usuario

El sistema reconoce tres tipos de usuarios, cada uno con permisos específicos:

- **Terreno**: Personal que realiza trabajos en el terreno (limpieza, mantenimiento)
- **Jefatura**: Supervisores que planifican tareas y supervisan al equipo de terreno
- **Oferente**: Administradores del sistema con acceso completo

---

## 📊 Dashboard

### ¿Qué es?
Es tu panel principal. Te muestra de un vistazo toda la información importante: ubicación de paraderos, posición del personal en terreno y estadísticas del sistema.

### ¿Qué puedes ver?

- **Mapa Interactivo**: Visualización geográfica de:
  - 📍 Todas las paradas de autobús registradas
  - 👥 Ubicación en tiempo real del personal de terreno
  
- **Filtrado Visual**: Puedes mostrar u ocultar:
  - Puntos de paraderos
  - Ubicación de usuarios

### ¿Cómo usarlo?

1. **Haz zoom** en el mapa para ver detalles de zonas específicas
2. **Desplázate** arrastrando el mapa para explorar diferentes áreas
3. **Usa los filtros** para ver solo lo que necesites
4. **Haz clic en marcadores** para obtener información de la parada o usuario

---

## 📍 Paraderos

### ¿Qué es?
Es el catastro completo de todas las paradas de autobús. Aquí registras, visualizas y administras la información de cada una.

### ¿Qué puedes hacer?

#### 1. **Ver Paraderos en el Mapa**
- Se muestran todas las paradas registradas
- Cada pin te da información como código, descripción y última fecha de visita
- Los marcadores cambian de color según si fueron visitados recientemente o no

#### 2. **Buscar Paraderos Nuevos** (Integración con Google Places)
- El sistema busca automáticamente paradas cercanas a donde estés viendo el mapa
- Puedes ver sugerencias de nuevas ubicaciones para registrar
- Importa datos directamente desde Google Places

#### 3. **Crear una Parada Manualmente**
- **Código**: Identificador único (ej: P-001)
- **Descripción**: Nombre o ubicación descriptiva (ej: "Esquina Av. Principal con 5 Sur")
- **Coordenadas**: Latitud y Longitud (puedes hacer click en el mapa para establecerlas)
- Haz clic en "Crear" y listo

#### 4. **Ver Listado Tabular**
- Tabla con todas las paradas registradas
- Información: código, descripción, coordenadas, última visita
- Puedes ordenar e identificar paradas que necesitan mantenimiento

#### 5. **Acciones Rápidas**
- Botones para centrar el mapa en una parada específica
- Ver detalles completos de la parada

### Indicadores de Estado

- 🟢 **Parada Visitada Recientemente**: Se le ha dado mantenimiento hace poco
- 🔴 **Sin Visitas**: Necesita atención pronto

---

## 📋 Órdenes de Trabajo

### ¿Qué es?
Son las tareas asignadas al equipo de terreno. Cada orden especifica qué trabajo hacer, dónde hacerlo y quién lo debe hacer.

### ¿Cómo funciona?

#### **Para Jefatura/Oferente (Crear Órdenes)**

1. **Accede a Órdenes de Trabajo**
2. **Haz clic en "Crear Orden de Trabajo"**
3. **Completa la información**:
   - **Descripción**: ¿Qué hay que hacer? (ej: "Limpieza de paradero", "Reparación de estructura")
   - **Paradas**: Selecciona cuál o cuáles paraderos están involucrados
   - **Personal Asignado**: Elige quién del equipo ejecutará la tarea
   - **Fecha/Hora**: Cuándo se debe realizar
   - **Prioridad**: Urgencia de la tarea (alta, media, baja)

4. **Revisa y publica**: Confirma los datos y la orden se envía al equipo

#### **Para Personal de Terreno (Ejecutar Órdenes)**

1. **Revisa tus órdenes asignadas**
2. **Ve a la parada indicada**
3. **Realiza el trabajo** según lo especificado
4. **"Completar" la orden** desde tu dispositivo
5. **Carga un formulario de visita** (ver sección correspondiente)

#### **Gestión de Órdenes**

- Ver estado de órdenes: Pendientes, en progreso, completadas
- Visualizar detalles de cada orden
- Historial de órdenes ejecutadas
- Editar órdenes antes de completarse

---

## 🛣️ Rutas

### ¿Qué es?
Las rutas agrupan múltiples paraderos en un recorrido lógico para optimizar el trabajo del equipo de terreno. En lugar de visitar paraderos de forma aleatoria, una ruta es un camino eficiente que minimiza tiempo y distancia.

### ¿Cómo funciona?

#### **Para Jefatura/Oferente (Crear Rutas)**

1. **Accede a Rutas**
2. **Haz clic en "Crear Ruta"**
3. **Configura la ruta**:
   - **Nombre**: Identificador de la ruta (ej: "Ruta Centro", "Ruta Sur")
   - **Descripción**: Detalles adicionales
   - **Paraderos**: Selecciona los puntos que forman parte de esta ruta (el orden importa)
   - **Orden de visita**: Arrastra para establecer el orden lógico de visitas

4. **Guarda la ruta**

#### **Beneficios de las Rutas**

- ✅ Ahorra tiempo de viaje
- ✅ Reduce combustible/transporte
- ✅ Equipo sabe exactamente dónde ir
- ✅ Trabajo más eficiente y organizado

#### **Ver/Usar una Ruta**

- Visualiza toda la ruta en el mapa con los puntos en orden
- Asigna una ruta completa a un equipo en una orden
- Monitorea el progreso de ejecución

---

## 📝 Formularios de Visita

### ¿Qué es?
Cuando el equipo de terreno completa una tarea, debe documentarla. El formulario de visita es el registro que prueba que se hizo el trabajo y captura detalles importantes.

### ¿Qué información captura?

- **Parada Visitada**: Identificación del punto
- **Fecha y Hora**: Cuándo se hizo el trabajo
- **Personal que Visitó**: Quién ejecutó la tarea
- **Descripción de Trabajo**: Qué se hizo exactamente
- **Observaciones**: Problemas encontrados, daños, necesidades futuras
- **Fotografías**: Evidencia visual (antes/después)
- **Estado de la Parada**: Evaluación de su condición actual

### ¿Cómo usarlo?

#### **Crear un Formulario (Terreno)**

1. Completa una orden de trabajo
2. Accede a "Formularios de Visita"
3. Haz clic en "Nuevo Formulario"
4. Llena todos los campos con detalle
5. Adjunta fotos del trabajo realizado
6. Envía el formulario

#### **Ver Formularios (Jefatura/Oferente)**

1. Accede a "Formularios de Visita"
2. Busca por paradero, fecha o personal
3. Revisa los detalles y fotos
4. Valida que el trabajo se realizó correctamente

### ¿Por qué es importante?

- 📊 Crea un historial de mantenimiento para cada paradero
- 🔍 Permite detectar problemas recurrentes
- 📸 Proporciona evidencia del trabajo realizado
- 📈 Ayuda a planificar mantenimiento preventivo

---

## 📈 Reportes

### ¿Qué es?
Los reportes sintetizan información sobre órdenes completadas, visitas realizadas y el estado general del sistema para ayudarte a tomar decisiones.

### Tipos de Reportes

#### **Reporte de Órdenes de Trabajo**
- ¿Cuántas órdenes se completaron en un período?
- ¿Cuáles están atrasadas?
- ¿Qué personal es más rápido?

#### **Reporte de Visitabilidad**
- ¿Cuántas paradas se visitaron?
- ¿Cuáles no han sido visitadas?
- ¿Cuál es el tiempo promedio entre visitas?

#### **Reporte de Personal**
- Productividad de cada integrante del equipo
- Órdenes completadas por usuario
- Evaluación de desempeño

#### **Reporte de Rutas**
- Eficiencia de cada ruta
- Tiempo promedio de ejecución
- Órdenes pendientes por ruta

### ¿Cómo usarlo?

1. Accede a "Reportes"
2. Selecciona el tipo de reporte que necesitas
3. Establece fechas de búsqueda
4. Aplica filtros (personal, ruta, paradero)
5. Genera el reporte
6. Descarga o imprime si es necesario

---

## 👥 Usuarios

### ¿Qué es?
Administración centralizada de todas las personas que tienen acceso al sistema. Solo Jefatura/Oferente pueden acceder.

### ¿Qué puedes hacer?

#### **Ver Todos los Usuarios**
- Lista completa de usuarios del sistema
- Información: nombre, usuario, rol, estado

#### **Crear Nuevo Usuario**
1. Haz clic en "Crear Usuario"
2. Ingresa datos:
   - **Nombre Completo**: Nombre de la persona
   - **Usuario**: Nombre de usuario único
   - **Contraseña**: Credencial de acceso
   - **Rol**: Selecciona terreno, jefatura u oferente
   - **Email** (opcional): Para recuperación de contraseña

3. Guarda el usuario

#### **Editar/Eliminar Usuarios**
- Modifica información de usuarios existentes
- Cambia roles si es necesario
- Desactiva usuarios que se van

#### **Gestionar Permisos**

Cada rol tiene acceso a diferentes módulos:

| Módulo | Terreno | Jefatura | Oferente |
|--------|---------|----------|----------|
| Dashboard | ✓ | ✓ | ✓ |
| Paraderos | ✓ | ✓ | ✓ |
| Órdenes | ✓ | ✓ | ✓ |
| Reportes | ✗ | ✓ | ✓ |
| Usuarios | ✗ | ✓ | ✓ |
| Rutas | ✗ | ✓ | ✓ |
| Formularios | ✓ | ✓ | ✓ |
| Mi Cuenta | ✓ | ✓ | ✓ |

---

## ⚙️ Mi Cuenta

### ¿Qué es?
Tu espacio personal donde administras tu perfil y configuración de seguridad.

### ¿Qué puedes hacer?

#### **Ver Mi Información**
- Tu nombre completo
- Tu usuario
- Tu rol en el sistema
- Tu email (si está registrado)

#### **Cambiar Contraseña**
1. Haz clic en "Cambiar Contraseña"
2. Ingresa tu contraseña actual
3. Digita la nueva contraseña
4. Confirma la nueva contraseña
5. Guarda los cambios

#### **Editar Perfil**
- Actualiza tu nombre
- Modifica tu email
- Otros datos de contacto

#### **Cerrar Sesión**
- Sal de forma segura del sistema
- Tu sesión se cierra completamente

---

## 🎯 Flujo de Trabajo Típico (Ejemplo)

Para entender mejor cómo funcionan los módulos juntos, aquí hay un ejemplo día a día:

### **Día 1: Planificación (Jefatura)**

1. **Revisa el Dashboard**: Ve qué paraderos necesitan mantenimiento
2. **Crea una Ruta**: Agrupa 10 paraderos en el centro que no han sido visitados
3. **Crea Órdenes de Trabajo**: Asigna la ruta al equipo de terreno para mañana
4. **Supervisa**: Ve que las órdenes se hayan enviado correctamente

### **Día 2: Ejecución (Terreno)**

1. **Revisa Órdenes**: Ve las tareas asignadas
2. **Va al Terreno**: Sigue la ruta, visitando cada paradero en orden
3. **Realiza el Trabajo**: Limpia/repara según sea necesario
4. **Completa Formularios**: Después de cada visita, documenta lo hecho
5. **Toma Fotos**: Evidencia del trabajo realizado

### **Día 3: Análisis (Jefatura)**

1. **Revisa Formularios**: Valida que el trabajo se completó
2. **Genera Reportes**: Analiza productividad y problemas encontrados
3. **Planifica Siguiente**: Ve qué paraderos necesitan seguimiento
4. **Retroalimenta**: Comunica resultados al equipo

---

## 💡 Consejos Útiles

- ✅ Sé específico en descripciones de órdenes - ayuda al equipo de terreno
- ✅ Toma fotos claras en los formularios - documenta evidencia
- ✅ Completa formularios el mismo día - información está fresca
- ✅ Revisa regularmente el Dashboard - sé proactivo ante problemas
- ✅ Agrupa paraderos lógicamente - las rutas mejoran eficiencia
- ✅ Descarga reportes regularmente - analiza tendencias

---

## 🆘 Preguntas Frecuentes

**P: ¿Perdí mi contraseña, qué hago?**
R: Contacta a tu administrador del sistema (Jefatura/Oferente) para que te la reinicie.

**P: ¿Puedo crear paraderos siendo personal de terreno?**
R: No, solo Jefatura/Oferente pueden crear paraderos. El terreno puede reportar ubicaciones en formularios.

**P: ¿Qué pasa si no completo una orden a tiempo?**
R: Aparecerá en el reportes como atrasada. Tu supervisor te contactará.

**P: ¿Puedo acceder desde mi celular?**
R: Sí, el sistema es responsive. Accede desde cualquier navegador web.

**P: ¿Con qué frecuencia debo visitar una parada?**
R: Eso lo define tu supervisor según el plan de mantenimiento. Revisa tus órdenes de trabajo.

---

## 📞 Soporte

Si necesitas ayuda adicionalmente:
- Contacta a tu Jefatura inmediato
- O ponte en contacto con el administrador del sistema

---

**Última actualización**: Febrero 2026
**Versión**: 1.0
