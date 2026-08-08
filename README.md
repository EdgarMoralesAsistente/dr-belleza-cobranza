# Dr. Belleza - Sistema de Gestión Médica & Financiamiento Estético

Sistema integral para clínicas estéticas y cirugía plástica. Permite gestionar pacientes, planes de financiamiento inmutables, cuotas, abonos, recibos oficiales imprimibles, CRM de seguimiento con alarmas, control de accesos de usuarios y sincronización bidireccional con **Google Sheets** a través de **Google Apps Script API**.

---

## 🚀 Despliegue en Vercel & GitHub

### 1. Subir a GitHub
1. Inicializa el repositorio local si aún no lo has hecho:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Dr. Belleza App"
   ```
2. Crea un repositorio en GitHub y conéctalo:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/dr-belleza-app.git
   git branch -M main
   git push -u origin main
   ```

### 2. Despliegue en Vercel
1. Ingresa a [Vercel](https://vercel.com) y haz clic en **"Add New Project"**.
2. Importa tu repositorio de GitHub `dr-belleza-app`.
3. Vercel detectará automáticamente que es un proyecto **Vite**.
4. En la configuración de build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Haz clic en **Deploy**. ¡El proyecto cuenta con `vercel.json` configurado para enrutamiento SPA!

---

## 📊 Sincronización con Google Sheets (Google Apps Script)

El sistema incluye integración nativa con Google Sheets sin necesidad de claves de API complejas de GCP. Utiliza un script ejecutable de Google Apps Script (`Code.gs`).

### Pasos para conectar Google Sheets:
1. Abre [Google Drive](https://drive.google.com) y crea una nueva hoja de cálculo llamada **"Dr. Belleza - BD Médica"**.
2. En el menú superior de Google Sheets, ve a **Extensiones -> Apps Script**.
3. Borra el código predeterminado que aparece en el editor.
4. En tu app **Dr. Belleza**, ve al módulo **Configuración -> Pestaña Google Sheets**.
5. Haz clic en **"Copiar Script Code.gs al Portapapeles"** (o copia el contenido del archivo `src/gas/codeGs.ts`).
6. Pega todo el código en el editor de Apps Script.
7. Guarda los cambios ($Ctrl + S$) y ejecuta la función `setupSpreadsheet()` una sola vez para estructurar automáticamente las 5 pestañas (*Pacientes, Pagos, Usuarios, Actividades_CRM, Financiamiento_Cirugias*).
8. Haz clic en **Desplegar -> Nuevo despliegue**:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo (*tu cuenta*)
   - **Quién tiene acceso**: Cualquier persona (*Anyone*)
9. Haz clic en **Desplegar**, otorga los permisos necesarios y **copia la URL de la aplicación web** generada (empieza por `https://script.google.com/macros/s/...`).
10. Regresa a la app **Dr. Belleza**, pega la URL en la sección de Google Sheets y presiona **"Guardar y Probar Conexión"**.

---

## 🔒 Lógica de Protección Inmutable e Historicidad

- **Protección de Precios**: Los cambios de precio en el catálogo de procedimientos quirúrgicos solo aplican a nuevos presupuestos y pacientes registradas a partir del cambio. Las pacientes con plan registrado conservan su monto acordado inmutable.
- **Protección de Cuotas y Cupones**: Modificar o eliminar cupones o planes de financiamiento en Configuración no afecta a los negocios o contratos registrados con anterioridad.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons.
- **Animaciones**: Motion (Framer Motion).
- **Almacenamiento Local**: LocalStorage con migración automática a Google Sheets vía REST API.
- **Servidor SSR / Preview**: Express + Vite.
