# Guía de Despliegue

## Opciones de Despliegue

### Opción 1: Vercel (Recomendado para Next.js) ⭐

Vercel es la plataforma creada por el equipo de Next.js, por lo que es la más fácil y optimizada.

#### Pasos:

1. **Instalar Vercel CLI** (opcional, también puedes usar la interfaz web):
   ```bash
   npm i -g vercel
   ```

2. **Desplegar**:
   ```bash
   vercel
   ```
   O simplemente conecta tu repositorio de GitHub en [vercel.com](https://vercel.com)

3. **Configurar Variables de Entorno**:
   En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave anónima de Supabase

4. **¡Listo!** Vercel detecta automáticamente que es Next.js y configura todo.

---

### Opción 2: Netlify

#### Pasos:

1. **Crear cuenta en Netlify** en [netlify.com](https://netlify.com)

2. **Conectar repositorio**:
   - Si tienes el código en GitHub/GitLab/Bitbucket, conéctalo desde el dashboard
   - O arrastra la carpeta desde la interfaz web

3. **Configurar Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next` (Netlify lo detecta automáticamente con el plugin)

4. **Configurar Variables de Entorno**:
   En Site settings > Environment variables, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave anónima de Supabase

5. **Instalar plugin de Next.js** (si no se instala automáticamente):
   - En el dashboard, ve a Plugins
   - Busca "@netlify/plugin-nextjs" e instálalo

6. **Desplegar**: Netlify desplegará automáticamente en cada push a la rama principal

---

## Variables de Entorno Necesarias

Asegúrate de configurar estas variables en tu plataforma de despliegue:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

**⚠️ IMPORTANTE**: Estas variables deben empezar con `NEXT_PUBLIC_` para que estén disponibles en el navegador.

---

## Verificar el Despliegue

Después de desplegar:

1. ✅ Verifica que la página carga correctamente
2. ✅ Prueba el login/registro
3. ✅ Prueba el scanner QR desde un celular (debe pedir permisos de cámara)
4. ✅ Verifica que los tickets se pueden escanear
5. ✅ Verifica que un QR no se puede escanear dos veces

---

## Notas sobre el Scanner QR

- ✅ Funciona en dispositivos móviles (celular/tablet)
- ✅ Requiere permisos de cámara
- ✅ Protegido contra escaneos duplicados (un QR solo se puede usar una vez)
- ✅ Muestra mensaje claro si el ticket ya fue utilizado
- ✅ Permite escanear múltiples tickets seguidos sin reiniciar

---

## Solución de Problemas

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifica que las variables de entorno estén configuradas en tu plataforma de despliegue
- Asegúrate de que empiecen con `NEXT_PUBLIC_`

### El scanner no funciona en el celular
- Verifica que el sitio esté usando HTTPS (requerido para acceder a la cámara)
- Asegúrate de dar permisos de cámara cuando el navegador lo solicite

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de usar Node.js 18 o superior

