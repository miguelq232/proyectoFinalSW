# IGCS SCZ - App Móvil

## Requisitos
- Flutter SDK instalado
- Android Studio o VS Code con extensión Flutter

## Instalación
1. Clonar el repositorio
2. Entrar a la carpeta mobil/
3. Copiar .env.example a .env y configurar:
 
4. Instalar dependencias:
flutter pub get

5. Correr la app:
flutter run

## Estructura del proyecto
lib/
├── config/        → configuración de rutas, tema y constantes
├── modules/       → módulos por funcionalidad
│   ├── auth/      → login y registro
│   ├── vecino/    → pantallas del vecino
│   └── operador/  → pantallas del operador
└── shared/        → componentes y servicios compartidos

## Variables de entorno
Copia .env.example a .env y configura:
- IA_URL → URL del microservicio FastAPI de IA
