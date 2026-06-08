
import React, { useEffect, useMemo, useState } from "react";
// RESUMEN_HITOS_BARRA_FINAL
// RADAR_5_SISTEMAS_GSE
// BUSCADOR_ENTREGABLES_EDUCACION_FINAL
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  UploadCloud,
  FolderOpen,
  Flag,
  Hourglass,
  Layers3,
  LockKeyhole,
  LogIn,
  MapPin,
  Monitor,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
  MessageCircle,
} from "lucide-react";
import { loadSheetData, demoData, getActiveSpreadsheetId } from "./sheets";
import "./index.css";

const BRAND = "#00b8b5";
// RUTA_HITOS_DETALLE_VISIBLE_FINAL RUTA_HITOS_TARJETAS_HOMOGENEAS_FINAL

function formatSheetText(value = "") {
  return String(value || "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}


function getStatusType(status = "") {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("finalizado") || normalized.includes("aprobado") || normalized.includes("disponible")) return "success";
  if (normalized.includes("validación") || normalized.includes("validacion") || normalized.includes("revision") || normalized.includes("revisión")) return "warning";
  if (normalized.includes("bloqueado")) return "danger";
  if (normalized.includes("desarrollo")) return "info";
  return "neutral";
}

function safeUrl(url = "") {
  const clean = String(url || "").trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return "";
}

function Badge({ children, status }) {
  return <span className={`badge ${getStatusType(status || children)}`}>{children}</span>;
}

function ProgressBar({ value, status, reverse = false }) {
  const width = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div className="progress">
      <div className={`progressFill ${reverse ? "danger" : getStatusType(status)}`} style={{ width: `${width}%` }} />
    </div>
  );
}


