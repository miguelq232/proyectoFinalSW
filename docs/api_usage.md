# Manual de Uso de APIs: IGCS SCZ

Este documento sirve como guía de referencia rápida para el uso y consumo de las APIs REST expuestas por el backend del Sistema Inteligente de Gestión de Residuos Urbanos (IGCS SCZ).

---

## 1. Seguridad y Autenticación

Todas las solicitudes a las APIs (excepto registro público, inicio de sesión, salud del sistema y documentación de Swagger) requieren autenticación por medio de **JSON Web Tokens (JWT)**.

* **Cabecera requerida:** `Authorization`
* **Formato:** `Bearer <JWT_TOKEN>`

Ejemplo de cabecera:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. PB-01: Autenticación de Usuarios

### Inicio de Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/api/auth/login`
* **Descripción:** Valida credenciales de acceso y devuelve el token JWT del usuario.
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "email": "admin@igcsscz.com",
    "password": "miPasswordSeguro"
  }
  ```
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "admin@igcsscz.com",
    "rol": "ADMINISTRADOR",
    "nombre": "Administrador General"
  }
  ```
* **Respuestas de Error:**
  * `401 Unauthorized`: Credenciales incorrectas o usuario inactivo.

### Registro Público
* **Método:** `POST`
* **Ruta:** `/api/auth/register`
* **Descripción:** Permite a vecinos u operadores registrarse por su cuenta (no permite registro de administradores).
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "email": "vecino.nuevo@correo.com",
    "password": "Password123",
    "nombre": "Carlos",
    "apellido": "Guzmán",
    "telefono": "+591 76543210",
    "rol": "VECINO"
  }
  ```
* **Respuesta Exitosa (`210 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "vecino.nuevo@correo.com",
    "rol": "VECINO",
    "nombre": "Carlos"
  }
  ```

---

## 3. PB-02: Gestión de Usuarios

### Listar Todos los Usuarios
* **Método:** `GET`
* **Ruta:** `/api/usuarios`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "email": "admin@igcsscz.com",
      "nombre": "Administrador",
      "apellido": "General",
      "telefono": "+591 70000001",
      "rol": "ADMINISTRADOR",
      "activo": true,
      "fechaCreacion": "2026-05-31T09:00:00"
    },
    {
      "id": 2,
      "email": "operador.juan@igcsscz.com",
      "nombre": "Juan",
      "apellido": "López",
      "telefono": "+591 70000002",
      "rol": "OPERADOR",
      "activo": true,
      "fechaCreacion": "2026-05-31T09:05:00",
      "licencia": "Categoría T - Profesional",
      "turno": "Mañana"
    },
    {
      "id": 3,
      "email": "vecino.ana@correo.com",
      "nombre": "Ana",
      "apellido": "Suarez",
      "telefono": "+591 70000003",
      "rol": "VECINO",
      "activo": true,
      "fechaCreacion": "2026-05-31T09:10:00",
      "direccion": "Av. Banzer 4to Anillo",
      "latitud": -17.7834,
      "longitud": -63.1821,
      "codigoQR": "QR_DATA_BASE64",
      "puntosAcumulados": 150,
      "zonaId": 1,
      "zonaNombre": "Distrito Norte"
    }
  ]
  ```

### Registrar Nuevo Usuario (Interno)
* **Método:** `POST`
* **Ruta:** `/api/usuarios`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Permite a un administrador registrar a cualquier tipo de usuario (incluidos otros administradores) en el sistema.
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "email": "operador.pedro@igcsscz.com",
    "password": "PasswordPedro123",
    "nombre": "Pedro",
    "apellido": "Vargas",
    "telefono": "+591 70000004",
    "rol": "OPERADOR",
    "licencia": "Categoría B",
    "turno": "Tarde"
  }
  ```
* **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "id": 4,
    "email": "operador.pedro@igcsscz.com",
    "nombre": "Pedro",
    "apellido": "Vargas",
    "telefono": "+591 70000004",
    "rol": "OPERADOR",
    "activo": true,
    "fechaCreacion": "2026-05-31T09:15:30",
    "licencia": "Categoría B",
    "turno": "Tarde"
  }
  ```

