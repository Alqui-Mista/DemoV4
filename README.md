# Demo Project - React 3D & 2D

Un proyecto React moderno que combina páginas 3D y 2D con las siguientes tecnologías:

## 🚀 Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **React Router** para navegación entre páginas
- **Three.js + React Three Fiber** para elementos 3D
- **React Three Drei** para helpers y componentes 3D

## 📁 Estructura del Proyecto

```
src/
├── pages/           # Páginas principales
│   ├── HomePage.tsx        # Página 3D
│   ├── VapiButtom.tsx      # Página 2D
│   └── VapiButtom.css      # Estilos para VapiButtom
├── components/      # Componentes reutilizables
│   ├── Navigation.tsx      # Navegación principal
│   └── Navigation.css      # Estilos de navegación
├── hooks/          # Custom hooks (vacío para desarrollo)
├── utils/          # Funciones utilitarias (vacío para desarrollo)
├── styles/         # Archivos de estilos (vacío para desarrollo)
└── main.tsx        # Punto de entrada
```

## 🎯 Páginas del Proyecto

### HomePage (3D)
- Página con elementos tridimensionales usando Three.js
- Canvas 3D con controles de órbita
- Ambiente y iluminación configurados
- Lista para desarrollo de modelos 3D

### VapiButtom (2D)
- Página tradicional 2D con diseño moderno
- Gradientes y efectos visuales
- Diseño responsivo
- Estructura modular para desarrollo

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en modo watch

### Construcción
```bash
npm run build
```
Construye la aplicación para producción

### Vista Previa
```bash
npm run preview
```
Previsualiza la construcción de producción

### Linting
```bash
npm run lint
```
Ejecuta ESLint para revisar el código

## 🎨 Características de Diseño

- **Navegación fija** con efecto blur
- **Tema oscuro** como base
- **Colores vibrantes** (#64ffda, gradientes)
- **Animaciones suaves** y transiciones
- **Diseño responsivo** para móviles
- **Tipografía moderna** (Inter, Arial)

## 📦 Dependencias Principales

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "three": "^0.x",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "typescript": "^5.x",
  "vite": "^7.x"
}
```

## 🚀 Próximos Pasos para Desarrollo

1. **HomePage (3D)**:
   - Agregar modelos 3D personalizados
   - Implementar interacciones
   - Configurar animaciones

2. **VapiButtom (2D)**:
   - Desarrollar el contenido específico
   - Agregar formularios o funcionalidades
   - Implementar componentes interactivos

3. **Componentes Globales**:
   - Crear hooks personalizados en `/hooks`
   - Desarrollar utilidades en `/utils`
   - Expandir estilos en `/styles`

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Dispositivos móviles

---

**¡El proyecto está listo para comenzar el desarrollo!** 🎉
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
