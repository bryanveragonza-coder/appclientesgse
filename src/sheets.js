
function getSheetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sheet") || params.get("sheetId") || "";
}

function getSheetIdFromSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem("gseClientSession") || "null");
    return session?.sheetId || "";
  } catch {
    return "";
  }
}

export function getActiveSpreadsheetId() {
  return getSheetIdFromSession() || getSheetIdFromUrl() || import.meta.env.VITE_SPREADSHEET_ID || "";
}

export const demoData = {
  project: {
    client: "SIN CONEXIÃ“N - REVISAR GOOGLE SHEET",
    companyClient: "SIN CONEXIÃ“N - REVISAR GOOGLE SHEET",
    contactName: "",
    contactRole: "",
    welcomeMessage: "",
    service: "Business Powerâ„¢",
    status: "Pendiente",
    progress: 0,
    nextStep: "Configurar Google Sheet",
    nextDate: "Sin fecha",
    linkMeet: "",
    responsibleClient: "Sin responsable",
    generalManager: "Sin informaciÃ³n",
    logoGSE: "",
    logoGSEhorizontal: "",
    logoGSEhorizontalColor: "",
    loginImage: "",
    logoClient: "",
    projectPhrase: "Ruta de avance del proyecto",
    whatsappMessage: "Hola, equipo ðŸ‘‹ Ya actualizamos la Ruta de Avance Visibleâ„¢.",
    documentUploadLink: "",
    structureImage: "",
    processMapToBeImage: "",
    iaKzenPoliciesUrl: "",
    policyTemplateUrl: "",
    iaKzenProceduresUrl: "",
    procedureTemplateUrl: ""
  },
  milestones: [],
  findings: [],
  pending: [],
  deliverables: [],
  updates: [],
  education: [],
  meetings: [],
  processesAsIs: [],
  processesToBe: [],
  coeAsIs: [],
  coeToBe: [],
  architectureRoles: [],
  indicators: [],
  documents: [
    {
      id: "1",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnÃ³stico, sube en la carpeta compartida toda la informaciÃ³n documental disponible de la empresa.",
      category: "Estructura",
      item: "Organigrama actual",
      detail: "Documento donde se visualice la estructura actual de la empresa.",
      required: "SÃ­",
      responseClient: "",
      status: "Pendiente",
      observation: "",
      responseDate: ""
    },
    {
      id: "2",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnÃ³stico, sube en la carpeta compartida toda la informaciÃ³n documental disponible de la empresa.",
      category: "Talento Humano",
      item: "Listado de colaboradores",
      detail: "Base actual de colaboradores con cargo, Ã¡rea, fecha de ingreso y sueldo si aplica.",
      required: "SÃ­",
      responseClient: "",
      status: "Pendiente",
      observation: "",
      responseDate: ""
    },
    {
      id: "3",
      title: "Carga de documentos iniciales",
      description: "Para iniciar el diagnÃ³stico, sube en la carpeta compartida toda la informaciÃ³n documental disponible de la empresa.",
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
  const { id, type } = getSpreadsheetId(getActiveSpreadsheetId());
  const encodedSheet = encodeURIComponent(sheetName);

  if (type === "published") {
    return `https://docs.google.com/spreadsheets/d/e/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodedSheet}`;
  }

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodedSheet}`;
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
    throw new Error(`La hoja ${sheetName} devolviÃ³ HTML, no CSV`);
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

function findProjectFieldValue(cleanRows, possibleKeys = []) {
  const normalizedKeys = possibleKeys.map(normalizeKey);

  for (let rowIndex = 0; rowIndex < cleanRows.length; rowIndex++) {
    const row = cleanRows[rowIndex] || [];
    const normalizedRow = row.map(normalizeKey);

    for (let columnIndex = 0; columnIndex < normalizedRow.length; columnIndex++) {
      if (!normalizedKeys.includes(normalizedRow[columnIndex])) continue;

      const sameRowValue = cleanText(row[columnIndex + 1]);
      if (sameRowValue) return sameRowValue;

      for (let nextRowIndex = rowIndex + 1; nextRowIndex < cleanRows.length; nextRowIndex++) {
        const belowValue = cleanText(cleanRows[nextRowIndex]?.[columnIndex]);
        if (belowValue) return belowValue;
      }
    }
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
    "dueÃ±o",
    "lidercliente",
    "logogse",
    "logogsehorizontal",
    "logogsehor",
    "logohorizontalgse",
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
    "onedrive",
    "imagenestructura",
    "estructuraimagen",
    "linkestructura",
    "enlaceestructura",
    "imagenmapadeprocesos",
    "imagenmapaprocesos",
    "imagenmapaprocesostobe",
    "mapaprocesostobe",
    "linkmapaprocesos",
    "enlacemapaprocesos",
    "iakzenpoliticas",
    "formatopoliticas",
    "iakzenprocedimientos",
    "formatoprocedimientos"
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
  const looksHorizontal = headerKeys.some((key) => validKeys.includes(key));

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
    generalManager: map.gerentegeneral || map.dueno || map["dueño"] || map.lidercliente || demoData.project.generalManager,
    logoGSE: map.logogse || demoData.project.logoGSE,
    logoGSEhorizontal: map.logogsehorizontal || map.logogsehor || map.logohorizontalgse || findProjectFieldValue(cleanRows, ["LogoGSEhorizontal", "Logo GSE horizontal", "Logo horizontal GSE", "LogoGSECompleto", "Logo GSE completo"]) || demoData.project.logoGSEhorizontal,
    logoGSEhorizontalColor: map.logogsehorizontalcolor || map.logogsehorizontalcolour || findProjectFieldValue(cleanRows, ["LogoGSEhorizontalcolor", "Logo GSE horizontal color", "Logo GSE horizontal a color", "LogoGSEHorizontalColor"]) || demoData.project.logoGSEhorizontalColor,
    loginImage: map.imageninicio || map.imagenlogin || findProjectFieldValue(cleanRows, ["ImagenInicio", "Imagen Inicio", "Imagen login", "ImagenLogin"]) || demoData.project.loginImage,
    logoClient: map.logocliente || demoData.project.logoClient,
    projectPhrase: map.fraseproyecto || demoData.project.projectPhrase,
    whatsappMessage: map.mensajewhatsapp || map.whatsapp || demoData.project.whatsappMessage,
    documentUploadLink: map.linkcargadocumentos || map.enlacecargadocumentos || map.linkdocumentos || map.enlacedocumentos || map.linkonedrive || map.onedrive || demoData.project.documentUploadLink,
    structureImage: map.imagenestructura || map.estructuraimagen || map.linkestructura || map.enlaceestructura || demoData.project.structureImage,
    processMapToBeImage: map.imagenmapadeprocesos || map.imagenmapaprocesos || map.imagenmapaprocesostobe || map.mapaprocesostobe || map.linkmapaprocesos || map.enlacemapaprocesos || findProjectFieldValue(cleanRows, ["ImagenMapadeprocesos", "Imagen Mapa de procesos", "Imagen Mapa de Procesos", "ImagenMapaProcesos", "ImagenMapaProcesosTOBE", "Mapa procesos TO BE", "Mapa de procesos TO BE"]) || demoData.project.processMapToBeImage,
    iaKzenPoliciesUrl: map.iakzenpoliticas || findProjectFieldValue(cleanRows, ["IAKZENPoliticas", "IA K&ZEN Politicas", "IA K&ZEN Políticas", "Link IA Políticas"]) || "",
    policyTemplateUrl: map.formatopoliticas || findProjectFieldValue(cleanRows, ["FormatoPoliticas", "Formato Políticas", "Formato Politicas", "Link Formato Políticas"]) || "",
    iaKzenProceduresUrl: map.iakzenprocedimientos || findProjectFieldValue(cleanRows, ["IAKZENProcedimientos", "IA K&ZEN Procedimientos", "Link IA Procedimientos"]) || "",
    procedureTemplateUrl: map.formatoprocedimientos || findProjectFieldValue(cleanRows, ["FormatoProcedimientos", "Formato Procedimientos", "Link Formato Procedimientos"]) || "",
  };
}

function mapMilestones(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["ID", "Id"]) || String(index + 1),
    title: getRowValue(row, ["Hito", "Titulo", "TÃ­tulo", "Nombre"]),
    system: getRowValue(row, ["Sistema"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
    description: getRowValue(row, ["Descripcion", "DescripciÃ³n", "Detalle"]),
    includes: getRowValue(row, ["QuÃ© incluye", "Que incluye", "QueIncluye", "Incluye", "Contenido", "Dentro", "Actividades"]),
    includesGSE: getRowValue(row, ["QueIncluyeGSE", "QuÃ© incluye GSE", "Que incluye GSE", "IncluyeGSE", "Incluye GSE"]),
    includesClient: getRowValue(row, ["QueIncluyeCliente", "QuÃ© incluye cliente", "Que incluye cliente", "IncluyeCliente", "Incluye Cliente"]),
    link: getRowValue(row, ["Link", "URL", "Enlace", "LinkHito"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["Ficha", "FichaTecnica", "Ficha TÃ©cnica", "Ficha Tecnica", "FichaTecnicaProceso", "Ficha Proceso", "LinkFicha", "Link Ficha", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    targetDate: getRowValue(row, ["FechaObjetivo", "Fecha Objetivo", "Fecha objetivo", "Fecha", "FechaMeta"]),
    open: getRowValue(row, ["Abierto", "Abierta", "EstadoDesbloqueo", "Desbloqueado", "Disponible"]),
  })).filter((x) => x.title);
}

function mapFindings(rows) {
  return rows.map((row, index) => {
    const processArea = getRowValue(row, [
      "ProcesoAreaImpactada", "Proceso / Ãrea Impactada", "Proceso / Area Impactada",
      "ProcesoArea", "Proceso Area", "Ãrea Impactada", "Area Impactada", "Proceso", "Proceso Impactado", "Proceso impactado", "Area 2"
    ]);
    const management = getRowValue(row, ["Gerencia", "GERENCIA", "Gerencia responsable", "Gerencia Responsable"]);
    const areaDetail = getRowValue(row, ["Area", "Ãrea", "AREA", "Ãrea responsable", "Area responsable", "Area Responsable", "Ãrea Responsable"]);
    const finding = getRowValue(row, [
      "HallazgoIdentificado", "Hallazgo Identificado", "Hallazgo", "Hallazgo identificado"
    ]);
    const description = getRowValue(row, [
      "DescripcionTecnica", "DescripciÃ³n TÃ©cnica del Hallazgo", "Descripcion Tecnica del Hallazgo",
      "DescripciÃ³n TÃ©cnica", "Descripcion Tecnica", "Descripcion", "DescripciÃ³n", "Detalle", "Explicacion", "ExplicaciÃ³n"
    ]);
    const recommendation = getRowValue(row, [
      "RecomendacionTecnica", "RecomendaciÃ³n TÃ©cnica", "Recomendacion Tecnica",
      "Solucion", "SoluciÃ³n", "Propuesta", "Accion", "AcciÃ³n"
    ]);
    const solutionType = getRowValue(row, [
      "TipoSolucion", "Tipo de SoluciÃ³n", "Tipo de Solucion", "Tipo Solucion", "Sistema", "Sistema que lo resuelve"
    ]);
    const owner = getRowValue(row, [
      "ResponsableSugerido", "Responsable Sugerido", "Responsable", "Responsable sugerido", "Responsable Hallazgo", "ResponsableHallazgo"
    ]);

    return {
      id: getRowValue(row, ["ID", "Id", "Codigo", "CÃ³digo"]) || String(index + 1),
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
      deliveryDate: getRowValue(row, ["Fechamax", "FechaMax", "Fecha max", "Fecha mÃ¡xima", "Fecha maxima", "Fecha de entrega", "FechaEntrega", "Fecha Entrega"]),
      deliverableGSE: getRowValue(row, ["EntregableGSE", "Entregable GSE", "EntregablesGSE", "Entregables GSE", "GSE"]),
      deliverableClient: getRowValue(row, ["EntregableCliente", "Entregable Cliente", "EntregablesCliente", "Entregables Cliente", "Cliente"]),
      link: getRowValue(row, ["Link", "URL", "Enlace", "Documento", "Archivo", "Carpeta", "LinkHallazgo"]),
      imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
      technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha TÃ©cnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
      policyLoaded: getRowValue(row, ["PoliticaCargada", "PolíticaCargada", "Politica Cargada", "Política Cargada", "Politica", "Política"]),
      procedureLoaded: getRowValue(row, ["ProcedimientoCargado", "Procedimiento Cargado", "Procedimiento"]),
      impact: getRowValue(row, ["Impacto"]),
      image: getRowValue(row, ["Imagen", "ImagenPreview", "Imagen previa", "URLImagen"]),
    };
  }).filter((x) => {
    // Mantener todas las filas no vacÃ­as que llegan desde Google Sheets.
    // Antes se descartaban filas cuando el hallazgo no venÃ­a en una columna especÃ­fica,
    // lo que podÃ­a dejar visibles solo algunos registros aunque la hoja tuviera mÃ¡s.
    return Object.entries(x).some(([key, value]) => key !== "id" && cleanText(value));
  });
}

function mapPending(rows) {
  return rows.map((row) => ({
    request: getRowValue(row, ["Pendiente", "Solicitud"]),
    owner: getRowValue(row, ["Responsable", "Responsable cliente", "Responsable Cliente"]),
    dueDate: getRowValue(row, ["Fecha lÃ­mite", "Fecha limite", "Fecha", "FechaObjetivo", "Fecha Objetivo"]),
    status: getRowValue(row, ["Estado"]),
    blocks: getRowValue(row, ["QuÃ© bloquea", "Que bloquea", "Bloquea", "Impacto"]),
    description: getRowValue(row, ["Descripcion", "DescripciÃ³n", "Detalle", "Explicacion", "ExplicaciÃ³n"]),
    link: getRowValue(row, ["LinkPendiente", "Link Pendiente", "Link", "URL", "Enlace", "LinkDocumento", "Link Documento", "Documento", "Archivo"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["Ficha", "FichaTecnica", "Ficha TÃ©cnica", "Ficha Tecnica", "FichaTecnicaProceso", "Ficha Proceso", "LinkFicha", "Link Ficha", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    validationClient: getRowValue(row, [
      "ValidacionDeCliente", "ValidaciÃ³nDeCliente", "Validacion De Cliente", "ValidaciÃ³n De Cliente", "ValidacionCliente", "ValidaciÃ³nCliente", "Validacion Cliente", "ValidaciÃ³n Cliente",
      "Validado", "AprobacionCliente", "AprobaciÃ³nCliente", "Aprobacion Cliente", "AprobaciÃ³n Cliente"
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
    technicalSheet: getRowValue(row, ["Ficha", "FichaTecnica", "Ficha TÃ©cnica", "Ficha Tecnica", "FichaTecnicaProceso", "Ficha Proceso", "LinkFicha", "Link Ficha", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    observation: getRowValue(row, ["Observacion", "ObservaciÃ³n", "Notas", "Comentario"]),
  })).filter((x) => x.deliverable);
}

function mapUpdates(rows) {
  return rows.map((row) => ({
    title: getRowValue(row, ["TÃ­tulo", "Titulo", "Title"]),
    text: getRowValue(row, ["Texto", "Mensaje", "Detalle"]),
    target: getRowValue(row, ["Destino", "Target", "Vista"]),
  })).filter((x) => x.title || x.text);
}

function mapMeetings(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["ID", "Id", "Codigo", "CÃ³digo"]) || String(index + 1),
    date: getRowValue(row, ["Fecha", "FechaReunion", "Fecha ReuniÃ³n", "Fecha Reunion"]),
    time: getRowValue(row, ["Hora", "HoraReunion", "Hora ReuniÃ³n", "Hora Reunion"]),
    title: getRowValue(row, ["Titulo", "TÃ­tulo", "Title", "Nombre", "Reunion", "ReuniÃ³n"]),
    status: getRowValue(row, ["Estado", "Status"]),
    link: getRowValue(row, ["Link", "LinkMeet", "Link Meet", "URL", "Enlace"]),
    observation: getRowValue(row, ["Observacion", "ObservaciÃ³n", "Notas", "Comentario"]),
  })).filter((x) => x.title || x.date || x.time || x.link);
}

function mapDocuments(rows) {
  return rows.map((row, index) => {
    const title = getRowValue(row, ["Titulo", "TÃ­tulo", "Title", "NombreTitulo", "Nombre TÃ­tulo"]);
    const description = getRowValue(row, [
      "Descripcion", "DescripciÃ³n", "Description", "DescripcionGeneral", "DescripciÃ³n General",
      "Texto", "Intro", "Introduccion", "IntroducciÃ³n"
    ]);
    const category = getRowValue(row, ["Categoria", "CategorÃ­a", "Category", "Tipo", "Grupo", "Area", "Ãrea"]);
    const item = getRowValue(row, [
      "Item", "Ãtem", "Documento", "Documento solicitado", "Documento Solicitado",
      "Documento requerido", "Documento Requerido", "Checklist", "Nombre", "Requerimiento",
      "Solicitud", "Archivo", "InformaciÃ³n requerida", "Informacion requerida"
    ]);
    const detail = getRowValue(row, [
      "Detalle", "Detail", "DescripcionItem", "DescripciÃ³n Item", "Descripcion del item", "DescripciÃ³n del Ã­tem",
      "DescripcionDocumento", "DescripciÃ³n Documento", "Descripcion documento", "DescripciÃ³n documento",
      "ParaQueSirve", "Para quÃ© sirve", "Para que sirve", "Instruccion", "InstrucciÃ³n"
    ]);

    return {
      id: getRowValue(row, ["ID", "Id", "N", "NÂ°", "No"]) || String(index + 1),
      title,
      description,
      category,
      item,
      detail,
      required: getRowValue(row, ["Obligatorio", "Required", "Requerido", "Es obligatorio"]),
      responseClient: getRowValue(row, ["RespuestaCliente", "Respuesta Cliente", "Respuesta", "Tiene", "Disponibilidad", "SeleccionCliente", "SelecciÃ³n Cliente"]),
      status: getRowValue(row, ["Estado", "Status", "Situacion", "SituaciÃ³n", "Disponible"]),
      observation: getRowValue(row, ["Observacion", "ObservaciÃ³n", "Notas", "Comentario", "Comentarios", "Observaciones"]),
      folderLink: getRowValue(row, ["LinkCarpeta", "Link Carpeta", "Carpeta", "URLCarpeta", "URL Carpeta", "EnlaceCarpeta", "Enlace Carpeta"]),
      responseDate: getRowValue(row, ["FechaRespuesta", "Fecha Respuesta", "Fecha", "FechaRegistro"]),
    };
  }).filter((x) => x.item || x.title || x.description || x.detail || x.category);
}


function mapArchitectureRoles(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["N°", "NÂ°", "N", "No", "Numero", "Número", "ID", "Id"]) || String(index + 1),
    gerencia: getRowValue(row, ["GERENCIA", "Gerencia"]),
    area: getRowValue(row, ["ÁREA", "AREA", "Área", "Area"]),
    cargo: getRowValue(row, ["CARGO", "Cargo"]),
    profileUrl: getRowValue(row, ["Perfil", "URLPerfil", "PerfilURL", "EnlacePerfil", "Enlace Perfil", "URL", "Url"]),
    occupationalGroup: getRowValue(row, ["GRUPO OCUPACIONAL sugerido", "GRUPO OCUPACIONAL", "Grupo Ocupacional sugerido", "Grupo Ocupacional", "Grupo"]),
    abbreviation: getRowValue(row, ["ABREVIACIÓN", "ABREVIACION", "Abreviación", "Abreviacion"]),
    status: getRowValue(row, ["STATUS", "Status", "Estado"]),
    validated: getRowValue(row, ["Validado", "VALIDADO", "Validada"]),
  })).filter((x) => x.gerencia || x.area || x.cargo || x.profileUrl || x.occupationalGroup || x.abbreviation || x.status);
}

function mapIndicators(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["N°", "NÂ°", "N", "No", "Numero", "Número", "ID", "Id"]) || String(index + 1),
    process: getRowValue(row, ["Proceso", "PROCESO", "NombreProceso", "Nombre del proceso"]),
    area: getRowValue(row, ["Área", "Area", "AREA", "Departamento"]),
    name: getRowValue(row, ["Nombre del indicador", "NombreIndicador", "Indicador", "Nombre", "KPI"]),
    formula: getRowValue(row, ["Fórmula", "Formula", "FORMULA"]),
    description: getRowValue(row, ["Descripción", "Descripcion", "DESCRIPCION", "Detalle", "Descripción del indicador", "Descripcion del indicador"]),
    unit: getRowValue(row, ["UMD", "Unidad", "Unidad de medida", "UnidadMedida"]),
    frequency: getRowValue(row, ["Frecuencia de medida", "FrecuenciaMedida", "Frecuencia", "Periodicidad"]),
    goal: getRowValue(row, ["Meta", "META", "Objetivo"]),
    baseline: getRowValue(row, ["Línea base", "Linea base", "LineaBase", "LíneaBase", "Base"]),
    month1: getRowValue(row, ["Mes 1", "Mes1", "MES 1"]),
    month2: getRowValue(row, ["Mes 2", "Mes2", "MES 2"]),
    month3: getRowValue(row, ["Mes 3", "Mes3", "MES 3"]),
    trend: getRowValue(row, ["Tendencia", "tendencia"]),
    actionPlan: getRowValue(row, ["Plan de acción", "PlanAccion", "Plan de accion", "PlanAcción"]),
    responsible: getRowValue(row, ["Responsable", "RESPONSABLE"]),
    endDate: getRowValue(row, ["Fecha termin.", "FechaTermin", "FechaTerminacion", "Fecha terminación", "Fecha de terminación", "Fecha fin"]),
    status: getRowValue(row, ["Estatus", "Status", "Estado"]),
  })).filter((x) => x.process || x.name || x.formula || x.goal || x.baseline || x.month1 || x.month2 || x.month3);
}

function mapProcessesAsIs(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["NÂ°", "N", "No", "Numero", "NÃºmero", "ID", "Id"]) || String(index + 1),
    processId: getRowValue(row, ["IDProceso", "ID Proceso", "IdProceso", "Id Proceso"]),
    type: getRowValue(row, ["TipoProceso", "Tipo de Proceso", "Tipo Proceso", "Tipo de proceso", "Tipo"]),
    macroCode: getRowValue(row, ["CodigoMacroproceso", "CÃ³digo Macroproceso", "CÃ³d. Macroproceso", "Cod Macroproceso", "Codigo Macroproceso"]),
    macroName: getRowValue(row, ["NombreMacroproceso", "Nombre del Macroproceso", "Nombre Macroproceso", "Macroproceso"]),
    processCode: getRowValue(row, ["CodigoProceso", "CÃ³digo Proceso", "CÃ³d. Proceso", "Cod Proceso", "Codigo Proceso"]),
    processName: getRowValue(row, ["NombreProceso", "Nombre del Proceso", "Nombre Proceso", "Proceso"]),
    description: getRowValue(row, ["DescripcionProceso", "DescripciÃ³n del Proceso", "Descripcion del Proceso", "DescripciÃ³n Proceso", "Descripcion Proceso", "Descripcion", "DescripciÃ³n"]),
    link: getRowValue(row, ["Link", "link", "URL", "Url", "Enlace", "Imagen", "ImagenPreview", "Imagen Preview", "VistaPrevia", "Vista Previa", "LinkImagen", "Link Imagen"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["Ficha", "FichaTecnica", "Ficha TÃ©cnica", "Ficha Tecnica", "FichaTecnicaProceso", "Ficha Proceso", "LinkFicha", "Link Ficha", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    imageValidated: getRowValue(row, ["ImagenValidada", "Imagen Validada", "Imagen validada"]),
    technicalSheetValidated: getRowValue(row, ["FichaValidada", "Ficha Validada", "Ficha validada"]),
  })).filter((x) => x.processName || x.processCode || x.macroName || x.description);
}

function mapProcessesToBe(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["NÂ°", "N", "No", "Numero", "NÃºmero", "ID", "Id"]) || String(index + 1),
    processId: getRowValue(row, ["IDProceso", "ID Proceso", "IdProceso", "Id Proceso"]),
    type: getRowValue(row, ["TipoProceso", "Tipo de Proceso", "Tipo Proceso", "Tipo de proceso", "Tipo"]),
    macroCode: getRowValue(row, ["CodigoMacroproceso", "CÃ³digo Macroproceso", "CÃ³d. Macroproceso", "Cod Macroproceso", "Codigo Macroproceso"]),
    macroName: getRowValue(row, ["NombreMacroproceso", "Nombre del Macroproceso", "Nombre Macroproceso", "Macroproceso"]),
    processCode: getRowValue(row, ["CodigoProceso", "CÃ³digo Proceso", "CÃ³d. Proceso", "Cod Proceso", "Codigo Proceso"]),
    processName: getRowValue(row, ["NombreProceso", "Nombre del Proceso", "Nombre Proceso", "Proceso"]),
    changes: getRowValue(row, ["CambiosObservaciones", "Cambios y Observaciones", "Cambios y observaciones", "Cambios Observaciones", "Cambios", "Observaciones", "Observacion", "ObservaciÃ³n"]),
    link: getRowValue(row, ["Link", "link", "URL", "Url", "Enlace", "Imagen", "ImagenPreview", "Imagen Preview", "VistaPrevia", "Vista Previa", "LinkImagen", "Link Imagen"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["Ficha", "FichaTecnica", "Ficha TÃ©cnica", "Ficha Tecnica", "FichaTecnicaProceso", "Ficha Proceso", "LinkFicha", "Link Ficha", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    imageValidated: getRowValue(row, ["ImagenValidada", "Imagen Validada", "Imagen validada"]),
    technicalSheetValidated: getRowValue(row, ["FichaValidada", "Ficha Validada", "Ficha validada"]),
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
    whatIs: getRowValue(row, ["QueEs", "QuÃ© es", "Que es"]),
    purpose: getRowValue(row, ["ParaQueSirve", "Para quÃ© sirve", "Para que sirve"]),
    howToRead: getRowValue(row, ["ComoLeerlo", "CÃ³mo leerlo", "Como leerlo"]),
    imagePreview: getRowValue(row, ["ImagenPreview", "Imagen previa", "Imagen"]),
    link: getRowValue(row, ["LinkEntregable", "Link Entregable", "Link", "URL", "Enlace", "Documento", "Archivo"]),
    imageProcess: getRowValue(row, ["ImagenProceso", "Imagen Proceso", "Imagen del Proceso", "LinkImagen", "Link Imagen", "Imagen", "Link"]),
    technicalSheet: getRowValue(row, ["FichaTecnica", "Ficha TÃ©cnica", "FichaTecnicaProceso", "LinkFichaTecnica", "Link Ficha Tecnica", "Link Ficha TÃ©cnica"]),
    status: getRowValue(row, ["Estado"]),
  })).filter((x) => x.deliverable || x.whatIs || x.purpose);
}

function mapCOERows(rows) {
  return rows.map((row) => ({
    code: getRowValue(row, ["CÃ“DIGO", "CODIGO", "Codigo", "CÃ³digo", "CodigoProceso", "CÃ³digo Proceso", "Code"]),
    process: getRowValue(row, ["PROCESO", "Proceso", "NombreProceso", "Nombre del Proceso"]),
    processType: getRowValue(row, ["TIPO DE PROCESO", "Tipo de Proceso", "TipoProceso", "TIPO PROCESO", "Tipo", "Tipo Proceso"]),
    activity: getRowValue(row, ["ACTIVIDAD", "Actividad"]),
    participant: getRowValue(row, ["INTERVINIENTE", "Interviniente", "Responsable", "Rol"]),
    observation: getRowValue(row, ["OBSERVACIÃ“N", "OBSERVACION", "ObservaciÃ³n", "Observacion", "Notas", "Comentario"]),
    time: getRowValue(row, ["TIEMPO (xmin)", "Tiempo (xmin)", "Tiempo", "TIEMPO", "TiempoXmin", "Tiempo xmin"]),
    cost: getRowValue(row, ["COSTO (xmin)", "Costo (xmin)", "Costo", "COSTO", "CostoXmin", "Costo xmin"]),
    frequency: getRowValue(row, ["FRECUENCIA", "Frecuencia"]),
    nav: getRowValue(row, ["NAV", "Nav", "nav", "GeneraValor", "Genera Valor", "Valor", "NoAgregaValor", "No agrega valor"]),
    month: getRowValue(row, ["MES", "Mes", "month", "Month"]),
  })).filter((x) => x.code || x.process || x.processType || x.activity || x.participant || x.observation || x.nav);
}

export async function loadSheetData() {
  if (!getActiveSpreadsheetId()) {
    throw new Error("Falta iniciar sesiÃ³n o configurar VITE_SPREADSHEET_ID.");
  }

  const [projectRawRows, milestoneRows, findingRows, pendingRows, deliverableRows, updateRows, educationRows, meetingRows, documentRows, architectureRows, indicatorRows, processesAsIsRows, processesToBeRows, coeAsIsRows, coeToBeRows] = await Promise.all([
    fetchCsvRows("Proyecto"),
    fetchCsvSheet("Hitos"),
    fetchCsvSheet("Hallazgos"),
    fetchFirstAvailableSheet(["PendientesCliente", "Pendientes del cliente", "Pendientes Cliente", "Pendientes"]),
    fetchCsvSheet("Entregables"),
    fetchCsvSheet("Actualizaciones", false),
    fetchFirstAvailableSheet(["Educacion", "EducaciÃ³n", "Lo que vas a recibir", "Educacion Cliente"]),
    fetchFirstAvailableSheet(["Reuniones", "ReunionesCliente", "Reuniones Cliente", "Agenda"]),
    fetchFirstAvailableSheet(["Documentos", "CargaDocumentos", "Carga de documentos", "Carga Documentos", "ChecklistDocumentos", "Checklist Documentos", "Checklist"]),
    fetchFirstAvailableSheet(["ArquitecturaCargos", "Arquitectura Cargos", "Estructura", "EstructuraCargos", "Arquitectura"]),
    fetchFirstAvailableSheet(["Indicadores", "ImplementacionIndicadores", "Implementación Indicadores", "Implementacion Indicadores", "IndicadoresImplementacion", "Indicadores Implementacion"]),
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
    meetings: mapMeetings(meetingRows),
    documents: mapDocuments(documentRows),
    architectureRoles: mapArchitectureRoles(architectureRows),
    indicators: mapIndicators(indicatorRows),
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





