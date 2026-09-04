import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Dr. Belleza - Medical & Aesthetic Financing App",
      timestamp: new Date().toISOString()
    });
  });

  // Endpoint para obtener y compartir la URL de Google Apps Script centralizada
  let sharedGasUrl = process.env.VITE_GAS_URL || process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbzEzjHBbjl2rXUO0yuhV3qL7bbHbAJJB-XKeJoMNDdeUeWfU0M6vB4EdEGCVjD-lDb61Q/exec";
  let sharedCatalog: any[] = [];

  app.get("/api/gas-config", (req, res) => {
    res.json({
      success: true,
      gasUrl: sharedGasUrl || process.env.VITE_GAS_URL || process.env.GAS_URL || ""
    });
  });

  app.post("/api/gas-config", (req, res) => {
    const { gasUrl } = req.body;
    if (gasUrl && typeof gasUrl === "string") {
      sharedGasUrl = gasUrl.trim();
      return res.json({ success: true, gasUrl: sharedGasUrl });
    }
    return res.status(400).json({ error: "Invalid gasUrl" });
  });

  // Endpoints para Catálogo Quirúrgico Centralizado Multi-usuario
  app.get("/api/catalog", (req, res) => {
    res.json({
      success: true,
      catalog: sharedCatalog
    });
  });

  // Endpoints para Registro Centralizado de Usuarios Eliminados (Tombstones)
  const sharedDeletedUserIdentifiers = new Set<string>([
    'USR-973', 'USR-706', 'USR-617', 'USR-305', 'USR-421', 'USR-923', 'USR-893',
    'YOLY@BECERRA.COM', 'GERANINCHIQUI@GMAIL.COM', 'GERALDINE@RINCON.COM',
    'GERALDINE@PRUEBAS.COM', 'PRUEBA@PRUEBA1.COM',
    'DRA.ISABELLA@DRBELLEZA.COM', 'MARIA.CRM@DRBELLEZA.COM', 'DR.MENDOZA@DRBELLEZA.COM',
    'CARLOS.FINANZAS@DRBELLEZA.COM', 'MENDOZA@DRBELLEZA.COM', 'VALERIA@DRBELLEZA.COM'
  ]);

  app.get("/api/deleted-users", (req, res) => {
    res.json({
      success: true,
      deletedUserIds: Array.from(sharedDeletedUserIdentifiers)
    });
  });

  app.post("/api/deleted-users", (req, res) => {
    const { id, email, ids, emails } = req.body;
    if (id && typeof id === 'string') sharedDeletedUserIdentifiers.add(id.trim().toUpperCase());
    if (email && typeof email === 'string') sharedDeletedUserIdentifiers.add(email.trim().toUpperCase());
    if (Array.isArray(ids)) {
      ids.forEach(i => {
        if (i && typeof i === 'string') sharedDeletedUserIdentifiers.add(i.trim().toUpperCase());
      });
    }
    if (Array.isArray(emails)) {
      emails.forEach(e => {
        if (e && typeof e === 'string') sharedDeletedUserIdentifiers.add(e.trim().toUpperCase());
      });
    }
    return res.json({
      success: true,
      deletedUserIds: Array.from(sharedDeletedUserIdentifiers)
    });
  });

  app.delete("/api/deleted-users", (req, res) => {
    const { id, email } = req.body;
    if (id && typeof id === 'string') sharedDeletedUserIdentifiers.delete(id.trim().toUpperCase());
    if (email && typeof email === 'string') sharedDeletedUserIdentifiers.delete(email.trim().toUpperCase());
    return res.json({
      success: true,
      deletedUserIds: Array.from(sharedDeletedUserIdentifiers)
    });
  });

  app.post("/api/catalog", (req, res) => {
    const { catalog } = req.body;
    if (Array.isArray(catalog)) {
      const map = new Map<string, any>();
      // Preservar catálogo anterior y mezclar
      sharedCatalog.forEach(p => {
        if (p && p.nombre) map.set(String(p.nombre).trim().toLowerCase(), p);
      });
      catalog.forEach(p => {
        if (p && p.nombre) map.set(String(p.nombre).trim().toLowerCase(), p);
      });
      sharedCatalog = Array.from(map.values());
      return res.json({ success: true, catalog: sharedCatalog });
    }
    return res.status(400).json({ error: "Invalid catalog array" });
  });

  // Proxy endpoint para Google Apps Script con filtro de seguridad anti-reaparición
  app.post("/api/gas-proxy", async (req, res) => {
    const { gasUrl, payload } = req.body;
    if (!gasUrl) {
      return res.status(400).json({ error: "Missing gasUrl" });
    }

    const modifiedPayload = payload ? { ...payload } : {};

    // 1. Bloquear estrictamente re-subida de usuarios eliminados
    if (modifiedPayload.action === "saveUsuario" && modifiedPayload.usuario) {
      const uId = String(modifiedPayload.usuario.usuarioId || "").trim().toUpperCase();
      const uEmail = String(modifiedPayload.usuario.email || "").trim().toUpperCase();
      if (sharedDeletedUserIdentifiers.has(uId) || sharedDeletedUserIdentifiers.has(uEmail)) {
        return res.json({ success: true, message: "Usuario bloqueado permanentemente de Sheets por eliminación previa." });
      }
    }

    // 2. Filtrar listas completas enviadas a Sheets para expurgar cualquier usuario eliminado
    if (Array.isArray(modifiedPayload.usuarios)) {
      modifiedPayload.usuarios = modifiedPayload.usuarios.filter((u: any) => {
        const uId = String(u.usuarioId || u.Usuario_ID || "").trim().toUpperCase();
        const uEmail = String(u.email || u.Email || "").trim().toUpperCase();
        return !sharedDeletedUserIdentifiers.has(uId) && !sharedDeletedUserIdentifiers.has(uEmail);
      });
    }

    // 3. Bloquear registros de pacientes fantasmas (V-00000000 o sin cédula o paciente sin nombre)
    if ((modifiedPayload.action === "addPaciente" || modifiedPayload.action === "updatePaciente") && modifiedPayload.paciente) {
      const pCed = String(modifiedPayload.paciente.cedula || "").trim().toUpperCase();
      const pNom = String(modifiedPayload.paciente.nombre || "").trim().toLowerCase();
      const pId = String(modifiedPayload.paciente.id || "").trim().toUpperCase();
      const digitsOnly = pCed.replace(/[^0-9]/g, "");
      if (!pCed || pCed === "V-00000000" || pCed === "V- 00000000" || digitsOnly === "00000000" || digitsOnly === "0" || pNom === "paciente sin nombre" || !pNom || pId === "PAC-000") {
        console.warn("gas-proxy: Bloqueado intento de guardar paciente fantasma o sin cédula válida:", pCed, pNom);
        return res.json({ success: true, message: "Registro fantasma bloqueado por validación de seguridad." });
      }
    }

    // 4. Bloquear financiamientos asociados a pacientes fantasmas (PAC-000)
    if (modifiedPayload.action === "saveFinanciamiento" && modifiedPayload.financiamiento) {
      const pId = String(modifiedPayload.financiamiento.pacienteId || modifiedPayload.financiamiento.Paciente_ID || "").trim().toUpperCase();
      if (!pId || pId === "PAC-000") {
        console.warn("gas-proxy: Bloqueado intento de guardar financiamiento asociado a paciente fantasma PAC-000");
        return res.json({ success: true, message: "Financiamiento fantasma bloqueado por validación de seguridad." });
      }
    }

    // 5. Si se envía syncFullDatabase o listas completas, purgar pacientes y financiamientos fantasmas
    if (Array.isArray(modifiedPayload.pacientes)) {
      modifiedPayload.pacientes = modifiedPayload.pacientes.filter((p: any) => {
        const pCed = String(p.cedula || p.CEDULA || "").trim().toUpperCase();
        const pNom = String(p.nombre || p.NOMBRE || "").trim().toLowerCase();
        const pId = String(p.id || p.ID || "").trim().toUpperCase();
        const digitsOnly = pCed.replace(/[^0-9]/g, "");
        if (!pCed || pCed === "V-00000000" || pCed === "V- 00000000" || digitsOnly === "00000000" || digitsOnly === "0" || pNom === "paciente sin nombre" || !pNom || pId === "PAC-000") {
          return false;
        }
        return true;
      });
    }

    if (Array.isArray(modifiedPayload.financiamientos)) {
      modifiedPayload.financiamientos = modifiedPayload.financiamientos.filter((f: any) => {
        const pId = String(f.pacienteId || f.Paciente_ID || "").trim().toUpperCase();
        return Boolean(pId && pId !== "PAC-000");
      });
    }

    try {
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(modifiedPayload),
        redirect: "follow",
      });

      const rawText = await response.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        const isHtml = rawText.trim().startsWith("<");
        if (isHtml) {
          console.warn("Aviso en gas-proxy: Apps Script retornó HTML (posible página de estado o cuota temporal):", rawText.slice(0, 100));
          return res.json({
            success: response.ok,
            message: "Petición procesada por Google Apps Script.",
            isHtml: true
          });
        }
        return res.json({
          success: response.ok,
          message: rawText
        });
      }

      return res.json(data);
    } catch (err: any) {
      console.warn("Aviso de conexión en gas-proxy:", err?.message || err);
      return res.status(200).json({ success: false, error: err?.message || "Failed to communicate with Apps Script" });
    }
  });

  // Endpoint para purga directa y definitiva en Google Sheets desde el backend
  app.post("/api/purge-users", async (req, res) => {
    const gasUrl = sharedGasUrl || process.env.VITE_GAS_URL || process.env.GAS_URL || "";
    if (!gasUrl) {
      return res.status(400).json({ error: "GAS URL no configurada" });
    }

    try {
      // 1. Obtener usuarios actuales de Sheets
      const getRes = await fetch(`${gasUrl}?action=getAllData`, { redirect: "follow" });
      const getText = await getRes.text();
      let allData: any;
      try {
        allData = JSON.parse(getText);
      } catch {
        return res.status(200).json({ success: false, error: "No se pudieron obtener los datos de Sheets (respuesta no JSON)" });
      }

      if (!allData || !Array.isArray(allData.usuarios)) {
        return res.status(200).json({ success: false, error: "No se pudieron obtener los datos de Sheets" });
      }

      // 2. Filtrar únicamente usuarios válidos no eliminados
      const cleanUsers = allData.usuarios.filter((u: any) => {
        const uId = String(u.Usuario_ID || u.usuarioId || "").trim().toUpperCase();
        const uEmail = String(u.Email || u.email || "").trim().toUpperCase();
        if (!uEmail || !uEmail.includes("@")) return false;
        return !sharedDeletedUserIdentifiers.has(uId) && !sharedDeletedUserIdentifiers.has(uEmail);
      }).map((u: any) => ({
        usuarioId: u.Usuario_ID || u.usuarioId,
        nombre: u.Nombre || u.nombre,
        email: u.Email || u.email,
        passwordHash: u.Password_Hash || u.passwordHash || "clave123",
        rol: u.Rol || u.rol || "Asistente",
        estatus: u.Estatus || u.estatus || "Activo",
        fechaCreacion: u.Fecha_Creacion || u.fechaCreacion || new Date().toISOString().split("T")[0],
        fotoUrl: u.Foto_Url || u.fotoUrl || ""
      }));

      // 3. Sobrescribir hoja de usuarios usando syncFullDatabase
      const postRes = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "syncFullDatabase", usuarios: cleanUsers }),
        redirect: "follow"
      });
      const postText = await postRes.text();
      let postData: any;
      try {
        postData = JSON.parse(postText);
      } catch {
        postData = { success: postRes.ok, message: postText };
      }

      return res.json({
        success: true,
        message: "Google Sheets purgado exitosamente.",
        remainingUsers: cleanUsers,
        sheetResult: postData
      });
    } catch (err: any) {
      return res.status(200).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Endpoint para purga de registros fantasmas (V-00000000 y PAC-000) en Google Sheets
  app.post("/api/purge-ghosts", async (req, res) => {
    const gasUrl = sharedGasUrl || process.env.VITE_GAS_URL || process.env.GAS_URL || "";
    if (!gasUrl) {
      return res.status(400).json({ error: "GAS URL no configurada" });
    }

    try {
      let maxPasses = 5;
      let pass = 0;
      let lastGhostsCount = 0;
      let lastGhostFinCount = 0;

      while (pass < maxPasses) {
        pass++;
        // 1. Eliminar pacientes V-00000000
        await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "deletePaciente", cedula: "V-00000000" }),
          redirect: "follow"
        });

        // 2. Eliminar financiamientos PAC-000
        await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "deletePaciente", pacienteId: "PAC-000" }),
          redirect: "follow"
        });

        // 3. Verificar estado actual
        const checkRes = await fetch(`${gasUrl}?action=getAllData`, { redirect: "follow" });
        const checkData = await checkRes.json();
        const ghosts = (checkData.pacientes || []).filter((p: any) => {
          const ced = String(p.cedula || p.CEDULA || "").trim().toUpperCase();
          const nom = String(p.nombre || p.NOMBRE || "").trim().toLowerCase();
          const pId = String(p.id || p.ID || "").trim().toUpperCase();
          const digits = ced.replace(/[^0-9]/g, "");
          return !ced || ced === "V-00000000" || ced === "V- 00000000" || digits === "00000000" || digits === "0" || nom === "paciente sin nombre" || !nom || pId === "PAC-000";
        });
        const ghostFin = (checkData.financiamientos || []).filter((f: any) => {
          const pId = String(f.Paciente_ID || f.pacienteId || "").trim().toUpperCase();
          return !pId || pId === "PAC-000";
        });

        lastGhostsCount = ghosts.length;
        lastGhostFinCount = ghostFin.length;

        if (lastGhostsCount === 0 && lastGhostFinCount === 0) {
          break;
        }
      }

      return res.json({
        success: true,
        message: "Purga de registros fantasmas completada con éxito.",
        ghostsRemaining: lastGhostsCount,
        ghostFinRemaining: lastGhostFinCount,
        passesExecuted: pass
      });
    } catch (err: any) {
      return res.status(200).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dr. Belleza] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