### Actualizar Usuario
* **Método:** `PUT`
* **Ruta:** `/api/usuarios/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "email": "operador.pedro.nuevo@igcsscz.com",
    "password": "", 
    "nombre": "Pedro Antonio",
    "apellido": "Vargas",
    "telefono": "+591 70000099",
    "rol": "OPERADOR",
    "licencia": "Categoría C",
    "turno": "Noche"
  }
  ```
  *(Nota: Si el campo `password` se envía vacío o en blanco, la contraseña existente no se modificará)*.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 4,
    "email": "operador.pedro.nuevo@igcsscz.com",
    "nombre": "Pedro Antonio",
    "apellido": "Vargas",
    "telefono": "+591 70000099",
    "rol": "OPERADOR",
    "activo": true,
    "fechaCreacion": "2026-05-31T09:15:30",
    "licencia": "Categoría C",
    "turno": "Noche"
  }
  ```

### Habilitar / Deshabilitar Usuario (Toggle Activo)
* **Método:** `PATCH`
* **Ruta:** `/api/usuarios/{id}/activo`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Alterna lógicamente el estado activo/inactivo de un usuario.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 4,
    "activo": false
  }
  ```

### Eliminar Usuario
* **Método:** `DELETE`
* **Ruta:** `/api/usuarios/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`204 No Content`):** *(Cuerpo vacío)*

---

## 4. PB-03: Gestión de Vehículos (Camiones)

### Listar Todos los Vehículos
* **Método:** `GET`
* **Ruta:** `/api/camiones`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "placa": "3456-LPA",
      "modelo": "Nissan Condor",
      "anio": 2021,
      "color": "Verde",
      "estado": "ACTIVO",
      "fechaRegistro": "2026-05-31T09:00:00",
      "zonaId": 1,
      "zonaNombre": "Distrito Norte",
      "operadorId": 2,
      "operadorNombre": "Juan López"
    }
  ]
  ```

### Registrar Nuevo Vehículo
* **Método:** `POST`
* **Ruta:** `/api/camiones`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "placa": "8823-XCA",
    "modelo": "Volvo FMX",
    "anio": 2024,
    "color": "Blanco",
    "estado": "ACTIVO",
    "zonaId": 1,
    "operadorId": 2
  }
  ```
* **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "id": 2,
    "placa": "8823-XCA",
    "modelo": "Volvo FMX",
    "anio": 2024,
    "color": "Blanco",
    "estado": "ACTIVO",
    "fechaRegistro": "2026-05-31T09:20:00",
    "zonaId": 1,
    "zonaNombre": "Distrito Norte",
    "operadorId": 2,
    "operadorNombre": "Juan López"
  }
  ```

### Actualizar Vehículo
* **Método:** `PUT`
* **Ruta:** `/api/camiones/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "placa": "8823-XCA",
    "modelo": "Volvo FMX Super",
    "anio": 2024,
    "color": "Verde y Blanco",
    "estado": "EN_MANTENIMIENTO",
    "zonaId": 2,
    "operadorId": 4
  }
  ```
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 2,
    "placa": "8823-XCA",
    "modelo": "Volvo FMX Super",
    "anio": 2024,
    "color": "Verde y Blanco",
    "estado": "EN_MANTENIMIENTO",
    "fechaRegistro": "2026-05-31T09:20:00",
    "zonaId": 2,
    "zonaNombre": "Distrito Sur",
    "operadorId": 4,
    "operadorNombre": "Pedro Vargas"
  }
  ```

### Eliminar Vehículo
* **Método:** `DELETE`
* **Ruta:** `/api/camiones/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`204 No Content`):** *(Cuerpo vacío)*

---

## 5. PB-04: Gestión de Zonas de Recolección

### Listar Todas las Zonas
* **Método:** `GET`
* **Ruta:** `/api/zonas`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Distrito Norte",
      "descripcion": "Zona residencial de Equipetrol y aledaños",
      "latitudCentro": -17.7634,
      "longitudCentro": -63.1821,
      "radioKm": 3.5,
      "activa": true,
      "cantidadVecinos": 124,
      "cantidadCamiones": 2
    }
  ]
  ```

### Registrar Nueva Zona
* **Método:** `POST`
* **Ruta:** `/api/zonas`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "nombre": "Distrito Sur",
    "descripcion": "Zona sur abarcando Santos Dumont y Doble Vía La Guardia",
    "latitudCentro": -17.8251,
    "longitudCentro": -63.1945,
    "radioKm": 5.0,
    "activa": true
  }
  ```
