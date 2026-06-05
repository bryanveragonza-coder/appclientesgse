
function getSheetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sheet") || params.get("sheetId") || "";
}

const SPREADSHEET_ID = getSheetIdFromUrl() || import.meta.env.VITE_SPREADSHEET_ID || "";

export function getActiveSpreadsheetId() {
  return SPREADSHEET_ID;
}

export const demoData = {
  project: {
    client: "SIN CONEXIÓN - REVISAR GOOGLE SHEET",
    companyClient: "SIN CONEXIÓN - REVISAR GOOGLE SHEET",
    contactName: "",
    contactRole: "",
    welcomeMessage: "",
    service: "Business Power™",
    status: "Pendiente",
    progress: 0,
    nextStep: "Configurar Google Sheet",
    nextDate: "Sin fecha",
    linkMeet: "",
    responsibleClient: "Sin responsable",
    generalManager: "Sin información",
    logoGSE: "",
    logoClient: "",
    projectPhrase: "Ruta de avance del proyecto",
    whatsappMessage: "Hola, equipo 👋 Ya actualizamos la Ruta de Avance Visible™.",
    documentUploadLink: ""
  },
  milestones: [],
  findings: [],
  pending: [],
  deliverables: [],
  updates: [],
  education: [],
  processesAsIs: [],
  processesToBe: [],
  coeAsIs: [],
  coeToBe: [],
  documents: [
    {
      id: "1",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnóstico, sube en la carpeta compartida toda la información documental disponible de la empresa.",
      category: "Estructura",
      item: "Organigrama actual",
      detail: "Documento donde se visualice la estructura actual de la empresa.",
      required: "Sí",
      responseClient: "",
      status: "Pendiente",
      observation: "",
      responseDate: ""
    },
    {
      id: "2",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnóstico, sube en la carpeta compartida toda la información documental disponible de la empresa.",
      category: "Talento Humano",
      item: "Listado de colaboradores",
      detail: "Base actual de colaboradores con cargo, área, fecha de ingreso y sueldo si aplica.",
      required: "Sí",
      responseClient: "",
      status: "Pendiente",
      observation: "",
      responseDate: ""
    },
    {
      id: "3",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnóstico, sube en la carpeta compartida toda la información documental disponible de la empresa.",
      category: "Procesos",
      item: "Manuales o procedimientos actuales",
      detail: "Manuales, instructivos, flujos o documentos internos existentes.",
      required: "No",
      responseClient: "",
      status: "No disponible",
      observation: "",
      responseDate: ""
    }
  ]
};

function cleanText(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r/g, "")
    .trim();
}

