# Modelo Entidad-Relación (MER) - Sistema de Gestión de Películas y Series

## 1. Entidades Principales

### 1.1 GÉNERO
**Descripción:** Categorías o géneros cinematográficos
- **id_genero** (PK) - INTEGER - Identificador único del género
- **nombre** - VARCHAR(100) - Nombre del género (Acción, Drama, Comedia, etc.)
- **descripcion** - TEXT - Descripción detallada del género
- **estado** - BOOLEAN - Estado activo/inactivo
- **fecha_creacion** - DATETIME - Fecha de creación del registro
- **fecha_actualizacion** - DATETIME - Fecha de última actualización

### 1.2 DIRECTOR
**Descripción:** Directores de películas y series
- **id_director** (PK) - INTEGER - Identificador único del director
- **nombre** - VARCHAR(100) - Nombre completo del director
- **apellido** - VARCHAR(100) - Apellido del director
- **fecha_nacimiento** - DATE - Fecha de nacimiento
- **nacionalidad** - VARCHAR(50) - País de origen
- **biografia** - TEXT - Biografía del director
- **estado** - BOOLEAN - Estado activo/inactivo
- **fecha_creacion** - DATETIME - Fecha de creación del registro
- **fecha_actualizacion** - DATETIME - Fecha de última actualización

### 1.3 PRODUCTORA
**Descripción:** Compañías productoras de contenido audiovisual
- **id_productora** (PK) - INTEGER - Identificador único de la productora
- **nombre** - VARCHAR(150) - Nombre de la productora
- **pais_origen** - VARCHAR(50) - País de origen de la productora
- **fundacion** - DATE - Fecha de fundación
- **descripcion** - TEXT - Descripción de la productora
- **sitio_web** - VARCHAR(255) - URL del sitio web oficial
- **estado** - BOOLEAN - Estado activo/inactivo
- **fecha_creacion** - DATETIME - Fecha de creación del registro
- **fecha_actualizacion** - DATETIME - Fecha de última actualización

### 1.4 TIPO
**Descripción:** Clasificación del tipo de contenido
- **id_tipo** (PK) - INTEGER - Identificador único del tipo
- **nombre** - VARCHAR(50) - Nombre del tipo (Película, Serie, Documental, etc.)
- **descripcion** - TEXT - Descripción del tipo de contenido
- **estado** - BOOLEAN - Estado activo/inactivo
- **fecha_creacion** - DATETIME - Fecha de creación del registro
- **fecha_actualizacion** - DATETIME - Fecha de última actualización

### 1.5 MEDIA (Entidad Principal)
**Descripción:** Películas y series del sistema
- **id_media** (PK) - INTEGER - Identificador único del contenido
- **titulo** - VARCHAR(200) - Título de la película/serie
- **sinopsis** - TEXT - Resumen del argumento
- **fecha_estreno** - DATE - Fecha de estreno
- **duracion** - INTEGER - Duración en minutos (para películas)
- **temporadas** - INTEGER - Número de temporadas (para series)
- **episodios** - INTEGER - Número total de episodios (para series)
- **calificacion** - DECIMAL(3,1) - Calificación promedio (1.0 - 10.0)
- **poster_url** - VARCHAR(500) - URL de la imagen del poster
- **trailer_url** - VARCHAR(500) - URL del trailer
- **estado** - BOOLEAN - Estado activo/inactivo
- **fecha_creacion** - DATETIME - Fecha de creación del registro
- **fecha_actualizacion** - DATETIME - Fecha de última actualización
- **id_tipo** (FK) - INTEGER - Referencia a TIPO
- **id_director** (FK) - INTEGER - Referencia a DIRECTOR
- **id_productora** (FK) - INTEGER - Referencia a PRODUCTORA

## 2. Entidad de Relación

### 2.1 MEDIA_GENERO (Tabla de Relación Many-to-Many)
**Descripción:** Relación entre Media y Géneros (una película puede tener múltiples géneros)
- **id_media_genero** (PK) - INTEGER - Identificador único de la relación
- **id_media** (FK) - INTEGER - Referencia a MEDIA
- **id_genero** (FK) - INTEGER - Referencia a GÉNERO
- **fecha_asignacion** - DATETIME - Fecha de asignación del género