* **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "id": 2,
    "nombre": "Distrito Sur",
    "descripcion": "Zona sur abarcando Santos Dumont y Doble Vía La Guardia",
    "latitudCentro": -17.8251,
    "longitudCentro": -63.1945,
    "radioKm": 5.0,
    "activa": true,
    "cantidadVecinos": 0,
    "cantidadCamiones": 0
  }
  ```

### Actualizar Zona
* **Método:** `PUT`
* **Ruta:** `/api/zonas/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "nombre": "Distrito Sur Ampliado",
    "descripcion": "Zona sur ampliada abarcando 5to anillo",
    "latitudCentro": -17.8251,
    "longitudCentro": -63.1945,
    "radioKm": 6.5,
    "activa": true
  }
  ```
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 2,
    "nombre": "Distrito Sur Ampliado",
    "descripcion": "Zona sur ampliada abarcando 5to anillo",
    "latitudCentro": -17.8251,
    "longitudCentro": -63.1945,
    "radioKm": 6.5,
    "activa": true,
    "cantidadVecinos": 0,
    "cantidadCamiones": 0
  }
  ```

### Habilitar / Deshabilitar Zona (Toggle Activa)
* **Método:** `PATCH`
* **Ruta:** `/api/zonas/{id}/activo`
* **Cabecera:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": 2,
    "activa": false
  }
  ```

### Eliminar Zona
* **Método:** `DELETE`
* **Ruta:** `/api/zonas/{id}`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Elimina físicamente la zona de la base de datos desvinculando de forma segura (seteando en NULL la zona_id) a vecinos y camiones asociados para preservar integridad referencial.
* **Respuesta Exitosa (`204 No Content`):** *(Cuerpo vacío)*

---

## 6. PB-05 a PB-09: Seguimiento GPS y Geolocalización

### Transmitir Coordenadas en Vivo (Operador)
* **Método:** `POST`
* **Ruta:** `/api/gps/actualizar`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Permite al operario reportar periódicamente la latitud y longitud actuales del camión recolector.
* **Cuerpo de la Petición (`application/json`):**
  ```json
  {
    "camionId": 1,
    "latitud": -17.785421,
    "longitud": -63.184312
  }
  ```
* **Respuesta Exitosa (`200 OK`):** *(Cuerpo vacío)*

### Obtener Ubicaciones Vivas Globales (Administrador)
* **Método:** `GET`
* **Ruta:** `/api/gps/camiones/vivo`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Obtiene las coordenadas en tiempo real de todos los vehículos que están transitando activamente.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "camionId": 1,
      "placa": "3456-LPA",
      "modelo": "Nissan Condor",
      "estado": "ACTIVO",
      "operadorNombre": "Juan López",
      "zonaId": 1,
      "zonaNombre": "Distrito Norte",
      "latitud": -17.785421,
      "longitud": -63.184312,
      "ultimaActualizacion": "2026-05-31T09:32:15"
    }
  ]
  ```

### Obtener Ubicaciones Vivas por Zona (Vecino)
* **Método:** `GET`
* **Ruta:** `/api/gps/zona/{zonaId}/vivo`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Lista los camiones en vivo que están recorriendo específicamente la zona provista.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  [
    {
      "camionId": 1,
      "placa": "3456-LPA",
      "modelo": "Nissan Condor",
      "estado": "ACTIVO",
      "operadorNombre": "Juan López",
      "zonaId": 1,
      "zonaNombre": "Distrito Norte",
      "latitud": -17.785421,
      "longitud": -63.184312,
      "ultimaActualizacion": "2026-05-31T09:32:15"
    }
  ]
  ```

### Consultar Alerta de Cercanía / Radar (Vecino)
* **Método:** `GET`
* **Ruta:** `/api/gps/cercano`
* **Cabecera:** `Authorization: Bearer <token>`
* **Descripción:** Mide la distancia geodésica entre el domicilio del vecino solicitante y el camión de basura activo más cercano en su zona. Retorna una alerta de cercanía (`cerca = true`) si la distancia es menor o igual a 500 metros.
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "cerca": true,
    "distanciaMetros": 412.35,
    "placa": "3456-LPA",
    "camionId": 1,
    "operadorNombre": "Juan López"
  }
  ```
* **Respuesta si no hay vehículos activos o si el vecino no ha georreferenciado su hogar (`200 OK`):**
  ```json
  {
    "cerca": false,
    "distanciaMetros": null,
    "placa": null,
    "camionId": null,
    "operadorNombre": null
  }
  ```