function normalizeKey(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function parseNumber(value, fallback = 0) {
  const n = Number(String(value ?? "").replace("%", "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : fallback;
}

function getSpreadsheetId(rawValue) {
  const raw = String(rawValue || "").trim();

  const publishedMatch = raw.match(/\/d\/e\/([^/]+)/);
  if (publishedMatch) return { id: publishedMatch[1], type: "published" };

  const editableMatch = raw.match(/\/d\/([^/]+)/);
  if (editableMatch) return { id: editableMatch[1], type: "editable" };

  if (raw.startsWith("2PACX-")) return { id: raw, type: "published" };

  return { id: raw, type: "editable" };
}

function csvUrl(sheetName) {
  const { id, type } = getSpreadsheetId(SPREADSHEET_ID);
  const encodedSheet = encodeURIComponent(sheetName);

  if (type === "published") {
    return `https://docs.google.com/spreadsheets/d/e/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
  }

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
}

function parseCsvRows(csvText) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;
      current.push(value);
      value = "";
      if (current.some((cell) => cleanText(cell))) rows.push(current.map(cleanText));
      current = [];
      continue;
    }

    value += char;
  }

  current.push(value);
  if (current.some((cell) => cleanText(cell))) rows.push(current.map(cleanText));
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(cleanText);
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cleanText(row[index]);
    });
    return obj;
  });
}

async function fetchCsvRows(sheetName, required = true) {
  const url = csvUrl(sheetName);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    if (!required) return [];
    throw new Error(`No se pudo leer la hoja ${sheetName}`);
  }

  const text = await response.text();

  if (text.trim().startsWith("<")) {
    if (!required) return [];
    throw new Error(`La hoja ${sheetName} devolvió HTML, no CSV`);
  }

  return parseCsvRows(text);
}

async function fetchCsvSheet(sheetName, required = true) {
  const rows = await fetchCsvRows(sheetName, required);
  return rowsToObjects(rows);
}

async function fetchFirstAvailableSheet(sheetNames = []) {
  for (const sheetName of sheetNames) {
    const rows = await fetchCsvSheet(sheetName, false);
    if (rows.length) return rows;
  }
  return [];
}

function getRowValue(row, possibleKeys) {
  const normalizedRow = {};

  Object.keys(row || {}).forEach((key) => {
    normalizedRow[normalizeKey(key)] = row[key];
  });

  for (const key of possibleKeys) {
    const value = normalizedRow[normalizeKey(key)];
    if (cleanText(value)) return cleanText(value);
  }

  return "";
}

function projectFromRawRows(rows) {
  const map = {};
  const validKeys = [
    "cliente",
    "empresacliente",
    "nombrecliente",
    "cargocliente",
    "servicio",
    "estadogeneral",
    "estado",
    "avancegeneral",
    "avance",
    "proximopaso",
    "proximopasoactual",
    "fechaproximopaso",
    "proximafecha",
    "linkmeet",
    "meet",
    "googlemeet",
    "responsablecliente",
    "responsable",
    "gerentegeneral",
    "dueno",
    "dueño",
    "lidercliente",
    "logogse",
    "logocliente",
    "fraseproyecto",
    "mensajebienvenida",
    "mensajewhatsapp",
    "whatsapp",
    "linkcargadocumentos",
    "enlacecargadocumentos",
    "linkdocumentos",
    "enlacedocumentos",
    "linkonedrive",
    "onedrive"
  ];

  const cleanRows = rows
    .map((row) => row.map(cleanText))
    .filter((row) => row.some((cell) => cell !== ""));

  if (!cleanRows.length) {
    return demoData.project;
  }

  // Formato horizontal recomendado:
  // Cliente | Servicio | EstadoGeneral | AvanceGeneral | ...
  const headerKeys = cleanRows[0].map(normalizeKey);
  const valueRow = cleanRows[1] || [];
  const looksHorizontal = headerKeys.includes("cliente") && headerKeys.includes("servicio");

  if (looksHorizontal && valueRow.length) {
    headerKeys.forEach((key, index) => {
      if (validKeys.includes(key)) {
        const value = cleanText(valueRow[index]);
        if (value) map[key] = value;
      }
    });
  }

  // Formato vertical alternativo:
  // Campo | Valor
  const firstA = normalizeKey(cleanRows[0]?.[0]);
  const firstB = normalizeKey(cleanRows[0]?.[1]);

  if (firstA === "campo" && firstB === "valor") {
    cleanRows.slice(1).forEach((row) => {
      const key = normalizeKey(row[0]);
      const value = cleanText(row[1]);
      if (validKeys.includes(key) && value) {
        map[key] = value;
      }
    });
  }

  // Formato key-value sin encabezados
  cleanRows.forEach((row) => {
    const cells = row.map(cleanText).filter((cell) => cell !== "");
    if (!cells.length) return;

    const first = normalizeKey(cells[0]);
    const second = cells[1] ? cleanText(cells[1]) : "";

    if (first === "cliente" && normalizeKey(second) === "servicio") return;
    if (first === "campo" && normalizeKey(second) === "valor") return;

    if (validKeys.includes(first) && second && !map[first]) {
      map[first] = second;
    }
  });

  return {
    client: map.cliente || demoData.project.client,
    companyClient: map.empresacliente || map.cliente || demoData.project.client,
    contactName: map.nombrecliente || map.gerentegeneral || map.responsablecliente || "",
    contactRole: map.cargocliente || "",
    welcomeMessage: map.mensajebienvenida || "",
    service: map.servicio || demoData.project.service,
    status: map.estadogeneral || map.estado || demoData.project.status,
    progress: parseNumber(map.avancegeneral || map.avance, demoData.project.progress),
    nextStep: map.proximopaso || map.proximopasoactual || demoData.project.nextStep,
    nextDate: map.fechaproximopaso || map.proximafecha || demoData.project.nextDate,
    linkMeet: map.linkmeet || map.meet || map.googlemeet || demoData.project.linkMeet,
    responsibleClient: map.responsablecliente || map.responsable || demoData.project.responsibleClient,
    generalManager: map.gerentegeneral || map.dueno || map.dueño || map.lidercliente || demoData.project.generalManager,
    logoGSE: map.logogse || demoData.project.logoGSE,
    logoClient: map.logocliente || demoData.project.logoClient,
    projectPhrase: map.fraseproyecto || demoData.project.projectPhrase,
    whatsappMessage: map.mensajewhatsapp || map.whatsapp || demoData.project.whatsappMessage,
    documentUploadLink: map.linkcargadocumentos || map.enlacecargadocumentos || map.linkdocumentos || map.enlacedocumentos || map.linkonedrive || map.onedrive || demoData.project.documentUploadLink,
  };
}

function mapMilestones(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["ID", "Id"]) || String(index + 1),
    title: getRowValue(row, ["Hito", "Titulo", "Título", "Nombre"]),
    system: getRowValue(row, ["Sistema"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
    description: getRowValue(row, ["Descripcion", "Descripción", "Detalle"]),
    includes: getRowValue(row, ["Qué incluye", "Que incluye", "QueIncluye", "Incluye", "Contenido", "Dentro", "Actividades"]),
    includesGSE: getRowValue(row, ["QueIncluyeGSE", "Qué incluye GSE", "Que incluye GSE", "IncluyeGSE", "Incluye GSE"]),
    includesClient: getRowValue(row, ["QueIncluyeCliente", "Qué incluye cliente", "Que incluye cliente", "IncluyeCliente", "Incluye Cliente"]),
    link: getRowValue(row, ["Link", "URL", "Enlace", "LinkHito"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
    targetDate: getRowValue(row, ["FechaObjetivo", "Fecha Objetivo", "Fecha objetivo", "Fecha", "FechaMeta"]),
  })).filter((x) => x.title);
}

function mapFindings(rows) {
  return rows.map((row, index) => {
    const processArea = getRowValue(row, [
      "ProcesoAreaImpactada", "Proceso / Área Impactada", "Proceso / Area Impactada",
      "ProcesoArea", "Proceso Area", "Área Impactada", "Area Impactada", "Proceso", "Proceso Impactado", "Proceso impactado", "Area 2"
    ]);
    const management = getRowValue(row, ["Gerencia", "GERENCIA", "Gerencia responsable", "Gerencia Responsable"]);
    const areaDetail = getRowValue(row, ["Area", "Área", "AREA", "Área responsable", "Area responsable", "Area Responsable", "Área Responsable"]);
    const finding = getRowValue(row, [
      "HallazgoIdentificado", "Hallazgo Identificado", "Hallazgo", "Hallazgo identificado"
    ]);
    const description = getRowValue(row, [
      "DescripcionTecnica", "Descripción Técnica del Hallazgo", "Descripcion Tecnica del Hallazgo",
      "Descripción Técnica", "Descripcion Tecnica", "Descripcion", "Descripción", "Detalle", "Explicacion", "Explicación"
    ]);
    const recommendation = getRowValue(row, [
      "RecomendacionTecnica", "Recomendación Técnica", "Recomendacion Tecnica",
      "Solucion", "Solución", "Propuesta", "Accion", "Acción"
    ]);
    const solutionType = getRowValue(row, [
      "TipoSolucion", "Tipo de Solución", "Tipo de Solucion", "Tipo Solucion", "Sistema", "Sistema que lo resuelve"
    ]);
    const owner = getRowValue(row, [
      "ResponsableSugerido", "Responsable Sugerido", "Responsable", "Responsable sugerido", "Responsable Hallazgo", "ResponsableHallazgo"
    ]);

    return {
      id: getRowValue(row, ["ID", "Id", "Codigo", "Código"]) || String(index + 1),
      management,
      gerencia: management,
      processArea,
      area: areaDetail || processArea,
      areaDetail,
      finding,
      description,
      recommendation,
      solution: recommendation,
      priority: getRowValue(row, ["Prioridad"]),
      solutionType,
      system: solutionType,
      owner,
      responsible: owner,
      status: getRowValue(row, ["Estado"]),
      deliveryDate: getRowValue(row, ["Fechamax", "FechaMax", "Fecha max", "Fecha máxima", "Fecha maxima", "Fecha de entrega", "FechaEntrega", "Fecha Entrega"]),
      deliverableGSE: getRowValue(row, ["EntregableGSE", "Entregable GSE", "EntregablesGSE", "Entregables GSE", "GSE"]),
      deliverableClient: getRowValue(row, ["EntregableCliente", "Entregable Cliente", "EntregablesCliente", "Entregables Cliente", "Cliente"]),
      link: getRowValue(row, ["Link", "URL", "Enlace", "Documento", "Archivo", "Carpeta", "LinkHallazgo"]),
      imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
      technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
      impact: getRowValue(row, ["Impacto"]),
      image: getRowValue(row, ["Imagen", "ImagenPreview", "Imagen previa", "URLImagen"]),
    };
  }).filter((x) => {
    // Mantener todas las filas no vacías que llegan desde Google Sheets.
    // Antes se descartaban filas cuando el hallazgo no venía en una columna específica,
    // lo que podía dejar visibles solo algunos registros aunque la hoja tuviera más.
    return Object.entries(x).some(([key, value]) => key !== "id" && cleanText(value));
  });
}

function mapPending(rows) {
  return rows.map((row) => ({
    request: getRowValue(row, ["Pendiente", "Solicitud"]),
    owner: getRowValue(row, ["Responsable", "Responsable cliente", "Responsable Cliente"]),
    dueDate: getRowValue(row, ["Fecha límite", "Fecha limite", "Fecha", "FechaObjetivo", "Fecha Objetivo"]),
    status: getRowValue(row, ["Estado"]),
    blocks: getRowValue(row, ["Qué bloquea", "Que bloquea", "Bloquea", "Impacto"]),
    description: getRowValue(row, ["Descripcion", "Descripción", "Detalle", "Explicacion", "Explicación"]),
    link: getRowValue(row, ["LinkPendiente", "Link Pendiente", "Link", "URL", "Enlace", "LinkDocumento", "Link Documento", "Documento", "Archivo"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
    validationClient: getRowValue(row, [
      "ValidacionDeCliente", "ValidaciónDeCliente", "Validacion De Cliente", "Validación De Cliente", "ValidacionCliente", "ValidaciónCliente", "Validacion Cliente", "Validación Cliente",
      "Validado", "AprobacionCliente", "AprobaciónCliente", "Aprobacion Cliente", "Aprobación Cliente"
    ]),
  })).filter((x) => x.request);
}

function mapDeliverables(rows) {
  return rows.map((row) => ({
    system: getRowValue(row, ["Sistema"]),
    milestone: getRowValue(row, ["Hito"]),
    deliverable: getRowValue(row, ["Entregable"]),
    status: getRowValue(row, ["Estado"]),
    responsible: getRowValue(row, ["Responsable", "responsable", "Owner", "Encargado", "ResponsableEntregable", "Responsable Entregable"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
    link: getRowValue(row, [
      "LinkEntregable", "Link Entregable", "Link entregable", "Link", "URL", "Enlace",
      "EnlaceEntregable", "Enlace Entregable", "Documento", "Archivo"
    ]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
    observation: getRowValue(row, ["Observacion", "Observación", "Notas", "Comentario"]),
  })).filter((x) => x.deliverable);
}

function mapUpdates(rows) {
  return rows.map((row) => ({
    title: getRowValue(row, ["Título", "Titulo", "Title"]),
    text: getRowValue(row, ["Texto", "Mensaje", "Detalle"]),
    target: getRowValue(row, ["Destino", "Target", "Vista"]),
  })).filter((x) => x.title || x.text);
}

function mapDocuments(rows) {
  return rows.map((row, index) => {
    const title = getRowValue(row, ["Titulo", "Título", "Title", "NombreTitulo", "Nombre Título"]);
    const description = getRowValue(row, [
      "Descripcion", "Descripción", "Description", "DescripcionGeneral", "Descripción General",
      "Texto", "Intro", "Introduccion", "Introducción"
    ]);
    const category = getRowValue(row, ["Categoria", "Categoría", "Category", "Tipo", "Grupo", "Area", "Área"]);
    const item = getRowValue(row, [
      "Item", "Ítem", "Documento", "Documento solicitado", "Documento Solicitado",
      "Documento requerido", "Documento Requerido", "Checklist", "Nombre", "Requerimiento",
      "Solicitud", "Archivo", "Información requerida", "Informacion requerida"
    ]);
    const detail = getRowValue(row, [
      "Detalle", "Detail", "DescripcionItem", "Descripción Item", "Descripcion del item", "Descripción del ítem",
      "DescripcionDocumento", "Descripción Documento", "Descripcion documento", "Descripción documento",
      "ParaQueSirve", "Para qué sirve", "Para que sirve", "Instruccion", "Instrucción"
    ]);

    return {
      id: getRowValue(row, ["ID", "Id", "N", "N°", "No"]) || String(index + 1),
      title,
      description,
      category,
      item,
      detail,
      required: getRowValue(row, ["Obligatorio", "Required", "Requerido", "Es obligatorio"]),
      responseClient: getRowValue(row, ["RespuestaCliente", "Respuesta Cliente", "Respuesta", "Tiene", "Disponibilidad", "SeleccionCliente", "Selección Cliente"]),
      status: getRowValue(row, ["Estado", "Status", "Situacion", "Situación", "Disponible"]),
      observation: getRowValue(row, ["Observacion", "Observación", "Notas", "Comentario", "Comentarios", "Observaciones"]),
      responseDate: getRowValue(row, ["FechaRespuesta", "Fecha Respuesta", "Fecha", "FechaRegistro"]),
    };
  }).filter((x) => x.item || x.title || x.description || x.detail || x.category);
}


function mapProcessesAsIs(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["N°", "N", "No", "Numero", "Número", "ID", "Id"]) || String(index + 1),
    type: getRowValue(row, ["TipoProceso", "Tipo de Proceso", "Tipo Proceso", "Tipo de proceso", "Tipo"]),
    macroCode: getRowValue(row, ["CodigoMacroproceso", "Código Macroproceso", "Cód. Macroproceso", "Cod Macroproceso", "Codigo Macroproceso"]),
    macroName: getRowValue(row, ["NombreMacroproceso", "Nombre del Macroproceso", "Nombre Macroproceso", "Macroproceso"]),
    processCode: getRowValue(row, ["CodigoProceso", "Código Proceso", "Cód. Proceso", "Cod Proceso", "Codigo Proceso"]),
    processName: getRowValue(row, ["NombreProceso", "Nombre del Proceso", "Nombre Proceso", "Proceso"]),
    description: getRowValue(row, ["DescripcionProceso", "Descripción del Proceso", "Descripcion del Proceso", "Descripción Proceso", "Descripcion Proceso", "Descripcion", "Descripción"]),
    link: getRowValue(row, ["Link", "link", "URL", "Url", "Enlace", "Imagen", "ImagenPreview", "Imagen Preview", "VistaPrevia", "Vista Previa", "LinkImagen", "Link Imagen"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
  })).filter((x) => x.processName || x.processCode || x.macroName || x.description);
}

function mapProcessesToBe(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["N°", "N", "No", "Numero", "Número", "ID", "Id"]) || String(index + 1),
    type: getRowValue(row, ["TipoProceso", "Tipo de Proceso", "Tipo Proceso", "Tipo de proceso", "Tipo"]),
    macroCode: getRowValue(row, ["CodigoMacroproceso", "Código Macroproceso", "Cód. Macroproceso", "Cod Macroproceso", "Codigo Macroproceso"]),
    macroName: getRowValue(row, ["NombreMacroproceso", "Nombre del Macroproceso", "Nombre Macroproceso", "Macroproceso"]),
    processCode: getRowValue(row, ["CodigoProceso", "Código Proceso", "Cód. Proceso", "Cod Proceso", "Codigo Proceso"]),
    processName: getRowValue(row, ["NombreProceso", "Nombre del Proceso", "Nombre Proceso", "Proceso"]),
    changes: getRowValue(row, ["CambiosObservaciones", "Cambios y Observaciones", "Cambios y observaciones", "Cambios Observaciones", "Cambios", "Observaciones", "Observacion", "Observación"]),
    link: getRowValue(row, ["Link", "link", "URL", "Url", "Enlace", "Imagen", "ImagenPreview", "Imagen Preview", "VistaPrevia", "Vista Previa", "LinkImagen", "Link Imagen"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
    status: getRowValue(row, ["Status", "Estado"]),
    consultant: getRowValue(row, ["Consultor"]),
    responsible: getRowValue(row, ["Responsable"]),
  })).filter((x) => x.processName || x.processCode || x.macroName || x.changes);
}

function mapEducation(rows) {
  return rows.map((row) => ({
    system: getRowValue(row, ["Sistema"]),
    milestone: getRowValue(row, ["Hito"]),
    deliverable: getRowValue(row, ["Entregable"]),
    whatIs: getRowValue(row, ["QueEs", "Qué es", "Que es"]),
    purpose: getRowValue(row, ["ParaQueSirve", "Para qué sirve", "Para que sirve"]),
    howToRead: getRowValue(row, ["ComoLeerlo", "Cómo leerlo", "Como leerlo"]),
    imagePreview: getRowValue(row, ["ImagenPreview", "Imagen previa", "Imagen"]),
    link: getRowValue(row, ["LinkEntregable", "Link Entregable", "Link", "URL", "Enlace", "Documento", "Archivo"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha Técnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha Técnica"]),
    status: getRowValue(row, ["Estado"]),
  })).filter((x) => x.deliverable || x.whatIs || x.purpose);
}

function mapCOERows(rows) {
  return rows.map((row) => ({
    code: getRowValue(row, ["CÓDIGO", "CODIGO", "Codigo", "Código", "CodigoProceso", "Código Proceso", "Code"]),
    process: getRowValue(row, ["PROCESO", "Proceso", "NombreProceso", "Nombre del Proceso"]),
    processType: getRowValue(row, ["TIPO DE PROCESO", "Tipo de Proceso", "TipoProceso", "TIPO PROCESO", "Tipo", "Tipo Proceso"]),
    activity: getRowValue(row, ["ACTIVIDAD", "Actividad"]),
    participant: getRowValue(row, ["INTERVINIENTE", "Interviniente", "Responsable", "Rol"]),
    observation: getRowValue(row, ["OBSERVACIÓN", "OBSERVACION", "Observación", "Observacion", "Notas", "Comentario"]),
    time: getRowValue(row, ["TIEMPO (xmin)", "Tiempo (xmin)", "Tiempo", "TIEMPO", "TiempoXmin", "Tiempo xmin"]),
    cost: getRowValue(row, ["COSTO (xmin)", "Costo (xmin)", "Costo", "COSTO", "CostoXmin", "Costo xmin"]),
    frequency: getRowValue(row, ["FRECUENCIA", "Frecuencia"]),
    nav: getRowValue(row, ["NAV", "Nav", "nav", "GeneraValor", "Genera Valor", "Valor", "NoAgregaValor", "No agrega valor"]),
  })).filter((x) => x.code || x.process || x.processType || x.activity || x.participant || x.observation || x.nav);
}

export async function loadSheetData() {
  if (!SPREADSHEET_ID) {
    throw new Error("Falta configurar VITE_SPREADSHEET_ID o usar ?sheet=ID");
  }

  const [projectRawRows, milestoneRows, findingRows, pendingRows, deliverableRows, updateRows, educationRows, documentRows, processesAsIsRows, processesToBeRows, coeAsIsRows, coeToBeRows] = await Promise.all([
    fetchCsvRows("Proyecto"),
    fetchCsvSheet("Hitos"),
    fetchCsvSheet("Hallazgos"),
    fetchFirstAvailableSheet(["PendientesCliente", "Pendientes del cliente", "Pendientes Cliente", "Pendientes"]),
    fetchCsvSheet("Entregables"),
    fetchCsvSheet("Actualizaciones", false),
    fetchFirstAvailableSheet(["Educacion", "Educación", "Lo que vas a recibir", "Educacion Cliente"]),
    fetchFirstAvailableSheet(["Documentos", "CargaDocumentos", "Carga de documentos", "Carga Documentos", "ChecklistDocumentos", "Checklist Documentos", "Checklist"]),
    fetchFirstAvailableSheet(["ProcesosASIS", "Procesos AS IS", "Procesos As Is", "Procesos AS-IS", "Procesos AS_IS", "ListaASIS", "Lista AS IS", "Lista AS-IS", "ASIS", "AS IS"]),
    fetchFirstAvailableSheet(["ProcesosTOBE", "Procesos TO BE", "Procesos To Be", "Procesos TO-BE", "Procesos TO_BE", "ListaTOBE", "Lista TO BE", "Lista TO-BE", "TOBE", "TO BE"]),
    fetchFirstAvailableSheet(["COEASIS", "COE AS IS", "COE As Is", "COE AS-IS", "COE AS_IS", "COE Actual", "COEActual"]),
    fetchFirstAvailableSheet(["COETOBE", "COE TO BE", "COE To Be", "COE TO-BE", "COE TO_BE", "COE Propuesto", "COEPropuesto"]),
  ]);

  return {
    project: projectFromRawRows(projectRawRows),
    milestones: mapMilestones(milestoneRows),
    findings: mapFindings(findingRows),
    pending: mapPending(pendingRows),
    deliverables: mapDeliverables(deliverableRows),
    updates: mapUpdates(updateRows),
    education: mapEducation(educationRows),
    documents: mapDocuments(documentRows),
    processesAsIs: mapProcessesAsIs(processesAsIsRows),
    processesToBe: mapProcessesToBe(processesToBeRows),
    coeAsIs: mapCOERows(coeAsIsRows),
    coeToBe: mapCOERows(coeToBeRows),
  };
}

// SHEETSJS_SYNTAX_FIX_PENDIENTESCLIENTE_FINAL

// PENDIENTES_VALIDACION_CLIENTE_FINAL

// Estado soportado en PendientesCliente: Terminado

// GRAFICOS_ESTADOS_TERMINADO_RADAR_S_FIX_FINAL

// HALLAZGOS_MATRIZ_FIX_FINAL

// LISTA_MAESTRA_PROCESOS_FINAL

// LISTA_MAESTRA_PROCESOS_LECTURA_FIX_FINAL

// LISTA_MAESTRA_IMAGEN_PROCESO_FICHA_TECNICA_FINAL

// COE_MATRICES_OVERFLOW_TOP10_FIX_FINAL

// MATRICES_SCROLL_FIJO_FINAL

// COE_V6_NAV_LAYOUT_FINAL

// COE_V7_HOMOGENEO_NAV_FILTER_FINAL

// COE_V8_TIPOGRAFIA_SUAVE_FINAL

// HALLAZGOS_V2_ESTADOS_FILTROS_FINAL

// RUTA_V3_RESTAURA_MENU_STATUS_FINAL

// ENTREGABLES_V3_FIX_RESPONSABLE_RESUMEN_FINAL

// ENTREGABLES_V4_BADGES_VISIBLES_FINAL

// COE_V9_TIPO_PROCESO_FINAL

// PENDIENTES_V2_VALIDACION_CLIENTE_FINAL

// PENDIENTES_V3_BADGES_DESCRIPCION_VISIBLE_FINAL

// HALLAZGOS_V3_ESTADOS_TITULOS_FINAL

// RESUMEN_V6_HITOS_MATRIZ_ESTADOS_FINAL

// HALLAZGOS_V4_GERENCIA_ENTREGABLES_MENU_FINAL

// HALLAZGOS_V9_LECTURA_COMPLETA_TAGS_2_FILAS_FINAL

// HALLAZGOS_V12_FILTROS_FECHAMAX_FINAL