function FilterSelect({ label, value, onChange, options = [] }) {
  const cleanOptions = Array.from(
    new Set(
      (Array.isArray(options) ? options : [])
        .map((option) => String(option || "").trim())
        .filter(Boolean)
    )
  );

  return (
    <label className="filter">
      <span>{label}</span>
      <select value={value || "Todos"} onChange={(event) => onChange?.(event.target.value)}>
        <option value="Todos">Todos</option>
        {cleanOptions.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}


function Logo({ src, fallback, className = "" }) {
  const url = safeUrl(src);
  if (url) {
    return <img src={url} alt={fallback} className={`logoImage ${className}`} />;
  }
  return <div className={`logoFallback ${className}`}>{fallback}</div>;
}

function Sidebar({ view, setView, project }) {
  const groups = [
    { title: "", items: [[Sparkles, "Portal del proyecto", "portal"]] },
    {
      title: "Seguimiento",
      items: [
        [BarChart3, "Resumen", "resumen"],
        [Target, "Ruta del proyecto", "ruta"],
        [BarChart3, "COE", "coe"],
        [Search, "Hallazgos", "hallazgos"],
        [AlertTriangle, "Pendientes cliente", "pendientes"],
      ],
    },
    { title: "Procesos", items: [[ClipboardCheck, "Lista Maestra de Procesos", "procesos"]] },
    {
      title: "Documentacion",
      items: [
        [FileText, "Entregables GSE", "entregables"],
        [UploadCloud, "Carga de documentos", "documentos"],
      ],
    },
    { title: "Informacion", items: [[BookOpen, "Lo que vas a recibir", "educacion"]] },
  ];

  const company = project.companyClient || project.client;
  const contact = project.contactName || project.generalManager || project.responsibleClient;
  const role = project.contactRole || "cargo de empresa";

  return (
    <aside className="sidebar premiumSidebar">
      <div className="brand premiumBrand">
        <Logo src={project.logoGSE} fallback="GSE" />
        <div>
          <div className="brandTitle">GSE&CO - Ruta de Implementación Visible</div>
          <div className="brandSub"></div>
        </div>
      </div>

      <div className="clientProfile">
        <div className="clientProfileTop">
          <Logo src={project.logoClient} fallback={company?.slice(0, 2) || "CL"} className="clientMiniLogo" />
          <div>
            <span>Cliente</span>
            <strong>{company}</strong>
          </div>
        </div>

        <div className="clientProfileLine">
          <Users size={15} />
          <div>
            <span>{contact || "Sin contacto definido"}</span>
            <small>{role}</small>
          </div>
        </div>

      </div>

      <nav className="nav premiumNav">
        {groups.map((group, groupIndex) => (
          <div className="navGroup" key={`${group.title}-${groupIndex}`}>
            {group.title && <span className="navGroupTitle">{group.title}</span>}
            {group.items.map(([Icon, label, value]) => (
              <button key={label} className={`navItem ${view === value ? "active" : ""}`} onClick={() => setView(value)}>
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebarCard premiumSidebarCard">
        <Logo src={project.logoGSE} fallback="GSE" />
      </div>
    </aside>
  );
}

function Header({ project, connected }) {
  const company = project.companyClient || project.client;

  return (
    <header className="unifiedProjectHeader header premiumHeader">
      <div className="headerIdentity">
        <div className="headerIcon unifiedHeaderIcon">
          <Building2 size={22} />
        </div>
        <div className="headerText">
          <div className="eyebrow">{project.service}</div>
          <h1>{company}</h1>
          <p>Seguimiento ejecutivo del proyecto · RIV · Ruta de Implementación Visible™</p>
        </div>
      </div>

      <div className="headerActions unifiedHeaderActions">
        <Badge status={connected ? "Finalizado" : "Bloqueado"}>{connected ? "Google Sheets conectado" : "Sin conexión"}</Badge>
        <Badge status={project.status}>Estado: {project.status}</Badge>
      </div>
    </header>
  );
}

function PortalProject({ project, milestones, pending, setView }) {
  const cleanPortalText = (value = "") => String(value || "")
    .replace(/á/g, "á")
    .replace(/é/g, "é")
    .replace(/í/g, "í")
    .replace(/ó/g, "ó")
    .replace(/ú/g, "ú")
    .replace(/ñ/g, "ñ")
    .replace(/·/g, "·")
    .replace(/™/g, "™")
    .replace(/Adminitrativa/gi, "Administrativa");
  const meetUrl = safeUrl(project.linkMeet);
  const company = project.companyClient || project.client;
  const contact = project.contactName || project.generalManager || project.responsibleClient;
  const role = cleanPortalText(project.contactRole || "Responsable del proyecto");
  const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
  const completedPending = pending.filter(isPendingCompleted).length;
  const disorder = Math.max(0, 100 - (Number(project.progress) || 0));
  const welcome = cleanPortalText(project.welcomeMessage || "Bienvenido a tu Ruta de Implementación Visible. Aquí podrás revisar el avance del proyecto, los hitos trabajados, los pendientes activos y los entregables construidos por GSE para ordenar tu empresa.");

  return (
    <div className="portalPage">
      <section className="portalHero">
        <div className="portalOverlay"></div>

        <div className="portalContent">
          <h2 className="portalRivTitle">
            <span>Bienvenido a tu</span>
            <span>Ruta de</span>
            <span>Implementación</span>
            <span>Visible</span>
          </h2>
          <p>{welcome}</p>

          <div className="portalClientBox">
            <div>
              <span>Empresa</span>
              <strong>{company}</strong>
            </div>
            <div>
              <span>{role}</span>
              <strong>{contact || "Sin contacto definido"}</strong>
            </div>
          </div>

          <p className="portalSignature">Creado por GSE&CO</p>

          <div className="portalActions">
            <button className="primaryPortalButton" onClick={() => setView("resumen")}>
              <LogIn size={18} />
              Entrar al tablero
              <ArrowRight size={18} />
            </button>

            {meetUrl && (
              <a className="secondaryPortalButton" href={meetUrl} target="_blank" rel="noreferrer">
                <Video size={18} />
                Conectarse a reunión
              </a>
            )}
          </div>
        </div>

        <div className="portalMetrics">
          <div className="portalMetricCard">
            <div>
              <span>Avance General</span>
              <strong>{project.progress}%</strong>
              <ProgressBar value={project.progress} status={project.status} />
            </div>
            <Rocket size={28} />
          </div>

          <div className="portalMetricCard">
            <div>
              <span>Desorden restante</span>
              <strong>{disorder}%</strong>
              <ProgressBar value={disorder} status="Bloqueado" reverse />
            </div>
            <Brain size={28} />
          </div>

          <div className="portalMetricCard">
            <div>
              <span>Hitos completados</span>
              <strong>{completed}/{milestones.length}</strong>
              <ProgressBar value={(completed / Math.max(1, milestones.length)) * 100} status="Finalizado" />
            </div>
            <Flag size={28} />
          </div>

          <div className="portalMetricCard">
            <div>
              <span>Pendientes cliente</span>
              <strong>{completedPending}/{pending.length}</strong>
              <ProgressBar value={(completedPending / Math.max(1, pending.length)) * 100} status="En validación" />
            </div>
            <Hourglass size={28} />
          </div>
        </div>
      </section>

      <section className="portalNextStep">
        <div>
          <div className="eyebrow">Próximo paso</div>
          <h3>{project.nextStep}</h3>
          <p>{project.nextDate}</p>
        </div>

        <button className="plainPortalAction" onClick={() => setView("ruta")}>
          Ver ruta del proyecto
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}


function DashboardMiniGauge({ value = 0 }) {
  const safe = Math.max(0, Math.min(Number(value) || 0, 100));
  const radius = 46;
  const circumference = Math.PI * radius;
  const dash = (safe / 100) * circumference;

  return (
    <div className="dashboardGaugeWrap paintedGauge" style={{ "--gauge-value": safe }}>
      <svg className="dashboardGaugeSvg" viewBox="0 0 120 74" role="img" aria-label={`Avance general ${safe}%`}>
        <path className="dashboardGaugeBaseArc" d="M14 60 A46 46 0 0 1 106 60" pathLength="100" />
        <path className="dashboardGaugeProgressArc" d="M14 60 A46 46 0 0 1 106 60" pathLength="100" style={{ strokeDasharray: `${safe} 100` }} />
        <line className="dashboardGaugeNeedleSvg" x1="60" y1="60" x2="60" y2="24" style={{ transform: `rotate(${(safe / 100) * 180 - 90}deg)`, transformOrigin: "60px 60px" }} />
        <circle className="dashboardGaugeNeedleHub" cx="60" cy="60" r="5.6" />
      </svg>
      <div className="dashboardGaugeLabels"><span>0</span><span>100%</span></div>
    </div>
  );
}

function DashboardMiniThermometer({ value = 0 }) {
  const safe = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div className="thermoWidget">
      <div className="thermoScale"><span>100%</span><span>50%</span><span>0%</span></div>
      <div className="thermoTube">
        <div className="thermoGradient" />
        <div className="thermoBulb" />
        <div className="thermoMarker" style={{ bottom: `calc(${safe}% - 5px)` }} />
      </div>
      <div className="thermoLegend">
        <span><i className="swatch danger"></i>Crítico</span>
        <span><i className="swatch warning"></i>Seguimiento</span>
        <span><i className="swatch success"></i>Controlado</span>
      </div>
    </div>
  );
}

function DashboardMiniMilestones({ done = 0, total = 0 }) {
  const count = Math.max(total || 0, 4);
  return (
    <div className="miniMilestoneChart">
      <div className="miniMilestoneBars">
        {Array.from({ length: count }).map((_, index) => {
          const active = index < done;
          const current = index === done && done < count;
          return (
            <div key={index} className={`miniMilestoneCol ${active ? 'done' : current ? 'current' : 'todo'}`}>
              <span>{index + 1}</span>
              <div className="miniMilestoneBar" />
            </div>
          );
        })}
      </div>
      <div className="miniMilestoneFoot">Total {total} hitos</div>
    </div>
  );
}

function DashboardMiniPending({ pending = 0, done = 0 }) {
  const total = Math.max(pending + done, 1);
  return (
    <div className="miniPendingChart">
      <div className="miniPendingRow"><span>Pendiente</span><div className="miniPendingBar"><i style={{ width: `${(pending / total) * 100}%` }} /></div><strong>{pending}</strong></div>
      <div className="miniPendingRow"><span>Completado</span><div className="miniPendingBar success"><i style={{ width: `${(done / total) * 100}%` }} /></div><strong>{done}</strong></div>
      <div className="miniPendingLine">
        <svg viewBox="0 0 160 46" preserveAspectRatio="none">
          <polyline points="0,36 32,30 64,22 96,27 128,18 160,12" fill="rgba(0,184,181,0.12)" stroke="rgba(0,184,181,0.0)" />
          <polyline points="0,36 32,30 64,22 96,27 128,18 160,12" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function DashboardMiniBlockers({ blocked = 0 }) {
  const safeBlocked = Math.max(0, Number(blocked) || 0);
  const mood = safeBlocked > 0 ? "Atención" : "All Good";
  const linePoints = safeBlocked > 0
    ? "0,20 18,19 36,18 54,17 72,15 90,18 108,21 120,23"
    : "0,22 18,22 36,22 54,20 72,20 90,13 108,11 120,8";
  const markerLeft = safeBlocked > 0 ? Math.min(92, 22 + safeBlocked * 17) : 12;

  return (
    <div className={`miniBlockerWidget cleanBlocker ${safeBlocked > 0 ? "hasBlocks" : "noBlocks"}`}>
      <div className="miniBlockerFaceOnly">
        <div className="miniSmileFace">{safeBlocked > 0 ? "ðŸ˜" : "ðŸ˜Š"}</div>
        <strong>{mood}</strong>
      </div>
      <div className="miniSparkline">
        <span className={`sparkCheck ${safeBlocked > 0 ? "alert" : "ok"}`}>{safeBlocked > 0 ? "!" : "✓"}</span>
        <svg viewBox="0 0 120 26" preserveAspectRatio="none">
          <polyline points={linePoints} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={markerLeft} cy={safeBlocked > 0 ? 18 : 20} r="3.2" fill="var(--brand)" />
        </svg>
      </div>
    </div>
  );
}

function normalizeSystemName(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

const BUSINESS_POWER_SYSTEMS = [
  {
    short: "S1",
    label: "Operación sin Caos",
    keys: ["operacion sin caos", "operación sin caos", "procesos", "sistema 1"],
    fallback: 0,
  },
  {
    short: "S2",
    label: "Talento en el Rol Correcto",
    keys: ["talento en el rol correcto", "talento", "estructura", "roles", "sistema 2"],
    fallback: 0,
  },
  {
    short: "S3",
    label: "Salarios Justos que Retienen",
    keys: ["salarios justos que retienen", "salarios", "salarial", "remuneracion", "remuneración", "sistema 3"],
    fallback: 0,
  },
  {
    short: "S4",
    label: "Desempeño que Optimiza la Estructura",
    keys: ["desempeno que optimiza la estructura", "desempeño que optimiza la estructura", "desempeno", "desempeño", "evaluacion", "evaluación", "sistema 4"],
    fallback: 0,
  },
  {
    short: "S5",
    label: "K&ZEN Interno Permanente",
    keys: ["kzen interno permanente", "k zen interno permanente", "kaizen", "mejora continua", "k&zen", "sistema 5"],
    fallback: 0,
  },
];

function isCompletedStatus(status = "") {
  const normalized = normalizeSystemName(status);
  return (
    normalized.includes("finalizado") ||
    normalized.includes("aprobado") ||
    normalized.includes("completado") ||
    normalized.includes("terminado")
  );
}

function isPendingCompleted(item = {}) {
  const status = normalizeSystemName(item.status || "");
  const validation = normalizeSystemName(item.validationClient || item.validacionCliente || "");
  return status.includes("terminado") || validation.includes("validado");
}

function isPendingBlocked(item = {}) {
  const status = normalizeSystemName(item.status || "");
  return status.includes("bloqueado") && !isPendingCompleted(item);
}

function isPendingActive(item = {}) {
  return !isPendingCompleted(item);
}

function getSystemScores({ milestones = [], deliverables = [], projectProgress = 0 }) {
  const sourceItems = [
    ...milestones.map((item) => ({ system: item.system, progress: Number(item.progress) || 0, title: item.title })),
    ...deliverables.map((item) => ({ system: item.system, progress: Number(item.progress) || 0, title: item.deliverable })),
  ];

  return BUSINESS_POWER_SYSTEMS.map((system) => {
    const values = sourceItems
      .filter((item) => {
        const systemText = normalizeSystemName(`${item.system || ""} ${item.title || ""}`);
        return system.keys.some((key) => systemText.includes(normalizeSystemName(key)));
      })
      .map((item) => Number(item.progress) || 0);

    const score = values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : Math.max(system.fallback, Math.round((Number(projectProgress) || 0) * 0.35));

    return { ...system, value: Math.max(0, Math.min(score, 100)) };
  });
}

function DashboardDisorderVisual({ project, milestones = [], deliverables = [] }) {
  const progress = Number(project?.progress) || 0;
  const systemScores = getSystemScores({ milestones, deliverables, projectProgress: progress });
  const chaosRaw = [92, 88, 84, 78, 70, 63, 55, 48];
  const chaos = chaosRaw.map((value, index) => Math.max(10, Math.min(95, Math.round(value - progress * 0.55 + ((index % 3) - 1) * 3))));
  const order = chaos.map((v) => 100 - v);
  const labels = ['Inicio', 'S1', 'S2', 'S3', 'S4', 'S5', 'Cierre', 'Actual'];

  return (
    <div className="dashboardSplitGrid">
      <div className="dashboardChartCard">
        <div className="dashboardChartTitle">Desorden operativo mensual</div>
        <div className="chartLegendRow"><span><i className="legendDot danger"></i>Caos</span><span><i className="legendDot brand"></i>Orden</span></div>
        <div className="dashboardBarsChart">
          {labels.map((label, index) => (
            <div key={label} className="dashboardBarGroup">
              <div className="dashboardBars">
                <div className="dashboardBar danger" style={{ height: `${chaos[index]}%` }} />
                <div className="dashboardBar brand" style={{ height: `${order[index]}%` }} />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboardChartCard">
        <div className="dashboardChartTitle">Radar de avance por sistema</div>
        <DashboardRadar systemScores={systemScores} />
      </div>
    </div>
  );
}

function DashboardRadar({ systemScores = [] }) {
  const scores = systemScores.length ? systemScores : BUSINESS_POWER_SYSTEMS.map((system) => ({ ...system, value: 0 }));
  const values = scores.map((item) => item.value);
  const pendingValues = values.map((v) => Math.max(8, 100 - v));
  const size = 300;
  const center = size / 2;
  const radius = 88;
  const pointsFor = (arr) => arr.map((value, index) => {
    const angle = (Math.PI * 2 * index) / arr.length - Math.PI / 2;
    const r = radius * (value / 100);
    return `${(center + Math.cos(angle) * r).toFixed(1)},${(center + Math.sin(angle) * r).toFixed(1)}`;
  }).join(' ');
  const axisEnd = scores.map((_, index) => {
    const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      tx: center + Math.cos(angle) * (radius + 34),
      ty: center + Math.sin(angle) * (radius + 34),
    };
  });

  return (
    <div className="dashboardRadarWrap radarFiveSystems">
      <svg viewBox={`0 0 ${size} ${size}`} className="dashboardRadarSvg" role="img" aria-label="Radar de avance de los cinco sistemas de Business Power">
        {[20,40,60,80,100].map((step) => {
          const poly = scores.map((_, index) => {
            const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
            const r = radius * (step / 100);
            return `${(center + Math.cos(angle) * r).toFixed(1)},${(center + Math.sin(angle) * r).toFixed(1)}`;
          }).join(' ');
          return <polygon key={step} points={poly} fill="none" stroke="rgba(11,69,78,0.12)" strokeWidth="1" />;
        })}
        {axisEnd.map((axis, index) => <line key={index} x1={center} y1={center} x2={axis.x} y2={axis.y} stroke="rgba(11,69,78,0.12)" strokeWidth="1" />)}
        <polygon points={pointsFor(pendingValues)} fill="rgba(255,120,92,0.16)" stroke="rgba(255,120,92,0.42)" strokeWidth="2" />
        <polygon points={pointsFor(values)} fill="rgba(0,184,181,0.24)" stroke="rgba(0,184,181,0.95)" strokeWidth="2.5" />
        {axisEnd.map((axis, index) => (
          <text key={index} x={axis.tx} y={axis.ty} textAnchor="middle" className="dashboardRadarLabel">
            {scores[index].short}
          </text>
        ))}
      </svg>
      <div className="radarSystemLegend">
        {scores.map((item) => (
          <div className="radarSystemItem" key={item.label} title={item.label}>
            <span>{item.short}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
      <div className="chartLegendRow radarLegend"><span><i className="legendDot danger"></i>Pendiente</span><span><i className="legendDot brand"></i>Avance</span></div>
    </div>
  );
}


function SummaryInsightCards({ project, milestones = [], deliverables = [], findings = [], processesAsIs = [], processesToBe = [], coeAsIs = [], coeToBe = [] }) {
  const systemScores = getSystemScores({ milestones, deliverables, projectProgress: Number(project?.progress) || 0 });

  const totalCost = (rows = []) => rows.reduce((sum, item) => {
    const cost = parseNumericValue(item.cost ?? item.costo ?? item["COSTO (xmin)"] ?? 0);
    const frequency = parseNumericValue(item.frequency ?? item.frecuencia ?? item.FRECUENCIA ?? 1) || 1;
    return sum + (cost * frequency);
  }, 0);

  const summarizeStatus = (rows = []) => {
    return rows.reduce((acc, item) => {
      const status = normalizeSystemName(item.status || item.estado || item.observation || item.observacion || item["OBSERVACIÓN"] || "");
      if (status.includes("completado") || status.includes("finalizado") || status.includes("terminado") || status.includes("solucionado")) {
        acc.completed += 1;
      } else if (status.includes("proceso") || status.includes("desarrollo") || status.includes("desarollo") || status.includes("revision")) {
        acc.inProcess += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    }, { pending: 0, inProcess: 0, completed: 0 });
  };

  const summarizeActivityStatus = (rows = []) => {
    const hasText = (value, words) => words.some((word) => normalizeSystemName(value).includes(word));
    return rows.reduce((acc, item) => {
      const status = item.status || item.estado || item.observation || item.observacion || item["OBSERVACIÓN"] || "";
      if (hasText(status, ["mantiene", "mantenido", "mantenida", "mantener", "se mantiene"])) acc.maintained += 1;
      else if (hasText(status, ["elimina", "eliminado", "eliminada", "eliminar"])) acc.deleted += 1;
      else if (hasText(status, ["agrega", "agregado", "agregada", "agregar", "nuevo", "nueva"])) acc.added += 1;
      return acc;
    }, { maintained: 0, deleted: 0, added: 0 });
  };

  const asIsCOE = totalCost(coeAsIs);
  const toBeCOE = totalCost(coeToBe);
  const coeDelta = asIsCOE - toBeCOE;
  const coePercent = asIsCOE > 0 ? (coeDelta / asIsCOE) * 100 : 0;
  const findingsStatus = summarizeStatus(findings);
  const activityStatus = summarizeActivityStatus([...coeAsIs, ...coeToBe]);

  return (
    <div className="summaryBottomGrid fourCards">
      <article className="summaryBottomCard summaryRadarCard">
        <div className="summaryBottomHeader">
          <div>
            <h3>Avance por sistemas</h3>
          </div>
        </div>
        <div className="summaryRadarMini">
          <DashboardRadar systemScores={systemScores} />
        </div>
      </article>

      <article className="summaryBottomCard summaryFindingsCard">
        <div className="summaryBottomHeader">
          <div>
            <h3>Total de hallazgos</h3>
          </div>
          <strong className="summaryBigNumber">{findings.length}</strong>
        </div>
        <div className="summaryMiniBars">
          <div className="summaryMiniRow">
            <span>Pendiente</span>
            <div className="summaryMiniTrack"><i style={{ width: `${findings.length ? (findingsStatus.pending / findings.length) * 100 : 0}%` }} /></div>
            <strong>{findingsStatus.pending}</strong>
          </div>
          <div className="summaryMiniRow">
            <span>En proceso</span>
            <div className="summaryMiniTrack"><i style={{ width: `${findings.length ? (findingsStatus.inProcess / findings.length) * 100 : 0}%` }} /></div>
            <strong>{findingsStatus.inProcess}</strong>
          </div>
          <div className="summaryMiniRow">
            <span>Completado</span>
            <div className="summaryMiniTrack"><i style={{ width: `${findings.length ? (findingsStatus.completed / findings.length) * 100 : 0}%` }} /></div>
            <strong>{findingsStatus.completed}</strong>
          </div>
        </div>
        <p>Clasificación según la columna Estado.</p>
      </article>

      <article className="summaryBottomCard summaryCOECard">
        <div className="summaryBottomHeader">
          <div>
            <h3>COE mensual</h3>
          </div>
        </div>
        <strong className="summaryCOEValue">${formatCurrency(Math.abs(coeDelta))}</strong>
        <div className="summaryCOEPill">{Math.abs(coePercent).toFixed(1)}%</div>
        <p>{coeDelta >= 0 ? "Reducción estimada frente al AS IS." : "Incremento estimado frente al AS IS."}</p>
      </article>

      <article className="summaryBottomCard summaryActivitiesCard">
        <div className="summaryBottomHeader">
          <div>
            <h3>Estado de actividades</h3>
          </div>
        </div>
        <div className="summaryActivityCreative">
          <div>
            <strong>{activityStatus.maintained}</strong>
            <span>Mantenidas</span>
          </div>
          <div>
            <strong>{activityStatus.deleted}</strong>
            <span>Eliminadas</span>
          </div>
          <div>
            <strong>{activityStatus.added}</strong>
            <span>Agregadas</span>
          </div>
        </div>
        <div className="summaryActivityLine">
          <i style={{ width: `${Math.min(100, Math.max(5, activityStatus.maintained * 4))}%` }} />
          <i style={{ width: `${Math.min(100, Math.max(5, activityStatus.deleted * 4))}%` }} />
          <i style={{ width: `${Math.min(100, Math.max(5, activityStatus.added * 4))}%` }} />
        </div>
        <p>Lectura consolidada de AS IS y TO BE.</p>
      </article>
    </div>
  );
}

function AppTopbar({ project, pending = [], meetings = [], updates = [], milestones = [], findings = [], deliverables = [], documents = [], education = [], processesAsIs = [], processesToBe = [], setView, setSelectedHito, setSelectedDeliverable, onLogout }) {
  const [openPanel, setOpenPanel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const meetUrl = safeUrl(project?.linkMeet);
  const activePending = pending.filter(isPendingActive).length;

  const meetingItems = [
    ...meetings.map((item) => ({
      title: item.title || "Reunion",
      date: [item.date, item.time].filter(Boolean).join(" - ") || "Por definir",
      link: safeUrl(item.link) || meetUrl,
      status: item.status,
    })),
    {
      title: project?.nextStep || "Proxima reunion",
      date: project?.nextDate || "Por definir",
      link: meetUrl,
    },
    ...updates
      .filter((item) => normalizeSystemName(`${item.target || ""} ${item.title || ""} ${item.text || ""}`).includes("reunion"))
      .slice(0, 3)
      .map((item) => ({ title: item.title || "Reunion", date: item.text || "Por definir", link: meetUrl })),
  ].filter((item) => item.title || item.date);

  const pendingItems = pending.filter(isPendingActive).slice(0, 8);
  const query = normalizeSystemName(searchTerm);
  const searchResults = query ? [
    ...milestones.map((item) => ({
      type: "Hito",
      title: item.title,
      detail: [item.id, item.status, item.targetDate].filter(Boolean).join(" - "),
      view: "ruta",
      action: () => setSelectedHito?.(item.title || ""),
      haystack: `${item.id} ${item.title} ${item.status} ${item.system} ${item.description}`,
    })),
    ...findings.map((item) => ({
      type: "Hallazgo",
      title: item.finding,
      detail: [item.priority, item.status, item.management, item.areaDetail].filter(Boolean).join(" - "),
      view: "hallazgos",
      haystack: `${item.id} ${item.finding} ${item.description} ${item.priority} ${item.status} ${item.management} ${item.areaDetail}`,
    })),
    ...pending.map((item) => ({
      type: "Pendiente",
      title: item.request,
      detail: [item.status, item.dueDate].filter(Boolean).join(" - "),
      view: "pendientes",
      haystack: `${item.request} ${item.status} ${item.owner} ${item.blocks} ${item.description}`,
    })),
    ...deliverables.map((item) => ({
      type: "Entregable",
      title: item.deliverable,
      detail: [item.system, item.status, item.responsible].filter(Boolean).join(" - "),
      view: "entregables",
      action: () => setSelectedDeliverable?.(item.deliverable || ""),
      haystack: `${item.deliverable} ${item.system} ${item.milestone} ${item.status} ${item.responsible}`,
    })),
    ...documents.map((item) => ({
      type: "Documento",
      title: item.item || item.title,
      detail: [item.category, item.status].filter(Boolean).join(" - "),
      view: "documentos",
      haystack: `${item.title} ${item.item} ${item.category} ${item.status} ${item.detail}`,
    })),
    ...education.map((item) => ({
      type: "Info",
      title: item.deliverable,
      detail: [item.system, item.status].filter(Boolean).join(" - "),
      view: "educacion",
      haystack: `${item.deliverable} ${item.system} ${item.milestone} ${item.whatIs} ${item.purpose}`,
    })),
    ...processesAsIs.map((item) => ({
      type: "Proceso AS IS",
      title: item.processName,
      detail: [item.type, item.processCode].filter(Boolean).join(" - "),
      view: "procesos",
      haystack: `${item.processName} ${item.processCode} ${item.type} ${item.macroName} ${item.description}`,
    })),
    ...processesToBe.map((item) => ({
      type: "Proceso TO BE",
      title: item.processName,
      detail: [item.type, item.status, item.processCode].filter(Boolean).join(" - "),
      view: "procesos",
      haystack: `${item.processName} ${item.processCode} ${item.type} ${item.status} ${item.macroName} ${item.changes}`,
    })),
  ]
    .filter((item) => normalizeSystemName(item.haystack).includes(query))
    .slice(0, 10) : [];

  const goToResult = (item) => {
    item.action?.();
    setView?.(item.view);
    setSearchTerm("");
    setOpenPanel("");
  };

  return (
    <div className="canvaTopbar appGlobalTopbar">
      <div className="canvaActionWrap globalSearchWrap">
        <label className="canvaSearch">
          <Search size={18} />
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setOpenPanel(event.target.value ? "search" : "");
            }}
            onFocus={() => searchTerm && setOpenPanel("search")}
            placeholder="Buscar"
          />
        </label>
        {openPanel === "search" && (
          <div className="canvaPopover canvaSearchResults">
            <h4>Resultados</h4>
            {searchResults.map((item, index) => (
              <button className="canvaPopoverItem asButton" key={`${item.type}-${item.title}-${index}`} onClick={() => goToResult(item)}>
                <Search size={16} />
                <div>
                  <strong>{item.title || "Sin titulo"}</strong>
                  <span>{item.type}{item.detail ? ` - ${item.detail}` : ""}</span>
                </div>
              </button>
            ))}
            {!searchResults.length && <p className="canvaEmptyText">No hay resultados para esa busqueda.</p>}
          </div>
        )}
      </div>

      <div className="canvaTopActions">
        <div className="canvaActionWrap">
          <button className="canvaIconAction" onClick={() => setOpenPanel(openPanel === "meetings" ? "" : "meetings")} aria-label="Reuniones">
            <Clock3 size={18} />
            <span>Reuniones</span>
          </button>
          {openPanel === "meetings" && (
            <div className="canvaPopover">
              <h4>Reuniones</h4>
              {meetingItems.map((item, index) => (
                <div className="canvaPopoverItem" key={`${item.title}-${index}`}>
                  <CalendarDays size={16} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.date}</span>
                    {item.status && <span>{item.status}</span>}
                    {item.link && <a href={item.link} target="_blank" rel="noreferrer">Conectarse</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="canvaActionWrap">
          <button className="canvaIconAction" onClick={() => setOpenPanel(openPanel === "pending" ? "" : "pending")} aria-label="Pendientes">
            <Bell size={18} />
            {activePending > 0 && <i>{activePending}</i>}
            <span>Pendientes</span>
          </button>
          {openPanel === "pending" && (
            <div className="canvaPopover right">
              <h4>Pendientes</h4>
              {pendingItems.map((item, index) => (
                <button className="canvaPopoverItem asButton" key={`${item.request}-${index}`} onClick={() => setView?.("pendientes")}>
                  <AlertTriangle size={16} />
                  <div>
                    <strong>{item.request}</strong>
                    <span>{item.dueDate || "Por definir"} - {item.status || "Pendiente"}</span>
                  </div>
                </button>
              ))}
              {!pendingItems.length && <p className="canvaEmptyText">No hay pendientes activos.</p>}
            </div>
          )}
        </div>

        <Logo src={project?.logoClient} fallback={(project?.companyClient || project?.client || "CL").slice(0, 2)} className="canvaTopLogo" />
        <span className="canvaUserName">{project?.contactName || project?.responsibleClient || "Cliente"}</span>
        <button className="topbarLogoutButton" type="button" onClick={onLogout}>
          Salir
        </button>
      </div>
    </div>
  );
}

function SummaryCanvaDashboard({ project, milestones = [], pending = [], findings = [], deliverables = [], processesAsIs = [], processesToBe = [], coeAsIs = [], coeToBe = [], updates = [], meetings = [], setView }) {
  const [openPanel, setOpenPanel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const projectProgress = Number(project?.progress) || 0;
  const disorder = Math.max(0, 100 - projectProgress);
  const completedMilestones = milestones.filter((item) => isCompletedStatus(item.status)).length;
  const activePending = pending.filter(isPendingActive).length;
  const meetUrl = safeUrl(project?.linkMeet);

  const meetingItems = [
    ...meetings.map((item) => ({
      title: item.title || "Reunión",
      date: [item.date, item.time].filter(Boolean).join(" · ") || "Por definir",
      link: safeUrl(item.link) || meetUrl,
      status: item.status,
      observation: item.observation,
    })),
    {
      title: project?.nextStep || "Próxima reunión",
      date: project?.nextDate || "Por definir",
      link: meetUrl,
    },
    ...updates
      .filter((item) => normalizeSystemName(`${item.target || ""} ${item.title || ""} ${item.text || ""}`).includes("reunion"))
      .slice(0, 3)
      .map((item) => ({ title: item.title || "Reunión", date: item.text || "Por definir", link: meetUrl })),
  ].filter((item) => item.title || item.date);

  const pendingItems = pending.filter(isPendingActive).slice(0, 8);
  const isMilestoneOpen = (item = {}, index = 0) => {
    const explicit = normalizeSystemName(item.open || item.abierto || "");
    if (explicit) return explicit === "si" || explicit === "sí" || explicit.includes("abierto") || explicit.includes("disponible");
    return index < 4 || isCompletedStatus(item.status);
  };
  const routeSource = milestones.slice(0, 13);
  const allMilestones = Array.from({ length: 13 }, (_, index) => {
    const item = routeSource[index] || {};
    const code = item.id || `E${index}`;
    const title = item.title || "Por definir";
    const status = item.status || (index < 4 ? "Abierto" : "Cerrado");
    const unlocked = isMilestoneOpen(item, index);
    return {
      ...item,
      id: code,
      title,
      status,
      date: item.targetDate || item.date || "Fecha",
      unlocked,
      completed: isCompletedStatus(status),
    };
  });
  const visibleCompletedMilestones = allMilestones.filter((item) => isCompletedStatus(item.status)).length;
  const pinIndex = Math.max(0, allMilestones.findLastIndex((item) => item.unlocked));
  const unlockedMilestoneRaw = allMilestones[pinIndex]?.id ?? pinIndex;
  const unlockedMilestoneCode = String(unlockedMilestoneRaw).replace(/^E/i, "").replace(".0", "") || "0";

  const totalCost = (rows = []) => rows.reduce((sum, item) => {
    const cost = parseNumericValue(item.cost ?? item.costo ?? item["COSTO (xmin)"] ?? 0);
    const frequency = parseNumericValue(item.frequency ?? item.frecuencia ?? item.FRECUENCIA ?? 1) || 1;
    return sum + (cost * frequency);
  }, 0);
  const asIsCOE = totalCost(coeAsIs);
  const toBeCOE = totalCost(coeToBe);
  const coeDelta = asIsCOE - toBeCOE;
  const coePercent = asIsCOE > 0 ? (coeDelta / asIsCOE) * 100 : 0;

  const statusClass = (status = "") => {
    const text = normalizeSystemName(status);
    if (text.includes("cerrado")) return "closed";
    if (isCompletedStatus(status)) return "done";
    if (text.includes("desarrollo") || text.includes("proceso")) return "active";
    return "pending";
  };
  const countByStatus = (rows = []) => {
    const buckets = new Map();
    rows.forEach((item) => {
      const label = item.status || "Sin estado";
      buckets.set(label, (buckets.get(label) || 0) + 1);
    });
    return Array.from(buckets.entries()).map(([label, value]) => {
      const text = normalizeSystemName(label);
      const color = text.includes("complet") || text.includes("finaliz") || text.includes("aprob")
        ? "#00b8b5"
        : text.includes("desarrollo") || text.includes("proceso")
          ? "#53676b"
          : text.includes("pendiente")
            ? "#b9c4c6"
            : "#102f37";
      return { label, value, color };
    });
  };

  const systemMetrics = [
    {
      label: "Hallazgos",
      total: findings.length,
      value: findings.filter((item) => isCompletedStatus(item.status)).length,
      note: "Completado",
      segments: countByStatus(findings),
    },
    {
      label: "Perfiles",
      total: 0,
      value: 0,
      note: "Pendiente de datos",
      segments: [],
    },
    {
      label: "Nivel de empleabilidad",
      total: 0,
      value: 0,
      note: "Pendiente de datos",
      segments: [],
    },
    {
      label: "Desempeño",
      total: 0,
      value: 0,
      note: "Pendiente de datos",
      segments: [],
    },
    {
      label: "Masa Salarial",
      total: 0,
      value: 0,
      note: "Pendiente de datos",
      segments: [],
    },
  ];

  const filteredDetail = milestones.filter((item) => {
    const query = normalizeSystemName(searchTerm);
    if (!query) return true;
    return normalizeSystemName(`${item.id} ${item.title} ${item.status} ${item.system}`).includes(query);
  });

  return (
    <section className="canvaSummary">
      <div className="canvaWelcome">
        <h2>Hola, {project?.contactName || project?.companyClient || project?.client || "Nombre del Cliente"}</h2>
        <p>Bienvenido a tu Ruta de Implementación Visible (RIV)</p>
      </div>

      <div className="canvaKpiRow">
        <button className="canvaKpiCard" onClick={() => setView?.("ruta")}>
          <div><span>Avance General</span><strong>{projectProgress}%</strong></div>
          <Rocket size={30} />
        </button>
        <button className="canvaKpiCard">
          <div><span>Desorden Operativo</span><strong>{disorder.toFixed(2)}%</strong></div>
          <AlertTriangle size={30} />
        </button>
        <button className="canvaKpiCard" onClick={() => setView?.("pendientes")}>
          <div><span>Pendientes Cliente</span><strong>{activePending}</strong></div>
          <Hourglass size={30} />
        </button>
      </div>

      <div className="canvaMainGrid">
        <article className="canvaPanel canvaMilestonePanel">
          <div className="canvaPanelHeader">
            <div>
              <h3>Hitos Completados</h3>
              <strong>{visibleCompletedMilestones}/{allMilestones.length}</strong>
            </div>
            <div>
              <span>Desbloqueado hasta</span>
              <strong>E{unlockedMilestoneCode}/E12</strong>
            </div>
          </div>
          <div className="canvaRouteScroll">
            <CanvaMilestonePath milestones={allMilestones} pinIndex={pinIndex} statusClass={statusClass} setView={setView} />
          </div>
        </article>

        <article className="canvaPanel canvaCoePanel">
          <div className="canvaPanelHeader">
            <div>
              <h3>COE</h3>
              <strong>${formatCurrency(Math.abs(coeDelta))}</strong>
              <strong>{Math.abs(coePercent).toFixed(0)}%</strong>
            </div>
            <div className="canvaLegend">
              <span><i></i> COE AS IS</span>
              <span><i className="muted"></i> COE TO BE</span>
            </div>
          </div>
          <CanvaTrendChart coeAsIs={coeAsIs} coeToBe={coeToBe} asIs={asIsCOE} toBe={toBeCOE} progress={projectProgress} />
        </article>

        <article className="canvaPanel canvaSystemsPanel">
          <h3>Avances por Sistema</h3>
          <div className="canvaSystemGrid">
            {systemMetrics.map((item) => (
              <div className="canvaSystemMetric" key={item.label}>
                <strong>{item.total}</strong>
                <span>{item.label}</span>
                <CanvaRing value={item.value} total={Math.max(item.total, item.value, 1)} segments={item.segments} />
              </div>
            ))}
          </div>
        </article>

        <article className="canvaPanel canvaDetailPanel">
          <h3>Detalle de Avance Hitos</h3>
          <div className="canvaDetailTable">
            <div className="canvaDetailHead"><span>ID</span><span>Nombre</span><span>Estado</span><span>Avance</span></div>
            {(filteredDetail.length ? filteredDetail : milestones).map((item, index) => (
              <button className="canvaDetailRow" key={`${item.id}-${index}`} onClick={() => setView?.("ruta")}>
                <span>{item.id}</span>
                <span>{item.title}</span>
                <em className={statusClass(item.status)}>{item.status || "Pendiente"}</em>
                <strong>{Number(item.progress) || 0}%</strong>
              </button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function CanvaRing({ value = 0, total = 1, segments = [] }) {
  const [activeSegment, setActiveSegment] = useState(null);
  const cleanSegments = segments.filter((item) => item.value > 0);
  const totalSegments = cleanSegments.reduce((sum, item) => sum + item.value, 0);
  const active = activeSegment || cleanSegments.find((item) => normalizeSystemName(item.label).includes("complet") || normalizeSystemName(item.label).includes("finaliz") || normalizeSystemName(item.label).includes("aprob")) || (cleanSegments.length ? cleanSegments[0] : null);
  let cursor = 0;
  const segmentGradient = cleanSegments.map((item, index) => {
    const start = cursor;
    const end = cursor + (item.value / Math.max(1, totalSegments)) * 100;
    cursor = end;
    return `${item.color || "#b9c4c6"} ${start}% ${end}%`;
  }).join(", ");
  const percent = Math.max(0, Math.min(100, (Number(value) / Math.max(1, Number(total))) * 100));
  return (
    <div className={`canvaRingWrap ${cleanSegments.length ? "interactive" : "empty"}`}>
      <div
        className="canvaRing"
        style={{ "--ring": `${percent}%`, "--segments": segmentGradient || "#dfe7e7 0% 100%" }}
      >
        {cleanSegments.map((item) => (
          <button
            type="button"
            key={item.label}
            aria-label={`${item.label}: ${item.value}`}
            onClick={() => setActiveSegment(item)}
          />
        ))}
        <span>{active ? active.value : value}</span>
      </div>
      <small className="canvaRingLabel">{active ? active.label : cleanSegments.length ? "Estado" : "Pendiente de datos"}</small>
    </div>
  );
}

function CanvaMilestonePath({ milestones = [], pinIndex = 0, statusClass, setView }) {
  const topRow = milestones.slice(0, 6);
  const bottomRow = milestones.slice(6, 13).reverse();
  const renderNode = (item, originalIndex, extraClass = "") => (
    <button
      className={`canvaRouteNode ${extraClass} ${statusClass(item.status)} ${item.unlocked ? "unlocked" : "locked"} ${originalIndex === pinIndex ? "current" : ""}`}
      key={`${item.id}-${originalIndex}`}
      onClick={() => setView?.("ruta")}
    >
      {originalIndex === pinIndex && <MapPin className="canvaRoutePin" size={38} />}
      <span>{String(item.id).replace(".0", "")}</span>
      <ChevronRight size={13} />
      <strong>{item.title}</strong>
      <small>{item.date}</small>
      <em>{item.unlocked ? "Abierto" : "Cerrado"}</em>
    </button>
  );

  return (
    <div className="canvaRoutePath" style={{ "--pin-index": pinIndex }}>
      <div className="canvaRouteRow top">
        {topRow.map((item, index) => renderNode(item, index))}
      </div>
      <div className="canvaRouteTurn" aria-hidden="true"></div>
      <div className="canvaRouteRow bottom">
        {bottomRow.map((item) => renderNode(item, milestones.indexOf(item)))}
      </div>
    </div>
  );
}

function CanvaTrendChart({ coeAsIs = [], coeToBe = [], asIs = 0, toBe = 0, progress = 0 }) {
  const normalizeMonth = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return `Mes ${numeric}`;
    return raw;
  };
  const costFor = (item = {}) => {
    const cost = parseNumericValue(item.cost ?? item.costo ?? item["COSTO (xmin)"] ?? 0);
    const frequency = parseNumericValue(item.frequency ?? item.frecuencia ?? item.FRECUENCIA ?? 1) || 1;
    return cost * frequency;
  };
  const totalsByMonth = (rows = []) => rows.reduce((acc, item) => {
    const month = normalizeMonth(item.month || item.mes || item.MES);
    if (!month) return acc;
    acc.set(month, (acc.get(month) || 0) + costFor(item));
    return acc;
  }, new Map());

  const asIsMap = totalsByMonth(coeAsIs);
  const toBeMap = totalsByMonth(coeToBe);
  const monthLabels = [...new Set([...asIsMap.keys(), ...toBeMap.keys()])].slice(0, 6);

  if (monthLabels.length) {
    const asIsValues = monthLabels.map((month) => asIsMap.get(month) || 0);
    const toBeValues = monthLabels.map((month) => toBeMap.get(month) || 0);
    const hasRealCost = [...asIsValues, ...toBeValues].some((value) => value > 0);
    if (hasRealCost) {
      return <CanvaTrendSvg labels={monthLabels} asIsValues={asIsValues} toBeValues={toBeValues} />;
    }
  }

  const base = Number(asIs) || Math.max(40, 90 - progress);
  const target = Number(toBe) || Math.max(15, base * 0.68);
  const labels = ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"];
  const asIsValues = labels.map((month, index) => base * (0.72 + Math.sin(index * 1.35) * 0.16 + (index === 3 ? 0.34 : 0)));
  const toBeValues = labels.map((month, index) => target * (0.70 + Math.sin(index * 1.35) * 0.13 + (index === 3 ? 0.24 : 0)));
  return <CanvaTrendSvg labels={labels} asIsValues={asIsValues} toBeValues={toBeValues} />;
}

function CanvaTrendSvg({ labels = [], asIsValues = [], toBeValues = [] }) {
  const max = Math.max(...asIsValues, ...toBeValues, 1);
  const costLabel = (value) => {
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return `$${Math.round(value)}`;
  };
  const pointsFor = (values) => values.map((value, index) => {
    const step = labels.length > 1 ? 220 / (labels.length - 1) : 44;
    const x = 42 + index * step;
    const y = 142 - (value / max) * 100;
    return { x, y };
  });
  const pathFor = (values) => {
    const points = pointsFor(values);
    if (!points.length) return "";
    if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    return points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      const previous = points[index - 1];
      const previousControl = points[index - 2] || previous;
      const nextControl = points[index + 1] || point;
      const tension = 0.18;
      const c1x = previous.x + (point.x - previousControl.x) * tension;
      const c1y = previous.y + (point.y - previousControl.y) * tension;
      const c2x = point.x - (nextControl.x - previous.x) * tension;
      const c2y = point.y - (nextControl.y - previous.y) * tension;
      return `${path} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }, "");
  };

  return (
    <svg className="canvaTrendChart" viewBox="0 0 292 178" role="img" aria-label="Tendencia COE de seis meses">
      <text className="axisTitle" x="8" y="18">CLI</text>
      <line className="axisLine" x1="34" x2="34" y1="36" y2="144" />
      <line className="axisLine" x1="34" x2="268" y1="144" y2="144" />
      {[0, 1, 2].map((line) => {
        const y = 48 + line * 42;
        const value = max * (1 - (y - 42) / 100);
        return (
          <React.Fragment key={line}>
            <line x1="34" x2="268" y1={y} y2={y} />
            <text className="axisValue" x="4" y={y + 4}>{costLabel(Math.max(0, value))}</text>
          </React.Fragment>
        );
      })}
      <path d={pathFor(toBeValues)} className="toBe" />
      <path d={pathFor(asIsValues)} className="asIs" />
      {labels.map((month, index) => {
        const step = labels.length > 1 ? 220 / (labels.length - 1) : 44;
        return <text key={month} x={42 + index * step} y="164">{String(month).replace("Mes ", "")}</text>;
      })}
      <text x="242" y="172">Mes</text>
    </svg>
  );
}

function KpiCards({ project, milestones, pending, setView }) {
  const activePending = pending.filter(isPendingActive).length;
  const completedPending = pending.filter(isPendingCompleted).length;
  const blocked = pending.filter(isPendingBlocked).length;
  const disorder = Math.max(0, 100 - (Number(project.progress) || 0));

  const cards = [
    {
      label: "Avance general",
      value: `${project.progress}%`,
      note: "Histórico de progreso",
      target: "ruta",
      widget: <DashboardMiniGauge value={Number(project.progress) || 0} />,
    },
    {
      label: "Desorden operativo",
      value: `${disorder}%`,
      note: "Se reduce con el avance",
      widget: <DashboardMiniThermometer value={disorder} />,
    },
    {
      label: "Pendientes cliente",
      value: activePending,
      note: activePending ? "Seguimiento necesario" : "Todo validado",
      target: "pendientes",
      widget: <DashboardMiniPending pending={activePending} done={completedPending} />,
    },
    {
      label: "Bloqueos",
      value: blocked,
      note: blocked ? "Requieren atención" : "Operación controlada",
      target: "pendientes",
      widget: <DashboardMiniBlockers blocked={blocked} />,
    },
  ];

  return (
    <div className="dashboardKpiGrid fourCards">
      {cards.map((card) => {
        const clickable = Boolean(card.target);
        return (
          <article
            className={`dashboardWidgetCard ${clickable ? "clickable" : ""}`}
            key={card.label}
            onClick={() => clickable && setView?.(card.target)}
          >
            <div className="dashboardWidgetHeader">
              <span>{card.label}</span>
            </div>
            <div className="dashboardWidgetValue">{card.value}</div>
            <div className="dashboardWidgetGraphic">{card.widget}</div>
            <div className="dashboardWidgetFooter">{card.note}</div>
          </article>
        );
      })}
    </div>
  );
}

function MilestonesExecutive({ milestones, setView, selectedHito = "", setSelectedHito }) {
  const total = milestones.length || 0;
  const completed = milestones.filter((m) => isCompletedStatus(m.status)).length;
  const completionWidth = total ? (completed / total) * 100 : 0;

  return (
    <section className="card hitosProgressCard hitosNamesCard">
      <div className="hitosProgressLayout">
        <div className="hitosProgressStat">
          <div className="hitosMiniAccent" />
          <div className="hitosProgressValue">{completed}/{total}</div>
          <div className="hitosProgressLabel">HITOS CUMPLIDOS</div>
          <p className="hitosProgressSubcopy">Avance visible según los hitos finalizados, aprobados o completados.</p>
        </div>

        <div className="hitosProgressMain">
          <div className="hitosProgressHeader">
            <div>
              <h2>Hitos completados</h2>
              <p>La barra se pinta conforme se completan los hitos del proyecto.</p>
            </div>
            <Badge status="En validación">{completed} de {total} completados</Badge>
          </div>

          <div className="hitosNamesScroller">
            <div className="hitosTrackLabels hitosTrackLabelsNamed" style={{ gridTemplateColumns: `repeat(${Math.max(total, 1)}, minmax(128px, 1fr))` }}>
              {milestones.map((m, index) => {
                const completedStatus = isCompletedStatus(m.status);
                return (
                  <button
                    key={`${m.id}-${m.title}`}
                    className={`hitosTrackLabel named ${selectedHito === m.title ? "selected" : ""} ${completedStatus ? "completed" : ""}`}
                    onClick={() => {
                      setSelectedHito?.(m.title);
                      setView?.("ruta");
                    }}
                    title={m.title}
                  >
                    <span className="hitoCode">{m.id ? `E${m.id}` : `E${index + 1}`}</span>
                    <span className="hitoName">{m.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="hitosLineWrap namedLine" style={{ minWidth: `${Math.max(total, 1) * 128}px` }}>
              <div className="hitosLineBase" />
              <div className="hitosLineFill" style={{ width: `${completionWidth}%` }} />
              {milestones.map((m, index) => {
                const done = isCompletedStatus(m.status);
                const active = selectedHito === m.title;
                const pos = total <= 1 ? 0 : (index / (total - 1)) * 100;
                return (
                  <button
                    key={`dot-${m.id}-${index}`}
                    className={`hitosDot ${done ? "done" : ""} ${active ? "active" : ""}`}
                    style={{ left: `${pos}%` }}
                    onClick={() => {
                      setSelectedHito?.(m.title);
                      setView?.("ruta");
                    }}
                    aria-label={`${m.id ? `E${m.id}` : `E${index + 1}`} ${m.title}`}
                    title={`${m.title} · ${m.status || "Sin estado"}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="hitosProgressHelp">Haz clic en cualquier hito para revisar su descripción, qué incluye y enlace dentro de la Ruta del proyecto.</div>
        </div>
      </div>
    </section>
  );
}


function HitosStatusMatrix({ milestones = [], setView, setSelectedHito }) {
  const getStatusClass = (status = "") => {
    const value = normalizeSystemName(status);
    if (value.includes("completado") || value.includes("finalizado") || value.includes("terminado") || value.includes("aprobado")) return "completed";
    if (value.includes("proceso") || value.includes("desarrollo") || value.includes("desarollo") || value.includes("revision")) return "process";
    if (value.includes("pendiente") || value.includes("planificado")) return "planned";
    return "planned";
  };

  return (
    <section className="card summaryHitosStatusCard">
      <div className="summaryHitosStatusHeader">
        <h3>Detalle de estado de hitos del proyecto</h3>
        <Badge status="En validación">{milestones.length} hitos</Badge>
      </div>

      <div className="summaryHitosStatusTableWrap">
        <table className="summaryHitosStatusTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hito</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((item, index) => {
              const code = item.id ? `E${item.id}` : `E${index}`;
              const status = item.status || "Planificado";
              return (
                <tr
                  key={`${code}-${item.title}`}
                  onClick={() => {
                    setSelectedHito?.(item.title);
                    setView?.("ruta");
                  }}
                >
                  <td>{code}</td>
                  <td>{item.title}</td>
                  <td>
                    <span className={`summaryHitoStatusPill ${getStatusClass(status)}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DisorderInsightsCard({ project, milestones = [], deliverables = [] }) {
  return (
    <section className="card disorderInsightsCard">
      <div className="sectionHeader executiveHeader compact">
        <div>
          <h2>Radar de avance por sistemas</h2>
          <p>Lectura visual del avance en los 5 sistemas de Business Power: procesos, talento, salarios, desempeño y K&ZEN.</p>
        </div>
      </div>
      <DashboardDisorderVisual project={project} milestones={milestones} deliverables={deliverables} />
    </section>
  );
}

function DisorderCard({ project, milestones = [], pending = [] }) {
  const progress = Number(project.progress) || 0;
  const disorder = Math.max(0, 100 - progress);
  const blocked = pending.filter((p) => String(p.status).toLowerCase().includes("bloqueado")).length;
  const status = disorder > 60 ? "Bloqueado" : disorder > 30 ? "En validación" : "Finalizado";

  return (
    <section className="card executiveDisorderCard">
      <div className="sectionHeader executiveHeader">
        <div>
          <h2>Nivel de desorden operativo</h2>
          <p>Vista ejecutiva del avance del orden estructural, basada en el progreso del proyecto y la carga actual de seguimiento.</p>
        </div>
        <Badge status={status}>{disorder}% restante</Badge>
      </div>

      <div className="executiveDisorderTopline">
        <span>Esta barra disminuye conforme avanzan los hitos, validaciones y entregables del proyecto.</span>
        <span>Bloqueos activos: <strong>{blocked}</strong></span>
      </div>

      <div className="disorderMeter executiveMeter">
        <div className="disorderLabels">
          <span>Caos</span>
          <strong>{disorder}%</strong>
          <span>Orden</span>
        </div>
        <ProgressBar value={disorder} status="Bloqueado" reverse />
      </div>

      <DashboardDisorderVisual progress={progress} />

      <div className="disorderNote executiveNote">
        Avance general: <strong>{progress}%</strong> · Desorden estimado: <strong>{disorder}%</strong> · Hitos: <strong>{milestones.length}</strong>
      </div>
    </section>
  );
}


function MilestonesExecutiveDashboard({ milestones, setView, selectedHito = "", setSelectedHito }) {
  const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;

  return (
    <section className="card executiveMilestonesCard">
      <div className="sectionHeader executiveMilestonesHeader">
        <div>
          <h2>Hitos del proyecto</h2>
          <p>Vista amplia para revisar las 12 etapas sin saturar las tarjetas superiores.</p>
        </div>
        <Badge status="Finalizado">{completed}/{milestones.length} completados</Badge>
      </div>

      <div className="executiveMilestoneGrid">
        {milestones.map((m, index) => {
          const selected = selectedHito === m.title;
          return (
            <article
              key={`${m.id}-${m.title}`}
              className={`executiveMilestoneItem ${selected ? "selected" : ""}`}
              onClick={() => {
                setSelectedHito?.(m.title);
                setView?.("ruta");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedHito?.(m.title);
                  setView?.("ruta");
                }
              }}
            >
              <div className="executiveMilestoneTop">
                <div className={`executiveMilestoneNumber ${getStatusType(m.status)}`}>
                  {getStatusType(m.status) === "success" ? <CheckCircle2 size={18} /> : (m.id || index + 1)}
                </div>
                <Badge status={m.status}>{m.status}</Badge>
              </div>

              <h3>{m.title}</h3>

              <div className="executiveMilestoneMeta">
                <span>{m.system || "Sistema general"}</span>
                {m.date && <strong>{m.date}</strong>}
              </div>

              <ProgressBar value={m.progress || 0} status={m.status} />
              <div className="executiveMilestoneProgress">{m.progress || 0}% de avance</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}


function ProjectHero({ project, completedText }) {
  const meetUrl = safeUrl(project.linkMeet);
  return (
    <div className="heroCard mobileStaticHero premiumHeroCard hideDuplicatedProjectCard">
      <div>
        <div className="eyebrow">Tablero conectado</div>
        <h2>{project.service} · {project.client}</h2>
        <p>{project.projectPhrase || completedText}</p>
      </div>

      <div className="heroDetails">
        <div className="responsible">
          <Users size={22} />
          <div>
            <span>Gerente general / dueño</span>
            <strong>{project.generalManager}</strong>
          </div>
        </div>
        <div className="responsible">
          <Users size={22} />
          <div>
            <span>Responsable cliente</span>
            <strong>{project.responsibleClient}</strong>
          </div>
        </div>
        {meetUrl && (
          <a className="meetButton" href={meetUrl} target="_blank" rel="noreferrer">
            <Video size={18} />
            Conectarse a la reunión
          </a>
        )}
      </div>
    </div>
  );
}

function Timeline({ milestones, deliverables = [], detailed = false, setView, setSelectedDeliverable, selectedHito = "", setSelectedHito }) {
  const [openRouteSections, setOpenRouteSections] = useState({});
  const [routeSearchTerm, setRouteSearchTerm] = useState("");
  const [routeStatusFilter, setRouteStatusFilter] = useState("Todos");
  const [routeHitoFilter, setRouteHitoFilter] = useState("Todos");

  const toggleRouteSection = (key) => {
    setOpenRouteSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const goToRoute = (title) => {
    setSelectedHito?.(title);
    setView?.("ruta");
  };

  const statusOptions = useMemo(() => milestones.map((m) => m.status).filter(Boolean), [milestones]);
  const hitoOptions = useMemo(() => milestones.map((m) => m.title).filter(Boolean), [milestones]);

  const filteredMilestones = useMemo(() => {
    const query = normalizeSystemName(routeSearchTerm);
    return milestones.filter((m) => {
      const title = m.title || "";
      const status = m.status || "";
      const system = m.system || "";
      const includesGSE = m.includesGSE || m.includes || "";
      const includesClient = m.includesClient || "";
      const description = m.description || "";
      const matchesStatus = routeStatusFilter === "Todos" || status === routeStatusFilter;
      const matchesHito = routeHitoFilter === "Todos" || title === routeHitoFilter;
      const searchable = normalizeSystemName([
        m.id,
        title,
        status,
        system,
        description,
        includesGSE,
        includesClient,
      ].join(" "));
      return matchesStatus && matchesHito && (!query || searchable.includes(query));
    });
  }, [milestones, routeSearchTerm, routeStatusFilter, routeHitoFilter]);

  const statusCounts = useMemo(() => {
    return milestones.reduce((acc, milestone) => {
      const status = normalizeSystemName(milestone.status || "");
      if (status.includes("finalizado") || status.includes("aprobado") || status.includes("completado") || status.includes("terminado")) {
        acc.finished += 1;
      } else if (status.includes("desarrollo") || status.includes("desarollo") || status.includes("progreso")) {
        acc.development += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    }, { finished: 0, pending: 0, development: 0 });
  }, [milestones]);

  return (
    <section className="card premiumSectionCard routeProjectSection">
      <div className="sectionHeader">
        <div>
          <h2>Ruta del proyecto</h2>
          <p>Cada tarjeta muestra el detalle del hito, lo que incluye y el enlace relacionado.</p>
        </div>
        {detailed && <Badge status="En validación">{filteredMilestones.length} visibles</Badge>}
      </div>

      {detailed && (
        <>
          <div className="routeSummaryGrid">
            <article className="routeSummaryCard">
              <div>
                <span>Total de Hitos</span>
                <strong>{milestones.length}</strong>
              </div>
              <div className="routeSummaryIcon" aria-hidden="true">
                <MapPin size={18} />
                <MapPin size={18} />
                <MapPin size={18} />
                <Flag size={28} />
              </div>
              <p>Hitos cargados en la ruta de avance.</p>
            </article>

            <article className="routeSummaryCard routeStatusSummaryCard">
              <span>Estado de Hitos</span>
              <div className="routeMiniStatusRows threeStatus">
                <div>
                  <span>Finalizado</span>
                  <div className="routeMiniTrack"><i style={{ width: `${milestones.length ? (statusCounts.finished / milestones.length) * 100 : 0}%` }} /></div>
                  <strong>{statusCounts.finished}</strong>
                </div>
                <div>
                  <span>Pendiente</span>
                  <div className="routeMiniTrack pending"><i style={{ width: `${milestones.length ? (statusCounts.pending / milestones.length) * 100 : 0}%` }} /></div>
                  <strong>{statusCounts.pending}</strong>
                </div>
                <div>
                  <span>En desarrollo</span>
                  <div className="routeMiniTrack development"><i style={{ width: `${milestones.length ? (statusCounts.development / milestones.length) * 100 : 0}%` }} /></div>
                  <strong>{statusCounts.development}</strong>
                </div>
              </div>
              <p>Según el estado registrado para cada hito.</p>
            </article>
          </div>

          <div className="premiumFilters routeFilters oneLineRouteFilters">
            <label className="searchFilter routeSearchFilter">
              <span>Buscar</span>
              <div className="searchInputWrap compact">
                <Search size={18} />
                <input
                  value={routeSearchTerm}
                  onChange={(event) => setRouteSearchTerm(event.target.value)}
                  placeholder="Buscar por hito, estado o contenido"
                />
              </div>
            </label>
            <FilterSelect label="Estado" value={routeStatusFilter} onChange={setRouteStatusFilter} options={statusOptions} />
            <FilterSelect label="Hito" value={routeHitoFilter} onChange={setRouteHitoFilter} options={hitoOptions} />
          </div>
        </>
      )}

      <div className={detailed ? "timelineDetailed" : "timeline"}>
        {(detailed ? filteredMilestones : milestones).map((m, index) => {
          const relatedDeliverables = deliverables.filter((d) =>
            normalizeSystemName(d.milestone).includes(normalizeSystemName(m.title)) ||
            normalizeSystemName(m.title).includes(normalizeSystemName(d.milestone))
          );
          const completed = isCompletedStatus(m.status);
          const descriptionText = formatSheetText(m.description);
          const includesGSEText = formatSheetText(m.includesGSE || m.includes);
          const includesClientText = formatSheetText(m.includesClient);
          const descriptionKey = `${m.id}-${m.title}-descripcion`;
          const includesGSEKey = `${m.id}-${m.title}-incluye-gse`;
          const includesClientKey = `${m.id}-${m.title}-incluye-cliente`;
          const deliverablesKey = `${m.id}-${m.title}-entregables`;

          return (
            <article
              key={`${m.id}-${m.title}`}
              className={`${detailed ? "premiumMilestone" : "timelineItem"} ${completed ? "completed" : ""} ${selectedHito === m.title ? "selected" : ""}`}
              onClick={() => !detailed && goToRoute(m.title)}
            >
              <div className={`milestoneIcon routeMilestoneIcon ${completed ? "done" : "empty"}`}>
                {completed ? <CheckCircle2 size={20} /> : null}
              </div>

              <div className="milestoneContent">
                <h3>{m.id ? `E${m.id}: ` : ""}{m.title}</h3>
                <div className="badgeRow">
                  <Badge status={m.status}>{m.status}</Badge>
                </div>
                {m.targetDate && (
                  <div className="timelineMeta"><Clock3 size={16} /> Fecha objetivo: <strong>{m.targetDate}</strong></div>
                )}
                <ProgressBar value={m.progress} />
                <div className="progressText">{m.progress}% de avance</div>
              </div>

              {detailed && (
                <div className="milestoneDetails alwaysVisible routeDetailsFixed routeAccordionDetails routeAccordionCompact">
                  {descriptionText && (
                    <div className="routeAccordionItem">
                      <button
                        type="button"
                        className="routeAccordionHeader"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRouteSection(descriptionKey);
                        }}
                      >
                        <span>Descripción</span>
                        <ChevronRight className={openRouteSections[descriptionKey] ? "open" : ""} size={18} />
                      </button>
                      {openRouteSections[descriptionKey] && (
                        <div className="routeAccordionBody routeDetailTextBlock">
                          <p>{descriptionText}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {includesGSEText && (
                    <div className="routeAccordionItem">
                      <button
                        type="button"
                        className="routeAccordionHeader"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRouteSection(includesGSEKey);
                        }}
                      >
                        <span>Incluye GSE</span>
                        <ChevronRight className={openRouteSections[includesGSEKey] ? "open" : ""} size={18} />
                      </button>
                      {openRouteSections[includesGSEKey] && (
                        <div className="routeAccordionBody routeDetailTextBlock">
                          <p>{includesGSEText}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {includesClientText && (
                    <div className="routeAccordionItem">
                      <button
                        type="button"
                        className="routeAccordionHeader"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRouteSection(includesClientKey);
                        }}
                      >
                        <span>Incluye cliente</span>
                        <ChevronRight className={openRouteSections[includesClientKey] ? "open" : ""} size={18} />
                      </button>
                      {openRouteSections[includesClientKey] && (
                        <div className="routeAccordionBody routeDetailTextBlock">
                          <p>{includesClientText}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {relatedDeliverables.length > 0 && (
                    <div className="routeAccordionItem">
                      <button
                        type="button"
                        className="routeAccordionHeader"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRouteSection(deliverablesKey);
                        }}
                      >
                        <span>Entregables dentro de este hito</span>
                        <ChevronRight className={openRouteSections[deliverablesKey] ? "open" : ""} size={18} />
                      </button>
                      {openRouteSections[deliverablesKey] && (
                        <div className="routeAccordionBody miniList routeMiniListFixed">
                          {relatedDeliverables.map((d) => (
                            <button
                              key={d.deliverable}
                              className="miniListItem routeMiniListItemFixed"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDeliverable?.(d.deliverable);
                                setView?.("entregables");
                              }}
                            >
                              {d.deliverable}
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {m.link && safeUrl(m.link) && (
                    <a
                      className="secondaryLink routeSecondaryLinkFixed"
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir enlace del hito <ExternalLink size={15} />
                    </a>
                  )}

                  {!descriptionText && !includesGSEText && !includesClientText && !safeUrl(m.link) && relatedDeliverables.length === 0 && (
                    <p className="muted">
                      Agrega Descripción, QueIncluyeGSE, QueIncluyeCliente, Link o entregables relacionados para mostrar el detalle de este hito.
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {detailed && filteredMilestones.length === 0 && (
        <div className="emptyState">No hay hitos que coincidan con los filtros seleccionados.</div>
      )}
    </section>
  );
}

function ProcessesMasterList({ processesAsIs = [], processesToBe = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [macroFilter, setMacroFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const allProcesses = [...processesAsIs, ...processesToBe];
  const typeOptions = useMemo(() => allProcesses.map((item) => item.type).filter(Boolean), [allProcesses]);
  const macroOptions = useMemo(() => allProcesses.map((item) => item.macroName).filter(Boolean), [allProcesses]);
  const statusOptions = useMemo(() => processesToBe.map((item) => item.status).filter(Boolean), [processesToBe]);

  const filterProcess = (item, source) => {
    const query = normalizeSystemName(searchTerm);
    const matchesType = typeFilter === "Todos" || item.type === typeFilter;
    const matchesMacro = macroFilter === "Todos" || item.macroName === macroFilter;
    const matchesStatus = source === "ASIS" || statusFilter === "Todos" || item.status === statusFilter;
    const searchable = normalizeSystemName([
      item.id,
      item.type,
      item.macroCode,
      item.macroName,
      item.processCode,
      item.processName,
      item.description,
      item.changes,
      item.status,
      item.link,
    ].join(" "));
    return matchesType && matchesMacro && matchesStatus && (!query || searchable.includes(query));
  };

  const filteredAsIs = useMemo(
    () => processesAsIs.filter((item) => filterProcess(item, "ASIS")),
    [processesAsIs, searchTerm, typeFilter, macroFilter, statusFilter]
  );

  const filteredToBe = useMemo(
    () => processesToBe.filter((item) => filterProcess(item, "TOBE")),
    [processesToBe, searchTerm, typeFilter, macroFilter, statusFilter]
  );

  const ProcessTable = ({ title, subtitle, rows, variant }) => (
    <div className="processTableCard">
      <div className="processTableHeader">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <Badge status="En validación">{rows.length} visibles</Badge>
      </div>

      <div className="processTableWrap individualMatrixScroll">
        <table className="processTable fixedMatrixTable">
          <thead>
            <tr>
              <th>N°</th>
              <th>Tipo</th>
              <th>Cód. Macro</th>
              <th>Macroproceso</th>
              <th>Cód. Proceso</th>
              <th>Proceso</th>
              {variant === "asis" ? <th>Descripción</th> : <th>Cambios / Observaciones</th>}
              {variant === "tobe" && <th>Status</th>}
              <th>Imagen Proceso</th>
              <th>Ficha Técnica</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={`${variant}-${item.id}-${item.processCode}-${index}`}>
                <td>{item.id}</td>
                <td>{item.type}</td>
                <td>{item.macroCode}</td>
                <td>{item.macroName}</td>
                <td>{item.processCode}</td>
                <td><strong>{item.processName}</strong></td>
                <td>{variant === "asis" ? item.description : item.changes}</td>
                {variant === "tobe" && <td><Badge status={item.status}>{item.status || "Sin status"}</Badge></td>}
                <td className="imageProcessCell">
                  {safeUrl(item.imageProcess || item.link) ? (
                    <a className="processPreviewLink" href={safeUrl(item.imageProcess || item.link)} target="_blank" rel="noreferrer">
                      Ver imagen <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="processNoPreview">Sin imagen</span>
                  )}
                </td>
                <td className="techSheetCell">
                  {safeUrl(item.technicalSheet) ? (
                    <a className="processPreviewLink" href={safeUrl(item.technicalSheet)} target="_blank" rel="noreferrer">
                      Ver ficha <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="processNoPreview">Sin ficha</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <div className="emptyState">No hay procesos que coincidan con los filtros seleccionados.</div>}
    </div>
  );

  return (
    <section className="card premiumSectionCard processMasterSection">
      <div className="sectionHeader">
        <div>
          <h2>Lista Maestra de Procesos</h2>
          <p>Consulta integrada de procesos AS IS y TO BE, con búsqueda y filtros por tipo, macroproceso y status.</p>
        </div>
      </div>

      <div className="processSummaryGrid">
        <article className="processSummaryCard">
          <span>Total procesos AS IS</span>
          <strong>{processesAsIs.length}</strong>
          <p>Procesos levantados en situación actual.</p>
        </article>
        <article className="processSummaryCard">
          <span>Total procesos TO BE</span>
          <strong>{processesToBe.length}</strong>
          <p>Procesos propuestos o ajustados.</p>
        </article>
      </div>

      <div className="premiumFilters processFilters">
        <label className="searchFilter processSearchFilter">
          <span>Buscar proceso</span>
          <div className="searchInputWrap">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por código, proceso, macroproceso, descripción o cambios"
            />
          </div>
        </label>
        <FilterSelect label="Tipo de proceso" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label="Macroproceso" value={macroFilter} onChange={setMacroFilter} options={macroOptions} />
        <FilterSelect label="Status TO BE" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>

      <div className="processTablesStack">
        <ProcessTable
          title="Procesos AS IS"
          subtitle="Situación actual documentada en la lista maestra."
          rows={filteredAsIs}
          variant="asis"
        />
        <ProcessTable
          title="Procesos TO BE"
          subtitle="Procesos propuestos, modificados o diseñados para la operación objetivo."
          rows={filteredToBe}
          variant="tobe"
        />
      </div>
    </section>
  );
}

function parseNumericValue(value) {
  const raw = String(value ?? "")
    .replace(/\$/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");
  const number = Number(raw);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function COEDashboard({ coeAsIs = [], coeToBe = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [processFilter, setProcessFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [navFilter, setNavFilter] = useState("Todos");

  const enrichRows = (rows) => rows.map((item) => {
    const time = parseNumericValue(item.time);
    const cost = parseNumericValue(item.cost);
    const frequency = parseNumericValue(item.frequency) || 1;
    const observationStatus = String(item.observation || "").trim();
    return {
      ...item,
      timeValue: time,
      costValue: cost,
      frequencyValue: frequency,
      observationStatus,
      processType: String(item.processType || "").trim(),
      navStatus: String(item.nav || "").trim(),
      totalCost: cost * frequency,
    };
  });

  const asIsRows = useMemo(() => enrichRows(coeAsIs), [coeAsIs]);
  const toBeRows = useMemo(() => enrichRows(coeToBe), [coeToBe]);
  const allRows = useMemo(() => [...asIsRows, ...toBeRows], [asIsRows, toBeRows]);
  const processOptions = useMemo(() => allRows.map((item) => item.process).filter(Boolean), [allRows]);
  const typeOptions = useMemo(() => allRows.map((item) => item.processType).filter(Boolean), [allRows]);
  const statusOptions = useMemo(() => allRows.map((item) => item.observationStatus).filter(Boolean), [allRows]);
  const navOptions = useMemo(() => allRows.map((item) => item.navStatus).filter(Boolean), [allRows]);

  const filterRow = (item) => {
    const query = normalizeSystemName(searchTerm);
    const matchesProcess = processFilter === "Todos" || item.process === processFilter;
    const matchesType = typeFilter === "Todos" || item.processType === typeFilter;
    const matchesStatus = statusFilter === "Todos" || item.observationStatus === statusFilter;
    const matchesNav = navFilter === "Todos" || item.navStatus === navFilter;
    const searchable = normalizeSystemName([
      item.code,
      item.process,
      item.processType,
      item.activity,
      item.participant,
      item.observation,
      item.navStatus,
      item.time,
      item.cost,
      item.frequency,
    ].join(" "));
    return matchesProcess && matchesType && matchesStatus && matchesNav && (!query || searchable.includes(query));
  };

  const filteredAsIs = useMemo(() => asIsRows.filter(filterRow), [asIsRows, searchTerm, processFilter, typeFilter, statusFilter, navFilter]);
  const filteredToBe = useMemo(() => toBeRows.filter(filterRow), [toBeRows, searchTerm, processFilter, typeFilter, statusFilter, navFilter]);

  const totalsByProcess = (rows) => {
    const totals = new Map();
    rows.forEach((item) => {
      const key = item.process || "Sin proceso";
      totals.set(key, (totals.get(key) || 0) + item.totalCost);
    });
    return Array.from(totals.entries())
      .map(([process, total]) => ({ process, total }))
      .sort((a, b) => b.total - a.total);
  };

  const asIsProcesses = useMemo(() => totalsByProcess(filteredAsIs), [filteredAsIs]);
  const toBeProcesses = useMemo(() => totalsByProcess(filteredToBe), [filteredToBe]);
  const asIsTotal = useMemo(() => filteredAsIs.reduce((sum, row) => sum + row.totalCost, 0), [filteredAsIs]);
  const toBeTotal = useMemo(() => filteredToBe.reduce((sum, row) => sum + row.totalCost, 0), [filteredToBe]);
  const difference = asIsTotal - toBeTotal;
  const reductionPercent = asIsTotal > 0 ? (difference / asIsTotal) * 100 : 0;
  const maxProcessCost = Math.max(1, ...asIsProcesses.map((item) => item.total), ...toBeProcesses.map((item) => item.total));

  const summarizeActivities = (rows) => {
    const isMatch = (value, words) => words.some((word) => normalizeSystemName(value).includes(word));
    return rows.reduce((acc, item) => {
      const obs = item.observationStatus || "";
      if (isMatch(obs, ["mantiene", "mantenida", "mantenido", "mantener", "igual", "continua", "continuar"])) acc.maintained += 1;
      if (isMatch(obs, ["elimina", "eliminada", "eliminado", "eliminar", "suprime", "suprimido"])) acc.deleted += 1;
      if (isMatch(obs, ["agrega", "agregada", "agregado", "agregar", "nuevo", "nueva", "crea", "creado"])) acc.added += 1;
      return acc;
    }, { maintained: 0, deleted: 0, added: 0 });
  };

  const summarizeNav = (rows) => {
    const isValue = (value) => {
      const text = normalizeSystemName(value);
      return text.includes("si") || text.includes("sí") || text.includes("genera") || text.includes("valor") || text.includes("agrega");
    };
    const isNoValue = (value) => {
      const text = normalizeSystemName(value);
      return text.includes("no") || text.includes("nav") || text.includes("no agrega") || text.includes("sin valor");
    };

    return rows.reduce((acc, item) => {
      const nav = item.navStatus || "";
      if (!nav) {
        acc.unclassified += 1;
      } else if (isNoValue(nav)) {
        acc.noValue += 1;
      } else if (isValue(nav)) {
        acc.value += 1;
      } else {
        acc.unclassified += 1;
      }
      return acc;
    }, { value: 0, noValue: 0, unclassified: 0 });
  };

  const asIsActivityStatusSummary = useMemo(() => summarizeActivities(filteredAsIs), [filteredAsIs]);
  const toBeActivityStatusSummary = useMemo(() => summarizeActivities(filteredToBe), [filteredToBe]);
  const asIsNavSummary = useMemo(() => summarizeNav(filteredAsIs), [filteredAsIs]);
  const toBeNavSummary = useMemo(() => summarizeNav(filteredToBe), [filteredToBe]);

  const maxActivityCount = Math.max(
    1,
    asIsActivityStatusSummary.maintained,
    asIsActivityStatusSummary.deleted,
    asIsActivityStatusSummary.added,
    toBeActivityStatusSummary.maintained,
    toBeActivityStatusSummary.deleted,
    toBeActivityStatusSummary.added
  );

  const maxNavCount = Math.max(
    1,
    asIsNavSummary.value,
    asIsNavSummary.noValue,
    toBeNavSummary.value,
    toBeNavSummary.noValue
  );

  const CoeBarMetric = ({ label, value, max }) => (
    <div className="coeInsightBarMetric">
      <span>{label}</span>
      <div className="coeInsightBarTrack">
        <i style={{ width: `${Math.max(value > 0 ? 4 : 0, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );

  const ActivitySummaryRow = ({ title, summary }) => (
    <div className="coeInsightRow coeBarSummaryGroup">
      <span>{title}</span>
      <CoeBarMetric label="Mantenidas" value={summary.maintained} max={maxActivityCount} />
      <CoeBarMetric label="Eliminadas" value={summary.deleted} max={maxActivityCount} />
      <CoeBarMetric label="Agregadas" value={summary.added} max={maxActivityCount} />
    </div>
  );

  const NavSummaryRow = ({ title, summary }) => (
    <div className="coeInsightRow coeBarSummaryGroup">
      <span>{title}</span>
      <CoeBarMetric label="Generar Valor" value={summary.value} max={maxNavCount} />
      <CoeBarMetric label="No generan valor" value={summary.noValue} max={maxNavCount} />
    </div>
  );

  const ProcessCostList = ({ title, subtitle, rows, badge }) => (
    <article className="coeProcessListCard fixedHeight">
      <div className="coeChartHeader">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <Badge status="En validación">{badge}</Badge>
      </div>
      <div className="coeProcessScrollList fixedProcessList">
        {rows.map((item, index) => (
          <div className="coeBarRow" key={`${title}-${item.process}-${index}`}>
            <div className="coeBarInfo">
              <span>{index + 1}. {item.process}</span>
              <strong>${formatCurrency(item.total)}</strong>
            </div>
            <div className="coeBarTrack">
              <div className="coeBarFill" style={{ width: `${Math.max(4, (item.total / maxProcessCost) * 100)}%` }} />
            </div>
          </div>
        ))}
        {!rows.length && <div className="emptyState compact">No hay datos para mostrar.</div>}
      </div>
    </article>
  );

  const COETable = ({ title, subtitle, rows }) => (
    <div className="processTableCard coeTableCard">
      <div className="processTableHeader">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <Badge status="En validación">{rows.length} visibles</Badge>
      </div>
      <div className="processTableWrap coeTableWrap coeMatrixInternalScroll">
        <table className="processTable coeTable matrixInternalScrollTable">
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>PROCESO</th>
              <th>TIPO</th>
              <th>ACTIVIDAD</th>
              <th>INTERVINIENTE</th>
              <th>OBSERVACIÓN / STATUS</th>
              <th>NAV</th>
              <th>TIEMPO (xmin)</th>
              <th>COSTO (xmin)</th>
              <th>FRECUENCIA</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={`${title}-${item.code}-${item.activity}-${index}`}>
                <td>{item.code}</td>
                <td><strong>{item.process}</strong></td>
                <td>{item.processType}</td>
                <td>{item.activity}</td>
                <td>{item.participant}</td>
                <td>{item.observation}</td>
                <td>{item.navStatus}</td>
                <td>{item.time}</td>
                <td>{item.cost}</td>
                <td>{item.frequency}</td>
                <td><strong>${formatCurrency(item.totalCost)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="emptyState">No hay actividades que coincidan con los filtros seleccionados.</div>}
    </div>
  );

  return (
    <section className="card premiumSectionCard coeSection">
      <div className="sectionHeader">
        <div>
          <h2>COE</h2>
          <p>Comparativo de costo operativo estructural por proceso, separando AS IS y TO BE.</p>
        </div>
      </div>

      <div className="coeExecutiveGrid threeCards">
        <article className="coeExecutiveCard coeCostCard">
          <span>Costo procesos AS IS</span>
          <strong>${formatCurrency(asIsTotal)}</strong>
          <p>Total mensual estimado de la situación actual.</p>
        </article>
        <article className="coeExecutiveCard coeDifferenceCard difference">
          <span>COE mensual</span>
          <strong>${formatCurrency(Math.abs(difference))}</strong>
          <em>{Math.abs(reductionPercent).toFixed(1)}%</em>
          <p>{difference >= 0 ? "Reducción estimada frente al AS IS." : "Incremento estimado frente al AS IS."}</p>
        </article>
        <article className="coeExecutiveCard coeCostCard">
          <span>Costo procesos TO BE</span>
          <strong>${formatCurrency(toBeTotal)}</strong>
          <p>Total mensual estimado de la operación objetivo.</p>
        </article>
      </div>

      <div className="coeInsightGrid">
        <article className="coeInsightCard coeActivitiesCard">
          <span>Actividades</span>
          <ActivitySummaryRow title="Actividades AS IS" summary={asIsActivityStatusSummary} />
          <ActivitySummaryRow title="Actividades TO BE" summary={toBeActivityStatusSummary} />
          <p>Según la columna Observación.</p>
        </article>

        <article className="coeInsightCard coeNavCard">
          <span>NAV</span>
          <NavSummaryRow title="NAV AS IS" summary={asIsNavSummary} />
          <NavSummaryRow title="NAV TO BE" summary={toBeNavSummary} />
          <p>Clasificación de actividades que generan o no generan valor.</p>
        </article>
      </div>

      <div className="coeChartsGrid coeProcessListsGrid">
        <ProcessCostList title="Procesos AS IS" subtitle="Costo total por proceso actual." rows={asIsProcesses} badge={`${asIsProcesses.length} procesos`} />
        <ProcessCostList title="Procesos TO BE" subtitle="Costo total por proceso propuesto." rows={toBeProcesses} badge={`${toBeProcesses.length} procesos`} />
      </div>

      <div className="premiumFilters processFilters coeFiltersOneLine">
        <label className="searchFilter processSearchFilter compactSearchFilter">
          <span>Buscar actividad</span>
          <div className="searchInputWrap compact">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por código, proceso o actividad"
            />
          </div>
        </label>
        <FilterSelect label="Proceso" value={processFilter} onChange={setProcessFilter} options={processOptions} />
        <FilterSelect label="Tipo" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        <FilterSelect label="NAV" value={navFilter} onChange={setNavFilter} options={navOptions} />
      </div>

      <div className="processTablesStack coeTablesStack">
        <COETable title="Matriz COE AS IS" subtitle="Actividades levantadas en la situación actual." rows={filteredAsIs} />
        <COETable title="Matriz COE TO BE" subtitle="Actividades propuestas para la operación objetivo." rows={filteredToBe} />
      </div>
    </section>
  );
}

function Findings({ findings = [] }) {
  const [open, setOpen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("Todos");
  const [deliverableTypeFilter, setDeliverableTypeFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const [managementFilter, setManagementFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const getFindingStatusGroup = (status = "") => {
    const value = normalizeSystemName(status);
    if (value.includes("completado") || value.includes("finalizado") || value.includes("terminado") || value.includes("solucionado")) return "Completado";
    if (value.includes("proceso") || value.includes("desarrollo") || value.includes("desarollo") || value.includes("revision")) return "En proceso";
    return "Pendiente";
  };

  const categories = [
    { key: "politica", label: "Política", words: ["politica", "politicas", "política", "políticas"] },
    { key: "procedimiento", label: "Procedimiento", words: ["procedimiento", "procedimientos", "manual", "manuales", "instructivo", "instructivos"] },
    { key: "indicador", label: "Indicador", words: ["indicador", "indicadores", "kpi", "kpís", "kpis"] },
    { key: "perfiles", label: "Perfiles", words: ["perfil", "perfiles", "cargo", "cargos"] },
    { key: "rediseno", label: "Rediseño de procesos", words: ["rediseno", "rediseño", "redisenio", "rediseñar", "redisenar", "rediseño de procesos"] },
    { key: "dimensionamiento", label: "Dimensionamiento", words: ["dimensionamiento", "dimensionar", "dimension"] },
  ];

  const cleanOptionValue = (value = "") => {
    const text = String(value || "").trim();
    if (!text || text === "-" || text === "—" || text.toLowerCase() === "n/a") return "";
    return text;
  };

  const getCategoryKeys = (value = "") => {
    const text = normalizeSystemName(value);
    if (!text) return [];
    return categories
      .filter((category) => category.words.some((word) => text.includes(normalizeSystemName(word))))
      .map((category) => category.key);
  };

  const getCategoryLabels = (item) => {
    const keys = [
      ...getCategoryKeys(item.deliverableGSE || ""),
      ...getCategoryKeys(item.deliverableClient || ""),
    ];
    return [...new Set(keys)]
      .map((key) => categories.find((category) => category.key === key)?.label)
      .filter(Boolean);
  };

  const getFindingField = (item, field) => {
    if (field === "date") return item.deliveryDate || item.fechaMax || item.fechamax || "";
    if (field === "priority") return item.priority || "";
    if (field === "status") return item.status || "";
    if (field === "management") return item.management || item.gerencia || "";
    if (field === "area") return item.areaDetail || item.area || "";
    return "";
  };

  const getDeliverableTypeMatches = (item) => {
    const labels = getCategoryLabels(item);
    const exactValues = [item.deliverableGSE, item.deliverableClient]
      .map(cleanOptionValue)
      .filter(Boolean);
    return [...new Set([...labels, ...exactValues])];
  };

  const matchesCurrentFilters = (item, excludeField = "") => {
    const deliveryDate = getFindingField(item, "date");
    const area = getFindingField(item, "area");
    const management = getFindingField(item, "management");
    const priority = getFindingField(item, "priority");
    const status = getFindingField(item, "status");
    const statusGroup = getFindingStatusGroup(status);
    const deliverableTypeMatches = getDeliverableTypeMatches(item);

    return (
      (excludeField === "date" || dateFilter === "Todos" || deliveryDate === dateFilter) &&
      (excludeField === "deliverableType" || deliverableTypeFilter === "Todos" || deliverableTypeMatches.includes(deliverableTypeFilter)) &&
      (excludeField === "priority" || priorityFilter === "Todos" || priority === priorityFilter) &&
      (excludeField === "management" || managementFilter === "Todos" || management === managementFilter) &&
      (excludeField === "area" || areaFilter === "Todos" || area === areaFilter) &&
      (excludeField === "status" || statusFilter === "Todos" || status === statusFilter || statusGroup === statusFilter)
    );
  };

  const optionValuesFor = (field) => {
    const values = findings
      .filter((item) => matchesCurrentFilters(item, field))
      .map((item) => getFindingField(item, field))
      .map(cleanOptionValue)
      .filter(Boolean);
    return [...new Set(values)];
  };

  const dateOptions = useMemo(() => optionValuesFor("date"), [findings, deliverableTypeFilter, priorityFilter, managementFilter, areaFilter, statusFilter]);
  const priorities = useMemo(() => optionValuesFor("priority"), [findings, dateFilter, deliverableTypeFilter, managementFilter, areaFilter, statusFilter]);
  const managements = useMemo(() => optionValuesFor("management"), [findings, dateFilter, deliverableTypeFilter, priorityFilter, areaFilter, statusFilter]);
  const areas = useMemo(() => optionValuesFor("area"), [findings, dateFilter, deliverableTypeFilter, priorityFilter, managementFilter, statusFilter]);
  const statuses = useMemo(() => {
    const values = findings
      .filter((item) => matchesCurrentFilters(item, "status"))
      .flatMap((item) => [item.status, getFindingStatusGroup(item.status)])
      .map(cleanOptionValue)
      .filter(Boolean);
    return [...new Set(values)];
  }, [findings, dateFilter, deliverableTypeFilter, priorityFilter, managementFilter, areaFilter]);

  const deliverableTypes = useMemo(() => {
    const values = findings
      .filter((item) => matchesCurrentFilters(item, "deliverableType"))
      .flatMap((item) => getDeliverableTypeMatches(item))
      .map(cleanOptionValue)
      .filter(Boolean);
    return [...new Set(values)];
  }, [findings, dateFilter, priorityFilter, managementFilter, areaFilter, statusFilter]);

  const filteredFindings = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    return findings.filter((item) => {
      const area = getFindingField(item, "area");
      const management = getFindingField(item, "management");
      const deliveryDate = getFindingField(item, "date");
      const priority = getFindingField(item, "priority");
      const status = getFindingField(item, "status");
      const statusGroup = getFindingStatusGroup(status);
      const searchable = normalizeSystemName([
        item.id,
        management,
        area,
        deliveryDate,
        item.processArea,
        item.finding,
        item.description,
        item.recommendation || item.solution,
        item.solutionType || item.system,
        item.deliverableGSE,
        item.deliverableClient,
        ...getDeliverableTypeMatches(item),
        status,
        statusGroup,
        priority,
      ].join(" "));
      return matchesCurrentFilters(item) && (!query || searchable.includes(query));
    });
  }, [findings, searchTerm, dateFilter, deliverableTypeFilter, priorityFilter, managementFilter, areaFilter, statusFilter]);

  const statusSummary = useMemo(() => {
    return filteredFindings.reduce((acc, item) => {
      const group = getFindingStatusGroup(item.status);
      if (group === "Pendiente") acc.pending += 1;
      if (group === "En proceso") acc.inProcess += 1;
      if (group === "Completado") acc.completed += 1;
      return acc;
    }, { pending: 0, inProcess: 0, completed: 0 });
  }, [filteredFindings]);

  const visibleDeliverableSummary = useMemo(() => {
    const initial = categories.reduce((acc, category) => {
      acc[category.key] = { label: category.label, gse: 0, client: 0 };
      return acc;
    }, {});

    filteredFindings.forEach((item) => {
      getCategoryKeys(item.deliverableGSE || "").forEach((key) => {
        if (initial[key]) initial[key].gse += 1;
      });
      getCategoryKeys(item.deliverableClient || "").forEach((key) => {
        if (initial[key]) initial[key].client += 1;
      });
    });

    return initial;
  }, [filteredFindings]);

  const visibleDeliverableTotals = useMemo(() => {
    return filteredFindings.reduce((acc, item) => {
      if (cleanOptionValue(item.deliverableGSE || "")) acc.gse += 1;
      if (cleanOptionValue(item.deliverableClient || "")) acc.client += 1;
      return acc;
    }, { gse: 0, client: 0 });
  }, [filteredFindings]);

  const visibleDeliverableCategoryTotals = useMemo(() => {
    return Object.values(visibleDeliverableSummary).reduce((acc, item) => {
      acc.gse += item.gse;
      acc.client += item.client;
      return acc;
    }, { gse: 0, client: 0 });
  }, [visibleDeliverableSummary]);

  return (
    <section className="card premiumSectionCard findingsPremiumSection">
      <div className="sectionHeader">
        <div>
          <h2>Hallazgos encontrados</h2>
          <p>Busca, filtra y revisa los hallazgos críticos de la matriz técnica.</p>
        </div>
        <Badge status="En validación">{filteredFindings.length} visibles</Badge>
      </div>

      <div className="findingsSummaryGrid">
        <article className="findingsSummaryCard">
          <div>
            <span>Total de Hallazgos</span>
            <strong>{filteredFindings.length}</strong>
          </div>
          <div className="findingsSummaryIcon" aria-hidden="true">
            <MapPin size={18} />
            <MapPin size={18} />
            <MapPin size={18} />
            <Flag size={28} />
          </div>
          <p>Total visible según los filtros activos.</p>
        </article>

        <article className="findingsSummaryCard findingsStatusSummaryCard">
          <span>Estado de Hallazgos</span>
          <div className="findingsStatusRows">
            <div>
              <span>Completado</span>
              <div><i style={{ width: `${filteredFindings.length ? (statusSummary.completed / filteredFindings.length) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.completed}</strong>
            </div>
            <div>
              <span>Pendiente</span>
              <div><i style={{ width: `${filteredFindings.length ? (statusSummary.pending / filteredFindings.length) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.pending}</strong>
            </div>
            <div>
              <span>En desarrollo</span>
              <div><i style={{ width: `${filteredFindings.length ? (statusSummary.inProcess / filteredFindings.length) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.inProcess}</strong>
            </div>
          </div>
          <p>Lectura actual de avance de los hallazgos filtrados.</p>
        </article>
      </div>

      <div className="findingsDeliverablesSplitGrid compactDeliverableCards">
        <article className="findingsDeliverableDashboardCard">
          <div className="findingsDeliverableDashboardHeader">
            <span>Entregables GSE</span>
            <strong>{visibleDeliverableTotals.gse}</strong>
          </div>
          <div className="findingsDeliverableBreakdownRows">
            {Object.values(visibleDeliverableSummary).map((item) => (
              <div key={`gse-${item.label}`}>
                <span>{item.label}</span>
                <div><i style={{ width: `${visibleDeliverableCategoryTotals.gse ? (item.gse / visibleDeliverableCategoryTotals.gse) * 100 : 0}%` }} /></div>
                <strong>{item.gse}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="findingsDeliverableDashboardCard client">
          <div className="findingsDeliverableDashboardHeader">
            <span>Entregables cliente</span>
            <strong>{visibleDeliverableTotals.client}</strong>
          </div>
          <div className="findingsDeliverableBreakdownRows">
            {Object.values(visibleDeliverableSummary).map((item) => (
              <div key={`client-${item.label}`}>
                <span>{item.label}</span>
                <div><i style={{ width: `${visibleDeliverableCategoryTotals.client ? (item.client / visibleDeliverableCategoryTotals.client) * 100 : 0}%` }} /></div>
                <strong>{item.client}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="premiumFilters findingsFilters findingsFiltersOrdered dependentFindingFilters">
        <label className="searchFilter findingsSearchFilter">
          <span>Buscar</span>
          <div className="searchInputWrap compact">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por hallazgo, fecha o entregable"
            />
          </div>
        </label>
        <FilterSelect label="Fecha de entrega" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
        <FilterSelect label="Tipo de entregable" value={deliverableTypeFilter} onChange={setDeliverableTypeFilter} options={deliverableTypes} />
        <FilterSelect label="Prioridad" value={priorityFilter} onChange={setPriorityFilter} options={priorities} />
        <FilterSelect label="Gerencia" value={managementFilter} onChange={setManagementFilter} options={managements} />
        <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areas} />
        <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statuses} />
      </div>

      <div className="findingsGridWhite">
        {filteredFindings.map((item) => {
          const process = item.processArea || item.process || item.area || "Proceso no definido";
          const recommendation = item.recommendation || item.solution;
          const solutionType = item.solutionType || item.system;
          const link = safeUrl(item.link || item.image);
          const key = `${item.id}-${item.finding || item.description}`;
          const isOpen = open === key;
          const status = item.status || "Pendiente";
          const deliveryDate = getFindingField(item, "date");

          return (
            <article key={key} className={`findingWhiteCard ${isOpen ? "selected" : ""}`}>
              <button className="findingWhiteHeader" onClick={() => setOpen(isOpen ? "" : key)}>
                <div>
                  <div className="findingMetaLine">
                    <span>ID {item.id}</span>
                    <span>{process}</span>
                  </div>
                  <h3>{item.finding || "Hallazgo sin título"}</h3>
                  {deliveryDate && <p className="findingDeliveryDate">Fecha de entrega: {deliveryDate}</p>}
                  <div className="badgeRow findingBadgesCompactOnly">
                    {item.priority && <Badge status={item.priority === "Alta" ? "Bloqueado" : "En validación"}>Prioridad: {item.priority}</Badge>}
                    <Badge status={status}>{status}</Badge>
                  </div>
                </div>
                <ChevronRight className={`chevron ${isOpen ? "open" : ""}`} size={20} />
              </button>

              {link && (
                <a className="secondaryLink findingLink findingLinkOutside" href={link} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                  Abrir evidencia o carpeta <ExternalLink size={15} />
                </a>
              )}

              {isOpen && (
                <div className="findingFixedExpanded">
                  <div className="findingFixedScroll">
                    {item.description && (
                      <div className="findingDetailBlock">
                        <strong>Descripción técnica del hallazgo</strong>
                        <p>{item.description}</p>
                      </div>
                    )}
                    {recommendation && (
                      <div className="findingDetailBlock">
                        <strong>Recomendación técnica</strong>
                        <p>{recommendation}</p>
                      </div>
                    )}
                    <div className="findingDetailGrid">
                      {solutionType && (
                        <div>
                          <strong>Tipo de solución</strong>
                          <span>{solutionType}</span>
                        </div>
                      )}
                    </div>
                    {!item.description && !recommendation && !solutionType && !link && (
                      <p className="muted">Agrega descripción, recomendación o link en la pestaña Hallazgos para mostrar más detalle.</p>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredFindings.length === 0 && (
        <div className="emptyState">No hay hallazgos que coincidan con los filtros seleccionados.</div>
      )}
    </section>
  );
}

function PendingClient({ pending, compact = false, setView }) {
  const [openPending, setOpenPending] = useState("");
  const [pendingValidation, setPendingValidation] = useState({});
  const [savingValidation, setSavingValidation] = useState({});
  const [validationMessage, setValidationMessage] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [validationFilter, setValidationFilter] = useState("Todos");

  const pendingWebhookUrl = safeUrl(import.meta.env.VITE_PENDING_WEBHOOK_URL || import.meta.env.VITE_DOCUMENTS_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();

  const getValidationStatus = (item) => {
    const key = item.request || item.id || "";
    return pendingValidation[key] ?? item.validationClient ?? "";
  };

  const normalizeValidation = (value) => {
    const text = normalizeSystemName(value || "");
    if (text.includes("implementado") || text.includes("validado") || text.includes("completado") || text.includes("finalizado")) return "Implementado";
    if (text.includes("pendiente") || !text) return "Pendiente";
    return value;
  };

  const statusOptions = useMemo(() => pending.map((item) => item.status).filter(Boolean), [pending]);
  const validationOptions = useMemo(() => {
    const values = pending.map((item) => normalizeValidation(getValidationStatus(item))).filter(Boolean);
    return [...new Set(["Implementado", "Pendiente", ...values])];
  }, [pending, pendingValidation]);

  const filteredPending = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    return pending.filter((item) => {
      const validationStatus = normalizeValidation(getValidationStatus(item));
      const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
      const matchesValidation = validationFilter === "Todos" || validationStatus === validationFilter;
      const searchable = normalizeSystemName([
        item.request,
        item.owner,
        item.dueDate,
        item.status,
        item.blocks,
        item.description,
        validationStatus,
      ].join(" "));
      return matchesStatus && matchesValidation && (!query || searchable.includes(query));
    });
  }, [pending, searchTerm, statusFilter, validationFilter, pendingValidation]);

  const summary = useMemo(() => {
    return pending.reduce((acc, item) => {
      const statusText = normalizeSystemName(item.status || "");
      const validationText = normalizeSystemName(normalizeValidation(getValidationStatus(item)));

      if (statusText.includes("finalizado") || statusText.includes("completado") || statusText.includes("terminado")) {
        acc.finalized += 1;
      } else if (statusText.includes("bloqueado")) {
        acc.blocked += 1;
      } else if (statusText.includes("revision") || statusText.includes("revisión") || statusText.includes("desarrollo") || statusText.includes("desarollo") || statusText.includes("proceso")) {
        acc.review += 1;
      } else {
        acc.pending += 1;
      }

      if (validationText.includes("implementado") || validationText.includes("completado") || validationText.includes("validado")) {
        acc.implemented += 1;
      } else {
        acc.pendingImplementation += 1;
      }

      return acc;
    }, { pending: 0, review: 0, finalized: 0, blocked: 0, implemented: 0, pendingImplementation: 0 });
  }, [pending, pendingValidation]);

  const items = compact ? pending.slice(0, 4) : filteredPending;

  const handleValidatePending = async (item, value = "Validado") => {
    const key = item.request || item.id || "";
    const previous = pendingValidation[key] ?? item.validationClient ?? "";

    setPendingValidation((current) => ({ ...current, [key]: value }));
    setSavingValidation((current) => ({ ...current, [key]: true }));
    setValidationMessage((current) => ({ ...current, [key]: "Guardando..." }));

    if (!pendingWebhookUrl) {
      setPendingValidation((current) => ({ ...current, [key]: previous }));
      setSavingValidation((current) => ({ ...current, [key]: false }));
      setValidationMessage((current) => ({
        ...current,
        [key]: "Falta configurar el webhook para guardar esta validación."
      }));
      return;
    }

    try {
      const response = await fetch(pendingWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updatePending",
          tipo: "pendiente",
          spreadsheetId,
          sheetName: "PendientesCliente",
          pendiente: item.request,
          responsable: item.owner,
          fecha: item.dueDate,
          campo: "ValidacionDeCliente",
          valor: value,
          validacionCliente: value,
          fechaValidacion: new Date().toISOString(),
        }),
      });

      const text = await response.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        result = { ok: response.ok, message: text };
      }

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "No se pudo registrar la validación.");
      }

      setValidationMessage((current) => ({ ...current, [key]: "Registrado" }));
    } catch (error) {
      console.error(error);
      setPendingValidation((current) => ({ ...current, [key]: previous }));
      setValidationMessage((current) => ({
        ...current,
        [key]: error.message || "No se pudo guardar."
      }));
    } finally {
      setSavingValidation((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <section className="card premiumSectionCard pendingClientSection">
      <div className="sectionHeader">
        <div>
          <h2>Pendientes cliente</h2>
          <p>Acciones necesarias para avanzar sin retrasos. Haz clic para ver descripción y enlace relacionado.</p>
        </div>
        {!compact && <Badge status="En validación">{filteredPending.length} visibles</Badge>}
      </div>

      {!compact && (
        <>
          <div className="pendingSummaryGrid">
            <article className="pendingSummaryCard">
              <span>Total de pendientes</span>
              <strong>{pending.length}</strong>
              <p>Acciones registradas para seguimiento del cliente.</p>
            </article>

            <article className="pendingSummaryCard">
              <span>Estado</span>
              <div className="pendingMiniRows">
                <div>
                  <span>Bloqueado</span>
                  <div className="pendingMiniTrack blocked"><i style={{ width: `${pending.length ? (summary.blocked / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.blocked}</strong>
                </div>
                <div>
                  <span>Pendiente</span>
                  <div className="pendingMiniTrack"><i style={{ width: `${pending.length ? (summary.pending / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.pending}</strong>
                </div>
                <div>
                  <span>En revisión</span>
                  <div className="pendingMiniTrack review"><i style={{ width: `${pending.length ? (summary.review / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.review}</strong>
                </div>
                <div>
                  <span>Terminado</span>
                  <div className="pendingMiniTrack success"><i style={{ width: `${pending.length ? (summary.finalized / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.finalized}</strong>
                </div>
              </div>
              <p>Según el estado del pendiente.</p>
            </article>

            <article className="pendingSummaryCard">
              <span>Implementó</span>
              <div className="pendingMiniRows">
                <div>
                  <span>Implementado</span>
                  <div className="pendingMiniTrack success"><i style={{ width: `${pending.length ? (summary.implemented / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.implemented}</strong>
                </div>
                <div>
                  <span>Pendiente</span>
                  <div className="pendingMiniTrack"><i style={{ width: `${pending.length ? (summary.pendingImplementation / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.pendingImplementation}</strong>
                </div>
              </div>
              <p>Seguimiento de implementación del pendiente.</p>
            </article>
          </div>

          <div className="premiumFilters pendingFilters oneLinePendingFilters">
            <label className="searchFilter pendingSearchFilter">
              <span>Buscar</span>
              <div className="searchInputWrap compact">
                <Search size={18} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar pendiente, responsable o bloqueo"
                />
              </div>
            </label>
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
            <FilterSelect label="Implementó" value={validationFilter} onChange={setValidationFilter} options={validationOptions} />
          </div>
        </>
      )}

      <div className="pendingList">
        {items.map((item) => {
          const isOpen = openPending === item.request;
          const link = safeUrl(item.link);
          const validationStatus = getValidationStatus(item);
          const normalizedValidation = normalizeValidation(validationStatus);
          const isValidated = normalizedValidation === "Implementado";
          const key = item.request || item.id || `${item.owner}-${item.dueDate}`;

          return (
            <div
              className={`pendingCard clickable ${isOpen ? "selected" : ""} ${isValidated ? "clientValidated" : ""}`}
              key={`${item.request}-${item.owner}`}
              onClick={() => {
                if (compact) {
                  setView?.("pendientes");
                  return;
                }
                setOpenPending(isOpen ? "" : item.request);
              }}
            >
              <div className="pendingHeader">
                <div>
                  <div className="itemTitle">{item.request}</div>
                  <div className="muted">Bloquea: {item.blocks}</div>
                </div>
                <ChevronRight className={`chevron ${isOpen ? "open" : ""}`} size={18} />
              </div>

              <div className="pendingMeta">
                <span><strong>Responsable:</strong> {item.owner}</span>
                <span><strong>Fecha:</strong> {item.dueDate}</span>
              </div>

              <div className="badgeRow pendingActionRow" onClick={(e) => e.stopPropagation()}>
                <Badge status={item.status}>{item.status}</Badge>

                {isValidated ? (
                  <Badge status="Finalizado">Implementado</Badge>
                ) : (
                  <button
                    className="pendingValidatePill"
                    type="button"
                    disabled={Boolean(savingValidation[key])}
                    onClick={() => handleValidatePending(item, "Implementado")}
                  >
                    {savingValidation[key] ? "Guardando..." : "Implementó"}
                  </button>
                )}

                {validationMessage[key] && (
                  <span className="pendingSaveMessage">{validationMessage[key]}</span>
                )}
              </div>

              {link && (
                <a
                  className="secondaryLink pendingLinkOutside"
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Abrir documento relacionado <ExternalLink size={15} />
                </a>
              )}

              {!compact && isOpen && (
                <div className="pendingDetails" onClick={(e) => e.stopPropagation()}>
                  {item.description && (
                    <div className="detailBlock routeDetailTextBlock">
                      <strong>Descripción</strong>
                      <p>{item.description}</p>
                    </div>
                  )}

                  {!item.description && !link && (
                    <p className="muted">Agrega Descripcion y Link en la pestaña PendientesCliente para mostrar más detalle.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && filteredPending.length === 0 && (
        <div className="emptyState">No hay pendientes que coincidan con los filtros seleccionados.</div>
      )}

      {compact && pending.length > 4 && (
        <button className="plainAction" onClick={() => setView?.("pendientes")}>
          Ver todos los pendientes <ChevronRight size={16} />
        </button>
      )}
    </section>
  );
}

function Deliverables({ deliverables = [], selectedDeliverable, setSelectedDeliverable, compact = false, setView }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [responsibleFilter, setResponsibleFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeliverable, setOpenDeliverable] = useState("");

  const systems = [...new Set(deliverables.map((d) => d.system).filter(Boolean))];
  const statuses = [...new Set(deliverables.map((d) => d.status).filter(Boolean))];
  const responsibles = [...new Set(deliverables.map((d) => d.responsible).filter(Boolean))];
  const milestones = [...new Set(deliverables.map((d) => d.milestone).filter(Boolean))];

  const summary = useMemo(() => {
    const isFinalized = (status = "") => {
      const value = normalizeSystemName(status);
      return value.includes("finalizado") || value.includes("terminado") || value.includes("aprobado") || value.includes("completado");
    };
    const isDevelopment = (status = "") => {
      const value = normalizeSystemName(status);
      return value.includes("desarrollo") || value.includes("desarollo") || value.includes("proceso") || value.includes("revision");
    };

    return deliverables.reduce((acc, item) => {
      const responsible = normalizeSystemName(item.responsible || "");
      const status = item.status || "";

      if (responsible.includes("gse")) acc.gse += 1;
      if (responsible.includes("cliente")) acc.client += 1;

      if (isFinalized(status)) acc.finalized += 1;
      else if (isDevelopment(status)) acc.development += 1;
      else acc.pending += 1;

      return acc;
    }, { gse: 0, client: 0, pending: 0, development: 0, finalized: 0 });
  }, [deliverables]);

  const search = String(searchTerm || "").trim().toLowerCase();

  const filtered = deliverables.filter((item) => {
    const systemOk = systemFilter === "Todos" || item.system === systemFilter;
    const statusOk = statusFilter === "Todos" || item.status === statusFilter;
    const responsibleOk = responsibleFilter === "Todos" || item.milestone === responsibleFilter;
    const searchableText = [
      item.system,
      item.milestone,
      item.deliverable,
      item.status,
      item.responsible,
      item.observation,
    ].join(" ").toLowerCase();
    const searchOk = !search || searchableText.includes(search);
    return systemOk && statusOk && responsibleOk && searchOk;
  });

  const items = compact ? filtered.slice(0, 6) : filtered;

  return (
    <section className="card premiumSectionCard deliverablesSection">
      <div className="sectionHeader">
        <div>
          <h2>{compact ? "Entregables principales" : "Entregables GSE"}</h2>
          <p>Vista por sistema e hito, con acceso al documento cuando esté disponible.</p>
        </div>
      </div>

      {!compact && (
        <>
          <div className="deliverablesSummaryGrid">
            <article className="deliverablesSummaryCard">
              <span>Total de entregables</span>
              <strong>{deliverables.length}</strong>
              <p>Documentos y productos registrados en la matriz.</p>
            </article>

            <article className="deliverablesSummaryCard">
              <span>Estado</span>
              <div className="deliverablesMiniRows three">
                <div>
                  <span>Pendiente</span>
                  <div className="deliverablesMiniTrack"><i style={{ width: `${deliverables.length ? (summary.pending / deliverables.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.pending}</strong>
                </div>
                <div>
                  <span>En desarrollo</span>
                  <div className="deliverablesMiniTrack soft"><i style={{ width: `${deliverables.length ? (summary.development / deliverables.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.development}</strong>
                </div>
                <div>
                  <span>Finalizado</span>
                  <div className="deliverablesMiniTrack success"><i style={{ width: `${deliverables.length ? (summary.finalized / deliverables.length) * 100 : 0}%` }} /></div>
                  <strong>{summary.finalized}</strong>
                </div>
              </div>
              <p>Según el estado del entregable.</p>
            </article>
          </div>

          <div className="filters premiumFilters deliverablesFilters oneLineDeliverablesFilters">
            <label className="filter searchFilter deliverablesSearchFilter">
              <span>Buscar</span>
              <div className="searchInputWrap compact">
                <Search size={16} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar entregable, sistema o hito..."
                />
              </div>
            </label>
            <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={systems} />
            <FilterSelect label="Hito" value={responsibleFilter} onChange={setResponsibleFilter} options={milestones} />
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statuses} />
          </div>
        </>
      )}

      {!compact && <div className="resultCounter"><Badge status="Disponible">{filtered.length} entregables</Badge></div>}

      <div className="deliverablesGrid">
        {items.map((item) => {
          const link = safeUrl(item.link);
          const selected = selectedDeliverable === item.deliverable;
          const deliverableKey = `${item.system}-${item.milestone}-${item.deliverable}`;
          const isOpen = openDeliverable === deliverableKey;
          return (
            <div
              className={`deliverableCard ${selected ? "selected" : ""} ${compact ? "clickable" : ""}`}
              key={deliverableKey}
              onClick={() => {
                if (compact) {
                  setSelectedDeliverable?.(item.deliverable);
                  setView?.("entregables");
                  return;
                }
                setOpenDeliverable(isOpen ? "" : deliverableKey);
              }}
            >
              <div className="deliverableCardTop">
                <div className="area">{item.system}</div>
                {!compact && <ChevronRight className={`chevron ${isOpen ? "open" : ""}`} size={18} />}
              </div>
              <div className="itemTitle">{item.deliverable}</div>
              <div className="badgeRow"><Badge status={item.status}>{item.status}</Badge></div>
              {item.milestone && <div className="muted">Hito: {item.milestone}</div>}
              {item.responsible && <div className="muted"><strong>Responsable:</strong> {item.responsible}</div>}
              <ProgressBar value={item.progress} status={item.status} />
              <div className="muted">{item.progress}% de avance</div>
              {!compact && item.observation && isOpen && (
                <div className="deliverableDescriptionPanel" onClick={(e) => e.stopPropagation()}>
                  <strong>Descripción</strong>
                  <p className="observation">{item.observation}</p>
                </div>
              )}
              {link && (
                <a className="secondaryLink routeSecondaryLinkFixed" href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  Ver entregable <ExternalLink size={15} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {!items.length && (
        <div className="emptyState">
          <Search size={22} />
          <strong>No encontramos entregables con esos filtros.</strong>
          <span>Prueba con otro sistema, estado, responsable o palabra clave.</span>
        </div>
      )}

      {compact && deliverables.length > 6 && (
        <button className="plainAction" onClick={() => setView?.("entregables")}>Ver todos los entregables <ChevronRight size={16} /></button>
      )}
    </section>
  );
}

function UpdatesPanel({ project, updates, setView, pending = [] }) {
  const safeUpdates = updates.length ? updates : [{ title: "Próximo paso", text: project.nextStep, target: "ruta" }];
  const meetUrl = safeUrl(project.linkMeet);
  const mainPending = pending[0];

  return (
    <aside className="rightPanel executiveRightPanel">
      <div className="executiveSideCard nextStepWhiteCard">
        <div className="sideCardIconLine">
          <div className="sideIcon"><Flag size={18} /></div>
          <span>Próximo paso</span>
        </div>
        <h3>{project.nextStep || "Próximo paso pendiente"}</h3>
        <p>{project.nextDate || "Fecha por confirmar"}</p>
        {meetUrl && (
          <a className="sideMeetButton" href={meetUrl} target="_blank" rel="noreferrer">
            <Video size={17} />
            Conectarse a Google Meet
          </a>
        )}
      </div>

      {mainPending && (
        <div
          className="executiveSideCard priorityPendingWhiteCard clickable"
          role="button"
          tabIndex={0}
          onClick={() => setView?.("pendientes")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setView?.("pendientes");
            }
          }}
        >
          <div className="sideCardIconLine">
            <div className="sideIcon warning"><AlertTriangle size={18} /></div>
            <span>Pendiente prioritario</span>
          </div>

          <h3>{mainPending.request}</h3>

          <div className="sidePendingMeta">
            <span><strong>Responsable:</strong> {mainPending.owner}</span>
            <span><strong>Fecha:</strong> {mainPending.dueDate}</span>
          </div>
        </div>
      )}

      {!mainPending && safeUpdates.slice(0, 1).map((u, index) => (
        <div className="executiveSideCard priorityPendingWhiteCard" key={`${u.title}-${index}`}>
          <div className="sideCardIconLine">
            <div className="sideIcon"><Search size={18} /></div>
            <span>{u.title}</span>
          </div>
          <p>{u.text}</p>
          <button className="sideLinkButton" onClick={() => setView("ruta")}>
            Ver detalle <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </aside>
  );
}

function Education({ education = [] }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [milestoneFilter, setMilestoneFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openEducationCard, setOpenEducationCard] = useState("");

  const systemOrder = [
    "Sistema 1: Operación sin Caos",
    "Sistema 2: Talento en el Rol Correcto",
    "Sistema 3: Salarios Justos que Retienen",
    "Sistema 4: Desempeño que Optimiza la Estructura",
    "Sistema 5: K&ZEN Interno Permanente",
  ];

  const normalizeSystem = (value = "") => String(value || "").trim();

  const systemsFromSheet = [...new Set(education.map((d) => normalizeSystem(d.system)).filter(Boolean))];
  const orderedSystems = [
    ...systemOrder.filter((system) => systemsFromSheet.includes(system)),
    ...systemsFromSheet.filter((system) => !systemOrder.includes(system)),
  ];

  const milestones = [...new Set(education.map((d) => d.milestone).filter(Boolean))];
  const statuses = [...new Set(education.map((d) => d.status).filter(Boolean))];
  const search = String(searchTerm || "").trim().toLowerCase();
  const getEducationStatusBucket = (status = "") => {
    const normalized = normalizeSystemName(status);
    if (normalized.includes("finalizado") || normalized.includes("terminado") || normalized.includes("aprobado")) return "Terminado";
    if (normalized.includes("desarrollo") || normalized.includes("proceso")) return "En desarrollo";
    return "Pendiente";
  };
  const statusCounts = ["Pendiente", "En desarrollo", "Terminado"].map((status) => ({
    status,
    count: education.filter((item) => getEducationStatusBucket(item.status) === status).length,
  }));

  const filtered = education.filter((item) => {
    const systemOk = systemFilter === "Todos" || item.system === systemFilter;
    const milestoneOk = milestoneFilter === "Todos" || item.milestone === milestoneFilter;
    const statusOk = statusFilter === "Todos" || item.status === statusFilter || getEducationStatusBucket(item.status) === statusFilter;
    const searchableText = [
      item.system,
      item.milestone,
      item.deliverable,
      item.whatIs,
      item.purpose,
      item.howToRead,
      item.status,
    ].join(" ").toLowerCase();
    const searchOk = !search || searchableText.includes(search);
    return systemOk && milestoneOk && statusOk && searchOk;
  });

  const grouped = filtered.reduce((acc, item) => {
    const milestone = String(item.milestone || "Sin hito asignado").trim() || "Sin hito asignado";
    const key = normalizeSystemName(milestone) || "sin hito";
    const existing = acc.find((group) => group.key === key);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ key, milestone, items: [item] });
    }
    return acc;
  }, []);

  const renderEducationCard = (item, index, prefix = "") => {
    const image = safeUrl(item.imagePreview);
    const link = safeUrl(item.link);
    const cardKey = `${prefix}${item.deliverable}-${index}`;
    const isOpen = openEducationCard === cardKey;

    return (
      <article className={`educationCard premiumEducationCard ${isOpen ? "open" : ""}`} key={cardKey}>
        {image ? (
          <img className="previewImage" src={image} alt={item.deliverable || "Imagen proceso"} />
        ) : (
          <div className="previewPlaceholder"><Monitor size={34} />Vista previa</div>
        )}

        <div className="educationContent">
          <button
            className="educationCardToggle"
            type="button"
            onClick={() => setOpenEducationCard((current) => (current === cardKey ? "" : cardKey))}
            aria-expanded={isOpen}
          >
            <ChevronRight size={24} />
          </button>

          <div className="area">{item.system || "Entregable"}</div>
          <h3>{item.deliverable}</h3>

          <div className="badgeRow">
            {item.milestone && <Badge status="En validación">Hito: {item.milestone}</Badge>}
            {item.status && <Badge status={getEducationStatusBucket(item.status) === "Terminado" ? "Finalizado" : item.status}>{item.status}</Badge>}
          </div>

          {isOpen && (
            <div className="educationDetailsPanel">
              {item.whatIs && <p><strong>¿Qué es?</strong><br />{item.whatIs}</p>}
              {item.purpose && <p><strong>¿Para qué sirve?</strong><br />{item.purpose}</p>}
              {item.howToRead && <p><strong>¿Cómo leerlo?</strong><br />{item.howToRead}</p>}
            </div>
          )}

          {link && (
            <a className="secondaryLink routeSecondaryLinkFixed" href={link} target="_blank" rel="noreferrer">
              Ver entregable <ExternalLink size={15} />
            </a>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="card premiumSectionCard educationSection">
      <div className="sectionHeader">
        <div>
          <h2>Lo que vas a recibir</h2>
          <p>
            Aquí encontrarás una guía clara de los entregables que estamos construyendo, qué significa cada uno,
            para qué sirve y cómo debes leerlo.
          </p>
        </div>
      </div>

      <p className="sectionIntro">
        La información está organizada por sistemas para que puedas entender cómo cada entregable aporta al orden,
        control y sostenibilidad de tu empresa.
      </p>

      <div className="educationSummaryGrid">
        <article className="educationTotalCard">
          <div>
            <h3>Total de entregables</h3>
            <strong>{education.length}</strong>
          </div>
          <div className="educationSummaryIcon">
            <BookOpen size={54} />
          </div>
        </article>

        <article className="educationStatusCard">
          <h3>Estado de entregables</h3>
          <div className="educationStatusRows">
            {statusCounts.map((item) => (
              <div className="educationStatusRow" key={item.status}>
                <span>{item.status}</span>
                <div className="educationStatusTrack">
                  <div style={{ width: `${education.length ? (item.count / education.length) * 100 : 0}%` }} />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="filters premiumFilters educationFilters">
        <label className="filter searchFilter educationSearchFilter">
          <span>Buscar</span>
          <div className="searchInputWrap">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar entregable, sistema o explicación..."
            />
          </div>
        </label>
        <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={orderedSystems} />
        <FilterSelect label="Hito" value={milestoneFilter} onChange={setMilestoneFilter} options={milestones} />
        <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={["Pendiente", "En desarrollo", "Terminado", ...statuses]} />
      </div>

      <div className="badgeRow resultCounter"><Badge status="Disponible">{filtered.length} recursos</Badge></div>

      <div className="systemsEducation">
        {grouped.map((group, groupIndex) => (
          <div className="systemSection premiumSystemSection" key={group.milestone}>
            <div className="systemHeader">
              <div className="systemNumber">Hito {groupIndex + 1}</div>
              <h3>{group.milestone}</h3>
            </div>

            <div className="educationGrid">
              {group.items.map((item, index) => renderEducationCard(item, index, group.milestone))}
            </div>
          </div>
        ))}

      </div>

      {!filtered.length && (
        <div className="emptyState">
          <Search size={22} />
          <strong>No encontramos recursos con esos filtros.</strong>
          <span>Prueba con otro sistema, hito o palabra clave.</span>
        </div>
      )}
    </section>
  );
}


function DocumentsUpload({ documents = [], project }) {
  const uploadLink = safeUrl(project.documentUploadLink || project.linkCargaDocumentos || "");
  const webhookUrl = safeUrl(import.meta.env.VITE_DOCUMENTS_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();
  const [responses, setResponses] = useState({});
  const [saving, setSaving] = useState({});
  const [saveMessage, setSaveMessage] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [requiredFilter, setRequiredFilter] = useState("Todos");
  const [documentStatusFilter, setDocumentStatusFilter] = useState("Todos");

  const title = documents.find((item) => item.title)?.title || "Carga de documentos iniciales";
  const description =
    documents.find((item) => item.description)?.description ||
    "Para iniciar el diagnóstico, revisa qué documentos tiene tu empresa y súbelos en la carpeta compartida.";

  const getDocumentKey = (item) => item.id || item.item || item.title || "";
  const getCurrentResponse = (item) => responses[getDocumentKey(item)] ?? item.responseClient ?? "";
  const getCurrentStatus = (item) => {
    const response = getCurrentResponse(item);
    if (response === "Sí tengo") return "Por subir";
    if (response === "No tengo") return "No disponible";
    return item.status || "Pendiente";
  };
  const getRequiredLabel = (item) => {
    const value = normalizeSystemName(item.required || item.obligatorio || "");
    return value.startsWith("s") || value.includes("obligatorio") ? "Obligatorio" : "Opcional";
  };

  const handleResponseChange = async (item, respuesta) => {
    const key = getDocumentKey(item);
    const previous = responses[key] ?? item.responseClient ?? "";

    setResponses((current) => ({ ...current, [key]: respuesta }));
    setSaving((current) => ({ ...current, [key]: true }));
    setSaveMessage((current) => ({ ...current, [key]: "Guardando respuesta..." }));

    if (!webhookUrl) {
      setSaving((current) => ({ ...current, [key]: false }));
      setSaveMessage((current) => ({ ...current, [key]: "Falta configurar VITE_DOCUMENTS_WEBHOOK_URL en Vercel." }));
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          spreadsheetId,
          item: item.item,
          id: item.id,
          categoria: item.category,
          respuesta,
          estado: respuesta === "Sí tengo" ? "Por subir" : "No disponible",
          fecha: new Date().toISOString(),
        }),
      });

      const text = await response.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        result = { ok: response.ok, message: text };
      }

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "No se pudo registrar la respuesta.");
      }

      setSaveMessage((current) => ({ ...current, [key]: "Respuesta registrada" }));
    } catch (error) {
      console.error(error);
      setResponses((current) => ({ ...current, [key]: previous }));
      setSaveMessage((current) => ({ ...current, [key]: error.message || "No se pudo guardar la respuesta." }));
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  };

  const statusOptions = useMemo(
    () => Array.from(new Set(documents.map((item) => getCurrentStatus(item)).filter(Boolean))),
    [documents, responses]
  );

  const filteredDocuments = useMemo(() => {
    const query = normalizeSystemName(searchTerm);

    return documents.filter((item) => {
      const searchable = normalizeSystemName(
        [
          item.title,
          item.category,
          item.item,
          item.detail,
          item.observation,
          item.required,
          getCurrentStatus(item),
        ].filter(Boolean).join(" ")
      );
      const matchesSearch = !query || searchable.includes(query);
      const matchesRequired = requiredFilter === "Todos" || getRequiredLabel(item) === requiredFilter;
      const matchesStatus = documentStatusFilter === "Todos" || getCurrentStatus(item) === documentStatusFilter;
      return matchesSearch && matchesRequired && matchesStatus;
    });
  }, [documents, responses, searchTerm, requiredFilter, documentStatusFilter]);

  const yesHave = documents.filter((item) => getCurrentResponse(item) === "Sí tengo").length;
  const required = documents.filter((item) => getRequiredLabel(item) === "Obligatorio").length;

  const renderDocumentItem = (item, index) => {
    const key = getDocumentKey(item) || String(index);
    const currentResponse = getCurrentResponse(item);
    const currentStatus = getCurrentStatus(item);
    const isDone = currentResponse === "Sí tengo" || String(currentStatus || "").toLowerCase().includes("cargado") || String(currentStatus || "").toLowerCase().includes("validado");

    return (
      <article className="documentChecklistItem" key={`${item.category || "general"}-${key}-${index}`}>
        <div className="documentCheckIcon">
          {isDone ? <CheckCircle2 size={19} /> : <ClipboardCheck size={19} />}
        </div>

        <div className="documentChecklistContent">
          <div className="documentItemTop">
            {item.category && <span className="documentCardCategory">{item.category}</span>}
            <h3>{item.item}</h3>
            <div className="badgeRow">
              {item.required && <Badge status="Disponible">Obligatorio: {item.required}</Badge>}
              {currentStatus && <Badge status={currentStatus}>{currentStatus}</Badge>}
            </div>
          </div>

          {item.detail && <p>{item.detail}</p>}

          <div className="documentResponseBox">
            <label htmlFor={`doc-response-${key}`}>¿Tienes este documento?</label>
            <select
              id={`doc-response-${key}`}
              value={currentResponse}
              onChange={(event) => handleResponseChange(item, event.target.value)}
              disabled={Boolean(saving[key])}
            >
              <option value="">Seleccionar</option>
              <option value="Sí tengo">Sí tengo</option>
              <option value="No tengo">No tengo</option>
            </select>
            {saveMessage[key] && <span className="documentSaveMessage">{saveMessage[key]}</span>}
          </div>

          {item.observation && <div className="documentObservation">{item.observation}</div>}
          {item.responseDate && <div className="documentResponseDate">Última respuesta: {item.responseDate}</div>}
        </div>
      </article>
    );
  };

  return (
    <section className="documentsPage">
      <div className="documentsHero">
        <div className="documentsHeroContent">
          <div className="portalEyebrow">
            <UploadCloud size={16} />
            Checklist documental
          </div>

          <h2>{title}</h2>
          <p>{description}</p>

          <div className="documentsActions">
            {uploadLink ? (
              <a className="primaryPortalButton documentsUploadButton" href={uploadLink} target="_blank" rel="noreferrer">
                <UploadCloud size={18} />
                Subir documentos
                <ExternalLink size={17} />
              </a>
            ) : (
              <button className="primaryPortalButton documentsUploadButton disabledButton" type="button">
                <UploadCloud size={18} />
                Enlace de carga pendiente
              </button>
            )}

            <button className="secondaryPortalButton documentsSecondaryButton" type="button">
              <FolderOpen size={18} />
              {documents.length} ítems solicitados
            </button>
          </div>
        </div>

        <div className="documentsHeroMetrics">
          <div className="portalMetricCard">
            <span>Ítems cargados</span>
            <strong><ChevronRight size={26} />{yesHave}/{documents.length}</strong>
            <ProgressBar value={documents.length ? (yesHave / documents.length) * 100 : 0} status="Finalizado" />
          </div>
          <div className="portalMetricCard">
            <span>Sí tiene</span>
            <strong><ChevronRight size={26} />{yesHave}</strong>
            <ProgressBar value={documents.length ? (yesHave / documents.length) * 100 : 0} status="Finalizado" />
          </div>
          <div className="portalMetricCard">
            <span>Obligatorios</span>
            <strong><ChevronRight size={26} />{required}</strong>
            <ProgressBar value={documents.length ? (required / documents.length) * 100 : 0} status="Finalizado" />
          </div>
        </div>
      </div>

      <div className="filters premiumFilters documentsFilters">
        <label className="filter searchFilter documentsSearchFilter">
          <span>Buscar</span>
          <div className="searchInputWrap">
            <Search size={19} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar documento, categoría o estado..."
            />
          </div>
        </label>
        <FilterSelect label="Obligatorio" value={requiredFilter} onChange={setRequiredFilter} options={["Obligatorio", "Opcional"]} />
        <FilterSelect label="Estado" value={documentStatusFilter} onChange={setDocumentStatusFilter} options={statusOptions} />
      </div>

      <div className="documentsChecklist">
        {!documents.length && (
          <div className="documentCategoryBlock">
            <div className="documentCategoryHeader">
              <div>
                <span>Checklist pendiente</span>
                <h3>No se encontraron ítems en Google Sheet</h3>
              </div>
              <Badge status="Pendiente">Revisar pestaña Documentos</Badge>
            </div>
            <div className="documentItemsGrid">
              <article className="documentChecklistItem">
                <div className="documentCheckIcon"><ClipboardCheck size={19} /></div>
                <div className="documentChecklistContent">
                  <div className="documentItemTop">
                    <h3>Revisa el nombre de la pestaña y los encabezados</h3>
                  </div>
                  <p>La app busca una pestaña llamada Documentos con columnas como Titulo, Descripcion, Categoria, Item, Detalle, Obligatorio, RespuestaCliente, Estado, Observacion y FechaRespuesta.</p>
                </div>
              </article>
            </div>
          </div>
        )}

        {documents.length > 0 && filteredDocuments.length === 0 && (
          <div className="documentCategoryBlock documentsEmptyState">
            <div className="documentCategoryHeader">
              <div>
                <span>Sin resultados</span>
                <h3>No hay documentos con esos filtros</h3>
              </div>
              <Badge status="Pendiente">Ajustar búsqueda</Badge>
            </div>
          </div>
        )}

        {filteredDocuments.length > 0 && (
          <div className="documentItemsGrid documentsFlatGrid">
            {filteredDocuments.map((item, index) => renderDocumentItem(item, index))}
          </div>
        )}
      </div>
    </section>
  );
}

function MobilePortalHome({ project, milestones = [], pending = [], setView }) {
  const [mobileSearch, setMobileSearch] = useState("");
  const company = project.companyClient || project.client || "Cliente";
  const contact = project.contactName || project.responsibleClient || "Cliente";
  const progress = Number(project.progress) || 0;
  const disorder = Math.max(0, 100 - progress);
  const completedMilestones = milestones.filter((item) => isCompletedStatus(item.status)).length;
  const activePending = pending.filter(isPendingActive).length;
  const quickItems = [
    { label: "Resumen", view: "resumen", icon: BarChart3 },
    { label: "Ruta", view: "ruta", icon: Target },
    { label: "COE", view: "coe", icon: Brain },
    { label: "Hallazgos", view: "hallazgos", icon: Search },
    { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
    { label: "Entregables", view: "entregables", icon: ClipboardCheck },
    { label: "Documentos", view: "documentos", icon: UploadCloud },
    { label: "Recibir", view: "educacion", icon: BookOpen },
  ];
  const filteredQuickItems = quickItems.filter((item) => normalizeSystemName(item.label).includes(normalizeSystemName(mobileSearch)));
  const routeItems = Array.from({ length: 13 }, (_, index) => {
    const item = milestones[index] || {};
    return {
      id: String(item.id || index).replace(/^E/i, ""),
      title: item.title || "Por definir",
      unlocked: index < 4 || normalizeSystemName(item.open || item.abierto || "").includes("si") || isCompletedStatus(item.status),
    };
  });

  return (
    <section className="mobilePortalHome">
      <div className="mobileHeroTop">
        <div className="mobileAvatar"><Users size={34} /></div>
        <h1>Hola {contact}</h1>
        <span>{company}</span>

        <label className="mobileHomeSearch">
          <Search size={17} />
          <input value={mobileSearch} onChange={(event) => setMobileSearch(event.target.value)} placeholder="Buscar" />
        </label>
      </div>

      <div className="mobileHomeBody">
        <div className="mobileQuickGrid">
          {(mobileSearch ? filteredQuickItems : quickItems).map((item) => {
            const Icon = item.icon;
            return (
              <button className="mobileQuickButton" key={item.view} type="button" onClick={() => setView(item.view)}>
                <Icon size={28} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <h2>Resumen</h2>
        <div className="mobileMiniKpis">
          <button type="button" onClick={() => setView("resumen")}>
            <i />
            <span>Avance General</span>
            <strong>{progress}%</strong>
          </button>
          <button type="button" onClick={() => setView("resumen")}>
            <i />
            <span>Desorden</span>
            <strong>{disorder}%</strong>
          </button>
          <button type="button" onClick={() => setView("pendientes")}>
            <i />
            <span>Pendientes</span>
            <strong>{activePending}</strong>
          </button>
        </div>

        <button className="mobileMilestonePreview" type="button" onClick={() => setView("ruta")}>
          <div className="mobilePreviewHeader">
            <span>Hitos completados</span>
            <strong>{completedMilestones}/{Math.max(milestones.length, 13)}</strong>
          </div>
          <div className="mobileMiniRoute">
            {routeItems.map((item) => (
              <span className={item.unlocked ? "open" : ""} key={item.id}>{item.id}</span>
            ))}
          </div>
        </button>

        <div className="mobileBottomCards">
          <button type="button" onClick={() => setView("ruta")}>
            <Rocket size={28} />
            <span>Hitos completados</span>
            <strong>{completedMilestones}/{Math.max(milestones.length, 13)}</strong>
          </button>
          <button type="button" onClick={() => setView("ruta")}>
            <Flag size={28} />
            <span>Ruta del proyecto</span>
            <strong>Ver</strong>
          </button>
        </div>
      </div>
    </section>
  );
}

function getStoredClientSession() {
  try {
    return JSON.parse(window.localStorage.getItem("gseClientSession") || "null");
  } catch {
    return null;
  }
}

function ClientLogin({ onLogin }) {
  const loginUrl = import.meta.env.VITE_LOGIN_WEBHOOK_URL || "";
  const supportWhatsappUrl = safeUrl(import.meta.env.VITE_SUPPORT_WHATSAPP_URL || "");
  const [usuario, setUsuario] = useState(() => window.localStorage.getItem("gseRememberedUser") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(window.localStorage.getItem("gseRememberedUser")));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!loginUrl) {
      setMessage("Falta configurar VITE_LOGIN_WEBHOOK_URL en Vercel.");
      return;
    }

    if (!usuario.trim() || !password.trim()) {
      setMessage("Ingresa usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ usuario, password }),
      });
      const result = await response.json();

      if (!response.ok || result.ok === false || !result.user?.sheetId) {
        throw new Error(result.message || "No se pudo iniciar sesión.");
      }

      const session = {
        ...result.user,
        loggedAt: new Date().toISOString(),
      };
      if (rememberMe) {
        window.localStorage.setItem("gseRememberedUser", usuario.trim());
      } else {
        window.localStorage.removeItem("gseRememberedUser");
      }
      window.localStorage.setItem("gseClientSession", JSON.stringify(session));
      onLogin(session);
    } catch (error) {
      setMessage(error.message || "Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="loginShell">
      <section className="loginPanel">
        <div className="loginBrandBlock">
          <div className="loginBrandMark">GSE&CO</div>
          <span>Portal privado del cliente</span>
        </div>
        <div>
          <span className="loginEyebrow">Ruta de Implementación Visible</span>
          <h1>Acceso cliente</h1>
          <p>Ingresa con el usuario asignado para abrir automáticamente tu ruta del proyecto.</p>
        </div>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label>
            <span>Usuario</span>
            <input value={usuario} onChange={(event) => setUsuario(event.target.value)} autoComplete="username" />
          </label>

          <label>
            <span>Contraseña</span>
            <div className="passwordInputWrap">
              <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" />
              <button
                type="button"
                className="passwordToggleButton"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="rememberLoginOption">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <span>Recuérdame</span>
          </label>

          {message && <div className="loginMessage">{message}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Validando..." : "Entrar"}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="loginHelpText">
          <MessageCircle size={18} />
          <p>
            Si tienes algún problema o si olvidaste la contraseña,
            {supportWhatsappUrl ? (
              <> <a href={supportWhatsappUrl} target="_blank" rel="noreferrer">escríbenos al WhatsApp</a>.</>
            ) : (
              " escríbenos al WhatsApp."
            )}
          </p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => getStoredClientSession());
  const [view, setView] = useState("portal");
  const [data, setData] = useState(demoData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] = useState("");
  const [selectedHito, setSelectedHito] = useState("");

  useEffect(() => {
    if (!session?.sheetId) return;

    loadSheetData()
      .then((sheetData) => {
        setData(sheetData);
        setConnected(true);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setConnected(false);
        setError("No se pudo conectar con Google Sheets. Revisa publicación, permisos o nombres de pestañas.");
      });
  }, [session?.sheetId]);

  const { project, milestones, findings, pending, deliverables, updates, education, meetings = [], documents = [], processesAsIs = [], processesToBe = [], coeAsIs = [], coeToBe = [] } = data;

  const completedText = useMemo(() => {
    const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
    return `${completed} hitos completados de ${milestones.length}`;
  }, [milestones]);

  const handleLogout = () => {
    window.localStorage.removeItem("gseClientSession");
    setSession(null);
    setConnected(false);
    setData(demoData);
  };

  if (!session?.sheetId) {
    return <ClientLogin onLogin={setSession} />;
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} project={project} />

      <main className="main">
        <AppTopbar
          project={project}
          pending={pending}
          meetings={meetings}
          updates={updates}
          milestones={milestones}
          findings={findings}
          deliverables={deliverables}
          documents={documents}
          education={education}
          processesAsIs={processesAsIs}
          processesToBe={processesToBe}
          setView={setView}
          setSelectedHito={setSelectedHito}
          setSelectedDeliverable={setSelectedDeliverable}
          onLogout={handleLogout}
        />

        <div className={`content view-${view}`}>
          <div className="mobileTabs">
            {[
              ["portal", "Portal"],
              ["resumen", "Resumen"],
              ["ruta", "Ruta"],
              ["procesos", "Procesos"],
              ["coe", "COE"],
              ["hallazgos", "Hallazgos"],
              ["pendientes", "Pendientes"],
              ["entregables", "Entregables"],
              ["documentos", "Documentos"],
              ["educacion", "Lo que vas a recibir"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setView(value)} className={view === value ? "active" : ""}>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="errorBox">{error}</div>}

          {view === "portal" && (
            <>
              <MobilePortalHome project={project} milestones={milestones} pending={pending} setView={setView} />
              <PortalProject project={project} milestones={milestones} pending={pending} setView={setView} />
            </>
          )}

          {view === "resumen" && (
            <SummaryCanvaDashboard
              project={project}
              milestones={milestones}
              pending={pending}
              findings={findings}
              deliverables={deliverables}
              processesAsIs={processesAsIs}
              processesToBe={processesToBe}
              coeAsIs={coeAsIs}
              coeToBe={coeToBe}
              updates={updates}
              meetings={meetings}
              setView={setView}
            />
          )}

          {view === "ruta" && <Timeline milestones={milestones} deliverables={deliverables} detailed setView={setView} setSelectedDeliverable={setSelectedDeliverable} selectedHito={selectedHito} setSelectedHito={setSelectedHito} />}
          {view === "procesos" && <ProcessesMasterList processesAsIs={processesAsIs} processesToBe={processesToBe} />}
          {view === "coe" && <COEDashboard coeAsIs={coeAsIs} coeToBe={coeToBe} />}
          {view === "hallazgos" && <Findings findings={findings} />}
          {view === "pendientes" && <PendingClient pending={pending} />}
          {view === "entregables" && <Deliverables deliverables={deliverables} selectedDeliverable={selectedDeliverable} setSelectedDeliverable={setSelectedDeliverable} />}
          {view === "documentos" && <DocumentsUpload documents={documents} project={project} />}
          {view === "educacion" && <Education education={education} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);


// PENDIENTESCLIENTE_FIX_FINAL

// SHEETSJS_SYNTAX_FIX_PENDIENTESCLIENTE_FINAL


// PENDIENTES_VALIDACION_CLIENTE_FINAL


// PENDIENTES_VALIDAR_BOTON_SUPERIOR_FINAL


// RUTA_PRIMERA_TARJETA_TEXTO_OSCURO_FINAL


// RUTA_JSX_TEXTO_OSCURO_FINAL


// FILTERSELECT_FIX_ENTREGABLES_EDUCACION_FINAL


// RUTA_ACORDEONES_DETALLE_FINAL


// GRAFICOS_ESTADOS_TERMINADO_RADAR_S_FIX_FINAL


// HALLAZGOS_MATRIZ_FIX_FINAL


// LISTA_MAESTRA_PROCESOS_FINAL


// LISTA_MAESTRA_PROCESOS_LECTURA_FIX_FINAL


// LISTA_MAESTRA_IMAGEN_PROCESO_FICHA_TECNICA_FINAL


// COE_MATRICES_OVERFLOW_TOP10_FIX_FINAL


// MATRICES_SCROLL_FIJO_FINAL


// SCROLL_INDIVIDUAL_ASIS_TOBE_MATRICES_FINAL


// SCROLL_SEPARADO_ASIS_TOBE_SIN_PADRE_FINAL


// SCROLL_INTERNO_DEFINITIVO_MATRICES_FINAL
// MATRICES_SCROLL_SIN_DESBORDE_REAL_FINAL


// MATRICES_SCROLL_SIN_DESBORDE_REAL_SYNTAX_FIX_FINAL


// RESUMEN_TRES_TARJETAS_FINAL


// COE_V2_STATUS_ACTIVIDADES_FINAL


// COE_V3_TITULOS_ACTIVIDADES_FILTROS_FINAL


// COE_V4_TARJETAS_VISUALES_FINAL


// COE_V5_TARJETAS_CLASES_REALES_FINAL


// COE_V6_NAV_LAYOUT_FINAL


// COE_V7_HOMOGENEO_NAV_FILTER_FINAL


// COE_V8_TIPOGRAFIA_SUAVE_FINAL


// HALLAZGOS_V2_ESTADOS_FILTROS_FINAL


// RESUMEN_V2_HOMOGENEO_4X4_FINAL


// RESUMEN_V3_ESPEJO_LAYOUT_FINAL


// RESUMEN_V4_TITULOS_LIMPIOS_FINAL


// RESUMEN_V5_PENDIENTE_PRIORITARIO_LIMPIO_FINAL


// RUTA_V3_RESTAURA_MENU_STATUS_FINAL


// ENTREGABLES_V3_FIX_RESPONSABLE_RESUMEN_FINAL


// ENTREGABLES_V4_BADGES_VISIBLES_FINAL


// COE_V9_TIPO_PROCESO_FINAL


// COE_V10_FILTROS_DOS_FILAS_NUMEROS_AJUSTADOS


// COE_V11_NUMEROS_IGUAL_LISTA_MAESTRA


// PENDIENTES_V2_VALIDACION_CLIENTE_FINAL


// PENDIENTES_V3_BADGES_DESCRIPCION_VISIBLE_FINAL


// HALLAZGOS_V3_ESTADOS_TITULOS_FINAL


// RESUMEN_V6_HITOS_MATRIZ_ESTADOS_FINAL


// RESUMEN_V7_PROPORCIONES_PREMIUM_FINAL


// RESUMEN_V8_COMPACTO_NUMEROS_ACTIVIDADES_FINAL


// RESUMEN_V9_HOMOGENEO_CLICK_PENDIENTE_FINAL


// RESUMEN_V10_RIV_AJUSTES_VISUALES_FINAL

// RESUMEN_V11_RADAR_HITOS_HOMOGENEO_FINAL


// HALLAZGOS_V4_GERENCIA_ENTREGABLES_MENU_FINAL


// HALLAZGOS_V5_ENTREGABLES_DIVIDIDOS_FILTROS_FINAL


// HALLAZGOS_V6_FILTRO_ENTREGABLE_META_VISIBLE_FINAL


// HALLAZGOS_V7_FILTROS_DEPENDIENTES_TAGS_FINAL


// HALLAZGOS_V8_TAGS_TURQUESAS_FILTRO_REAL_FINAL

// HALLAZGOS_V9_LECTURA_COMPLETA_TAGS_2_FILAS_FINAL


// HALLAZGOS_V10_TAGS_INLINE_2_FILAS_FINAL


// HALLAZGOS_V11_TAGS_LEGIBLES_TOTAL_SIN_DUPLICAR_FINAL


// ENTREGABLES_GSE_V5_BOTON_TURQUESA_FINAL


// HALLAZGOS_V12_FILTROS_FECHAMAX_FINAL