## 3. Relaciones del Modelo

### 3.1 Relaciones Uno a Muchos (1:N)
1. **TIPO → MEDIA**
   - Un tipo puede tener muchas medias
   - Una media pertenece a un solo tipo

2. **DIRECTOR → MEDIA**
   - Un director puede dirigir muchas medias
   - Una media tiene un director principal

3. **PRODUCTORA → MEDIA**
   - Una productora puede producir muchas medias
   - Una media es producida por una productora principal

### 3.2 Relaciones Muchos a Muchos (N:M)
1. **MEDIA ↔ GÉNERO** (a través de MEDIA_GENERO)
   - Una media puede pertenecer a múltiples géneros
   - Un género puede estar presente en múltiples medias

## 4. Diagrama Conceptual del MER

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GÉNERO    │    │  DIRECTOR   │    │ PRODUCTORA  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id_genero   │    │ id_director │    │id_productora│
│ nombre      │    │ nombre      │    │ nombre      │
│ descripcion │    │ apellido    │    │ pais_origen │
│ estado      │    │ fecha_nac   │    │ fundacion   │
│ fecha_crea  │    │ nacionalidad│    │ descripcion │
│ fecha_act   │    │ biografia    │    │ sitio_web   │
└─────────────┘    │ estado      │    │ estado      │
       │           │ fecha_crea  │    │ fecha_crea  │
       │           │ fecha_act   │    │ fecha_act   │
       │           └─────────────┘    └─────────────┘
       │                  │                   │
       │                  │                   │
       │                  ▼                   │
       │           ┌─────────────┐            │
       │           │    TIPO     │            │
       │           ├─────────────┤            │
       │           │ id_tipo     │            │
       │           │ nombre      │            │
       │           │ descripcion │            │
       │           │ estado      │            │
       │           │ fecha_crea  │            │
       │           │ fecha_act   │            │
       │           └─────────────┘            │
       │                  │                   │
       │                  ▼                   ▼
       │           ┌─────────────────────────────┐
       │           │           MEDIA             │
       │           ├─────────────────────────────┤
       │           │ id_media                    │
       │           │ titulo                      │
       │           │ sinopsis                    │
       │           │ fecha_estreno               │
       │           │ duracion                    │
       │           │ temporadas                  │
       │           │ episodios                   │
       │           │ calificacion                │
       │           │ poster_url                  │
       │           │ trailer_url                 │
       │           │ estado                      │
       │           │ fecha_creacion              │
       │           │ fecha_actualizacion         │
       │           │ id_tipo (FK)                │
       │           │ id_director (FK)            │
       │           │ id_productora (FK)          │
       │           └─────────────────────────────┘
       │                          │
       │                          │
       └──────────────────────────┼─────────────────────────┐
                                  │                         │
                                  ▼                         │
                          ┌─────────────┐                   │
                          │MEDIA_GENERO │                   │
                          ├─────────────┤                   │
                          │id_media_gen │                   │
                          │id_media (FK)│◄──────────────────┘
                          │id_genero(FK)│
                          │fecha_asign  │
                          └─────────────┘
```

## 5. Reglas de Negocio

1. **Integridad Referencial:**
   - Toda media debe tener un tipo, director y productora asignados
   - No se puede eliminar un tipo, director o productora si tiene medias asociadas

2. **Validaciones:**
   - Los nombres de géneros, directores y productoras deben ser únicos
   - Las fechas de estreno no pueden ser futuras
   - La calificación debe estar entre 1.0 y 10.0
   - La duración debe ser mayor a 0 para películas

3. **Estados:**
   - Todos los registros manejan estado activo/inactivo
   - Los registros inactivos no se muestran en consultas públicas

4. **Auditoría:**
   - Todas las entidades registran fecha de creación y actualización
   - Se mantiene trazabilidad de cambios

## 6. Índices Recomendados

- **MEDIA:** índices en titulo, fecha_estreno, calificacion
- **DIRECTOR:** índice en nombre + apellido
- **GÉNERO:** índice en nombre
- **PRODUCTORA:** índice en nombre
- **MEDIA_GENERO:** índice compuesto en (id_media, id_genero)

Este modelo permite una gestión completa y escalable del sistema de películas y series, manteniendo la integridad de los datos y facilitando las consultas complejas.