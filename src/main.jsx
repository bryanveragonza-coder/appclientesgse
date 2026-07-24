
import React, { Fragment, useEffect, useMemo, useState } from "react";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  UploadCloud,
  Flag,
  Hourglass,
  Layers3,
  Lock,
  LockKeyhole,
  LogIn,
  MapPin,
  Mic,
  Monitor,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Unlock,
  Users,
  Video,
  X,
  MessageCircle,
} from "lucide-react";
import { loadSheetData, loadSheetDataForSpreadsheetId, loadLoginMasterClients, demoData, getActiveSpreadsheetId } from "./sheets";
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
  const embeddedUrl = clean.match(/https?:\/\/[^\s"'<>)]*/i)?.[0] || "";
  return embeddedUrl.replace(/[),.;]+$/, "");
}

function getDrivePreviewUrl(url = "") {
  const clean = safeUrl(url);
  if (!clean) return "";
  const directMatch = clean.match(/\/d\/([^/]+)/) || clean.match(/[?&]id=([^&]+)/);
  return directMatch?.[1] ? `https://drive.google.com/thumbnail?id=${directMatch[1]}&sz=w2000` : clean;
}

function isCheckedSheetValue(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return ["si", "true", "1", "x", "ok", "validado", "validada", "yes"].includes(normalized);
}

function getClientSession() {
  try {
    return JSON.parse(window.localStorage.getItem("gseClientSession") || "null") || {};
  } catch {
    return {};
  }
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
  const [sidebarTooltip, setSidebarTooltip] = useState(null);
  const groups = [
    { title: "", items: [[Sparkles, "Portal del proyecto", "portal"]] },
    {
      title: "Seguimiento",
      items: [
        [BarChart3, "Resumen", "resumen"],
        [CalendarDays, "Calendario", "calendario"],
        [Target, "Ruta del proyecto", "ruta"],
        [BarChart3, "COE", "coe"],
        [Search, "Hallazgos", "hallazgos"],
        [AlertTriangle, "Pendientes cliente", "pendientes"],
      ],
    },
    { title: "Procesos", items: [[ClipboardCheck, "Mapa y lista maestra de procesos", "procesos"], [Building2, "Estructura y perfil", "estructura"]] },
    { title: "Implementación", items: [[Target, "Indicadores", "indicadores"]] },
    {
      title: "Documentacion",
      items: [
        [FileText, "Entregables GSE", "entregables"],
        [ClipboardCheck, "Entregables clientes", "entregables-clientes"],
        [UploadCloud, "Carga de documentos", "documentos"],
      ],
    },
    { title: "Informacion", items: [[BookOpen, "Lo que vas a recibir", "educacion"]] },
  ];

  const company = project.companyClient || project.client;
  const sidebarLogoHorizontal = getDrivePreviewUrl(project.logoGSEhorizontal || "");
  const contact = project.contactName || project.generalManager || project.responsibleClient;
  const role = project.contactRole || "cargo de empresa";
  const handleSidebarWheel = (event) => {
    if (window.innerWidth <= 760) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const content = document.querySelector(".main .content");
    if (!content) return;

    event.preventDefault();
    content.scrollBy({ top: event.deltaY, behavior: "auto" });
  };
  const showSidebarTooltip = (event, label) => {
    if (window.innerWidth <= 760) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setSidebarTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };
  const hideSidebarTooltip = () => setSidebarTooltip(null);

  return (
    <>
      <aside className="sidebar premiumSidebar" onWheel={handleSidebarWheel} onMouseLeave={hideSidebarTooltip}>
        <div className="brand premiumBrand sidebarHorizontalBrand">
          {sidebarLogoHorizontal ? (
            <img src={sidebarLogoHorizontal} alt="GSE&CO" className="sidebarHorizontalLogo" />
          ) : null}
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
                <button
                  key={label}
                  className={`navItem ${view === value ? "active" : ""}`}
                  onClick={() => setView(value)}
                  onMouseEnter={(event) => showSidebarTooltip(event, label)}
                  onFocus={(event) => showSidebarTooltip(event, label)}
                  onMouseLeave={hideSidebarTooltip}
                  onBlur={hideSidebarTooltip}
                  aria-label={label}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebarVersion">V 0.1</div>
      </aside>
      {sidebarTooltip ? (
        <div
          className="collapsedSidebarTooltip"
          style={{ top: `${sidebarTooltip.top}px`, left: `${sidebarTooltip.left}px` }}
        >
          {sidebarTooltip.label}
        </div>
      ) : null}
    </>
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

  const topbarCompany = project?.companyClient || project?.client || "";
  const topbarName = project?.contactName || project?.responsibleClient || "Cliente";
  const topbarRole = project?.contactRole || project?.role || "";

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
        <div className="canvaUserBlock">
          {topbarCompany && <span className="canvaUserCompany">{topbarCompany}</span>}
          <strong className="canvaUserName">{topbarName}</strong>
          {topbarRole && <small className="canvaUserRole">{topbarRole}</small>}
        </div>
        <button className="topbarLogoutButton" type="button" onClick={onLogout}>
          Salir
        </button>
      </div>
    </div>
  );
}

function SummaryCanvaDashboard({ project, milestones = [], pending = [], findings = [], deliverables = [], architectureRoles = [], processesAsIs = [], processesToBe = [], coeAsIs = [], coeToBe = [], updates = [], meetings = [], setView }) {
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
      total: architectureRoles.length,
      value: architectureRoles.filter((item) => isCompletedStatus(item.status) || isCheckedSheetValue(item.validated)).length,
      note: architectureRoles.length ? "Validado" : "Pendiente de datos",
      segments: countByStatus(architectureRoles),
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


function parseCalendarDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [year, month, day] = raw.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const match = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    return new Date(year, month, day);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseCalendarHour(value = "") {
  const raw = String(value || "").toLowerCase();
  const match = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return 9;
  let hour = Number(match[1]);
  const period = match[3];
  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return Math.max(0, Math.min(hour, 23));
}

function formatCalendarDate(date, options = {}) {
  return date.toLocaleDateString("es-ES", options);
}

function sameCalendarDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function normalizeCalendarTerm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function CalendarView({ meetings = [] }) {
  const today = new Date();
  const [mode, setMode] = useState("Semana");
  const [cursorDate, setCursorDate] = useState(today);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [calendarSearch, setCalendarSearch] = useState("");

  const calendarMeetings = useMemo(() => meetings.map((meeting) => {
    const date = parseCalendarDate(meeting.date);
    return { ...meeting, dateObject: date, hour: parseCalendarHour(meeting.time) };
  }).filter((meeting) => meeting.dateObject), [meetings]);

  const visibleMeetings = useMemo(() => {
    const query = normalizeCalendarTerm(calendarSearch);
    if (!query) return calendarMeetings;
    return calendarMeetings.filter((meeting) => normalizeCalendarTerm([
      meeting.title,
      meeting.description,
      meeting.status,
      meeting.observation,
      meeting.invited,
    ].join(" ")).includes(query));
  }, [calendarMeetings, calendarSearch]);

  useEffect(() => {
    const query = normalizeCalendarTerm(calendarSearch);
    const firstMatch = visibleMeetings[0];
    if (query && firstMatch?.dateObject && !sameCalendarDay(firstMatch.dateObject, cursorDate)) {
      setCursorDate(new Date(firstMatch.dateObject));
    }
  }, [calendarSearch, visibleMeetings, cursorDate]);

  const monthStart = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const monthLabel = formatCalendarDate(cursorDate, { month: "long", year: "numeric" });
  const weekStart = new Date(cursorDate);
  weekStart.setDate(cursorDate.getDate() - ((cursorDate.getDay() + 6) % 7));
  const visibleDays = mode === "Día"
    ? [new Date(cursorDate)]
    : Array.from({ length: mode === "Semana" ? 7 : 35 }, (_, index) => {
        const base = mode === "Semana" ? new Date(weekStart) : new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - ((monthStart.getDay() + 6) % 7));
        base.setDate(base.getDate() + index);
        return base;
      });

  const meetingsByStatus = visibleMeetings.reduce((acc, meeting) => {
    const key = meeting.status || "Sin estado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const maxStatus = Math.max(1, ...Object.values(meetingsByStatus));
  const hours = Array.from({ length: 12 }, (_, index) => index + 8);

  const moveCursor = (direction) => {
    const next = new Date(cursorDate);
    next.setDate(next.getDate() + direction * (mode === "Día" ? 1 : mode === "Semana" ? 7 : 30));
    setCursorDate(next);
  };

  return (
    <section className="calendarPage">
      <aside className="calendarSidebarPanel">
        <div className="calendarTitle"><CalendarDays size={24} /><h2>Calendario</h2></div>
        <div className="miniCalendarCard">
          <div className="miniCalendarHeader">{monthLabel}</div>
          <div className="miniCalendarGrid miniCalendarWeekdays">{["L", "M", "M", "J", "V", "S", "D"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="miniCalendarGrid">
            {Array.from({ length: 35 }, (_, index) => {
              const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - ((monthStart.getDay() + 6) % 7));
              first.setDate(first.getDate() + index);
              const hasMeeting = calendarMeetings.some((meeting) => sameCalendarDay(meeting.dateObject, first));
              return (
                <button key={first.toISOString()} className={`${sameCalendarDay(first, cursorDate) ? "active" : ""} ${hasMeeting ? "hasMeeting" : ""}`} onClick={() => setCursorDate(first)}>
                  {first.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        <label className="calendarSearchField">
          <Search size={16} />
          <input
            value={calendarSearch}
            onChange={(event) => setCalendarSearch(event.target.value)}
            placeholder="Buscar reunión"
          />
        </label>
        <div className="calendarMetricCard">
          <span>Reuniones totales</span>
          <strong><ChevronRight size={22} />{visibleMeetings.length}</strong>
        </div>
        <div className="calendarStatusCard">
          <h3>Estado reuniones</h3>
          {Object.entries(meetingsByStatus).map(([status, count]) => (
            <div className="calendarStatusRow" key={status}>
              <span>{status}</span>
              <div><i style={{ width: `${(count / maxStatus) * 100}%` }} /></div>
              <b>{count}</b>
            </div>
          ))}
        </div>
      </aside>

      <div className="calendarMainPanel">
        <div className="calendarToolbar">
          <button onClick={() => setCursorDate(new Date())}>Hoy</button>
          <button onClick={() => moveCursor(-1)}><ChevronLeft size={16} /></button>
          <button onClick={() => moveCursor(1)}><ChevronRight size={16} /></button>
          <h3>{mode === "Día" ? formatCalendarDate(cursorDate, { day: "numeric", month: "long", year: "numeric" }) : monthLabel}</h3>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option>Día</option>
            <option>Semana</option>
            <option>Mes</option>
          </select>
        </div>

        {mode === "Mes" ? (
          <div className="calendarMonthGrid">
            {visibleDays.map((day) => (
              <div className={`calendarMonthCell ${day.getMonth() !== cursorDate.getMonth() ? "muted" : ""}`} key={day.toISOString()}>
                <button onClick={() => { setCursorDate(day); setMode("Día"); }}>{day.getDate()}</button>
                {visibleMeetings.filter((meeting) => sameCalendarDay(meeting.dateObject, day)).slice(0, 3).map((meeting) => (
                  <button className="calendarMonthEvent" key={meeting.id} onClick={() => setSelectedMeeting(meeting)}>{meeting.title || "Reunión"}</button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="calendarWeekGrid" style={{ gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(130px, 1fr))` }}>
            <div className="calendarCorner">GMT-05</div>
            {visibleDays.map((day) => (
              <div className="calendarDayHeader" key={day.toISOString()}>
                <span>{formatCalendarDate(day, { weekday: "short" })}</span>
                <strong className={sameCalendarDay(day, today) ? "today" : ""}>{day.getDate()}</strong>
              </div>
            ))}
            {hours.map((hour) => (
              <Fragment key={hour}>
                <div className="calendarHour">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? "PM" : "AM"}</div>
                {visibleDays.map((day) => {
                  const events = visibleMeetings.filter((meeting) => sameCalendarDay(meeting.dateObject, day) && meeting.hour === hour);
                  return (
                    <div className="calendarSlot" key={`${day.toISOString()}-${hour}`}>
                      {events.map((meeting) => (
                        <button className="calendarEvent" key={meeting.id} onClick={() => setSelectedMeeting(meeting)}>
                          <strong>{meeting.title || "Reunión"}</strong>
                          <span>{meeting.time || "Hora por definir"}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {selectedMeeting && (
        <div className="calendarModalBackdrop" onClick={() => setSelectedMeeting(null)}>
          <article className="calendarMeetingModal" onClick={(event) => event.stopPropagation()}>
            <button className="calendarModalClose" onClick={() => setSelectedMeeting(null)}><X size={16} /></button>
            <Badge status={selectedMeeting.status}>{selectedMeeting.status || "Sin estado"}</Badge>
            <h3>{selectedMeeting.title || "Reunión"}</h3>
            <p>{formatCalendarDate(selectedMeeting.dateObject, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {selectedMeeting.time || "Hora por definir"}</p>
            <div className="calendarModalDetails">
              <div><b>Fecha</b><span>{selectedMeeting.date || "Por definir"}</span></div>
              <div><b>Hora</b><span>{selectedMeeting.time || "Por definir"}</span></div>
              <div><b>Estado</b><span>{selectedMeeting.status || "Sin estado"}</span></div>
            </div>
            {selectedMeeting.description && <div className="calendarModalBlock"><b>Descripción</b><span>{selectedMeeting.description}</span></div>}
            {selectedMeeting.invited && <div className="calendarModalBlock"><b>Invitados</b><span>{selectedMeeting.invited}</span></div>}
            {selectedMeeting.observation && <div className="calendarModalBlock"><b>Observación</b><span>{selectedMeeting.observation}</span></div>}
            <div className="calendarModalLinks">
              {selectedMeeting.link && <a href={safeUrl(selectedMeeting.link)} target="_blank" rel="noreferrer">Entrar a la reunión <ExternalLink size={15} /></a>}
              {selectedMeeting.minutesLink && <a href={safeUrl(selectedMeeting.minutesLink)} target="_blank" rel="noreferrer">Acta de reunión <ExternalLink size={15} /></a>}
            </div>
          </article>
        </div>
      )}
    </section>
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

function ImplementationIndicators({ indicators = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [processFilter, setProcessFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [localIndicators, setLocalIndicators] = useState(indicators);
  const [savingCells, setSavingCells] = useState({});

  useEffect(() => {
    setLocalIndicators(indicators);
  }, [indicators]);

  const spreadsheetId = getActiveSpreadsheetId();
  const indicatorsWebhookUrl = safeUrl(import.meta.env.VITE_INDICATORS_WEBHOOK_URL || "");
  const editableFields = ["baseline", "month1", "month2", "month3", "goal"];
  const statusBuckets = [
    { key: "pendiente", label: "Pendiente" },
    { key: "curso", label: "En curso" },
    { key: "cumplido", label: "Cumplido" },
    { key: "riesgo", label: "En riesgo" },
  ];

  const getStatusBucket = (status = "") => {
    const normalized = normalizeSystemName(status);
    if (normalized.includes("riesgo") || normalized.includes("alerta") || normalized.includes("bloque")) return "riesgo";
    if (normalized.includes("cumpl") || normalized.includes("final") || normalized.includes("termin") || normalized.includes("aprobad")) return "cumplido";
    if (normalized.includes("curso") || normalized.includes("proceso") || normalized.includes("desarrollo") || normalized.includes("seguimiento")) return "curso";
    return "pendiente";
  };

  const statusOptions = statusBuckets.map((bucket) => bucket.label);
  const getStatusLabel = (status = "") => statusBuckets.find((bucket) => bucket.key === getStatusBucket(status))?.label || "Pendiente";
  const areaOptions = useMemo(() => localIndicators.map((item) => item.area).filter(Boolean), [localIndicators]);
  const processOptions = useMemo(() => localIndicators.map((item) => item.process).filter(Boolean), [localIndicators]);

  const getSeries = (item) => [
    parseNumericValue(item.baseline),
    parseNumericValue(item.month1),
    parseNumericValue(item.month2),
    parseNumericValue(item.month3),
  ];

  const getLatestValue = (item) => {
    const values = [item.month3, item.month2, item.month1, item.baseline].map((value) => String(value || "").trim());
    return values.find(Boolean) || "Sin dato";
  };

  const getCompletion = (item) => {
    const goal = Math.abs(parseNumericValue(item.goal));
    const latest = Math.abs(parseNumericValue(getLatestValue(item)));
    if (!goal) return 0;
    return Math.max(0, Math.min(100, (latest / goal) * 100));
  };

  const getLinePoints = (item) => {
    const values = getSeries(item);
    const max = Math.max(...values, Math.abs(parseNumericValue(item.goal)), 1);
    return values.map((value, index) => {
      const x = 8 + index * 28;
      const y = 46 - (Math.max(0, value) / max) * 34;
      return `${x},${Math.max(8, Math.min(46, y))}`;
    }).join(" ");
  };

  const getChartBars = (item) => {
    const baseline = parseNumericValue(item.baseline);
    const goal = parseNumericValue(item.goal);
    const unitText = String(item.unit || "").trim();
    const normalizedUnit = normalizeSystemName(unitText);
    const isPercentage = normalizedUnit.includes("porcentaje") || unitText.includes("%");
    const unitLabel = isPercentage ? "Porcentaje" : unitText || "Unidades";
    const formatChartValue = (raw, numericValue) => {
      const clean = String(raw || "").trim();
      if (clean) return clean.replace(/%/g, "").trim();
      return numericValue ? String(numericValue) : "0";
    };
    const withUnitSuffix = (value) => {
      const clean = String(value || "0").trim();
      return isPercentage && !clean.includes("%") ? `${clean}%` : clean;
    };
    const months = [
      { label: "Mes 1", value: parseNumericValue(item.month1), raw: item.month1 },
      { label: "Mes 2", value: parseNumericValue(item.month2), raw: item.month2 },
      { label: "Mes 3", value: parseNumericValue(item.month3), raw: item.month3 },
    ];
    const rawMax = Math.max(Math.abs(baseline), Math.abs(goal), ...months.map((month) => Math.abs(month.value)), 1);
    const scaleStep = rawMax <= 10 ? 2 : rawMax <= 50 ? 10 : rawMax <= 100 ? 20 : rawMax <= 250 ? 50 : 100;
    const scaleMax = Math.max(scaleStep, Math.ceil(rawMax / scaleStep) * scaleStep);
    const plotHeight = 142;
    const toHeight = (value) => Math.max(3, Math.min(plotHeight, (Math.max(0, value) / scaleMax) * plotHeight));
    const positiveMonths = months.map((month) => Math.max(0, month.value));
    const pieTotal = positiveMonths.reduce((sum, value) => sum + value, 0);
    const pieColors = ["#00b8b5", "#63b8b4", "#087d78"];
    let startPercent = 0;
    const polarPoint = (percent) => {
      const angle = (percent / 100) * 360 - 90;
      const radians = (angle * Math.PI) / 180;
      const radius = 42;
      return {
        x: 50 + radius * Math.cos(radians),
        y: 50 + radius * Math.sin(radians),
      };
    };
    const makePiePath = (start, end) => {
      const slice = Math.max(0, end - start);
      if (!slice) return "";
      const safeEnd = slice >= 99.999 ? start + 99.999 : end;
      const from = polarPoint(start);
      const to = polarPoint(safeEnd);
      const largeArc = slice > 50 ? 1 : 0;
      return `M 50 50 L ${from.x.toFixed(3)} ${from.y.toFixed(3)} A 42 42 0 ${largeArc} 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)} Z`;
    };
    const pieSegments = months.map((month, index) => {
      const percent = pieTotal ? (Math.max(0, month.value) / pieTotal) * 100 : 0;
      const segment = {
        ...month,
        displayValue: withUnitSuffix(formatChartValue(month.raw, month.value)),
        percent,
        color: pieColors[index],
        path: makePiePath(startPercent, startPercent + percent),
      };
      startPercent += percent;
      return segment;
    });
    const ticks = [scaleMax, scaleMax * 0.75, scaleMax * 0.5, scaleMax * 0.25].map((value) => ({
      value,
      label: Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ","),
      height: toHeight(value),
    }));
    return {
      baseline,
      goal,
      isPercentage,
      unitLabel,
      baselineLabel: withUnitSuffix(formatChartValue(item.baseline, baseline)),
      goalLabel: withUnitSuffix(formatChartValue(item.goal, goal)),
      baselineHeight: toHeight(baseline),
      goalHeight: toHeight(goal),
      ticks,
      pieSegments,
      months: months.map((month) => ({
        ...month,
        displayValue: formatChartValue(month.raw, month.value),
        height: toHeight(month.value),
      })),
    };
  };
  const summary = useMemo(() => {
    const total = localIndicators.length;
    const statuses = statusBuckets.map((bucket) => ({
      ...bucket,
      count: localIndicators.filter((item) => getStatusBucket(item.status) === bucket.key).length,
    }));
    return { total, statuses };
  }, [localIndicators]);

  const filteredIndicators = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    const selectedStatusKey = statusBuckets.find((bucket) => bucket.label === statusFilter)?.key;
    return localIndicators.filter((item) => {
      const matchesArea = areaFilter === "Todos" || item.area === areaFilter;
      const matchesProcess = processFilter === "Todos" || item.process === processFilter;
      const matchesStatus = statusFilter === "Todos" || getStatusBucket(item.status) === selectedStatusKey;
      const searchable = normalizeSystemName([
        item.id,
        item.area,
        item.process,
        item.name,
        item.formula,
        item.description,
        item.unit,
        item.frequency,
        item.goal,
        item.baseline,
        item.month1,
        item.month2,
        item.month3,
        item.trend,
        item.actionPlan,
        item.responsible,
        item.endDate,
        item.status,
      ].join(" "));
      return matchesArea && matchesProcess && matchesStatus && (!query || searchable.includes(query));
    });
  }, [localIndicators, searchTerm, areaFilter, processFilter, statusFilter]);

  const updateLocalIndicator = (indicatorId, field, value) => {
    setLocalIndicators((current) => current.map((item) => (
      item.id === indicatorId ? { ...item, [field]: value } : item
    )));
  };

  const saveIndicatorValue = async (item, field, value) => {
    if (!editableFields.includes(field) || !indicatorsWebhookUrl) return;
    const key = `${item.id}-${field}`;
    setSavingCells((current) => ({ ...current, [key]: true }));

    try {
      const response = await fetch(indicatorsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateIndicatorValue",
          spreadsheetId,
          sheetName: "Indicadores",
          id: item.id,
          indicatorName: item.name,
          process: item.process,
          field,
          value,
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
        throw new Error(result.message || "No se pudo guardar el indicador.");
      }
    } catch (error) {
      console.error(error);
      window.alert(error.message || "No se pudo guardar el indicador.");
    } finally {
      setSavingCells((current) => ({ ...current, [key]: false }));
    }
  };

  const renderEditableInput = (item, field) => {
    const key = `${item.id}-${field}`;
    return (
      <input
        className={`indicatorValueInput ${savingCells[key] ? "saving" : ""}`}
        value={item[field] || ""}
        onChange={(event) => updateLocalIndicator(item.id, field, event.target.value)}
        onBlur={(event) => saveIndicatorValue(item, field, event.target.value)}
        placeholder="0"
      />
    );
  };

  return (
    <section className="card premiumSectionCard indicatorsSection">
      <div className="sectionHeader indicatorsHeader">
        <div>
          <h2>Indicadores</h2>
          <p>Registra línea base y avances mensuales para visualizar la evolución de los indicadores del proyecto.</p>
        </div>
      </div>

      <div className="processSummaryGrid processDashboardSummaryGrid indicatorsSummaryGrid">
        <article className="processSummaryCard processDashboardTotalCard indicatorsTotalCleanCard">
          <div>
            <span>Total de indicadores</span>
            <strong>{summary.total}</strong>
          </div>
        </article>
        <article className="processSummaryCard processDashboardStatusCard">
          <span>Estado de indicadores</span>
          <div className="processDashboardBarRows">
            {summary.statuses.map((bucket) => (
              <div key={`indicator-status-${bucket.key}`}>
                <em>{bucket.label}</em>
                <span><i style={{ width: `${summary.total ? (bucket.count / summary.total) * 100 : 0}%` }} /></span>
                <b>{bucket.count}</b>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="premiumFilters processFilters indicatorsFilters">
        <label className="searchFilter processSearchFilter">
          <span>Buscar indicador</span>
          <div className="searchInputWrap">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por proceso, indicador, fórmula o responsable"
            />
          </div>
        </label>
        <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areaOptions} />
        <FilterSelect label="Proceso" value={processFilter} onChange={setProcessFilter} options={processOptions} />
        <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>

      <div className="indicatorsWorkGrid">
        {filteredIndicators.map((item, index) => {
          const chart = getChartBars(item);
          return (
            <article className="indicatorWorkCard" key={`indicator-card-${item.id}-${index}`}>
              <div className="indicatorWorkMain">
                <div className="indicatorTrendTop">
                  <h3>{item.name || "Indicador sin nombre"}</h3>
                  <Badge status={item.status || getStatusLabel(item.status)}>{item.status || getStatusLabel(item.status)}</Badge>
                </div>
                <div className="indicatorWorkChart">
                  {chart.isPercentage ? (
                    <div className="indicatorPieChart">
                      <svg className="indicatorPieVisual" viewBox="0 0 100 100" role="img" aria-label="Distribución mensual del indicador">
                        <circle cx="50" cy="50" r="42" className="indicatorPieEmpty" />
                        {chart.pieSegments.map((segment) => segment.path ? (
                          <path key={`${item.id}-${segment.label}`} d={segment.path} fill={segment.color} />
                        ) : null)}
                      </svg>
                      <div className="indicatorPieLegend">
                        {chart.pieSegments.map((segment) => (
                          <span key={`${item.id}-${segment.label}`}>
                            <i style={{ background: segment.color }} />
                            <b>{segment.label}</b>
                            <em>{segment.displayValue}</em>
                          </span>
                        ))}
                      </div>
                      <div className="indicatorPieTargets">
                        <span>Meta: <b>{chart.goalLabel}</b></span>
                        <span>Línea base: <b>{chart.baselineLabel}</b></span>
                      </div>
                    </div>
                  ) : (
                    <div className="indicatorBarChart">
                      <span className="indicatorChartUnit">{chart.unitLabel}</span>
                      <div className="indicatorBarGrid" aria-hidden="true">
                        {chart.ticks.map((tick) => <span key={`${item.id}-tick-${tick.label}`} style={{ "--tick-height": `${tick.height}px` }} />)}
                      </div>
                      <div className="indicatorBarTicks" aria-hidden="true">
                        {chart.ticks.map((tick) => <span key={`${item.id}-tick-label-${tick.label}`} style={{ "--tick-height": `${tick.height}px` }}>{tick.label}</span>)}
                      </div>
                      <span className="indicatorBarAxis indicatorBarAxisY" />
                      <span className="indicatorBarAxis indicatorBarAxisX"><em>tiempo</em></span>
                      <span className="indicatorReferenceLine indicatorReferenceGoal" style={{ "--ref-height": `${chart.goalHeight}px` }}><em>{chart.goalLabel}</em></span>
                      <span className="indicatorReferenceLine indicatorReferenceBase" style={{ "--ref-height": `${chart.baselineHeight}px` }}><em>{chart.baselineLabel}</em></span>
                      <div className="indicatorBars">
                        {chart.months.map((month, monthIndex) => (
                          <div className={`indicatorBarSlot indicatorBarSlot${monthIndex + 1}`} key={`${item.id}-${month.label}`}>
                            <i style={{ "--bar-height": `${month.height}px` }}><strong>{month.displayValue}</strong></i>
                            <span>{month.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="indicatorBarLegend">
                        <span><i className="indicatorLegendGoal" /> Meta</span>
                        <span><i className="indicatorLegendBase" /> Línea Base</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="indicatorDataPrompt">Escribe los datos aquí:</p>
                <div className="indicatorClientFields">
                  <label><span>Línea base</span>{renderEditableInput(item, "baseline")}</label>
                  <label><span>Meta</span>{renderEditableInput(item, "goal")}</label>
                  <label><span>Mes 1</span>{renderEditableInput(item, "month1")}</label>
                  <label><span>Mes 2</span>{renderEditableInput(item, "month2")}</label>
                  <label><span>Mes 3</span>{renderEditableInput(item, "month3")}</label>
                </div>
                <details className="indicatorMoreDetails">
                  <summary>Ver más</summary>
                  <dl className="indicatorInfoGrid">
                    <div>
                      <dt>Fórmula</dt>
                      <dd>{item.formula || "Por definir"}</dd>
                    </div>
                    <div>
                      <dt>Descripción</dt>
                      <dd>{item.description || item.actionPlan || "Por definir"}</dd>
                    </div>
                    <div>
                      <dt>Proceso</dt>
                      <dd>{item.process || "Proceso sin definir"}</dd>
                    </div>
                  </dl>
                  <div className="indicatorMoreMeta">
                    <span><b>Área:</b> {item.area || "Por definir"}</span>
                    <span><b>UMD:</b> {item.unit || "Por definir"}</span>
                    <span><b>Frecuencia:</b> {item.frequency || "Por definir"}</span>
                    <span><b>Tendencia:</b> {item.trend || "Sin información"}</span>
                    <span><b>Responsable:</b> {item.responsible || "Por definir"}</span>
                    <span><b>Fecha termin.:</b> {item.endDate || "Por definir"}</span>
                    <span><b>Plan de acción:</b> {item.actionPlan || "Por definir"}</span>
                  </div>
                </details>
              </div>
            </article>
          );
        })}
      </div>

      {filteredIndicators.length === 0 && <div className="emptyState">No hay indicadores que coincidan con los filtros seleccionados.</div>}
    </section>
  );
}

function StructureView({ project = {}, architectureRoles = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gerenciaFilter, setGerenciaFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [localValidation, setLocalValidation] = useState({});
  const [savingValidation, setSavingValidation] = useState({});

  const validationWebhookUrl = safeUrl(import.meta.env.VITE_STRUCTURE_VALIDATION_WEBHOOK_URL || import.meta.env.VITE_ARCHITECTURE_VALIDATION_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();
  const structureImage = getDrivePreviewUrl(project.structureImage || project.imagenEstructura || "");

  const getValidationKey = (item) => [item.id || "sin-id", item.gerencia || "sin-gerencia", item.area || "sin-area", item.cargo || "sin-cargo"].join("|");
  const getValidated = (item) => {
    const key = getValidationKey(item);
    if (Object.prototype.hasOwnProperty.call(localValidation, key)) return localValidation[key];
    return isCheckedSheetValue(item.validated);
  };

  const gerenciaOptions = useMemo(() => architectureRoles.map((item) => item.gerencia).filter(Boolean), [architectureRoles]);
  const areaOptions = useMemo(() => architectureRoles.map((item) => item.area).filter(Boolean), [architectureRoles]);
  const statusOptions = useMemo(() => architectureRoles.map((item) => item.status).filter(Boolean), [architectureRoles]);

  const filteredRows = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    return architectureRoles.filter((item) => {
      const matchesGerencia = gerenciaFilter === "Todos" || item.gerencia === gerenciaFilter;
      const matchesArea = areaFilter === "Todos" || item.area === areaFilter;
      const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
      const searchable = normalizeSystemName([
        item.id,
        item.gerencia,
        item.area,
        item.cargo,
        item.profileUrl,
        item.occupationalGroup,
        item.abbreviation,
        item.status,
      ].join(" "));
      return matchesGerencia && matchesArea && matchesStatus && (!query || searchable.includes(query));
    });
  }, [architectureRoles, searchTerm, gerenciaFilter, areaFilter, statusFilter]);

  const validationStats = useMemo(() => {
    const yes = architectureRoles.filter(getValidated).length;
    return { yes, no: Math.max(0, architectureRoles.length - yes), total: architectureRoles.length };
  }, [architectureRoles, localValidation]);

  const distinctGerencias = useMemo(() => new Set(architectureRoles.map((item) => String(item.gerencia || "").trim()).filter(Boolean)).size, [architectureRoles]);
  const distinctAreas = useMemo(() => new Set(architectureRoles.map((item) => String(item.area || "").trim()).filter(Boolean)).size, [architectureRoles]);

  const handleValidate = async (item, nextChecked) => {
    if (!nextChecked) return;
    const label = item.cargo || item.area || item.gerencia || "este cargo";
    if (!window.confirm(`¿Confirmas que validas ${label}?`)) return;

    const key = getValidationKey(item);
    const previous = getValidated(item);
    setLocalValidation((current) => ({ ...current, [key]: true }));
    setSavingValidation((current) => ({ ...current, [key]: true }));

    if (!validationWebhookUrl) {
      setLocalValidation((current) => ({ ...current, [key]: previous }));
      setSavingValidation((current) => ({ ...current, [key]: false }));
      window.alert("Falta configurar VITE_STRUCTURE_VALIDATION_WEBHOOK_URL para guardar esta validación.");
      return;
    }

    try {
      const session = getClientSession();
      const response = await fetch(validationWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateArchitectureValidation",
          spreadsheetId,
          sheetName: "ArquitecturaCargos",
          field: "Validado",
          value: "SI",
          id: item.id,
          gerencia: item.gerencia,
          area: item.area,
          cargo: item.cargo,
          validatedAt: new Date().toISOString(),
          validatedBy: session.nombre || session.usuario || session.cliente || "Cliente",
          user: session.usuario || "",
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
        throw new Error(result.message || "No se pudo guardar la validación.");
      }
    } catch (error) {
      console.error(error);
      setLocalValidation((current) => ({ ...current, [key]: previous }));
      window.alert(error.message || "No se pudo guardar la validación.");
    } finally {
      setSavingValidation((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <section className="processMasterSection structureSection">
      <div className="sectionHeader">
        <div>
          <h2>Estructura y perfil</h2>
          <p>Arquitectura de cargos, perfiles, grupos ocupacionales sugeridos y validación del cliente.</p>
        </div>
      </div>

      <div className="processSummaryGrid processDashboardSummaryGrid structureDashboardGrid">
        <article className="processSummaryCard processDashboardTotalCard">
          <div>
            <span>Total cargos</span>
            <strong>{architectureRoles.length}</strong>
          </div>
          <i aria-hidden="true"><Users size={58} strokeWidth={1.5} /></i>
        </article>
        <article className="processSummaryCard processDashboardStatusCard">
          <span>Validación</span>
          <div className="processDashboardBarRows">
            <div>
              <em>Sí</em>
              <span><i style={{ width: `${validationStats.total ? (validationStats.yes / validationStats.total) * 100 : 0}%` }} /></span>
              <b>{validationStats.yes}</b>
            </div>
            <div>
              <em>No</em>
              <span><i style={{ width: `${validationStats.total ? (validationStats.no / validationStats.total) * 100 : 0}%` }} /></span>
              <b>{validationStats.no}</b>
            </div>
          </div>
        </article>
        <article className="processSummaryCard processDashboardStatusCard structureOrgStatusCard">
          <span>Estructura</span>
          <div className="processDashboardBarRows">
            <div>
              <em>Gerencias</em>
              <span><i style={{ width: `${Math.max(distinctGerencias, distinctAreas) ? (distinctGerencias / Math.max(distinctGerencias, distinctAreas)) * 100 : 0}%` }} /></span>
              <b>{distinctGerencias}</b>
            </div>
            <div>
              <em>Áreas</em>
              <span><i style={{ width: `${Math.max(distinctGerencias, distinctAreas) ? (distinctAreas / Math.max(distinctGerencias, distinctAreas)) * 100 : 0}%` }} /></span>
              <b>{distinctAreas}</b>
            </div>
          </div>
        </article>
      </div>

      <div className="structureHeroImageCard">
        {structureImage ? (
          <img src={structureImage} alt="Estructura organizacional" />
        ) : (
          <div className="structureEmptyImage">
            <Building2 size={42} />
            <span>Agrega ImagenEstructura en la pestaña Proyecto para mostrar la estructura.</span>
          </div>
        )}
      </div>

      <div className="premiumFilters processFilters structureFilters">
        <label className="searchFilter processSearchFilter">
          <span>Buscar</span>
          <div className="searchInputWrap">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por gerencia, área, cargo o grupo"
            />
          </div>
        </label>
        <FilterSelect label="Gerencia" value={gerenciaFilter} onChange={setGerenciaFilter} options={gerenciaOptions} />
        <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areaOptions} />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>

      <div className="processTableCard structureTableCard">
        <div className="processTableHeader">
          <div>
            <h3>Arquitectura de cargos y perfiles</h3>
            <p>Matriz cargada desde la pestaña ArquitecturaCargos.</p>
          </div>
          <Badge status="En validación">{filteredRows.length} visibles</Badge>
        </div>
        <div className="processTableWrap structureTableWrap">
          <table className="processTable fixedMatrixTable structureTable">
            <thead>
              <tr>
                <th>N°</th>
                <th>Gerencia</th>
                <th>Área</th>
                <th>Cargo</th>
                <th>Grupo ocupacional sugerido</th>
                <th>Abreviación</th>
                <th>Status</th>
                <th>Ver perfil</th>
                <th>Validado</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item, index) => {
                const key = getValidationKey(item);
                const checked = getValidated(item);
                const saving = Boolean(savingValidation[key]);
                return (
                  <tr key={`${item.id}-${item.cargo}-${index}`}>
                    <td>{item.id}</td>
                    <td>{item.gerencia}</td>
                    <td>{item.area}</td>
                    <td><strong>{item.cargo}</strong></td>
                    <td>{item.occupationalGroup}</td>
                    <td>{item.abbreviation}</td>
                    <td><Badge status={item.status}>{item.status || "Sin status"}</Badge></td>
                    <td>
                      {item.profileUrl ? (
                        <a className="structureProfileLink" href={safeUrl(item.profileUrl)} target="_blank" rel="noreferrer">Ver</a>
                      ) : (
                        <span className="structureProfileEmpty">Sin enlace</span>
                      )}
                    </td>
                    <td>
                      <label className={`processValidationCheck ${checked ? "validated" : ""} ${saving ? "saving" : ""}`} title="Validar cargo">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={saving}
                          onChange={(event) => handleValidate(item, event.target.checked)}
                        />
                        <span>{checked ? "Validado" : "Validar"}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && <div className="emptyState">No hay cargos que coincidan con los filtros seleccionados.</div>}
      </div>
    </section>
  );
}

function ProcessesMasterList({ project = {}, processesAsIs = [], processesToBe = [], pending = [], setView, previousView = "portal" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [macroFilter, setMacroFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [responsibleFilter, setResponsibleFilter] = useState("Todos");

  const allProcesses = [...processesAsIs, ...processesToBe];
  const typeOptions = useMemo(() => allProcesses.map((item) => item.type).filter(Boolean), [allProcesses]);
  const macroOptions = useMemo(() => allProcesses.map((item) => item.macroName).filter(Boolean), [allProcesses]);
  const areaOptions = useMemo(() => processesToBe.map((item) => item.area).filter(Boolean), [processesToBe]);
  const responsibleOptions = useMemo(() => allProcesses.map((item) => item.responsible).filter(Boolean), [allProcesses]);

  const filterProcess = (item, source) => {
    const query = normalizeSystemName(searchTerm);
    const matchesType = typeFilter === "Todos" || item.type === typeFilter;
    const matchesMacro = macroFilter === "Todos" || item.macroName === macroFilter;
    const matchesArea = source === "ASIS" || areaFilter === "Todos" || item.area === areaFilter;
    const matchesResponsible = responsibleFilter === "Todos" || item.responsible === responsibleFilter;
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
      item.area,
      item.responsible,
      item.link,
      item.technicalSheet,
    ].join(" "));
    return matchesType && matchesMacro && matchesArea && matchesResponsible && (!query || searchable.includes(query));
  };

  const filteredAsIs = useMemo(
    () => processesAsIs.filter((item) => filterProcess(item, "ASIS")),
    [processesAsIs, searchTerm, typeFilter, macroFilter, areaFilter, responsibleFilter]
  );

  const filteredToBe = useMemo(
    () => processesToBe.filter((item) => filterProcess(item, "TOBE")),
    [processesToBe, searchTerm, typeFilter, macroFilter, areaFilter, responsibleFilter]
  );
  const processBackView = previousView === "pendientes" ? "pendientes" : "portal";
  const activePending = pending.filter(isPendingActive).length;
  const getProcessValidationStats = (rows = []) => {
    const yes = rows.filter((item) => isCheckedSheetValue(item.imageValidated) || isCheckedSheetValue(item.technicalSheetValidated || item.fichaValidated)).length;
    return { yes, no: Math.max(0, rows.length - yes), total: rows.length };
  };
  const asIsValidationStats = getProcessValidationStats(processesAsIs);
  const toBeValidationStats = getProcessValidationStats(processesToBe);
  const validationAsIsWebhookUrl = safeUrl(import.meta.env.VITE_PROCESS_ASIS_WEBHOOK_URL || "");
  const validationToBeWebhookUrl = safeUrl(import.meta.env.VITE_PROCESS_TOBE_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();
  const processMapToBeImage = getDrivePreviewUrl(project.processMapToBeImage || project.imagenMapadeprocesos || project.imagenMapaProcesos || "");
  const [processValidation, setProcessValidation] = useState({});
  const [savingProcessValidation, setSavingProcessValidation] = useState({});

  const getProcessValidationKey = (item, variant, field) => [
    variant,
    field,
    item.processId || item.processCode || item.id || "sin-identificador",
    item.processName || "sin-proceso",
  ].join("|");

  const getProcessValidationValue = (item, variant, field) => {
    const key = getProcessValidationKey(item, variant, field);
    if (Object.prototype.hasOwnProperty.call(processValidation, key)) return processValidation[key];
    return field === "image"
      ? isCheckedSheetValue(item.imageValidated)
      : isCheckedSheetValue(item.technicalSheetValidated || item.fichaValidated);
  };

  const handleValidateProcessAsset = async (item, variant, field, nextChecked) => {
    if (!nextChecked) return;

    const validationWebhookUrl =
      variant === "asis" ? validationAsIsWebhookUrl : validationToBeWebhookUrl;
    const fieldName = field === "image" ? "imagen" : "ficha";
    const confirmMessage = `¿Confirmas que validas esta ${fieldName} del proceso ${item.processName || item.processCode || "seleccionado"}?`;
    if (!window.confirm(confirmMessage)) return;

    const key = getProcessValidationKey(item, variant, field);
    const previous = getProcessValidationValue(item, variant, field);
    setProcessValidation((current) => ({ ...current, [key]: true }));
    setSavingProcessValidation((current) => ({ ...current, [key]: true }));

    if (!validationWebhookUrl) {
      setProcessValidation((current) => ({ ...current, [key]: previous }));
      setSavingProcessValidation((current) => ({ ...current, [key]: false }));
      window.alert(
        variant === "asis"
          ? "Falta configurar VITE_PROCESS_ASIS_WEBHOOK_URL."
          : "Falta configurar VITE_PROCESS_TOBE_WEBHOOK_URL."
      );
      return;
    }

    try {
      const session = getClientSession();
      const response = await fetch(validationWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: variant === "asis"
            ? "updateProcessValidationASIS"
            : "updateProcessValidationTOBE",
          spreadsheetId,
          variant,
          sheetName: variant === "asis" ? "ProcesosASIS" : "ProcesosTOBE",
          field: field === "image" ? "ImagenValidada" : "FichaValidada",
          value: "SI",
          id: item.id,
          idProceso: item.processId,
          codigoProceso: item.processCode,
          proceso: item.processName,
          descripcion: variant === "asis" ? item.description : item.changes,
          validatedAt: new Date().toISOString(),
          validatedBy: session.nombre || session.usuario || session.cliente || "Cliente",
          user: session.usuario || "",
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
        throw new Error(result.message || "No se pudo guardar la validación.");
      }
    } catch (error) {
      console.error(error);
      setProcessValidation((current) => ({ ...current, [key]: previous }));
      window.alert(error.message || "No se pudo guardar la validación.");
    } finally {
      setSavingProcessValidation((current) => ({ ...current, [key]: false }));
    }
  };

  const ProcessAssetCell = ({ item, variant, field, url }) => {
    const key = getProcessValidationKey(item, variant, field);
    const checked = getProcessValidationValue(item, variant, field);
    const saving = Boolean(savingProcessValidation[key]);
    const label = field === "image" ? "Validar imagen" : "Validar ficha";

    return (
      <div className="processAssetActions">
        {url ? (
          <a className="processPreviewLink" href={url} target="_blank" rel="noreferrer">Ver</a>
        ) : (
          <span className="processNoPreview">Sin enlace</span>
        )}
        <label className={`processValidationCheck ${checked ? "validated" : ""} ${saving ? "saving" : ""}`} title={label}>
          <input
            type="checkbox"
            checked={checked}
            disabled={saving}
            onChange={(event) => handleValidateProcessAsset(item, variant, field, event.target.checked)}
          />
          <span>{checked ? "Validado" : "Validar"}</span>
        </label>
      </div>
    );
  };

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
              <th>Responsable</th>
              {variant === "asis" ? <th>Descripción</th> : <th>Cambios / Observaciones</th>}
              {variant === "tobe" && <th>Status</th>}
              <th>Imagen</th>
              <th>Ficha</th>
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
                <td>{item.responsible || "Por definir"}</td>
                <td>{variant === "asis" ? item.description : item.changes}</td>
                {variant === "tobe" && <td><Badge status={item.status}>{item.status || "Sin status"}</Badge></td>}
                <td className="imageProcessCell">
                  <ProcessAssetCell item={item} variant={variant} field="image" url={safeUrl(item.imageProcess || item.link)} />
                </td>
                <td className="techSheetCell">
                  <ProcessAssetCell item={item} variant={variant} field="sheet" url={safeUrl(item.technicalSheet || item.ficha || item.fichaTecnica || item.linkFicha)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <div className="emptyState">No hay procesos que coincidan con los filtros seleccionados.</div>}
    </div>
  );

  const MobileProcessTable = ({ title, subtitle, rows, variant }) => (
    <article className="mobileProcessMatrixCard">
      <div className="mobileProcessMatrixHead">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <b>{rows.length} visibles</b>
      </div>

      <div className="mobileProcessMatrixWrap">
        <table>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>Proceso</th>
              <th>Responsable</th>
              <th>{variant === "asis" ? "Descripción" : "Cambios"}</th>
              <th>Imagen</th>
              <th>Ficha</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((item, index) => {
              const imageUrl = safeUrl(item.imageProcess || item.link);
              const sheetUrl = safeUrl(item.technicalSheet || item.ficha || item.fichaTecnica || item.linkFicha);
              return (
                <tr key={`mobile-${variant}-${item.id}-${item.processCode}-${index}`}>
                  <td>{item.processCode || item.id}</td>
                  <td>{item.processName || "Por definir"}</td>
                  <td>{item.responsible || "Por definir"}</td>
                  <td>{variant === "asis" ? item.description : item.changes}</td>
                  <td><ProcessAssetCell item={item} variant={variant} field="image" url={imageUrl} /></td>
                  <td><ProcessAssetCell item={item} variant={variant} field="sheet" url={sheetUrl} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );

  return (
    <>
    <section className="mobileProcessMasterView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView?.(processBackView)}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView?.("entregables")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileProcessHero">
        <h1>Lista Maestra de Procesos</h1>
        <label>
          <Search size={17} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar"
          />
        </label>
      </header>

      <div className="mobileProcessBody">
        <div className="mobileProcessSummaryCards">
          <article>
            <i />
            <span>Total procesos AS IS</span>
            <strong><ChevronRight size={18} />{processesAsIs.length}</strong>
          </article>
          <article>
            <i />
            <span>Total procesos TO BE</span>
            <strong><ChevronRight size={18} />{processesToBe.length}</strong>
          </article>
        </div>

        <div className="mobileProcessFilters">
          <FilterSelect label="Tipo de proceso" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
          <FilterSelect label="Macroproceso" value={macroFilter} onChange={setMacroFilter} options={macroOptions} />
          <FilterSelect label="Responsable" value={responsibleFilter} onChange={setResponsibleFilter} options={responsibleOptions} />
        </div>

        <MobileProcessTable
          title="Procesos AS IS"
          subtitle="Actividades propuestas para la operación objetivo"
          rows={filteredAsIs}
          variant="asis"
        />

        <MobileProcessTable
          title="Procesos TO BE"
          subtitle="Actividades levantadas en la situación actual."
          rows={filteredToBe}
          variant="tobe"
        />
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>

    <section className="card premiumSectionCard processMasterSection">
      <div className="processMapToBeSection">
        <div className="processTableHeader">
          <div>
            <h3>Mapa de procesos TO BE</h3>
            <p>Imagen cargada desde la columna ImagenMapadeprocesos en la pestaña Proyecto.</p>
          </div>
        </div>
        <div className="structureHeroImageCard processMapToBeImageCard">
          {processMapToBeImage ? (
            <img src={processMapToBeImage} alt="Mapa de procesos TO BE" />
          ) : (
            <div className="structureEmptyImage">
              <Layers3 size={42} />
              <span>Agrega ImagenMapadeprocesos en la pestaña Proyecto para mostrar el mapa.</span>
            </div>
          )}
        </div>
      </div>

      <div className="sectionHeader">
        <div>
          <h2>Lista Maestra de Procesos</h2>
          <p>Consulta integrada de procesos AS IS y TO BE, con búsqueda y filtros por tipo, macroproceso y status.</p>
        </div>
      </div>

      <div className="processSummaryGrid processDashboardSummaryGrid">
        <article className="processSummaryCard processDashboardTotalCard">
          <div>
            <span>Total procesos AS IS</span>
            <strong>{processesAsIs.length}</strong>
          </div>
          <i aria-hidden="true"><ClipboardCheck size={58} strokeWidth={1.5} /></i>
        </article>
        <article className="processSummaryCard processDashboardStatusCard">
          <span>Validado AS IS</span>
          <div className="processDashboardBarRows">
            <div>
              <em>Sí</em>
              <span><i style={{ width: `${asIsValidationStats.total ? (asIsValidationStats.yes / asIsValidationStats.total) * 100 : 0}%` }} /></span>
              <b>{asIsValidationStats.yes}</b>
            </div>
            <div>
              <em>No</em>
              <span><i style={{ width: `${asIsValidationStats.total ? (asIsValidationStats.no / asIsValidationStats.total) * 100 : 0}%` }} /></span>
              <b>{asIsValidationStats.no}</b>
            </div>
          </div>
        </article>
        <article className="processSummaryCard processDashboardTotalCard">
          <div>
            <span>Total procesos TO BE</span>
            <strong>{processesToBe.length}</strong>
          </div>
          <i aria-hidden="true"><ClipboardCheck size={58} strokeWidth={1.5} /></i>
        </article>
        <article className="processSummaryCard processDashboardStatusCard">
          <span>Validado TO BE</span>
          <div className="processDashboardBarRows">
            <div>
              <em>Sí</em>
              <span><i style={{ width: `${toBeValidationStats.total ? (toBeValidationStats.yes / toBeValidationStats.total) * 100 : 0}%` }} /></span>
              <b>{toBeValidationStats.yes}</b>
            </div>
            <div>
              <em>No</em>
              <span><i style={{ width: `${toBeValidationStats.total ? (toBeValidationStats.no / toBeValidationStats.total) * 100 : 0}%` }} /></span>
              <b>{toBeValidationStats.no}</b>
            </div>
          </div>
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
              placeholder="Buscar por código, proceso, macroproceso, responsable, descripción o cambios"
            />
          </div>
        </label>
        <FilterSelect label="Tipo de proceso" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label="Macroproceso" value={macroFilter} onChange={setMacroFilter} options={macroOptions} />
        <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areaOptions} />
        <FilterSelect label="Responsable" value={responsibleFilter} onChange={setResponsibleFilter} options={responsibleOptions} />
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
    </>
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

function COEDashboard({ coeAsIs = [], coeToBe = [], pending = [], setView, previousView = "portal" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [processFilter, setProcessFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [navFilter, setNavFilter] = useState("Todos");
  const [mobileActivitySide, setMobileActivitySide] = useState("asis");
  const [mobileNavSide, setMobileNavSide] = useState("asis");
  const [mobileProcessSide, setMobileProcessSide] = useState("asis");
  const [mobileBottomNavVisible, setMobileBottomNavVisible] = useState(false);
  const [mobileCoeTouchStart, setMobileCoeTouchStart] = useState(null);

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

  useEffect(() => {
    const onScroll = () => setMobileBottomNavVisible(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSide = (current, setter) => setter(current === "asis" ? "tobe" : "asis");
  const activePending = pending.filter(isPendingActive).length;
const coeBackView = previousView === "ruta" ? "ruta" : "portal";
  const finishCoeSwipe = (touch, onPrev, onNext) => {
    if (mobileCoeTouchStart === null) return;
    const diffX = mobileCoeTouchStart.x - touch.clientX;
    const diffY = mobileCoeTouchStart.y - touch.clientY;
    if (Math.abs(diffX) > 22 && Math.abs(diffX) > Math.abs(diffY) * 1.05) {
      diffX > 0 ? onNext() : onPrev();
    }
    setMobileCoeTouchStart(null);
  };

  const MobileBarMetric = ({ label, value, max }) => (
    <div className="mobileCoeBarMetric">
      <span>{label}</span>
      <div><i style={{ width: `${Math.max(value > 0 ? 4 : 0, (value / Math.max(1, max)) * 100)}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );

  const MobileInsightCard = ({ title, badge, sideLabel, children, onPrev, onNext, nextLabel }) => (
    <article
      className="mobileCoeInsightCard"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        setMobileCoeTouchStart(touch ? { x: touch.clientX, y: touch.clientY } : null);
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        if (touch) finishCoeSwipe(touch, onPrev, onNext);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        setMobileCoeTouchStart({ x: event.clientX, y: event.clientY });
      }}
      onPointerUp={(event) => finishCoeSwipe(event, onPrev, onNext)}
    >
      <i className="mobileCoeAccent" />
      <div className="mobileCoeInsightHead">
        <span>{title}</span>
        <b>{badge}</b>
      </div>
      <div className="mobileCoeSideLabel">{sideLabel}</div>
      <button className="mobileCoeSlideArrow left" type="button" onClick={onPrev} aria-label="Anterior"><ChevronLeft size={27} /></button>
      <div className="mobileCoeInsightBody">{children}</div>
      <button className="mobileCoeSlideArrow right" type="button" onClick={onNext} aria-label="Siguiente"><ChevronRight size={27} /></button>
      <button className="mobileCoeNextLabel" type="button" onClick={onNext}>{nextLabel} <ChevronRight size={15} /></button>
    </article>
  );

  const MobileProcessRows = ({ rows }) => {
    return (
      <div className="mobileCoeProcessRows">
        {rows.map((item, index) => (
          <div
            className="mobileCoeProcessRow"
            key={`${item.process}-${index}`}
            onTouchStart={(event) => event.stopPropagation()}
            onTouchEnd={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <span>{index + 1}. {item.process}</span>
            <div><i style={{ width: `${Math.max(4, (item.total / maxProcessCost) * 100)}%` }} /></div>
            <strong>${formatCurrency(item.total)}</strong>
          </div>
        ))}
        {!rows.length && <p>No hay datos para mostrar.</p>}
      </div>
    );
  };

  const MobileMatrix = ({ title, subtitle, rows }) => (
    <article className="mobileCoeMatrixCard">
      <div className="mobileCoeMatrixHead">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <Badge status="En validación">{rows.length} visibles</Badge>
      </div>
      <div className="mobileCoeMatrixWrap">
        <table>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>Proceso</th>
              <th>Tipo</th>
              <th>Actividad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map((item, index) => (
              <tr key={`${title}-${item.code}-${index}`}>
                <td>{item.code}</td>
                <td>{item.process}</td>
                <td>{item.processType}</td>
                <td>{item.activity}</td>
                <td>${formatCurrency(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="mobileRouteEmpty">No hay actividades con esos filtros.</div>}
    </article>
  );

  return (
    <>
    <section className="mobileCoeView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView?.(coeBackView)}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView?.("hallazgos")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileCoeHero">
        <h1>COE</h1>
        <span>Costo Operativo Estructural</span>
        <label>
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar" />
        </label>
      </header>

      <div className="mobileCoeBody">
        <div className="mobileCoeKpis">
          <article><i /><span>Costo procesos AS IS</span><strong><ChevronRight size={16} />${formatCurrency(asIsTotal)}</strong></article>
          <article><i /><span>COE mensual</span><strong><ChevronRight size={16} />${formatCurrency(Math.abs(difference))}</strong></article>
          <article><i /><span>Costo procesos TO BE</span><strong><ChevronRight size={16} />${formatCurrency(toBeTotal)}</strong></article>
        </div>

        <article className="mobileCoeMainCard">
          <div><BarChart3 size={34} /></div>
          <span>COE</span>
          <strong>{Math.abs(reductionPercent).toFixed(0)}%</strong>
        </article>

        <h2 className="mobileCoeSectionTitle">Actividades</h2>
        <MobileInsightCard
          title={`Actividades ${mobileActivitySide === "asis" ? "AS IS" : "TO BE"}`}
          badge={`${mobileActivitySide === "asis" ? filteredAsIs.length : filteredToBe.length} actividades`}
          sideLabel={mobileActivitySide === "asis" ? "Actividades actuales" : "Actividades propuestas"}
          onPrev={() => toggleSide(mobileActivitySide, setMobileActivitySide)}
          onNext={() => toggleSide(mobileActivitySide, setMobileActivitySide)}
          nextLabel={`Actividades ${mobileActivitySide === "asis" ? "TO BE" : "AS IS"}`}
        >
          <MobileBarMetric label="Mantenidas" value={(mobileActivitySide === "asis" ? asIsActivityStatusSummary : toBeActivityStatusSummary).maintained} max={maxActivityCount} />
          <MobileBarMetric label="Eliminadas" value={(mobileActivitySide === "asis" ? asIsActivityStatusSummary : toBeActivityStatusSummary).deleted} max={maxActivityCount} />
          <MobileBarMetric label="Agregadas" value={(mobileActivitySide === "asis" ? asIsActivityStatusSummary : toBeActivityStatusSummary).added} max={maxActivityCount} />
        </MobileInsightCard>

        <h2 className="mobileCoeSectionTitle">NAV</h2>
        <MobileInsightCard
          title={`NAV ${mobileNavSide === "asis" ? "AS IS" : "TO BE"}`}
          badge={`${mobileNavSide === "asis" ? filteredAsIs.length : filteredToBe.length} actividades`}
          sideLabel="Clasificación de actividades que generan o no generan valor"
          onPrev={() => toggleSide(mobileNavSide, setMobileNavSide)}
          onNext={() => toggleSide(mobileNavSide, setMobileNavSide)}
          nextLabel={`NAV ${mobileNavSide === "asis" ? "TO BE" : "AS IS"}`}
        >
          <MobileBarMetric label="Generan Valor" value={(mobileNavSide === "asis" ? asIsNavSummary : toBeNavSummary).value} max={maxNavCount} />
          <MobileBarMetric label="No Generan Valor" value={(mobileNavSide === "asis" ? asIsNavSummary : toBeNavSummary).noValue} max={maxNavCount} />
        </MobileInsightCard>

        <h2 className="mobileCoeSectionTitle">Procesos</h2>
        <MobileInsightCard
          title={`Procesos ${mobileProcessSide === "asis" ? "AS IS" : "TO BE"}`}
          badge={`${mobileProcessSide === "asis" ? asIsProcesses.length : toBeProcesses.length} procesos`}
          sideLabel={mobileProcessSide === "asis" ? "Costo total por proceso actual" : "Costo total por proceso propuesto"}
          onPrev={() => toggleSide(mobileProcessSide, setMobileProcessSide)}
          onNext={() => toggleSide(mobileProcessSide, setMobileProcessSide)}
          nextLabel={`Procesos ${mobileProcessSide === "asis" ? "TO BE" : "AS IS"}`}
        >
          <MobileProcessRows rows={mobileProcessSide === "asis" ? asIsProcesses : toBeProcesses} />
        </MobileInsightCard>

        <div className="mobileCoeFilters">
          <FilterSelect label="Proceso" value={processFilter} onChange={setProcessFilter} options={processOptions} />
          <FilterSelect label="Tipo" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          <FilterSelect label="NAV" value={navFilter} onChange={setNavFilter} options={navOptions} />
        </div>

        <MobileMatrix title="Matriz COE AS IS" subtitle="Actividades levantadas en la situación actual." rows={filteredAsIs} />
        <MobileMatrix title="Matriz COE TO BE" subtitle="Actividades propuestas para la operación objetivo." rows={filteredToBe} />
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>

    <section className="card premiumSectionCard coeSection desktopCoeView">
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
    </>
  );
}

function Findings({ findings = [], pending = [], setView, previousView = "portal" }) {
  const [open, setOpen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("Todos");
  const [deliverableTypeFilter, setDeliverableTypeFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todos");
  const [managementFilter, setManagementFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [mobileDeliverableSide, setMobileDeliverableSide] = useState("gse");
  const [mobileFindingsVisible, setMobileFindingsVisible] = useState(6);
  const [mobileFindingsTouchStart, setMobileFindingsTouchStart] = useState(null);
  const [findingUploadStatus, setFindingUploadStatus] = useState({});
  const [savingFindingUpload, setSavingFindingUpload] = useState({});
  const findingUploadWebhookUrl = safeUrl(import.meta.env.VITE_FINDING_UPLOAD_WEBHOOK_URL || import.meta.env.VITE_DOCUMENTS_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();

  const getFindingUploadKey = (item, field) => [field, item.id || "sin-id", item.finding || item.description || "sin-hallazgo"].join("|");

  const getFindingUploadValue = (item, field) => {
    const key = getFindingUploadKey(item, field);
    if (Object.prototype.hasOwnProperty.call(findingUploadStatus, key)) return findingUploadStatus[key];
    return isCheckedSheetValue(item.policyLoaded) || isCheckedSheetValue(item.procedureLoaded);
  };

  const handleFindingUploadChange = async (item, field, nextChecked) => {
    if (!nextChecked) return;
    const title = item.finding || item.id || "este hallazgo";
    if (!window.confirm(`¿Confirmas que ya fue cargado el entregable para ${title}?`)) return;

    const key = getFindingUploadKey(item, field);
    const previous = getFindingUploadValue(item, field);
    setFindingUploadStatus((current) => ({ ...current, [key]: true }));
    setSavingFindingUpload((current) => ({ ...current, [key]: true }));

    if (!findingUploadWebhookUrl) {
      setFindingUploadStatus((current) => ({ ...current, [key]: previous }));
      setSavingFindingUpload((current) => ({ ...current, [key]: false }));
      window.alert("Falta configurar VITE_DOCUMENTS_WEBHOOK_URL para guardar este cargado.");
      return;
    }

    try {
      const session = getClientSession();
      const response = await fetch(findingUploadWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateFindingUploadStatus",
          spreadsheetId,
          sheetName: "Hallazgos",
          field: "PoliticaCargada",
          value: "SI",
          id: item.id,
          hallazgo: item.finding,
          descripcion: item.description,
          updatedAt: new Date().toISOString(),
          updatedBy: session.nombre || session.usuario || session.cliente || "Cliente",
          user: session.usuario || "",
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
        throw new Error(result.message || "No se pudo guardar el cargado.");
      }
    } catch (error) {
      console.error(error);
      setFindingUploadStatus((current) => ({ ...current, [key]: previous }));
      window.alert(error.message || "No se pudo guardar el cargado.");
    } finally {
      setSavingFindingUpload((current) => ({ ...current, [key]: false }));
    }
  };

  const FindingUploadChecks = ({ item }) => {
    const controls = [
      { field: "loaded", label: "Cargada" },
    ];
    return (
      <div className="findingUploadChecks" onClick={(event) => event.stopPropagation()}>
        {controls.map((control) => {
          const key = getFindingUploadKey(item, control.field);
          const checked = getFindingUploadValue(item, control.field);
          const saving = Boolean(savingFindingUpload[key]);
          return (
            <label key={control.field} className={`findingUploadCheck ${checked ? "validated" : ""} ${saving ? "saving" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={saving}
                onChange={(event) => handleFindingUploadChange(item, control.field, event.target.checked)}
              />
              <span>{control.label}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const getFindingStatusGroup = (status = "") => {
    const value = normalizeSystemName(status);
    if (value.includes("completado") || value.includes("finalizado") || value.includes("terminado") || value.includes("solucionado")) return "Completado";
    if (value.includes("proceso") || value.includes("desarrollo") || value.includes("desarollo") || value.includes("revision")) return "En proceso";
    return "Pendiente";
  };

  const cleanOptionValue = (value = "") => {
    const text = String(value || "").trim();
    const normalized = normalizeSystemName(text);
    if (!text || text === "-" || text === "—") return "";
    if (["n/a", "na", "no aplica", "no disponible", "ninguno", "sin entregable", "0"].includes(normalized)) return "";
    return text;
  };

  const splitDeliverableTypes = (value = "") => {
    const text = cleanOptionValue(value);
    if (!text) return [];
    return text
      .split(/[,;|\n\r]+/)
      .map(cleanOptionValue)
      .filter(Boolean);
  };

  const uniqueDeliverableLabels = (labels = []) => {
    const map = new Map();
    labels.forEach((label) => {
      const clean = cleanOptionValue(label);
      if (!clean) return;
      const key = normalizeSystemName(clean);
      if (!map.has(key)) map.set(key, clean);
    });
    return [...map.values()];
  };

  const getFindingField = (item, field) => {
    if (field === "date") return item.deliveryDate || item.fechaMax || item.fechamax || "";
    if (field === "priority") return item.priority || "";
    if (field === "status") return item.status || "";
    if (field === "management") return item.management || item.gerencia || "";
    if (field === "area") return item.areaDetail || item.area || "";
    return "";
  };

  const getDeliverableTypeMatches = (item) => uniqueDeliverableLabels([
    ...splitDeliverableTypes(item.deliverableGSE || ""),
    ...splitDeliverableTypes(item.deliverableClient || ""),
  ]);

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

  const getFindingSearchText = (item) => {
    const area = getFindingField(item, "area");
    const management = getFindingField(item, "management");
    const deliveryDate = getFindingField(item, "date");
    const priority = getFindingField(item, "priority");
    const status = getFindingField(item, "status");
    const statusGroup = getFindingStatusGroup(status);
    return normalizeSystemName([
      item.id,
      management,
      area,
      deliveryDate,
      item.processArea,
      item.process,
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
  };

  const getFindingSearchScore = (item, query, queryWords) => {
    if (!query) return 0;
    const title = normalizeSystemName(item.finding || "");
    const id = normalizeSystemName(item.id || "");
    const description = normalizeSystemName(item.description || "");
    const recommendation = normalizeSystemName(item.recommendation || item.solution || "");
    const fullText = getFindingSearchText(item);
    let score = 0;

    if (title === query) score += 1200;
    if (title.startsWith(query)) score += 900;
    if (title.includes(query)) score += 700;
    if (id === query) score += 650;
    if (description.includes(query)) score += 520;
    if (recommendation.includes(query)) score += 360;
    if (fullText.includes(query)) score += 220;

    queryWords.forEach((word) => {
      if (!word) return;
      if (title.includes(word)) score += 45;
      if (description.includes(word)) score += 28;
      if (recommendation.includes(word)) score += 18;
      if (fullText.includes(word)) score += 8;
    });

    return score;
  };

  const filteredFindings = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    const queryWords = query.split(" ").filter(Boolean);
    const matchesQuery = (item) => {
      if (!query) return true;
      const searchText = getFindingSearchText(item);
      return searchText.includes(query) || queryWords.every((word) => searchText.includes(word));
    };

    return findings
      .map((item, index) => ({ item, index, score: getFindingSearchScore(item, query, queryWords) }))
      .filter(({ item }) => matchesCurrentFilters(item) && matchesQuery(item))
      .sort((a, b) => {
        if (query && b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [findings, searchTerm, dateFilter, deliverableTypeFilter, priorityFilter, managementFilter, areaFilter, statusFilter]);

  const getFindingUniqueKey = (item = {}, index = 0) => {
    const rawId = String(item.id || "").trim();
    const numericMatch = rawId.match(/(\d+)(?!.*\d)/);
    if (numericMatch) return `hallazgo-${Number(numericMatch[1])}`;
    const fallback = normalizeSystemName(item.finding || item.description || item.recommendation || rawId);
    return fallback || `hallazgo-fila-${index}`;
  };

  const uniqueFilteredFindings = useMemo(() => {
    const map = new Map();
    filteredFindings.forEach((item, index) => {
      const key = getFindingUniqueKey(item, index);
      if (!map.has(key)) map.set(key, item);
    });
    return [...map.values()];
  }, [filteredFindings]);

  const uniqueFindingsCount = uniqueFilteredFindings.length;

  const statusSummary = useMemo(() => {
    return uniqueFilteredFindings.reduce((acc, item) => {
      const group = getFindingStatusGroup(item.status);
      if (group === "Pendiente") acc.pending += 1;
      if (group === "En proceso") acc.inProcess += 1;
      if (group === "Completado") acc.completed += 1;
      return acc;
    }, { pending: 0, inProcess: 0, completed: 0 });
  }, [uniqueFilteredFindings]);

  const visibleDeliverableSummary = useMemo(() => {
    const addLabels = (acc, labels, side) => {
      uniqueDeliverableLabels(labels).forEach((label) => {
        const key = normalizeSystemName(label);
        if (!acc[key]) acc[key] = { label, gse: 0, client: 0 };
        acc[key][side] += 1;
      });
    };

    return filteredFindings.reduce((acc, item) => {
      addLabels(acc, splitDeliverableTypes(item.deliverableGSE || ""), "gse");
      addLabels(acc, splitDeliverableTypes(item.deliverableClient || ""), "client");
      return acc;
    }, {});
  }, [filteredFindings]);

  const visibleDeliverableTotals = useMemo(() => {
    return Object.values(visibleDeliverableSummary).reduce((acc, item) => {
      acc.gse += item.gse;
      acc.client += item.client;
      return acc;
    }, { gse: 0, client: 0 });
  }, [visibleDeliverableSummary]);

  const visibleDeliverableCategoryTotals = visibleDeliverableTotals;

  useEffect(() => {
    setMobileFindingsVisible(6);
  }, [searchTerm, dateFilter, deliverableTypeFilter, priorityFilter, managementFilter, areaFilter, statusFilter]);

  const activePending = pending.filter(isPendingActive).length;
  const findingsBackView = previousView === "coe" ? "coe" : "portal";
  const maxDeliverableCount = Math.max(
    1,
    ...Object.values(visibleDeliverableSummary).map((item) => Math.max(item.gse, item.client))
  );

  const finishFindingsSwipe = (touch) => {
    if (!mobileFindingsTouchStart) return;
    const diffX = mobileFindingsTouchStart.x - touch.clientX;
    const diffY = mobileFindingsTouchStart.y - touch.clientY;
    if (Math.abs(diffX) > 24 && Math.abs(diffX) > Math.abs(diffY) * 1.05) {
      setMobileDeliverableSide((current) => current === "gse" ? "client" : "gse");
    }
    setMobileFindingsTouchStart(null);
  };

  const mobileStatusRows = [
    { label: "Completado", value: statusSummary.completed },
    { label: "Pendiente", value: statusSummary.pending },
    { label: "En desarrollo", value: statusSummary.inProcess },
  ];

  const mobileDeliverableRows = Object.values(visibleDeliverableSummary)
    .map((item) => ({
      label: item.label,
      value: mobileDeliverableSide === "gse" ? item.gse : item.client,
    }))
    .filter((item) => item.value > 0);

  const MobileFindingCard = ({ item }) => {
    const process = item.processArea || item.process || item.area || "Proceso no definido";
    const link = safeUrl(item.link || item.image);
    const status = item.status || "Pendiente";
    const deliveryDate = getFindingField(item, "date");
    const recommendation = item.recommendation || item.solution;
    const key = `mobile-${item.id}-${item.finding || item.description}`;
    const isOpen = open === key;
    return (
      <article className={`mobileFindingCard ${isOpen ? "open" : ""}`}>
        <i />
        <button
          type="button"
          className="mobileFindingOpen"
          onClick={() => setOpen(isOpen ? "" : key)}
          aria-label={isOpen ? "Ocultar detalle" : "Ver detalle"}
        >
          <ChevronRight size={17} />
        </button>
        <span>ID {item.id}</span>
        <small>{process}</small>
        <h3>{item.finding || "Hallazgo sin título"}</h3>
        {deliveryDate && <p>Fecha de entrega: {deliveryDate}</p>}
        {link && (
          <a href={link} target="_blank" rel="noreferrer">
            Abrir evidencia o carpeta <ExternalLink size={11} />
          </a>
        )}
        <div className="mobileFindingBadges">
          {item.priority && <b className="priority">{item.priority}</b>}
          <b className={getFindingStatusGroup(status) === "Completado" ? "done" : ""}>{status}</b>
        </div>
        <FindingUploadChecks item={item} />
        {isOpen && (
          <div className="mobileFindingDetail">
            {item.description && (
              <div>
                <strong>Descripción</strong>
                <p>{item.description}</p>
              </div>
            )}
            {recommendation && (
              <div>
                <strong>Recomendación</strong>
                <p>{recommendation}</p>
              </div>
            )}
            {!item.description && !recommendation && (
              <p>No hay descripción o recomendación cargada.</p>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <>
    <section className="mobileFindingsView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView?.(findingsBackView)}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView?.("pendientes")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileFindingsHero">
        <h1>Hallazgos encontrados</h1>
        <label>
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar" />
        </label>
      </header>

      <div className="mobileFindingsBody">
        <div className="mobileFindingsStatusCards">
          {mobileStatusRows.map((item) => (
            <article key={item.label}>
              <i />
              <span>{item.label}</span>
              <strong><ChevronRight size={17} />{item.value}</strong>
            </article>
          ))}
        </div>

        <article className="mobileFindingsTotalCard">
          <div><Search size={34} /></div>
          <span>Total de<br />Hallazgos</span>
          <strong><ChevronRight size={26} />{filteredFindings.length}</strong>
        </article>

        <h2 className="mobileFindingsSectionTitle">Entregables</h2>
        <article
          className="mobileFindingsDeliverableCard"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            setMobileFindingsTouchStart(touch ? { x: touch.clientX, y: touch.clientY } : null);
          }}
          onTouchEnd={(event) => {
            const touch = event.changedTouches[0];
            if (touch) finishFindingsSwipe(touch);
          }}
          onPointerDown={(event) => setMobileFindingsTouchStart({ x: event.clientX, y: event.clientY })}
          onPointerUp={(event) => finishFindingsSwipe(event)}
        >
          <i />
          <div className="mobileFindingsDeliverableHead">
            <span>{mobileDeliverableSide === "gse" ? "GSE" : "Cliente"}</span>
            <b>{mobileDeliverableSide === "gse" ? visibleDeliverableTotals.gse : visibleDeliverableTotals.client} entregables</b>
          </div>
          <button className="mobileFindingsDeliverableArrow left" type="button" onClick={() => setMobileDeliverableSide(mobileDeliverableSide === "gse" ? "client" : "gse")}><ChevronLeft size={26} /></button>
          <div className="mobileFindingsDeliverableRows">
            {mobileDeliverableRows.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <div><em style={{ width: `${Math.max(item.value ? 4 : 0, (item.value / maxDeliverableCount) * 100)}%` }} /></div>
                <strong>{item.value}</strong>
              </div>
            ))}
            {!mobileDeliverableRows.length && <p className="mobileFindingsEmptyText">Sin entregables para los filtros activos.</p>}
          </div>
          <button className="mobileFindingsDeliverableArrow right" type="button" onClick={() => setMobileDeliverableSide(mobileDeliverableSide === "gse" ? "client" : "gse")}><ChevronRight size={26} /></button>
          <button className="mobileFindingsNextDeliverable" type="button" onClick={() => setMobileDeliverableSide(mobileDeliverableSide === "gse" ? "client" : "gse")}>
            Entregables {mobileDeliverableSide === "gse" ? "clientes" : "GSE"} <ChevronRight size={14} />
          </button>
        </article>

        <div className="mobileFindingsFilters">
          <FilterSelect label="Fecha de entrega" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
          <FilterSelect label="Tipo de entregable" value={deliverableTypeFilter} onChange={setDeliverableTypeFilter} options={deliverableTypes} />
          <FilterSelect label="Prioridad" value={priorityFilter} onChange={setPriorityFilter} options={priorities} />
          <FilterSelect label="Gerencia" value={managementFilter} onChange={setManagementFilter} options={managements} />
          <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areas} />
          <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statuses} />
        </div>

        <div className="mobileFindingsGrid">
          {filteredFindings.slice(0, mobileFindingsVisible).map((item) => (
            <MobileFindingCard key={`${item.id || "sin-id"}-${item.finding || item.description || item.recommendation || item.solution || "sin-titulo"}-${filteredFindings.indexOf(item)}`} item={item} />
          ))}
        </div>

        {mobileFindingsVisible < filteredFindings.length && (
          <button className="mobileFindingsLoadMore" type="button" onClick={() => setMobileFindingsVisible((current) => current + 6)}>
            Cargar más <ChevronRight size={24} />
          </button>
        )}

        {!filteredFindings.length && <div className="mobileRouteEmpty">No hay hallazgos con esos filtros.</div>}
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>

    <section className="card premiumSectionCard findingsPremiumSection">
      <div className="sectionHeader">
        <div>
          <h2>Hallazgos encontrados</h2>
          <p>Busca, filtra y revisa los hallazgos críticos de la matriz técnica.</p>
        </div>
        <Badge status="En validación">{uniqueFindingsCount} visibles</Badge>
      </div>

      <div className="findingsSummaryGrid">
        <article className="findingsSummaryCard">
          <div>
            <span>Total de Hallazgos</span>
            <strong>{uniqueFindingsCount}</strong>
          </div>
          <div className="findingsSummaryIcon" aria-hidden="true">
            <Search size={28} />
          </div>
          <p>Total visible según los filtros activos.</p>
        </article>

        <article className="findingsSummaryCard findingsStatusSummaryCard">
          <span>Estado de Hallazgos</span>
          <div className="findingsStatusRows">
            <div>
              <span>Pendiente</span>
              <div><i style={{ width: `${uniqueFindingsCount ? (statusSummary.pending / uniqueFindingsCount) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.pending}</strong>
            </div>
            <div>
              <span>En proceso</span>
              <div><i style={{ width: `${uniqueFindingsCount ? (statusSummary.inProcess / uniqueFindingsCount) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.inProcess}</strong>
            </div>
            <div>
              <span>Completado</span>
              <div><i style={{ width: `${uniqueFindingsCount ? (statusSummary.completed / uniqueFindingsCount) * 100 : 0}%` }} /></div>
              <strong>{statusSummary.completed}</strong>
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
            {Object.values(visibleDeliverableSummary).filter((item) => item.gse > 0).map((item) => (
              <div key={`gse-${item.label}`}>
                <span>{item.label}</span>
                <div><i style={{ width: `${visibleDeliverableCategoryTotals.gse ? (item.gse / visibleDeliverableCategoryTotals.gse) * 100 : 0}%` }} /></div>
                <strong>{item.gse}</strong>
              </div>
            ))}
            {!visibleDeliverableTotals.gse && <p className="findingsDeliverableEmpty">Sin entregables GSE para los filtros activos.</p>}
          </div>
        </article>

        <article className="findingsDeliverableDashboardCard client">
          <div className="findingsDeliverableDashboardHeader">
            <span>Entregables cliente</span>
            <strong>{visibleDeliverableTotals.client}</strong>
          </div>
          <div className="findingsDeliverableBreakdownRows">
            {Object.values(visibleDeliverableSummary).filter((item) => item.client > 0).map((item) => (
              <div key={`client-${item.label}`}>
                <span>{item.label}</span>
                <div><i style={{ width: `${visibleDeliverableCategoryTotals.client ? (item.client / visibleDeliverableCategoryTotals.client) * 100 : 0}%` }} /></div>
                <strong>{item.client}</strong>
              </div>
            ))}
            {!visibleDeliverableTotals.client && <p className="findingsDeliverableEmpty">Sin entregables cliente para los filtros activos.</p>}
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
          const key = `${item.id || "sin-id"}-${item.finding || item.description || item.recommendation || item.solution || "sin-titulo"}-${filteredFindings.indexOf(item)}`;
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

              <FindingUploadChecks item={item} />

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
    </>
  );
}

function PendingClient({ pending, compact = false, setView, previousView = "portal" }) {
  const [openPending, setOpenPending] = useState("");
  const [pendingValidation, setPendingValidation] = useState({});
  const [savingValidation, setSavingValidation] = useState({});
  const [validationMessage, setValidationMessage] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [validationFilter, setValidationFilter] = useState("Todos");
  const [mobileVisibleCount, setMobileVisibleCount] = useState(6);

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
  const mobileItems = filteredPending.slice(0, mobileVisibleCount);
  const mobileBackView = previousView === "hallazgos" ? "hallazgos" : "portal";
  const mobileStatusRows = [
    { label: "Bloqueado", value: summary.blocked, className: "blocked" },
    { label: "Pendiente", value: summary.pending, className: "" },
    { label: "En revisión", value: summary.review, className: "review" },
    { label: "Terminado", value: summary.finalized, className: "success" },
  ];

  useEffect(() => {
    setMobileVisibleCount(6);
  }, [searchTerm, statusFilter, validationFilter]);

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
    <>
    {!compact && (
      <section className="mobilePendingView">
        <div className="mobileRouteTopbar">
          <button type="button" onClick={() => setView?.(mobileBackView)}><ChevronLeft size={18} /> Atrás</button>
          <button type="button" onClick={() => setView?.("entregables")}>Siguiente <ChevronRight size={18} /></button>
        </div>

        <header className="mobilePendingHero">
          <h1>Pendientes clientes</h1>
          <label>
            <Search size={17} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
            />
          </label>
        </header>

        <div className="mobilePendingBody">
          <div className="mobilePendingValidationCards">
            <article>
              <i />
              <span>Implementado</span>
              <strong><ChevronRight size={18} />{summary.implemented}</strong>
            </article>
            <article>
              <i />
              <span>Pendiente</span>
              <strong><ChevronRight size={18} />{summary.pendingImplementation}</strong>
            </article>
          </div>

          <article className="mobilePendingTotalCard">
            <div><AlertTriangle size={34} /></div>
            <span>Total de Pendientes</span>
            <strong><ChevronRight size={28} />{pending.length}</strong>
          </article>

          <article className="mobilePendingStatusCard">
            <i className="mobilePendingAccent" />
            <div className="mobilePendingStatusHead">
              <span>Estado</span>
              <b>{pending.length} pendientes</b>
            </div>
            <div className="mobilePendingStatusRows">
              {mobileStatusRows.map((row) => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  <div><i className={row.className} style={{ width: `${pending.length ? (row.value / pending.length) * 100 : 0}%` }} /></div>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <div className="mobilePendingFilters">
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
            <FilterSelect label="Implementó" value={validationFilter} onChange={setValidationFilter} options={validationOptions} />
          </div>

          <div className="mobilePendingGrid">
            {mobileItems.map((item) => {
              const key = item.request || item.id || `${item.owner}-${item.dueDate}`;
              const isOpen = openPending === key;
              const link = safeUrl(item.link);
              const normalizedValidation = normalizeValidation(getValidationStatus(item));
              const isValidated = normalizedValidation === "Implementado";

              return (
                <article className={`mobilePendingCard ${isOpen ? "open" : ""}`} key={`mobile-${key}`}>
                  <button type="button" className="mobilePendingCardHead" onClick={() => setOpenPending(isOpen ? "" : key)}>
                    <div>
                      <i />
                      <h2>{item.request || "Pendiente sin título"}</h2>
                      {item.blocks && <p>{item.blocks}</p>}
                      <span>Responsable: {item.owner || "Por definir"}</span>
                      <span>Fecha: {item.dueDate || "Por definir"}</span>
                    </div>
                    <ChevronRight className={isOpen ? "open" : ""} size={20} />
                  </button>

                  {link && (
                    <a className="mobilePendingLink" href={link} target="_blank" rel="noreferrer">
                      Abrir documento relacionado <ChevronRight size={13} />
                    </a>
                  )}

                  <div className="mobilePendingBadges">
                    <Badge status={item.status}>{item.status || "Pendiente"}</Badge>
                    <Badge status={isValidated ? "Finalizado" : "Pendiente"}>{isValidated ? "Implementado" : "En proceso"}</Badge>
                  </div>

                  {isOpen && (
                    <div className="mobilePendingDetail">
                      <h3>Descripción</h3>
                      <p>{item.description || "Sin descripción registrada."}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filteredPending.length > mobileVisibleCount && (
            <button className="mobilePendingLoadMore" type="button" onClick={() => setMobileVisibleCount((current) => current + 6)}>
              Cargar más <ChevronDown size={34} />
            </button>
          )}

          {!filteredPending.length && <div className="mobileRouteEmpty">No hay pendientes con esos filtros.</div>}
        </div>

        <nav className="mobileBottomNav visible">
          {[
            { label: "Inicio", view: "portal", icon: BarChart3 },
            { label: "Ruta", view: "ruta", icon: MapPin },
            { label: "COE", view: "coe", icon: Brain },
            { label: "Hallazgos", view: "hallazgos", icon: Search },
            { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
                <Icon size={18} />
                <span>{item.label}</span>
                {item.view === "pendientes" && pending.length > 0 && <i>{pending.length}</i>}
              </button>
            );
          })}
        </nav>
      </section>
    )}

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
    </>
  );
}

function ClientDeliverables({ findings = [], project = {} }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todos");
  const [uploadStatus, setUploadStatus] = useState({});
  const [saving, setSaving] = useState({});
  const [remoteResources, setRemoteResources] = useState({});

  const session = getClientSession();
  const webhookUrl = safeUrl(import.meta.env.VITE_FINDING_UPLOAD_WEBHOOK_URL || import.meta.env.VITE_DOCUMENTS_WEBHOOK_URL || "");
  const resourcesWebhookUrl = safeUrl(import.meta.env.VITE_KZEN_RESOURCES_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();

  const resourceUrls = {
    policiesAI: safeUrl(
      remoteResources.ia_politicas ||
      session?.recursosKzen?.ia_politicas ||
      session?.iaKzenPoliciesUrl ||
      project.iaKzenPoliciesUrl ||
      import.meta.env.VITE_KZEN_POLICIES_URL
    ),
    policiesTemplate: safeUrl(
      remoteResources.formato_politicas ||
      session?.recursosKzen?.formato_politicas ||
      session?.policyTemplateUrl ||
      project.policyTemplateUrl ||
      import.meta.env.VITE_KZEN_POLICIES_TEMPLATE_URL
    ),
    proceduresAI: safeUrl(
      remoteResources.ia_procedimientos ||
      session?.recursosKzen?.ia_procedimientos ||
      session?.iaKzenProceduresUrl ||
      project.iaKzenProceduresUrl ||
      import.meta.env.VITE_KZEN_PROCEDURES_URL
    ),
    proceduresTemplate: safeUrl(
      remoteResources.formato_procedimientos ||
      session?.recursosKzen?.formato_procedimientos ||
      session?.procedureTemplateUrl ||
      project.procedureTemplateUrl ||
      import.meta.env.VITE_KZEN_PROCEDURES_TEMPLATE_URL
    ),
  };

  useEffect(() => {
    if (!resourcesWebhookUrl) return;

    let active = true;

    fetch(resourcesWebhookUrl, { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (!active || result?.ok === false) return;
        setRemoteResources(result?.recursos || result?.resources || {});
      })
      .catch((error) => {
        console.error("No se pudieron cargar los recursos K&ZEN.", error);
      });

    return () => {
      active = false;
    };
  }, [resourcesWebhookUrl]);

  const splitTypes = (value = "") => String(value || "")
    .split(/[,;|\n\r]+/)
    .map((item) => item.trim())
    .filter((item) => item && !["-", "n/a", "no aplica", "ninguno", "0"].includes(normalizeSystemName(item)));

  const rows = useMemo(() => findings.flatMap((item, findingIndex) => {
    const types = splitTypes(item.deliverableClient);
    return types.map((type, typeIndex) => ({
      ...item,
      rowKey: `${item.id || findingIndex}-${normalizeSystemName(type)}-${typeIndex}`,
      deliverableType: type,
    }));
  }), [findings]);

  const getUploadKey = (item, field) => [field, item.id || item.rowKey, item.finding || item.description].join("|");
  const getUploadValue = (item, field) => {
    const key = getUploadKey(item, field);
    if (Object.prototype.hasOwnProperty.call(uploadStatus, key)) return uploadStatus[key];
    return isCheckedSheetValue(item.policyLoaded) || isCheckedSheetValue(item.procedureLoaded);
  };

  const getRowLoaded = (item) => getUploadValue(item, "loaded");

  const handleUploadChange = async (item, field, nextChecked) => {
    if (!nextChecked) return;
    if (!window.confirm("¿Confirmas que ya fue cargado este entregable?")) return;

    const key = getUploadKey(item, field);
    const previous = getUploadValue(item, field);
    setUploadStatus((current) => ({ ...current, [key]: true }));
    setSaving((current) => ({ ...current, [key]: true }));

    if (!webhookUrl) {
      setUploadStatus((current) => ({ ...current, [key]: previous }));
      setSaving((current) => ({ ...current, [key]: false }));
      window.alert("Falta configurar el webhook para guardar el cargado.");
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateFindingUploadStatus",
          spreadsheetId,
          sheetName: "Hallazgos",
          field: "PoliticaCargada",
          value: "SI",
          id: item.id,
          hallazgo: item.finding,
          descripcion: item.description,
          updatedAt: new Date().toISOString(),
          updatedBy: session.nombre || session.usuario || session.cliente || "Cliente",
          user: session.usuario || "",
        }),
      });
      const text = await response.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        result = { ok: response.ok, message: text };
      }
      if (!response.ok || result.ok === false) throw new Error(result.message || "No se pudo guardar el cargado.");
    } catch (error) {
      console.error(error);
      setUploadStatus((current) => ({ ...current, [key]: previous }));
      window.alert(error.message || "No se pudo guardar el cargado.");
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  };

  const typeOptions = useMemo(() => [...new Set(rows.map((item) => item.deliverableType).filter(Boolean))], [rows]);
  const areaOptions = useMemo(() => [...new Set(rows.map((item) => item.areaDetail || item.area).filter(Boolean))], [rows]);
  const filteredRows = useMemo(() => {
    const query = normalizeSystemName(searchTerm);
    return rows.filter((item) => {
      const loaded = getRowLoaded(item);
      const status = loaded ? "Cargado" : "Pendiente";
      const area = item.areaDetail || item.area || "";
      const searchable = normalizeSystemName([
        item.deliverableType,
        item.deliveryDate,
        item.description,
        item.recommendation,
        item.processArea,
        item.management,
        area,
        item.finding,
      ].join(" "));
      return (
        (typeFilter === "Todos" || item.deliverableType === typeFilter) &&
        (statusFilter === "Todos" || status === statusFilter) &&
        (areaFilter === "Todos" || area === areaFilter) &&
        (!query || searchable.includes(query))
      );
    });
  }, [rows, searchTerm, typeFilter, statusFilter, areaFilter, uploadStatus]);

  const typeSummary = useMemo(() => rows.reduce((acc, item) => {
    const key = item.deliverableType;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}), [rows]);
  const loadedTotal = rows.filter(getRowLoaded).length;
  const maxTypeCount = Math.max(1, ...Object.values(typeSummary));

  const resources = [
    { label: "IA K&ZEN Políticas", detail: "Crear con asistencia guiada", url: resourceUrls.policiesAI, icon: Sparkles },
    { label: "Formato de políticas", detail: "Ver y copiar formato", url: resourceUrls.policiesTemplate, icon: FileText },
    { label: "IA K&ZEN Procedimientos", detail: "Crear con asistencia guiada", url: resourceUrls.proceduresAI, icon: Sparkles },
    { label: "Formato de procedimientos", detail: "Ver y copiar formato", url: resourceUrls.proceduresTemplate, icon: FileText },
  ];

  return (
    <section className="clientDeliverablesView">
      <div className="sectionHeader clientDeliverablesHeader">
        <div>
          <h2>Entregables clientes</h2>
          <p>Consulta qué debes construir, revisa la recomendación técnica y accede a las herramientas para desarrollar cada entregable.</p>
        </div>
        <Badge status="En validación">{filteredRows.length} visibles</Badge>
      </div>

      <div className="clientDeliverablesSummary">
        <article className="clientDeliverableSummaryCard">
          <h3>Entregables solicitados</h3>
          <strong>{rows.length}</strong>
          <div className="clientDeliverableBars">
            {Object.entries(typeSummary).map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <i><b style={{ width: `${(value / maxTypeCount) * 100}%` }} /></i>
                <em>{value}</em>
              </div>
            ))}
          </div>
        </article>
        <article className="clientDeliverableSummaryCard">
          <h3>Estado de cargado</h3>
          <strong>{loadedTotal}/{rows.length}</strong>
          <div className="clientDeliverableBars">
            <div>
              <span>Cargado</span>
              <i><b style={{ width: `${rows.length ? (loadedTotal / rows.length) * 100 : 0}%` }} /></i>
              <em>{loadedTotal}</em>
            </div>
            <div>
              <span>Pendiente</span>
              <i><b className="pending" style={{ width: `${rows.length ? ((rows.length - loadedTotal) / rows.length) * 100 : 0}%` }} /></i>
              <em>{Math.max(0, rows.length - loadedTotal)}</em>
            </div>
          </div>
        </article>
      </div>

      <div className="clientDeliverableResources">
        {resources.map(({ label, detail, url, icon: Icon }) => (
          <a
            key={label}
            className={`clientDeliverableResource ${url ? "" : "disabled"}`}
            href={url || undefined}
            target={url ? "_blank" : undefined}
            rel={url ? "noreferrer" : undefined}
            aria-disabled={!url}
            onClick={(event) => !url && event.preventDefault()}
          >
            <Icon size={24} />
            <strong>{label}</strong>
            <span>{url ? detail : "Enlace pendiente de configurar"}</span>
            {url && <ExternalLink size={15} />}
          </a>
        ))}
      </div>

      <div className="clientDeliverableFilters">
        <label className="searchField clientDeliverableSearch">
          <Search size={18} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar entregable, recomendación, gerencia o área" />
        </label>
        <FilterSelect label="Tipo de entregable" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={["Cargado", "Pendiente"]} />
        <FilterSelect label="Área" value={areaFilter} onChange={setAreaFilter} options={areaOptions} />
      </div>

      <article className="clientDeliverableMatrixCard">
        <div className="processTableHeader">
          <div>
            <h3>Matriz de entregables clientes</h3>
            <p>Información tomada directamente de la pestaña Hallazgos.</p>
          </div>
          <Badge status="Disponible">{Math.min(filteredRows.length, 20)} de {filteredRows.length}</Badge>
        </div>
        <div className="clientDeliverableMatrixWrap">
          <table className="clientDeliverableMatrix">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Descripción técnica</th>
                <th>Recomendación</th>
                <th>Proceso</th>
                <th>Gerencia</th>
                <th>Área</th>
                <th>Cargada</th>
                <th>Archivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, 20).map((item) => (
                <tr key={item.rowKey}>
                  <td><strong>{item.deliverableType}</strong></td>
                  <td>{item.deliveryDate || "Por definir"}</td>
                  <td>{item.description || "Sin descripción técnica"}</td>
                  <td>{item.recommendation || item.solution || "Sin recomendación registrada"}</td>
                  <td>{item.processArea || "Por definir"}</td>
                  <td>{item.management || item.gerencia || "Por definir"}</td>
                  <td>{item.areaDetail || item.area || "Por definir"}</td>
                  {(() => {
                    const field = "loaded";
                    const key = getUploadKey(item, field);
                    const checked = getUploadValue(item, field);
                    return (
                      <td>
                        <label className={`clientDeliverableCheck ${checked ? "checked" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={Boolean(saving[key])}
                            onChange={(event) => handleUploadChange(item, field, event.target.checked)}
                          />
                          <span>{checked ? "Cargado" : "Marcar"}</span>
                        </label>
                      </td>
                    );
                  })()}
                  <td>
                    {safeUrl(item.link) ? (
                      <a className="clientDeliverableUploadLink" href={safeUrl(item.link)} target="_blank" rel="noreferrer">
                        Subir <ExternalLink size={14} />
                      </a>
                    ) : <span className="clientDeliverableNoLink">Sin enlace</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredRows.length && <div className="emptyState">No hay entregables cliente que coincidan con los filtros.</div>}
      </article>
    </section>
  );
}

function Deliverables({ deliverables = [], selectedDeliverable, setSelectedDeliverable, compact = false, setView, previousView = "portal", pending = [] }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [responsibleFilter, setResponsibleFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeliverable, setOpenDeliverable] = useState("");
  const [mobileVisibleCount, setMobileVisibleCount] = useState(6);

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
  const mobileItems = filtered.slice(0, mobileVisibleCount);
  const deliverablesBackView = previousView === "procesos" ? "procesos" : "portal";
  const activePending = pending.filter(isPendingActive).length;
useEffect(() => {
    setMobileVisibleCount(6);
  }, [searchTerm, systemFilter, responsibleFilter, statusFilter]);

  return (
    <>
    {!compact && (
      <section className="mobileDeliverablesView">
        <div className="mobileRouteTopbar">
          <button type="button" onClick={() => setView?.(deliverablesBackView)}><ChevronLeft size={18} /> Atrás</button>
          <button type="button" onClick={() => setView?.("documentos")}>Siguiente <ChevronRight size={18} /></button>
        </div>

        <header className="mobileDeliverablesHero">
          <h1>Entregables GSE</h1>
          <label>
            <Search size={17} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar"
            />
          </label>
        </header>

        <div className="mobileDeliverablesBody">
          <div className="mobileDeliverablesStatusCards">
            {[
              { label: "Finalizado", value: summary.finalized },
              { label: "Pendiente", value: summary.pending },
              { label: "En desarrollo", value: summary.development },
            ].map((item) => (
              <article key={item.label}>
                <i />
                <span>{item.label}</span>
                <strong><ChevronRight size={18} />{item.value}</strong>
              </article>
            ))}
          </div>

          <article className="mobileDeliverablesTotalCard">
            <div><FileText size={32} /></div>
            <span>Total de Entregables</span>
            <strong><ChevronRight size={28} />{deliverables.length}</strong>
          </article>

          <div className="mobileDeliverablesFilters">
            <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={systems} />
            <FilterSelect label="Hito" value={responsibleFilter} onChange={setResponsibleFilter} options={milestones} />
            <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={statuses} />
          </div>

          <div className="mobileDeliverablesGrid">
            {mobileItems.map((item) => {
              const link = safeUrl(item.link);
              const deliverableKey = `${item.system}-${item.milestone}-${item.deliverable}`;
              const isOpen = openDeliverable === deliverableKey;
              return (
                <article className={`mobileDeliverableCard ${isOpen ? "open" : ""}`} key={`mobile-${deliverableKey}`}>
                  <button type="button" className="mobileDeliverableHead" onClick={() => setOpenDeliverable(isOpen ? "" : deliverableKey)}>
                    <div>
                      <i />
                      <span>{item.system || "General"}</span>
                      {item.milestone && <small>Hito: {item.milestone}</small>}
                    </div>
                    <ChevronRight className={isOpen ? "open" : ""} size={19} />
                  </button>

                  <h2>{item.deliverable || "Entregable sin nombre"}</h2>
                  <ProgressBar value={item.progress} status={item.status} />
                  <p>{item.progress || 0}% de avance</p>

                  {link && (
                    <a className="mobileDeliverableLink" href={link} target="_blank" rel="noreferrer">
                      Ver entregable <ChevronRight size={13} />
                    </a>
                  )}

                  <Badge status={item.status}>{item.status || "Pendiente"}</Badge>

                  {isOpen && item.observation && (
                    <div className="mobileDeliverableDetail">
                      <h3>Descripción</h3>
                      <p>{item.observation}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filtered.length > mobileVisibleCount && (
            <button className="mobileDeliverablesLoadMore" type="button" onClick={() => setMobileVisibleCount((current) => current + 6)}>
              Cargar más <ChevronDown size={34} />
            </button>
          )}

          {!filtered.length && <div className="mobileRouteEmpty">No hay entregables con esos filtros.</div>}
        </div>

        <nav className="mobileBottomNav visible">
          {[
            { label: "Inicio", view: "portal", icon: BarChart3 },
            { label: "Ruta", view: "ruta", icon: MapPin },
            { label: "COE", view: "coe", icon: Brain },
            { label: "Hallazgos", view: "hallazgos", icon: Search },
            { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
                <Icon size={18} />
                <span>{item.label}</span>
                {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
              </button>
            );
          })}
        </nav>
      </section>
    )}

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
    </>
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

function Education({ education = [], setView, previousView = "portal", pending = [] }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [milestoneFilter, setMilestoneFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openEducationCard, setOpenEducationCard] = useState("");
  const [mobileGroupLimits, setMobileGroupLimits] = useState({});

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
  const mobileStatusCounts = ["Terminado", "En desarrollo", "Pendiente"].map((status) => ({
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
  const educationBackView = previousView === "documentos" ? "documentos" : "portal";
  const activePending = pending.filter(isPendingActive).length;
useEffect(() => {
    setMobileGroupLimits({});
  }, [searchTerm, systemFilter, milestoneFilter, statusFilter]);

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

  const renderMobileEducationCard = (item, index, prefix = "") => {
    const image = safeUrl(item.imagePreview);
    const cardKey = `mobile-${prefix}${item.deliverable}-${index}`;
    const isOpen = openEducationCard === cardKey;

    return (
      <article className={`mobileEducationCard ${isOpen ? "open" : ""}`} key={cardKey}>
        <i />
        <button
          className="mobileEducationCardToggle"
          type="button"
          onClick={() => setOpenEducationCard((current) => (current === cardKey ? "" : cardKey))}
          aria-expanded={isOpen}
        >
          <ChevronRight size={18} />
        </button>
        <span>{item.system || "Entregable"}</span>
        <h2>{item.deliverable || "Entregable"}</h2>
        {image ? (
          <img src={image} alt={item.deliverable || "Vista previa"} />
        ) : (
          <div className="mobileEducationImageFallback"><Monitor size={20} /></div>
        )}
        <div className="mobileEducationBadges">
          {item.milestone && <Badge status="En validación">{item.milestone}</Badge>}
          {item.status && <Badge status={getEducationStatusBucket(item.status) === "Terminado" ? "Finalizado" : item.status}>{item.status}</Badge>}
        </div>
        {isOpen && (
          <div className="mobileEducationDetails">
            {item.whatIs && <p><strong>¿Qué es?</strong>{item.whatIs}</p>}
            {item.purpose && <p><strong>¿Para qué sirve?</strong>{item.purpose}</p>}
            {item.howToRead && <p><strong>¿Cómo leerlo?</strong>{item.howToRead}</p>}
          </div>
        )}
      </article>
    );
  };

  return (
    <>
    <section className="mobileEducationView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView?.(educationBackView)}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView?.("portal")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileEducationHero">
        <h1>Lo que vas a recibir</h1>
        <p>Aquí encontrarás una guía clara de los entregables que estamos construyendo, qué significa cada uno, para qué sirve y cómo debes leerlo.</p>
        <p>La información está organizada por hitos para que puedas entender cómo cada entregable aporta al orden, control y sostenibilidad de tu empresa.</p>
        <label>
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar" />
        </label>
      </header>

      <div className="mobileEducationBody">
        <div className="mobileEducationMetrics">
          {mobileStatusCounts.map((item) => (
            <article key={item.status}><i /><span>{item.status}</span><strong><ChevronRight size={18} />{item.count}</strong></article>
          ))}
        </div>

        <article className="mobileEducationTotal">
          <div><ClipboardCheck size={34} /></div>
          <span>Total de<br />Entregables</span>
          <strong><ChevronRight size={28} />{education.length}</strong>
        </article>

        <div className="mobileEducationFilters">
          <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={orderedSystems} />
          <FilterSelect label="Hito" value={milestoneFilter} onChange={setMilestoneFilter} options={milestones} />
          <FilterSelect label="Estado" value={statusFilter} onChange={setStatusFilter} options={["Pendiente", "En desarrollo", "Terminado", ...statuses]} />
        </div>

        <div className="mobileEducationGroups">
          {grouped.map((group, groupIndex) => {
            const limit = mobileGroupLimits[group.key] || 4;
            const visibleItems = group.items.slice(0, limit);
            return (
              <section className="mobileEducationGroup" key={`mobile-${group.key}`}>
                <div className="mobileEducationGroupHeader">
                  <span>Hito {groupIndex + 1}</span>
                  <h2>{group.milestone}</h2>
                </div>
                <div className="mobileEducationGrid">
                  {visibleItems.map((item, index) => renderMobileEducationCard(item, index, group.key))}
                </div>
                {group.items.length > limit && (
                  <button
                    className="mobileEducationLoadMore"
                    type="button"
                    onClick={() => setMobileGroupLimits((current) => ({ ...current, [group.key]: limit + 4 }))}
                  >
                    Cargar más <ChevronDown size={34} />
                  </button>
                )}
              </section>
            );
          })}
        </div>

        {!filtered.length && <div className="mobileRouteEmpty">No hay entregables con esos filtros.</div>}
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>

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
    </>
  );
}


function DocumentsUpload({ documents = [], project, setView, previousView = "portal", pending = [] }) {
  const uploadLink = safeUrl(project.documentUploadLink || project.linkCargaDocumentos || "");
  const webhookUrl = safeUrl(import.meta.env.VITE_DOCUMENTS_WEBHOOK_URL || "");
  const spreadsheetId = getActiveSpreadsheetId();
  const [responses, setResponses] = useState({});
  const [saving, setSaving] = useState({});
  const [saveMessage, setSaveMessage] = useState({});
  const [documentStates, setDocumentStates] = useState({});
  const [expandedDocuments, setExpandedDocuments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [requiredFilter, setRequiredFilter] = useState("Todos");
  const [documentStatusFilter, setDocumentStatusFilter] = useState("Todos");
  const [mobileVisibleCount, setMobileVisibleCount] = useState(6);
  const [mobileInstructionsOpen, setMobileInstructionsOpen] = useState(false);

  const title = documents.find((item) => item.title)?.title || "Carga de documentos iniciales";
  const description = "Bienvenido al inicio formal de tu proyecto Business Power. Esta sección nos ayudará a conocer cómo opera actualmente tu empresa. Este es el primer paso para dejar atrás el caos operativo y empezar a trabajar con estructura, control y claridad.";

  const getDocumentKey = (item) => item.id || item.item || item.title || item.description || "";
  const normalizeDocumentStatus = (value) => {
    const normalized = normalizeSystemName(value || "");
    if (!normalized || normalized === "pendiente") return "Pendiente";
    if (normalized.includes("validado") || normalized.includes("aprobado")) return "Validado";
    if (normalized.includes("revision") || normalized.includes("cargado")) return "En revisión";
    if (normalized.includes("no disponible") || normalized.includes("no tengo")) return "No disponible";
    return String(value || "Pendiente").trim();
  };
  const getCurrentResponse = (item) => responses[getDocumentKey(item)] ?? item.responseClient ?? "";
  const getCurrentStatus = (item) => normalizeDocumentStatus(documentStates[getDocumentKey(item)] ?? item.status ?? "");
  const isRequiredDocument = (item) => {
    const value = normalizeSystemName(item.required || item.obligatorio || "");
    return value.startsWith("s") || value.includes("obligatorio");
  };
  const getRequiredLabel = (item) => (isRequiredDocument(item) ? "Obligatorio" : "Opcional");
  const getFolderLink = (item) => safeUrl(item.folderLink || item.linkCarpeta || item.link || "");
  const getStatusLabel = (status) => {
    if (status === "En revisión") return "En revisión por GSE";
    return status || "Pendiente";
  };

  const handleDocumentAction = async (item, { respuesta, estado }) => {
    const key = getDocumentKey(item);
    const previousResponse = responses[key] ?? item.responseClient ?? "";
    const previousStatus = documentStates[key] ?? item.status ?? "";

    if (respuesta === "No tengo" && isRequiredDocument(item)) {
      const confirmed = window.confirm("Este documento es obligatorio para el avance del proyecto. Si no cuentas con esta información, GSE deberá validar una alternativa.");
      if (!confirmed) return;
    }

    setResponses((current) => ({ ...current, [key]: respuesta }));
    setDocumentStates((current) => ({ ...current, [key]: estado }));
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
          estado,
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
      const requestWasSent =
        error instanceof TypeError &&
        String(error.message || "").toLowerCase().includes("failed to fetch");

      if (requestWasSent) {
        setSaveMessage((current) => ({ ...current, [key]: "Respuesta registrada" }));
        return;
      }

      setResponses((current) => ({ ...current, [key]: previousResponse }));
      setDocumentStates((current) => ({ ...current, [key]: previousStatus }));
      setSaveMessage((current) => ({ ...current, [key]: error.message || "No se pudo guardar la respuesta." }));
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  };

  const handleResponseChange = async (item, respuesta) => {
    const estado = respuesta === "Sí tengo" ? "En revisión" : respuesta === "No tengo" ? "No disponible" : "Pendiente";
    await handleDocumentAction(item, { respuesta, estado });
  };

  const statusOptions = useMemo(
    () => Array.from(new Set(documents.map((item) => getCurrentStatus(item)).filter(Boolean))),
    [documents, responses, documentStates]
  );

  const filteredDocuments = useMemo(() => {
    const query = normalizeSystemName(searchTerm);

    return documents.filter((item) => {
      const searchable = normalizeSystemName(
        [
          item.title,
          item.description,
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
  }, [documents, responses, documentStates, searchTerm, requiredFilter, documentStatusFilter]);

  const documentSummary = useMemo(() => {
    const total = documents.length;
    const pendingCount = documents.filter((item) => getCurrentStatus(item) === "Pendiente").length;
    const reviewCount = documents.filter((item) => getCurrentStatus(item) === "En revisión").length;
    const validatedCount = documents.filter((item) => getCurrentStatus(item) === "Validado").length;
    const unavailableCount = documents.filter((item) => getCurrentStatus(item) === "No disponible").length;
    const completedCount = documents.filter((item) => {
      const status = getCurrentStatus(item);
      return status === "Validado" || (status === "No disponible" && !isRequiredDocument(item));
    }).length;

    return {
      total,
      pendingCount,
      reviewCount,
      validatedCount,
      unavailableCount,
      progress: total ? Math.round((completedCount / total) * 100) : 0,
    };
  }, [documents, responses, documentStates]);

  const groupedDocuments = useMemo(() => {
    return filteredDocuments.reduce((groups, item) => {
      const group = item.category || item.item || "Documentos";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {});
  }, [filteredDocuments]);

  const documentStatusMax = Math.max(
    documentSummary.pendingCount,
    documentSummary.reviewCount,
    documentSummary.validatedCount,
    documentSummary.unavailableCount,
    1
  );

  const yesHave = documents.filter((item) => getCurrentResponse(item) === "Sí tengo").length;
  const required = documents.filter((item) => getRequiredLabel(item) === "Obligatorio").length;
  const mobileDocuments = filteredDocuments.slice(0, mobileVisibleCount);
  const documentsBackView = previousView === "entregables" ? "entregables" : "portal";
  const activePending = pending.filter(isPendingActive).length;
useEffect(() => {
    setMobileVisibleCount(6);
  }, [searchTerm, requiredFilter, documentStatusFilter]);

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

  const renderMobileDocumentItem = (item, index) => {
    const key = getDocumentKey(item) || String(index);
    const currentResponse = getCurrentResponse(item);
    const currentStatus = getCurrentStatus(item);

    return (
      <article className="mobileDocumentCard" key={`mobile-${item.category || "general"}-${key}-${index}`}>
        <i />
        <h2>{item.item || item.title || "Documento solicitado"}</h2>
        {item.detail && <p>{item.detail}</p>}
        <label>
          <span>¿Tienes este documento?</span>
          <select
            value={currentResponse}
            onChange={(event) => handleResponseChange(item, event.target.value)}
            disabled={Boolean(saving[key])}
          >
            <option value="">Seleccionar</option>
            <option value="Sí tengo">Sí tengo</option>
            <option value="No tengo">No tengo</option>
          </select>
        </label>
        <div className="mobileDocumentBadges">
          <Badge status="Disponible">Obligatorio: {item.required || "No"}</Badge>
          <Badge status={currentStatus}>{currentStatus}</Badge>
        </div>
      </article>
    );
  };

  return (
    <>
    <section className="mobileDocumentsView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView?.(documentsBackView)}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView?.("educacion")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileDocumentsHero">
        <h1>{title}</h1>
        <p>{description}</p>
        <label>
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar" />
        </label>
      </header>

      <div className="mobileDocumentsBody">
        <div className="mobileDocumentsMetrics">
          <article><i /><span>Ítems cargados</span><strong><ChevronRight size={18} />{yesHave}/{documents.length}</strong></article>
          <article><i /><span>Sí tiene</span><strong><ChevronRight size={18} />{yesHave}</strong></article>
          <article><i /><span>Obligatorios</span><strong><ChevronRight size={18} />{required}</strong></article>
        </div>

        {uploadLink ? (
          <a className="mobileDocumentsUpload" href={uploadLink} target="_blank" rel="noreferrer">
            <div><UploadCloud size={34} /></div>
            <span>Subir documentos</span>
            <ChevronRight size={28} />
          </a>
        ) : (
          <button className="mobileDocumentsUpload disabledButton" type="button">
            <div><UploadCloud size={34} /></div>
            <span>Enlace pendiente</span>
            <ChevronRight size={28} />
          </button>
        )}

        <section className={`mobileDocumentsInstructions ${mobileInstructionsOpen ? "open" : ""}`}>
          <h2>Instrucciones:</h2>
          <p>Da clic en <strong>“Subir aquí”</strong> para cargar cada documento en su carpeta correspondiente. Luego regresa a la app y selecciona <strong>“Ya lo cargué”</strong> para que GSE pueda revisarlo.</p>
          <p>Si no tienes un documento formal, pero la información existe en la práctica, represéntala de forma sencilla y súbela.</p>
          {mobileInstructionsOpen && (
            <>
              <p>Si la información está incompleta o desactualizada, súbela igual e indícalo en el nombre del archivo.</p>
              <p>Marca <strong>“No tengo”</strong> solo cuando no cuentes con el documento ni con la información necesaria para representarlo.</p>
            </>
          )}
          <button type="button" onClick={() => setMobileInstructionsOpen((current) => !current)}>
            {mobileInstructionsOpen ? "Ver menos" : "Seguir leyendo"} <ChevronDown size={28} />
          </button>
        </section>

        <div className="mobileDocumentsFilters">
          <FilterSelect label="Obligatorio" value={requiredFilter} onChange={setRequiredFilter} options={["Obligatorio", "Opcional"]} />
          <FilterSelect label="Estado" value={documentStatusFilter} onChange={setDocumentStatusFilter} options={statusOptions} />
        </div>

        <div className="mobileDocumentsGrid">
          {mobileDocuments.map((item, index) => renderMobileDocumentItem(item, index))}
        </div>

        {filteredDocuments.length > mobileVisibleCount && (
          <button className="mobileDocumentsLoadMore" type="button" onClick={() => setMobileVisibleCount((current) => current + 6)}>
            Cargar más <ChevronDown size={34} />
          </button>
        )}

        {!filteredDocuments.length && <div className="mobileRouteEmpty">No hay documentos con esos filtros.</div>}
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView?.(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>

    <section className="documentsPage documentsChecklistPage">
      <div className="documentsTableHeader">
        <div>
          <span>Checklist documental</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="documentsChecklistSummary documentsChecklistBars">
        <article className="documentsTotalSummaryCard">
          <span>Total documentos solicitados</span>
          <strong>{documentSummary.total}</strong>
          <p>{documentSummary.progress}% de avance documental</p>
          <ProgressBar value={documentSummary.progress} status="Finalizado" />
        </article>
        <article className="documentsStatusSummaryCard">
          <div>
            <span>Estado de documentos</span>
            <strong>{documentSummary.progress}%</strong>
          </div>
          {[
            ["Pendientes", documentSummary.pendingCount],
            ["En revisión", documentSummary.reviewCount],
            ["Validados", documentSummary.validatedCount],
            ["No disponibles", documentSummary.unavailableCount],
          ].map(([label, count]) => (
            <div className="documentsSummaryBarRow" key={label}>
              <span>{label}</span>
              <i><b style={{ width: `${Math.max(3, Math.round((count / documentStatusMax) * 100))}%` }} /></i>
              <em>{count}</em>
            </div>
          ))}
        </article>
      </div>

      <section className="documentsInstructions documentsInstructionsCompact">
        <h2>Instrucciones:</h2>
        <div>
          <p>Da clic en <strong>“Subir aquí”</strong> para cargar cada documento en su carpeta correspondiente. Luego regresa a la app y selecciona <strong>“Ya lo cargué”</strong> para que GSE pueda revisarlo.</p>
          <p>Si no tienes un documento formal, pero la información existe en la práctica, represéntala de forma sencilla y súbela.</p>
        </div>
        <div>
          <p>Si la información está incompleta o desactualizada, súbela igual e indícalo en el nombre del archivo.</p>
          <p>Marca <strong>“No tengo”</strong> solo cuando no cuentes con el documento ni con la información necesaria para representarlo.</p>
        </div>
      </section>

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

      <div className="documentsChecklistTableCard">
        {!documents.length && (
          <div className="documentsTableEmpty">
            <span>Checklist pendiente</span>
            <h3>No se encontraron ítems en Google Sheet</h3>
            <p>La app busca una pestaña llamada Documentos con columnas como Titulo, Descripcion, Categoria, Item, Detalle, Obligatorio, RespuestaCliente, Estado, Observacion, LinkCarpeta y FechaRespuesta.</p>
          </div>
        )}

        {documents.length > 0 && filteredDocuments.length === 0 && (
          <div className="documentsTableEmpty">
            <span>Sin resultados</span>
            <h3>No hay documentos con esos filtros</h3>
            <p>Prueba con otra búsqueda, estado u obligatoriedad.</p>
          </div>
        )}

        {filteredDocuments.length > 0 && (
          <div className="documentsChecklistTableWrap">
            <table className="documentsChecklistTable">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Documento solicitado</th>
                  <th>Categoría</th>
                  <th>Obligatorio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedDocuments).map(([group, rows]) => (
                  <Fragment key={group}>
                    {rows.map((item, index) => {
                      const key = getDocumentKey(item) || String(index);
                      const status = getCurrentStatus(item);
                      const folderLink = getFolderLink(item);
                      const isExpanded = Boolean(expandedDocuments[key]);
                      const isBusy = Boolean(saving[key]);
                      const statusClass = normalizeSystemName(status).replace(/\s+/g, "-");

                      return (
                        <Fragment key={`${group}-${key}-${index}`}>
                          <tr>
                            <td>
                              <span className={`documentsStatusPill status-${statusClass}`}>
                                {getStatusLabel(status)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="documentsRowToggle"
                                type="button"
                                onClick={() => setExpandedDocuments((current) => ({ ...current, [key]: !current[key] }))}
                              >
                                <ChevronRight size={16} className={isExpanded ? "open" : ""} />
                                <span>{item.description || item.item || item.title || "Documento solicitado"}</span>
                              </button>
                            </td>
                            <td>{item.category || "Sin categoría"}</td>
                            <td>{isRequiredDocument(item) ? "Sí" : "No"}</td>
                            <td>
                              <div className="documentsActionGroup">
                                {status === "Pendiente" && (
                                  <>
                                    {folderLink ? (
                                      <a href={folderLink} target="_blank" rel="noreferrer">Subir aquí</a>
                                    ) : (
                                      <button type="button" disabled>Sin carpeta</button>
                                    )}
                                    <button type="button" disabled={isBusy} onClick={() => handleDocumentAction(item, { respuesta: "Sí tengo", estado: "En revisión" })}>Ya lo cargué</button>
                                    <button type="button" disabled={isBusy} onClick={() => handleDocumentAction(item, { respuesta: "No tengo", estado: "No disponible" })}>No tengo</button>
                                  </>
                                )}
                                {status === "En revisión" && (
                                  folderLink ? <a href={folderLink} target="_blank" rel="noreferrer">Ver carpeta</a> : <button type="button" disabled>Sin carpeta</button>
                                )}
                                {status === "Validado" && (
                                  folderLink ? <a href={folderLink} target="_blank" rel="noreferrer">Ver carpeta</a> : <button type="button" disabled>Sin carpeta</button>
                                )}
                                {status === "No disponible" && (
                                  <button type="button" disabled={isBusy} onClick={() => handleDocumentAction(item, { respuesta: "", estado: "Pendiente" })}>Cambiar respuesta</button>
                                )}
                              </div>
                              {saveMessage[key] && <span className="documentSaveMessage tableMessage">{saveMessage[key]}</span>}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="documentsExpandedRow">
                              <td colSpan={5}>
                                <div>
                                  {item.item && <p><strong>Ítem:</strong> {item.item}</p>}
                                  {item.detail && <p><strong>Detalle:</strong> {item.detail}</p>}
                                  {item.observation && <p><strong>Observación:</strong> {item.observation}</p>}
                                  {item.responseDate && <p><strong>Última respuesta:</strong> {item.responseDate}</p>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
    </>
  );
}

function MobilePortalHome({ project, milestones = [], pending = [], meetings = [], updates = [], findings = [], deliverables = [], documents = [], education = [], architectureRoles = [], coeAsIs = [], coeToBe = [], setView }) {
  const [mobileSearch, setMobileSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMobilePanel, setOpenMobilePanel] = useState("");
  const [showBottomNav, setShowBottomNav] = useState(false);
  const company = project.companyClient || project.client || "Cliente";
  const contact = project.contactName || project.responsibleClient || "Cliente";
  const progress = Number(project.progress) || 0;
  const disorder = Math.max(0, 100 - progress);
  const completedMilestones = milestones.filter((item) => isCompletedStatus(item.status)).length;
  const activePending = pending.filter(isPendingActive).length;
const costFor = (item = {}) => {
    const cost = parseNumericValue(item.cost ?? item.costo ?? item["COSTO (xmin)"] ?? 0);
    const frequency = parseNumericValue(item.frequency ?? item.frecuencia ?? item.FRECUENCIA ?? 1) || 1;
    return cost * frequency;
  };
  const totalAsIs = coeAsIs.reduce((sum, item) => sum + costFor(item), 0);
  const totalToBe = coeToBe.reduce((sum, item) => sum + costFor(item), 0);
  const coePercent = totalAsIs > 0 ? ((totalAsIs - totalToBe) / totalAsIs) * 100 : 0;
  const meetUrl = safeUrl(project?.linkMeet);
  const meetingItems = [
    ...meetings.map((item) => ({
      title: item.title || "Reunión",
      detail: [item.date, item.time].filter(Boolean).join(" · ") || "Por definir",
      link: safeUrl(item.link) || meetUrl,
    })),
    {
      title: project?.nextStep || "Próxima reunión",
      detail: project?.nextDate || "Por definir",
      link: meetUrl,
    },
    ...updates
      .filter((item) => normalizeSystemName(`${item.target || ""} ${item.title || ""} ${item.text || ""}`).includes("reunion"))
      .slice(0, 2)
      .map((item) => ({ title: item.title || "Reunión", detail: item.text || "Por definir", link: meetUrl })),
  ].filter((item) => item.title || item.detail).slice(0, 5);
  const pendingItems = pending.filter(isPendingActive).slice(0, 6);
  const quickItems = [
    { label: "Ruta", view: "ruta", icon: MapPin, short: "Ruta" },
    { label: "COE", view: "coe", icon: Brain, short: "COE" },
    { label: "Hallazgos", view: "hallazgos", icon: Search, short: "Hallazgos" },
    { label: "Pendientes", view: "pendientes", icon: AlertTriangle, short: "Pendientes" },
    { label: "Procesos", view: "procesos", icon: Layers3, short: "Procesos" },
    { label: "Entregables", view: "entregables", icon: ClipboardCheck, short: "Entregables" },
    { label: "Documentos", view: "documentos", icon: UploadCloud, short: "Documentos" },
    { label: "Recibir", view: "educacion", icon: BookOpen, short: "Recibir" },
  ];
  const query = normalizeSystemName(mobileSearch);
  const searchResults = query ? [
    ...quickItems.map((item) => ({ type: "Sección", title: item.label, detail: "Abrir sección", view: item.view, haystack: item.label })),
    ...milestones.map((item) => ({ type: "Hito", title: item.title, detail: [item.id, item.status].filter(Boolean).join(" · "), view: "ruta", haystack: `${item.id} ${item.title} ${item.status}` })),
    ...pending.map((item) => ({ type: "Pendiente", title: item.request, detail: [item.status, item.dueDate].filter(Boolean).join(" · "), view: "pendientes", haystack: `${item.request} ${item.status} ${item.owner} ${item.description}` })),
    ...findings.map((item) => ({ type: "Hallazgo", title: item.finding, detail: [item.priority, item.status].filter(Boolean).join(" · "), view: "hallazgos", haystack: `${item.id} ${item.finding} ${item.status} ${item.priority}` })),
    ...deliverables.map((item) => ({ type: "Entregable", title: item.deliverable, detail: [item.milestone, item.status].filter(Boolean).join(" · "), view: "entregables", haystack: `${item.deliverable} ${item.system} ${item.milestone} ${item.status}` })),
    ...documents.map((item) => ({ type: "Documento", title: item.item || item.title, detail: [item.category, item.status].filter(Boolean).join(" · "), view: "documentos", haystack: `${item.title} ${item.item} ${item.category} ${item.status}` })),
    ...education.map((item) => ({ type: "Info", title: item.deliverable, detail: [item.milestone, item.status].filter(Boolean).join(" · "), view: "educacion", haystack: `${item.deliverable} ${item.system} ${item.milestone} ${item.whatIs}` })),
  ].filter((item) => normalizeSystemName(item.haystack).includes(query)).slice(0, 8) : [];
  const routeItems = Array.from({ length: 13 }, (_, index) => {
    const item = milestones[index] || {};
    return {
      id: String(item.id || index).replace(/^E/i, ""),
      title: item.title || "Por definir",
      date: item.targetDate || item.date || "Fecha",
      unlocked: index < 4 || normalizeSystemName(item.open || item.abierto || "").includes("si") || isCompletedStatus(item.status),
      status: item.status || (index < 4 ? "Abierto" : "Cerrado"),
    };
  });
  const topRouteItems = routeItems.slice(0, 6);
  const bottomRouteItems = routeItems.slice(6, 13);
  const profileCompletedCount = architectureRoles.filter((item) => isCompletedStatus(item.status) || isCheckedSheetValue(item.validated)).length;
  const systemMetrics = [
    { label: "Hallazgos", total: findings.length, value: findings.filter((item) => isCompletedStatus(item.status)).length, note: "Completado" },
    { label: "Perfiles", total: architectureRoles.length, value: profileCompletedCount, note: architectureRoles.length ? "Validado" : "Pendiente de datos" },
    { label: "Nivel de empleabilidad", total: 0, value: 0, note: "Pendiente de datos" },
    { label: "Desempeño", total: 0, value: 0, note: "Pendiente de datos" },
    { label: "Masa Salarial", total: 0, value: 0, note: "Pendiente de datos" },
  ];
  const unlockedIndex = Math.max(0, routeItems.findLastIndex((item) => item.unlocked));
  const unlockedCode = routeItems[unlockedIndex]?.id || "0";

  useEffect(() => {
    const onScroll = () => setShowBottomNav(window.scrollY > 260);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openResult = (item) => {
    setView(item.view);
    setSearchOpen(false);
    setMobileSearch("");
  };

  return (
    <section className="mobilePortalHome" onClick={() => setOpenMobilePanel("")}>
      <div className="mobileHeroTop" onClick={(event) => event.stopPropagation()}>
        <Logo src={project.logoClient || project.logoGSE} fallback={(company || "GSE").slice(0, 2)} className="mobileHeroLogo" />
        <h1>Hola {contact}</h1>
        <span>{company}</span>

        <div className="mobileHeroActions">
          <button className="mobileHomeSearch" type="button" onClick={() => setSearchOpen(true)}>
            <Search size={17} />
            <span>Buscar</span>
          </button>
          <button className="mobileRoundAction" type="button" onClick={() => setOpenMobilePanel(openMobilePanel === "meetings" ? "" : "meetings")}>
            <Clock3 size={19} />
          </button>
          <button className="mobileRoundAction" type="button" onClick={() => setOpenMobilePanel(openMobilePanel === "pending" ? "" : "pending")}>
            <Bell size={19} />
            {activePending > 0 && <i>{activePending}</i>}
          </button>
        </div>

        {openMobilePanel && (
          <div className="mobileTopPopover" onClick={(event) => event.stopPropagation()}>
            <button className="mobilePopoverClose" type="button" onClick={() => setOpenMobilePanel("")} aria-label="Cerrar">
              <X size={15} />
            </button>
            <h3>{openMobilePanel === "meetings" ? "Reuniones" : "Pendientes"}</h3>
            {(openMobilePanel === "meetings" ? meetingItems : pendingItems).map((item, index) => (
              <button
                type="button"
                key={`${item.title || item.request}-${index}`}
                onClick={() => openMobilePanel === "pending" ? setView("pendientes") : item.link && window.open(item.link, "_blank", "noreferrer")}
              >
                {openMobilePanel === "meetings" ? <Clock3 size={16} /> : <AlertTriangle size={16} />}
                <span>{item.title || item.request}</span>
                <small>{item.detail || item.dueDate || item.status || "Por definir"}</small>
              </button>
            ))}
            {openMobilePanel === "pending" && !pendingItems.length && <p>No hay pendientes activos.</p>}
          </div>
        )}
      </div>

      <div className="mobileHomeBody">
        <div className="mobileQuickGrid">
          {quickItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className="mobileQuickButton" key={item.view} type="button" onClick={() => setView(item.view)}>
                <Icon size={28} />
                <span>{item.short}</span>
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

        <article className="mobileMilestoneChart">
          <h3>Hitos completados</h3>
          <div className="mobileMilestoneScroll">
            <div className="mobileMilestoneCanvas">
              <div className="mobileMilestoneRow">
                {topRouteItems.map((item, index) => (
                  <button type="button" className="mobileMilestoneNode" key={`top-${item.id}`} onClick={() => setView("ruta")}>
                    {index === unlockedIndex && <MapPin size={30} className="mobileMilestonePin" />}
                    <span className={item.unlocked ? "open" : ""}>E{item.id}</span>
                    {item.unlocked ? <Unlock className="mobileLockIcon open" size={16} /> : <Lock className="mobileLockIcon" size={16} />}
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
              <div className="mobileMilestoneRow">
                {bottomRouteItems.map((item, index) => (
                  <button type="button" className="mobileMilestoneNode" key={`bottom-${item.id}`} onClick={() => setView("ruta")}>
                    {index + 6 === unlockedIndex && <MapPin size={30} className="mobileMilestonePin" />}
                    <span className={item.unlocked ? "open" : ""}>E{item.id}</span>
                    {item.unlocked ? <Unlock className="mobileLockIcon open" size={16} /> : <Lock className="mobileLockIcon" size={16} />}
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="mobileBottomCards">
          <button type="button" onClick={() => setView("ruta")}>
            <Rocket size={28} />
            <span>Hitos completados</span>
            <strong>{completedMilestones}/{Math.max(milestones.length, 13)}</strong>
          </button>
          <button type="button" onClick={() => setView("ruta")}>
            <Rocket size={28} />
            <span>Desbloqueado hasta</span>
            <strong>E{unlockedCode}/E12</strong>
          </button>
        </div>

        <article className="mobileCoeCard">
          <div className="mobileCoeHead">
            <span>COE</span>
            <strong>${formatCurrency(Math.abs(totalAsIs - totalToBe))}</strong>
            <div>
              <i />
              <small>COE AS IS</small>
              <b />
              <small>COE TO BE</small>
            </div>
          </div>
          <CanvaTrendChart coeAsIs={coeAsIs} coeToBe={coeToBe} progress={progress} />
        </article>

        <div className="mobileCoeMetricCards">
          <button type="button" onClick={() => setView("coe")}><i /><span>Total AS IS</span><strong>${formatCurrency(totalAsIs)}</strong></button>
          <button type="button" onClick={() => setView("coe")}><i /><span>COE mensual</span><strong>{Math.abs(coePercent).toFixed(0)}%</strong></button>
          <button type="button" onClick={() => setView("coe")}><i /><span>Total TO BE</span><strong>${formatCurrency(totalToBe)}</strong></button>
        </div>

        <article className="mobileMilestoneTable">
          <h3>Detalle de Avance Hitos</h3>
          <div className="mobileMilestoneTableHead">
            <span>ID</span><span>Nombre</span><span>Estado</span><span>Avance</span>
          </div>
          <div className="mobileMilestoneTableBody">
            {routeItems.map((item, index) => (
              <button type="button" key={`mobile-row-${item.id}`} onClick={() => setView("ruta")}>
                <span>E{item.id}</span>
                <strong>{item.title}</strong>
                <em className={isCompletedStatus(item.status) ? "done" : normalizeSystemName(item.status).includes("desarrollo") ? "active" : ""}>{item.status}</em>
                <span>{Number(milestones[index]?.progress) || (isCompletedStatus(item.status) ? 100 : 0)}%</span>
              </button>
            ))}
          </div>
        </article>

        <article className="mobileSystemProgress">
          <h3>Avances por sistema</h3>
          <div className="mobileSystemScroller">
            {systemMetrics.map((item) => (
              <button type="button" key={item.label} onClick={() => item.label === "Hallazgos" ? setView("hallazgos") : undefined}>
                <strong>{item.total}</strong>
                <span>{item.label}</span>
                <div className="mobileDonut" style={{ "--value": item.total ? Math.max(4, (item.value / item.total) * 100) : 0 }}>
                  <b>{item.value}</b>
                </div>
                <small>{item.note}</small>
              </button>
            ))}
          </div>
        </article>
      </div>

      {searchOpen && (
        <div className="mobileSearchOverlay">
          <div className="mobileSearchBar">
            <button type="button" onClick={() => setSearchOpen(false)}><ArrowRight size={22} /></button>
            <input value={mobileSearch} onChange={(event) => setMobileSearch(event.target.value)} autoFocus placeholder="Buscar..." />
            <button type="button"><Mic size={22} /></button>
          </div>
          <div className="mobileSearchResults">
            {(searchResults.length ? searchResults : quickItems).map((item, index) => (
              <button type="button" key={`${item.title || item.label}-${index}`} onClick={() => openResult(item)}>
                <Clock3 size={22} />
                <span>{item.title || item.label}</span>
                <small>{item.detail || item.type || "Abrir"}</small>
                <ArrowRight size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className={`mobileBottomNav ${showBottomNav ? "visible" : ""}`}>
        {quickItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView(item.view)}>
              <Icon size={18} />
              <span>{item.short}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function MobileRouteView({ milestones = [], deliverables = [], pending = [], setView, setSelectedDeliverable }) {
  const [routeSearchTerm, setRouteSearchTerm] = useState("");
  const [routeStatusFilter, setRouteStatusFilter] = useState("Todos");
  const [routeHitoFilter, setRouteHitoFilter] = useState("Todos");
  const [activeIndex, setActiveIndex] = useState(0);
  const [openPanel, setOpenPanel] = useState("");
  const [routeTouchStart, setRouteTouchStart] = useState(null);

  const statusOptions = useMemo(() => [...new Set(milestones.map((item) => item.status).filter(Boolean))], [milestones]);
  const hitoOptions = useMemo(() => milestones.map((item) => item.title).filter(Boolean), [milestones]);

  const statusCounts = useMemo(() => {
    return milestones.reduce((acc, milestone) => {
      const status = normalizeSystemName(milestone.status || "");
      if (status.includes("finalizado") || status.includes("aprobado") || status.includes("completado") || status.includes("terminado")) {
        acc.finished += 1;
      } else if (status.includes("desarrollo") || status.includes("progreso")) {
        acc.development += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    }, { finished: 0, pending: 0, development: 0 });
  }, [milestones]);

  const filteredMilestones = useMemo(() => {
    const query = normalizeSystemName(routeSearchTerm);
    return milestones.filter((item) => {
      const matchesStatus = routeStatusFilter === "Todos" || item.status === routeStatusFilter;
      const matchesHito = routeHitoFilter === "Todos" || item.title === routeHitoFilter;
      const searchable = normalizeSystemName([
        item.id,
        item.title,
        item.status,
        item.description,
        item.includesClient,
        item.includesGSE || item.includes,
      ].join(" "));
      return matchesStatus && matchesHito && (!query || searchable.includes(query));
    });
  }, [milestones, routeSearchTerm, routeStatusFilter, routeHitoFilter]);

  useEffect(() => {
    setActiveIndex(0);
    setOpenPanel("");
  }, [routeSearchTerm, routeStatusFilter, routeHitoFilter]);

  const activeMilestone = filteredMilestones[activeIndex] || filteredMilestones[0] || milestones[0] || {};
  const relatedDeliverables = deliverables.filter((item) =>
    normalizeSystemName(item.milestone).includes(normalizeSystemName(activeMilestone.title)) ||
    normalizeSystemName(activeMilestone.title).includes(normalizeSystemName(item.milestone))
  );
  const progress = Number(activeMilestone.progress) || (isCompletedStatus(activeMilestone.status) ? 100 : 0);
  const activePending = pending.filter(isPendingActive).length;
const total = Math.max(filteredMilestones.length, 1);
  const code = String(activeMilestone.id || activeIndex).replace(/^E/i, "");
  const date = activeMilestone.targetDate || activeMilestone.date || "Por definir";
  const statRows = [
    { label: "Finalizado", value: statusCounts.finished },
    { label: "Pendiente", value: statusCounts.pending },
    { label: "En desarrollo", value: statusCounts.development },
  ];
  const panels = [
    {
      key: "descripcion",
      label: "Descripción",
      text: formatSheetText(activeMilestone.description) || "Sin descripción registrada para este hito.",
    },
    {
      key: "cliente",
      label: "Incluye Cliente",
      text: formatSheetText(activeMilestone.includesClient) || "Sin información registrada para el cliente.",
    },
    {
      key: "entregables",
      label: "Entregables",
      text: relatedDeliverables.length
        ? relatedDeliverables.map((item) => item.deliverable || item.title).filter(Boolean).join("\n")
        : "Sin entregables registrados para este hito.",
    },
  ];

  const move = (direction) => {
    setOpenPanel("");
    setActiveIndex((current) => {
      if (!filteredMilestones.length) return 0;
      return (current + direction + filteredMilestones.length) % filteredMilestones.length;
    });
  };

  const finishSwipe = (clientX) => {
    if (routeTouchStart === null) return;
    const diff = routeTouchStart - clientX;
    if (Math.abs(diff) > 36) move(diff > 0 ? 1 : -1);
    setRouteTouchStart(null);
  };

  return (
    <section className="mobileRouteView">
      <div className="mobileRouteTopbar">
        <button type="button" onClick={() => setView("portal")}><ChevronLeft size={18} /> Atrás</button>
        <button type="button" onClick={() => setView("coe")}>Siguiente <ChevronRight size={18} /></button>
      </div>

      <header className="mobileRouteHero">
        <h1>Ruta del proyecto</h1>
        <label>
          <Search size={17} />
          <input value={routeSearchTerm} onChange={(event) => setRouteSearchTerm(event.target.value)} placeholder="Buscar" />
        </label>
      </header>

      <div className="mobileRouteBody">
        <div className="mobileRouteStatusCards">
          {statRows.map((item) => (
            <article key={item.label}>
              <i />
              <span>{item.label}</span>
              <strong><ChevronRight size={18} />{item.value}</strong>
            </article>
          ))}
        </div>

        <article className="mobileRouteTotalCard">
          <div><Flag size={32} /></div>
          <span>Total de Hitos</span>
          <strong><ChevronRight size={28} />{milestones.length}</strong>
        </article>

        <div className="mobileRouteFilters">
          <FilterSelect label="Estado" value={routeStatusFilter} onChange={setRouteStatusFilter} options={statusOptions} />
          <FilterSelect label="Hito" value={routeHitoFilter} onChange={setRouteHitoFilter} options={hitoOptions} />
        </div>

        <div
          className="mobileRouteCarousel"
          onTouchStart={(event) => setRouteTouchStart(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
        >
          <button className="mobileRouteArrow" type="button" onClick={() => move(-1)} aria-label="Hito anterior">
            <ChevronLeft size={30} />
          </button>

          <article className="mobileRouteMilestoneCard">
            <i className="mobileRouteAccent" />
            <div className="mobileRouteMilestoneHead">
              <div>
                <h2>E{code}: {activeMilestone.title || "Por definir"}</h2>
                <p><Clock3 size={13} /> Fecha: {date}</p>
              </div>
              <Badge status={activeMilestone.status || "Pendiente"}>{activeMilestone.status || "Pendiente"}</Badge>
            </div>

            <ProgressBar value={progress} />
            <div className="progressText">{progress}% de avance</div>

            <div className="mobileRouteAccordionButtons">
              {panels.map((panel) => (
                <button type="button" key={panel.key} onClick={() => setOpenPanel(openPanel === panel.key ? "" : panel.key)}>
                  {panel.label} <ChevronRight size={15} />
                </button>
              ))}
            </div>

            {openPanel && (
              <div className="mobileRouteAccordionPanel">
                <h3>{panels.find((panel) => panel.key === openPanel)?.label}</h3>
                {openPanel === "entregables" ? (
                  <div className="mobileRouteDeliverableList">
                    {relatedDeliverables.length ? relatedDeliverables.map((item, index) => {
                      const link = safeUrl(item.link || item.url || item.documentUrl);
                      const name = item.deliverable || item.title || `Entregable ${index + 1}`;
                      return (
                        <div className="mobileRouteDeliverableItem" key={`${name}-${index}`}>
                          <strong>{name}</strong>
                          {link && (
                            <a href={link} target="_blank" rel="noreferrer">
                              Abrir enlace <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      );
                    }) : <p>Sin entregables registrados para este hito.</p>}
                  </div>
                ) : (
                  <p>{panels.find((panel) => panel.key === openPanel)?.text}</p>
                )}
              </div>
            )}
          </article>

          <button className="mobileRouteArrow" type="button" onClick={() => move(1)} aria-label="Siguiente hito">
            <ChevronRight size={30} />
          </button>
        </div>

        {!filteredMilestones.length && <div className="mobileRouteEmpty">No hay hitos con esos filtros.</div>}
      </div>

      <nav className="mobileBottomNav visible">
        {[
          { label: "Inicio", view: "portal", icon: BarChart3 },
          { label: "Ruta", view: "ruta", icon: MapPin },
          { label: "COE", view: "coe", icon: Brain },
          { label: "Hallazgos", view: "hallazgos", icon: Search },
          { label: "Pendientes", view: "pendientes", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.view} onClick={() => setView(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.view === "pendientes" && activePending > 0 && <i>{activePending}</i>}
            </button>
          );
        })}
      </nav>
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

function getCachedLoginAssets() {
  try {
    return JSON.parse(window.localStorage.getItem("gseLoginAssets") || "null") || {};
  } catch {
    return {};
  }
}

function saveCachedLoginAssets(assets) {
  try {
    window.localStorage.setItem("gseLoginAssets", JSON.stringify(assets));
  } catch {
    // El login no debe fallar si el navegador bloquea localStorage.
  }
}

function ClientLogin({ onLogin }) {
  const storedSession = getStoredClientSession() || {};
  const cachedLoginAssets = getCachedLoginAssets();
  const loginAssetsUrl = import.meta.env.VITE_LOGIN_ASSETS_WEBHOOK_URL || "";
  const loginUrl = import.meta.env.VITE_LOGIN_WEBHOOK_URL || "";
  const localLoginEnabled = import.meta.env.DEV && String(import.meta.env.VITE_LOCAL_LOGIN_ENABLED || "").toLowerCase() === "true";
  const localLoginUser = import.meta.env.VITE_LOCAL_LOGIN_USER || "local";
  const localLoginPassword = import.meta.env.VITE_LOCAL_LOGIN_PASSWORD || "rivlocal2026";
  const localLoginSheetId = import.meta.env.VITE_LOCAL_LOGIN_SHEET_ID || "";
  const supportWhatsappUrl = safeUrl(import.meta.env.VITE_SUPPORT_WHATSAPP_URL || "");
  const [usuario, setUsuario] = useState(() => window.localStorage.getItem("gseRememberedUser") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(window.localStorage.getItem("gseRememberedUser")));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginAssets, setLoginAssets] = useState({
    logoGSEhorizontalColor: storedSession.logoGSEhorizontalColor || storedSession.LogoGSEhorizontalcolor || cachedLoginAssets.logoGSEhorizontalColor || cachedLoginAssets.LogoGSEhorizontalcolor || storedSession.logoGSEhorizontal || storedSession.logoGSE || import.meta.env.VITE_LOGIN_LOGO_HORIZONTAL_COLOR || import.meta.env.VITE_LOGIN_LOGO_HORIZONTAL || "",
    loginImage: storedSession.loginImage || storedSession.ImagenInicio || cachedLoginAssets.loginImage || cachedLoginAssets.ImagenInicio || import.meta.env.VITE_LOGIN_IMAGE || "",
  });

  useEffect(() => {
    const cleanUsuario = usuario.trim();
    if (!loginAssetsUrl) return;
    if (cleanUsuario.length === 1) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const separator = loginAssetsUrl.includes("?") ? "&" : "?";
        const query = cleanUsuario.length >= 2 ? `${separator}usuario=${encodeURIComponent(cleanUsuario)}` : "";
        const response = await fetch(`${loginAssetsUrl}${query}`, {
          method: "GET",
          signal: controller.signal,
        });
        const result = await response.json();
        const assets = result.loginAssets || result.assets || result.user || result || {};
        const nextAssets = {
          logoGSEhorizontalColor: assets.logoGSEhorizontalColor || assets.LogoGSEhorizontalcolor || assets.logoGSEHorizontalColor || assets.logo || "",
          loginImage: assets.loginImage || assets.ImagenInicio || assets.imagenInicio || assets.image || "",
        };
        if (nextAssets.logoGSEhorizontalColor || nextAssets.loginImage) {
          setLoginAssets((current) => {
            const mergedAssets = { ...current, ...nextAssets };
            saveCachedLoginAssets(mergedAssets);
            return mergedAssets;
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") console.warn("No se pudieron cargar los recursos visuales del login", error);
      }
    }, cleanUsuario ? 350 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [usuario, loginAssetsUrl]);

  const loginLogoUrl = getDrivePreviewUrl(loginAssets.logoGSEhorizontalColor);
  const loginImageUrl = getDrivePreviewUrl(loginAssets.loginImage);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const cleanUsuario = usuario.trim();
    const cleanPassword = password.trim();

    if (!cleanUsuario || !cleanPassword) {
      setMessage("Ingresa usuario y contraseña.");
      return;
    }

    if (localLoginEnabled && cleanUsuario.toLowerCase() === localLoginUser.toLowerCase() && cleanPassword === localLoginPassword) {
      if (!localLoginSheetId) {
        setMessage("Falta configurar VITE_LOCAL_LOGIN_SHEET_ID en .env.local.");
        return;
      }
      const session = {
        cliente: import.meta.env.VITE_LOCAL_LOGIN_CLIENTE || "Cliente local",
        usuario: cleanUsuario,
        sheetId: localLoginSheetId,
        nombre: import.meta.env.VITE_LOCAL_LOGIN_NOMBRE || "Usuario local",
        rol: import.meta.env.VITE_LOCAL_LOGIN_ROL || "Cliente",
        logoGSE: import.meta.env.VITE_LOCAL_LOGIN_LOGO || "",
        logoGSEhorizontal: import.meta.env.VITE_LOCAL_LOGIN_LOGO_HORIZONTAL || "",
        logoGSEhorizontalColor: import.meta.env.VITE_LOCAL_LOGIN_LOGO_HORIZONTAL_COLOR || "",
        loginImage: import.meta.env.VITE_LOCAL_LOGIN_IMAGE || "",
        localDev: true,
        loggedAt: new Date().toISOString(),
      };
      if (rememberMe) {
        window.localStorage.setItem("gseRememberedUser", cleanUsuario);
      } else {
        window.localStorage.removeItem("gseRememberedUser");
      }
      window.localStorage.setItem("gseClientSession", JSON.stringify(session));
      onLogin(session);
      return;
    }

    if (!loginUrl) {
      setMessage("Falta configurar VITE_LOGIN_WEBHOOK_URL en Vercel.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ usuario: cleanUsuario, password: cleanPassword }),
      });
      const result = await response.json();

      if (!response.ok || result.ok === false || !result.user?.sheetId) {
        throw new Error(result.message || "No se pudo iniciar sesión.");
      }

      const session = {
        ...result.user,
        logoGSEhorizontalColor: result.user.logoGSEhorizontalColor || loginAssets.logoGSEhorizontalColor || "",
        loginImage: result.user.loginImage || loginAssets.loginImage || "",
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
    <main className="loginShell loginSplitShell">
      <section className="loginPanel loginSplitPanel">
        <div className="loginBrandBlock loginBrandBlockVertical">
          {loginLogoUrl ? (
            <img src={loginLogoUrl} alt="GSE&CO" className="loginHorizontalLogo" />
          ) : (
            <div className="loginBrandMark">GSE&CO</div>
          )}
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
      <section className="loginVisualPanel" aria-hidden="true">
        {loginImageUrl ? (
          <img src={loginImageUrl} alt="" className="loginVisualImage" />
        ) : (
          <div className="loginVisualFallback" />
        )}
        <div className="loginVisualTint" />
      </section>
    </main>
  );
}

const INTERNAL_NOTES_KEY = "gseInternalProjectNotes";
const LOGIN_MASTER_SPREADSHEET_ID = "10cQa_lSzt3hxr5H5n-qYGeeP5lS-Ykk5rrC6ctNM2pY";

function readInternalStorage(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}

function writeInternalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function formatInternalNoteDate(value) {
  if (!value) return new Date().toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

function normalizeInternalNote(note = {}) {
  return {
    id: note.id || "",
    stamp: formatInternalNoteDate(note.fecha || note.stamp),
    text: note.observacion || note.text || "",
    user: note.usuario || "Equipo GSE",
    edited: Boolean(note.editado) && String(note.editado).toLowerCase() !== "no",
  };
}

async function postInternalNoteAction(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || result.ok === false) {
    throw new Error(result.message || "No se pudo guardar la observación.");
  }
  return result;
}

function parseInternalDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;
  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const fullYear = Number(year.length === 2 ? `20${year}` : year);
  const parsed = new Date(fullYear, Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isPaidCharge(charge = {}) {
  const status = normalizeSystemName(`${charge.paymentStatus || ""} ${charge.cutStatus || ""}`);
  return status.includes("pagado") || status.includes("cancelado") || status.includes("cobrado");
}

function getChargeDueDate(charge = {}) {
  if (!charge) return "";
  return charge.adjustedDueDate || charge.originalDueDate || "";
}

function getNextCharge(charges = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidates = charges
    .map((charge, index) => ({
      charge,
      index,
      parsedDate: parseInternalDate(getChargeDueDate(charge)),
      paid: isPaidCharge(charge),
    }))
    .filter((item) => item.charge);

  const unpaid = candidates.filter((item) => !item.paid);
  const withFutureDate = unpaid
    .filter((item) => item.parsedDate)
    .sort((a, b) => Math.abs(a.parsedDate - today) - Math.abs(b.parsedDate - today));

  return withFutureDate[0]?.charge || unpaid[0]?.charge || candidates[0]?.charge || null;
}

function summarizeInternalCharges(charges = []) {
  return charges.reduce((acc, charge) => {
    const status = normalizeSystemName(`${charge.paymentStatus || ""} ${charge.cutStatus || ""}`);
    if (status.includes("pagado") || status.includes("cobrado") || status.includes("cancelado")) {
      acc.paid += 1;
    } else if (status.includes("vencido") || status.includes("mora")) {
      acc.late += 1;
    } else {
      acc.pending += 1;
    }
    return acc;
  }, { paid: 0, pending: 0, late: 0 });
}

function splitInternalDeliverableTypes(value = "") {
  return String(value || "")
    .split(/[,;|\n\r]+/)
    .map((item) => item.trim())
    .filter((item) => item && !["-", "n/a", "no aplica", "ninguno", "0"].includes(normalizeSystemName(item)));
}

function summarizeClientDeliverables(findings = []) {
  const rows = findings.flatMap((item, findingIndex) => {
    const types = splitInternalDeliverableTypes(item.deliverableClient || "");
    return types.map((type, typeIndex) => ({
      ...item,
      rowKey: `${item.id || findingIndex}-${normalizeSystemName(type)}-${typeIndex}`,
      deliverableType: type,
    }));
  });
  const loaded = rows.filter((item) => isCheckedSheetValue(item.policyLoaded) || isCheckedSheetValue(item.procedureLoaded)).length;
  const policies = rows.filter((item) => normalizeSystemName(item.deliverableType).includes("politica")).length;
  const policiesLoaded = rows.filter((item) =>
    normalizeSystemName(item.deliverableType).includes("politica") &&
    (isCheckedSheetValue(item.policyLoaded) || isCheckedSheetValue(item.procedureLoaded))
  ).length;
  return {
    total: rows.length,
    loaded,
    pending: Math.max(0, rows.length - loaded),
    policies,
    policiesLoaded,
    policiesPending: Math.max(0, policies - policiesLoaded),
  };
}

function InternalMiniTrend({ values = [], mode = "line" }) {
  const cleanValues = values.length ? values.map((value) => Number(value) || 0) : [0];
  const max = Math.max(1, ...cleanValues);
  const min = Math.min(...cleanValues);
  const range = Math.max(1, max - min);
  const points = cleanValues.map((value, index) => {
    const x = cleanValues.length === 1 ? 50 : (index / (cleanValues.length - 1)) * 100;
    const y = 86 - ((value - min) / range) * 66;
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,90 ${line} 100,90`;

  if (mode === "bars") {
    const width = 100 / Math.max(1, cleanValues.length);
    return (
      <svg className="internalMiniTrend" viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true">
        {[20, 42, 64].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} />)}
        {cleanValues.map((value, index) => {
          const height = Math.max(6, (value / max) * 68);
          return <rect key={`${value}-${index}`} x={index * width + width * 0.18} y={88 - height} width={width * 0.56} height={height} rx="1.5" />;
        })}
      </svg>
    );
  }

  return (
    <svg className="internalMiniTrend" viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true">
      {[20, 42, 64].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} />)}
      <polygon points={area} />
      <polyline points={line} />
    </svg>
  );
}

function getInternalProjectSummary(entry = {}, data = {}) {
  const project = data.project || {};
  const milestones = data.milestones || [];
  const deliverables = data.deliverables || [];
  const meetings = data.meetings || [];
  const pending = data.pending || [];
  const charges = data.charges || [];
  const findings = data.findings || [];
  const nextCharge = getNextCharge(charges);
  const completed = milestones.filter((item) => isCompletedStatus(item.status)).length;
  const deliverableSummary = deliverables.reduce((acc, item) => {
    const status = normalizeSystemName(item.status || "");
    const overdue = normalizeSystemName(item.overdue || "");
    if (status.includes("finalizado") || status.includes("aprobado") || status.includes("terminado")) acc.finished += 1;
    else if (status.includes("desarrollo") || status.includes("progreso")) acc.inProgress += 1;
    else acc.pending += 1;
    if (overdue.includes("si") || overdue.includes("vencido")) acc.overdue += 1;
    return acc;
  }, { finished: 0, pending: 0, inProgress: 0, overdue: 0 });
  const progress = Number(project.progress) || (milestones.length ? Math.round((completed / milestones.length) * 100) : 0);
  const nextMeeting = meetings[0] || {};
  const activePending = pending.filter(isPendingActive).length;
  const paymentDate = getChargeDueDate(nextCharge) || project.paymentDate || entry.paymentDate || "Por definir";
  const clientDeliverables = summarizeClientDeliverables(findings);

  return {
    id: entry.id,
    sheetId: entry.sheetId,
    name: project.companyClient || project.client || entry.name || "Cliente sin nombre",
    logoGSEhorizontal: project.logoGSEhorizontal || "",
    logoGSEhorizontalColor: project.logoGSEhorizontalColor || project.logoGSEhorizontal || "",
    logoClient: project.logoClient || entry.logoClient || "",
    manager: entry.manager || project.responsibleClient || "Sin responsable",
    status: project.status || entry.status || "En seguimiento",
    service: project.service || entry.service || "Business Power",
    progress,
    completed,
    totalMilestones: milestones.length,
    activePending,
    nextStep: project.nextStep || "Por definir",
    nextDate: project.nextDate || nextMeeting.date || "Por definir",
    meetingTitle: nextMeeting.title || project.nextStep || "Próxima reunión",
    meetingDate: [nextMeeting.date, nextMeeting.time].filter(Boolean).join(" · ") || project.nextDate || "Por definir",
    meetingLink: safeUrl(nextMeeting.link) || safeUrl(project.linkMeet),
    paymentDate,
    paymentStatus: nextCharge?.paymentStatus || nextCharge?.cutStatus || project.paymentStatus || entry.paymentStatus || "Pendiente de registrar",
    paymentAmount: nextCharge?.value || project.paymentAmount || entry.paymentAmount || "",
    nextCharge,
    charges,
    deliverables,
    deliverableSummary,
    clientDeliverables,
    milestones,
    pending,
  };
}

function InternalProjectsPortal() {
  const internalNotesUrl = import.meta.env.VITE_INTERNAL_NOTES_WEBHOOK_URL || "";
  const internalWriteUrl = import.meta.env.VITE_INTERNAL_UPDATE_WEBHOOK_URL || internalNotesUrl;
  const [masterEntries, setMasterEntries] = useState([]);
  const [masterError, setMasterError] = useState("");
  const [notes, setNotes] = useState(() => readInternalStorage(INTERNAL_NOTES_KEY, {}));
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [internalActionMessage, setInternalActionMessage] = useState("");
  const [loaded, setLoaded] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [internalSection, setInternalSection] = useState("dashboard");
  const [selectedId, setSelectedId] = useState("");
  const [clientTab, setClientTab] = useState("cobros");
  const [query, setQuery] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  useEffect(() => {
    writeInternalStorage(INTERNAL_NOTES_KEY, notes);
  }, [notes]);

  useEffect(() => {
    let active = true;
    setLoadingMaster(true);
    setMasterError("");

    loadLoginMasterClients(LOGIN_MASTER_SPREADSHEET_ID)
      .then((clients) => {
        if (!active) return;
        setMasterEntries(clients);
        setSelectedId((current) => current || clients[0]?.id || "");
      })
      .catch((error) => {
        console.error(error);
        if (!active) return;
        setMasterEntries([]);
        setMasterError("No se pudo leer el Google Sheet maestro de login. Revisa que el Apps Script o la publicación permitan lectura de la lista interna.");
      })
      .finally(() => {
        if (active) setLoadingMaster(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allEntries = useMemo(() => {
    const bySheet = new Map();
    masterEntries.forEach((entry) => {
      if (!entry.sheetId) return;
      if (!bySheet.has(entry.sheetId)) {
        bySheet.set(entry.sheetId, entry);
        return;
      }
      const current = bySheet.get(entry.sheetId);
      bySheet.set(entry.sheetId, { ...entry, ...current, source: current.source || entry.source });
    });
    return Array.from(bySheet.values());
  }, [masterEntries]);

  useEffect(() => {
    if (!allEntries.length) {
      setLoaded({});
      return;
    }
    let active = true;
    setLoading(true);

    Promise.all(allEntries.map(async (entry) => {
      try {
        const data = await loadSheetDataForSpreadsheetId(entry.sheetId);
        return [entry.id, { data, error: "" }];
      } catch (error) {
        return [entry.id, { data: null, error: "No se pudo leer este Sheet. Revisa permisos/publicación y nombres de pestañas." }];
      }
    })).then((results) => {
      if (!active) return;
      setLoaded(Object.fromEntries(results));
      setSelectedId((current) => current || results[0]?.[0] || "");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [allEntries]);

  const summaries = useMemo(() => allEntries.map((entry) => {
    const state = loaded[entry.id] || {};
    return {
      entry,
      error: state.error || "",
      summary: getInternalProjectSummary(entry, state.data || {}),
    };
  }), [allEntries, loaded]);

  const filteredSummaries = useMemo(() => {
    const needle = normalizeSystemName(query);
    if (!needle) return summaries;
    return summaries.filter(({ summary }) => normalizeSystemName([
      summary.name,
      summary.manager,
      summary.status,
      summary.service,
      summary.nextStep,
      summary.name,
      summary.paymentStatus,
      summary.paymentDate,
    ].join(" ")).includes(needle));
  }, [query, summaries]);

  const selected = summaries.find((item) => item.entry.id === selectedId) || summaries[0];
  const selectedSummary = selected?.summary;
  const selectedNotes = selectedSummary ? notes[selectedSummary.id] || [] : [];
  const selectedChargeDashboard = summarizeInternalCharges(selectedSummary?.charges || []);
  const selectedDeliverableTotal = selectedSummary
    ? selectedSummary.deliverableSummary.finished + selectedSummary.deliverableSummary.inProgress + selectedSummary.deliverableSummary.pending
    : 0;
  const selectedMilestonePct = selectedSummary?.totalMilestones
    ? Math.round((selectedSummary.completed / selectedSummary.totalMilestones) * 100)
    : 0;

  useEffect(() => {
    if (!selectedSummary) return;
    cancelEditNote();
    setNoteMessage("");

    if (!internalNotesUrl) {
      setNoteMessage("Observaciones en modo local: falta configurar VITE_INTERNAL_NOTES_WEBHOOK_URL.");
      return;
    }

    let active = true;
    setNotesLoading(true);
    const separator = internalNotesUrl.includes("?") ? "&" : "?";
    fetch(`${internalNotesUrl}${separator}action=listNotes&sheetId=${encodeURIComponent(selectedSummary.sheetId)}`, { method: "GET" })
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        if (result.ok === false) throw new Error(result.message || "No se pudieron leer las observaciones.");
        const nextNotes = (result.notes || []).map(normalizeInternalNote);
        setNotes((current) => ({ ...current, [selectedSummary.id]: nextNotes }));
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        setNoteMessage(error.message || "No se pudieron leer las observaciones del Sheet.");
      })
      .finally(() => {
        if (active) setNotesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSummary?.id, selectedSummary?.sheetId, internalNotesUrl]);

  const totals = summaries.reduce((acc, item) => {
    acc.projects += 1;
    acc.progress += item.summary.progress;
    acc.pending += item.summary.activePending;
    acc.deliverables += item.summary.deliverables.length;
    acc.charges += item.summary.charges.length;
    acc.milestones += item.summary.totalMilestones;
    acc.completedMilestones += item.summary.completed;
    return acc;
  }, { projects: 0, progress: 0, pending: 0, deliverables: 0, charges: 0, milestones: 0, completedMilestones: 0 });
  const averageProgress = totals.projects ? Math.round(totals.progress / totals.projects) : 0;
  const dashboard = summaries.reduce((acc, item) => {
    const summary = item.summary;
    acc.finishedDeliverables += summary.deliverableSummary.finished;
    acc.pendingDeliverables += summary.deliverableSummary.pending;
    acc.inProgressDeliverables += summary.deliverableSummary.inProgress;
    acc.overdueDeliverables += summary.deliverableSummary.overdue;
    const chargeSummary = summarizeInternalCharges(summary.charges);
    acc.paidCharges += chargeSummary.paid;
    acc.pendingCharges += chargeSummary.pending;
    acc.lateCharges += chargeSummary.late;
    acc.clientDeliverables += summary.clientDeliverables.total;
    acc.clientDeliverablesLoaded += summary.clientDeliverables.loaded;
    acc.policies += summary.clientDeliverables.policies;
    acc.policiesLoaded += summary.clientDeliverables.policiesLoaded;
    return acc;
  }, {
    finishedDeliverables: 0,
    pendingDeliverables: 0,
    inProgressDeliverables: 0,
    overdueDeliverables: 0,
    paidCharges: 0,
    pendingCharges: 0,
    lateCharges: 0,
    clientDeliverables: 0,
    clientDeliverablesLoaded: 0,
    policies: 0,
    policiesLoaded: 0,
  });
  const deliverableTotal = dashboard.finishedDeliverables + dashboard.pendingDeliverables + dashboard.inProgressDeliverables;
  const chargeTotal = dashboard.paidCharges + dashboard.pendingCharges + dashboard.lateCharges;
  const finishedPct = deliverableTotal ? Math.round((dashboard.finishedDeliverables / deliverableTotal) * 100) : 0;
  const pendingPct = deliverableTotal ? Math.round((dashboard.pendingDeliverables / deliverableTotal) * 100) : 0;
  const progressPct = deliverableTotal ? Math.max(0, 100 - finishedPct - pendingPct) : 0;
  const paidChargePct = chargeTotal ? Math.round((dashboard.paidCharges / chargeTotal) * 100) : 0;
  const pendingChargePct = chargeTotal ? Math.round((dashboard.pendingCharges / chargeTotal) * 100) : 0;
  const clientDeliverablesLoadedPct = dashboard.clientDeliverables ? Math.round((dashboard.clientDeliverablesLoaded / dashboard.clientDeliverables) * 100) : 0;
  const clientDeliverableMix = summaries
    .map(({ summary }) => ({
      id: summary.id,
      name: summary.name,
      finished: summary.deliverableSummary.finished,
      inProgress: summary.deliverableSummary.inProgress,
      pending: summary.deliverableSummary.pending,
      total: summary.deliverableSummary.finished + summary.deliverableSummary.inProgress + summary.deliverableSummary.pending,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const progressTrend = summaries.map(({ summary }) => summary.progress);
  const pendingTrend = summaries.map(({ summary }) => summary.activePending);
  const chargeTrend = summaries.map(({ summary }) => summary.charges.length);
  const uploadedTrend = summaries.map(({ summary }) => summary.clientDeliverables.loaded);
  const dashboardRows = summaries
    .map(({ summary }) => ({
      id: summary.id,
      name: summary.name,
      progress: summary.progress,
      pendingClient: summary.activePending,
      finished: summary.deliverableSummary.finished,
      inProgress: summary.deliverableSummary.inProgress,
      pendingGse: summary.deliverableSummary.pending,
      chargesPending: summarizeInternalCharges(summary.charges).pending,
    }))
    .sort((a, b) => b.pendingClient + b.pendingGse - (a.pendingClient + a.pendingGse))
    .slice(0, 8);
  const internalLogoUrl = selectedSummary?.logoGSEhorizontalColor || selectedSummary?.logoGSEhorizontal || summaries.find((item) => item.summary.logoGSEhorizontalColor || item.summary.logoGSEhorizontal)?.summary.logoGSEhorizontalColor || summaries.find((item) => item.summary.logoGSEhorizontal)?.summary.logoGSEhorizontal || "";

  const reloadInternalClient = async (summary) => {
    if (!summary?.sheetId || !summary?.id) return;
    const data = await loadSheetDataForSpreadsheetId(summary.sheetId);
    setLoaded((current) => ({
      ...current,
      [summary.id]: { data, error: "" },
    }));
  };

  const updateInternalSheetCell = async ({ sheetName, rowNumber, columnName, value }) => {
    if (!selectedSummary) return;
    if (!internalWriteUrl) {
      setInternalActionMessage("Falta configurar VITE_INTERNAL_UPDATE_WEBHOOK_URL para guardar en Google Sheets.");
      return;
    }
    if (!rowNumber) {
      setInternalActionMessage("No se encontró la fila exacta en el Sheet. Actualiza el maestro e intenta de nuevo.");
      return;
    }
    try {
      setInternalActionMessage("Guardando cambio...");
      await postInternalNoteAction(internalWriteUrl, {
        action: "updateCell",
        sheetId: selectedSummary.sheetId,
        sheetName,
        rowNumber,
        columnName,
        value,
        usuario: "Equipo GSE",
      });
      await reloadInternalClient(selectedSummary);
      setInternalActionMessage("Cambio guardado en Google Sheets.");
    } catch (error) {
      console.error(error);
      setInternalActionMessage(error.message || "No se pudo guardar el cambio en Google Sheets.");
    }
  };

  const cycleDeliverableStatus = (item) => {
    const current = normalizeSystemName(item.status || "");
    const next = current.includes("finalizado") || current.includes("aprobado") || current.includes("terminado")
      ? "En desarrollo"
      : current.includes("desarrollo") || current.includes("progreso")
        ? "Pendiente"
        : "Finalizado";
    updateInternalSheetCell({ sheetName: "Entregables", rowNumber: item.rowNumber, columnName: "Estado", value: next });
  };

  const toggleDeliverableOverdue = (item) => {
    const current = normalizeSystemName(item.overdue || "");
    const next = current.includes("si") || current.includes("vencido") ? "No" : "Si";
    updateInternalSheetCell({ sheetName: "Entregables", rowNumber: item.rowNumber, columnName: "Vencido", value: next });
  };

  const updateDeliverableLink = (item) => {
    const next = window.prompt("Pega el link del entregable:", item.link || "");
    if (next === null) return;
    updateInternalSheetCell({ sheetName: "Entregables", rowNumber: item.rowNumber, columnName: "Link", value: next.trim() });
  };

  const cycleChargeStatus = (charge) => {
    const current = normalizeSystemName(charge.paymentStatus || charge.cutStatus || "");
    const next = current.includes("pagado") || current.includes("cobrado") || current.includes("cancelado")
      ? "Vencido"
      : current.includes("vencido") || current.includes("mora")
        ? "Sin estado"
        : current.includes("pendiente")
          ? "Pagado"
          : "Pendiente";
    updateInternalSheetCell({ sheetName: "Cobros", rowNumber: charge.rowNumber, columnName: "Estado pago", value: next });
  };

  const refreshMaster = () => {
    setLoadingMaster(true);
    setMasterError("");
    loadLoginMasterClients(LOGIN_MASTER_SPREADSHEET_ID)
      .then((clients) => {
        setMasterEntries(clients);
        setSelectedId((current) => current || clients[0]?.id || "");
      })
      .catch((error) => {
        console.error(error);
        setMasterError("No se pudo leer el Google Sheet maestro de login.");
      })
      .finally(() => setLoadingMaster(false));
  };

  const addNote = async () => {
    const clean = noteDraft.trim();
    if (!clean || !selectedSummary) return;
    const stamp = new Date().toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });

    if (internalNotesUrl) {
      try {
        setNoteMessage("");
        const result = await postInternalNoteAction(internalNotesUrl, {
          action: "addNote",
          sheetId: selectedSummary.sheetId,
          usuario: "Equipo GSE",
          observacion: clean,
        });
        const nextNote = normalizeInternalNote(result.note || { observacion: clean, fecha: new Date(), usuario: "Equipo GSE" });
        setNotes((current) => ({
          ...current,
          [selectedSummary.id]: [nextNote, ...(current[selectedSummary.id] || [])],
        }));
        setNoteDraft("");
      } catch (error) {
        console.error(error);
        setNoteMessage(error.message || "No se pudo guardar la observación.");
      }
      return;
    }

    setNotes((current) => ({
      ...current,
      [selectedSummary.id]: [{ text: clean, stamp }, ...(current[selectedSummary.id] || [])],
    }));
    setNoteDraft("");
  };

  const startEditNote = (index, text) => {
    setEditingNoteIndex(index);
    setEditingNoteText(text || "");
  };

  const cancelEditNote = () => {
    setEditingNoteIndex(null);
    setEditingNoteText("");
  };

  const saveEditedNote = async (index) => {
    const clean = editingNoteText.trim();
    if (!clean || !selectedSummary) return;
    const note = selectedNotes[index];

    if (internalNotesUrl) {
      if (!note?.id) {
        setNoteMessage("Esta observación no tiene ID en el Sheet. Crea una nueva observación para poder editarla.");
        return;
      }
      try {
        setNoteMessage("");
        await postInternalNoteAction(internalNotesUrl, {
          action: "editNote",
          sheetId: selectedSummary.sheetId,
          id: note.id,
          observacion: clean,
        });
      } catch (error) {
        console.error(error);
        setNoteMessage(error.message || "No se pudo editar la observación.");
        return;
      }
    }

    setNotes((current) => ({
      ...current,
      [selectedSummary.id]: (current[selectedSummary.id] || []).map((note, noteIndex) =>
        noteIndex === index ? { ...note, text: clean, edited: true } : note
      ),
    }));
    cancelEditNote();
  };

  const deleteNote = async (index) => {
    if (!selectedSummary) return;
    const note = selectedNotes[index];

    if (internalNotesUrl) {
      if (!note?.id) {
        setNoteMessage("Esta observación no tiene ID en el Sheet. No se puede cerrar desde la app.");
        return;
      }
      try {
        setNoteMessage("");
        await postInternalNoteAction(internalNotesUrl, {
          action: "closeNote",
          sheetId: selectedSummary.sheetId,
          id: note.id,
        });
      } catch (error) {
        console.error(error);
        setNoteMessage(error.message || "No se pudo cerrar la observación.");
        return;
      }
    }

    setNotes((current) => ({
      ...current,
      [selectedSummary.id]: (current[selectedSummary.id] || []).filter((_, noteIndex) => noteIndex !== index),
    }));
    if (editingNoteIndex === index) cancelEditNote();
  };

  const openClientRiv = (summary) => {
    window.localStorage.setItem("gseClientSession", JSON.stringify({
      sheetId: summary.sheetId,
      cliente: summary.name,
      usuario: "Equipo GSE",
      interno: true,
    }));
    window.location.href = "/";
  };

  return (
    <main className="internalPortal">
      <aside className="internalNavShell">
        <div className="internalNavBrand">
          <Logo
            src={getDrivePreviewUrl(internalLogoUrl)}
            fallback="GSE Corporate"
            className="internalBrandLogo"
          />
        </div>
        <nav className="internalNavMenu" aria-label="Navegación NIV">
          <button type="button" className={internalSection === "dashboard" ? "active" : ""} onClick={() => setInternalSection("dashboard")}><BarChart3 size={16} /> Dashboard</button>
          <button type="button" className={internalSection === "clientes" ? "active" : ""} onClick={() => setInternalSection("clientes")}><Building2 size={16} /> Clientes</button>
        </nav>
        <div className="internalNavFoot">
          <span>Portal interno GSE</span>
          <small>Gestión de proyectos</small>
        </div>
      </aside>

      <div className="internalMainShell">
      <header className="internalHeader">
        <div>
          <h1>NIV</h1>
          <p className="internalHeaderSubtitle">Núcleo Interno Visible para colaboradores</p>
        </div>
        <div className="internalHeaderActions">
          <button type="button" className="internalGhostLink" onClick={refreshMaster}>Actualizar maestro</button>
          <a href="/" className="internalGhostLink">Volver al RIV</a>
        </div>
      </header>

      {internalSection === "dashboard" && (
      <section className="internalExecutiveDashboard" id="dashboard" aria-label="Dashboard NIV">
        <div className="internalDashboardBand">General</div>
        <div className="internalOverviewCards">
          <article className="internalOverviewCard" data-tip="Promedio del avance general reportado en los RIV de todos los clientes.">
            <span>Avance promedio total</span>
            <strong>{averageProgress}%</strong>
            <div className="internalOverviewTrack"><i style={{ width: `${averageProgress}%` }} /></div>
            <div className="internalOverviewStats">
              <p><b>{totals.projects}</b><small>clientes activos</small></p>
              <p><b>{totals.completedMilestones}/{totals.milestones}</b><small>hitos completados</small></p>
            </div>
          </article>
          <article className="internalOverviewCard" data-tip="Entregables GSE marcados como finalizados, en desarrollo o pendientes.">
            <span>Entregables GSE</span>
            <strong>{deliverableTotal}</strong>
            <div className="internalStackedChart">
              <i className="done" style={{ width: `${finishedPct}%` }} />
              <i className="inProgress" style={{ width: `${progressPct}%` }} />
              <i className="pending" style={{ width: `${pendingPct}%` }} />
            </div>
            <div className="internalOverviewStats three">
              <p><b>{dashboard.finishedDeliverables}</b><small>finalizados</small></p>
              <p><b>{dashboard.inProgressDeliverables}</b><small>en desarrollo</small></p>
              <p><b>{dashboard.pendingDeliverables}</b><small>pendientes</small></p>
            </div>
          </article>
          <article className="internalOverviewCard" data-tip="Cobros registrados en las pestañas Cobros de los clientes.">
            <span>Cobros registrados</span>
            <strong>{chargeTotal}</strong>
            <div className="internalOverviewStats three">
              <p><b>{dashboard.paidCharges}</b><small>pagados</small></p>
              <p><b>{dashboard.pendingCharges}</b><small>pendientes</small></p>
              <p><b>{dashboard.lateCharges}</b><small>vencidos</small></p>
            </div>
            <div className="internalOverviewTrack split">
              <i className="paid" style={{ width: `${paidChargePct}%` }} />
              <i className="pending" style={{ width: `${pendingChargePct}%` }} />
            </div>
          </article>
          <article className="internalOverviewCard" data-tip="Entregables solicitados al cliente y marcados como cargados.">
            <span>Entregables subidos</span>
            <strong>{clientDeliverablesLoadedPct}%</strong>
            <div className="internalOverviewTrack"><i style={{ width: `${clientDeliverablesLoadedPct}%` }} /></div>
            <div className="internalOverviewStats">
              <p><b>{dashboard.clientDeliverablesLoaded}</b><small>cargadas</small></p>
              <p><b>{Math.max(0, dashboard.clientDeliverables - dashboard.clientDeliverablesLoaded)}</b><small>pendientes</small></p>
            </div>
          </article>
        </div>

        <div className="internalDashboardBand">Gestión de proyectos</div>
        <div className="internalExecutiveGrid">
          <article className="internalExecutivePanel wide" data-tip="Muestra por cliente cuántos entregables GSE están finalizados, en desarrollo o pendientes. El total al lado derecho es la cantidad de entregables registrados para ese cliente.">
            <div className="internalChartTitle">
              <h2>Entregables por cliente</h2>
              <span>estado operativo</span>
            </div>
            <div className="internalBarChart mix">
              {clientDeliverableMix.map((item) => {
                const total = Math.max(1, item.total);
                return (
                  <div className="internalBarRow mix" key={item.id}>
                    <span>{item.name}</span>
                    <i>
                      <em tabIndex="0" className="done" data-tip={`${item.finished}`} style={{ left: 0, width: `${(item.finished / total) * 100}%` }} />
                      <em tabIndex="0" className="inProgress" data-tip={`${item.inProgress}`} style={{ left: `${(item.finished / total) * 100}%`, width: `${(item.inProgress / total) * 100}%` }} />
                      <em tabIndex="0" className="pending" data-tip={`${item.pending}`} style={{ left: `${((item.finished + item.inProgress) / total) * 100}%`, width: `${(item.pending / total) * 100}%` }} />
                    </i>
                    <small>{item.total}</small>
                  </div>
                );
              })}
              {!clientDeliverableMix.length && <p className="internalEmpty compact">Sin clientes cargados todavía.</p>}
            </div>
            <div className="internalChartLegend compact inline">
              <span><i className="done" /> Finalizados</span>
              <span><i className="inProgress" /> En desarrollo</span>
              <span><i className="pending" /> Pendientes</span>
            </div>
          </article>

          <article className="internalExecutivePanel">
            <div className="internalChartTitle">
              <h2>Entregables subidos</h2>
              <span>Total {dashboard.clientDeliverables}</span>
            </div>
            <div className="internalStatusBars">
              <article>
                <div><span>Cargadas</span><strong>{dashboard.clientDeliverablesLoaded}</strong></div>
                <i><em className="done" style={{ width: `${clientDeliverablesLoadedPct}%` }} /></i>
                <small>{clientDeliverablesLoadedPct}%</small>
              </article>
              <article>
                <div><span>Pendientes</span><strong>{Math.max(0, dashboard.clientDeliverables - dashboard.clientDeliverablesLoaded)}</strong></div>
                <i><em className="pending" style={{ width: `${dashboard.clientDeliverables ? Math.max(0, 100 - clientDeliverablesLoadedPct) : 0}%` }} /></i>
                <small>{dashboard.clientDeliverables ? Math.max(0, 100 - clientDeliverablesLoadedPct) : 0}%</small>
              </article>
            </div>
          </article>

          <article className="internalExecutivePanel donutPanel">
            <div className="internalChartTitle">
              <h2>Cobros</h2>
              <span>{chargeTotal} registros</span>
            </div>
            <div
              className="internalDonutChart"
              style={{
                "--paid-end": `${paidChargePct}%`,
                "--pending-end": `${Math.min(100, paidChargePct + pendingChargePct)}%`,
              }}
            >
              <b>{chargeTotal}</b>
              <small>cobros</small>
            </div>
            <div className="internalChartLegend compact">
              <span><i className="done" /> Pagados {dashboard.paidCharges}</span>
              <span><i className="inProgress" /> Pendientes {dashboard.pendingCharges}</span>
              <span><i className="pending" /> Vencidos {dashboard.lateCharges}</span>
            </div>
          </article>
        </div>

        <article className="internalDashboardTablePanel">
          <div className="internalChartTitle">
            <h2>Resumen por cliente</h2>
            <span>{dashboardRows.length} visibles</span>
          </div>
          <div className="internalDashboardTable">
            <div className="internalDashboardTableHead">
              <span data-tip="Nombre del cliente conectado desde el Google Sheet maestro.">Cliente</span>
              <span data-tip="Promedio de avance general leído desde el RIV del cliente.">Avance</span>
              <span data-tip="Pendientes abiertos que dependen del cliente.">Pend. cliente</span>
              <span data-tip="Entregables GSE marcados como finalizados.">Finalizados</span>
              <span data-tip="Entregables GSE que están en desarrollo.">En desarrollo</span>
              <span data-tip="Entregables GSE pendientes por completar.">Pend. GSE</span>
              <span data-tip="Cobros que no están marcados como pagados.">Cobros pend.</span>
            </div>
            {dashboardRows.map((row) => (
              <div className="internalDashboardTableRow" key={row.id}>
                <span>{row.name}</span>
                <strong>{row.progress}%</strong>
                <span>{row.pendingClient}</span>
                <span>{row.finished}</span>
                <span>{row.inProgress}</span>
                <span>{row.pendingGse}</span>
                <span>{row.chargesPending}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
      )}

      {internalSection === "clientes" && (
      <section className="internalWorkspace" id="clientes">
        <aside className="internalSidePanel">
          <label className="internalSearch">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, proyecto o responsable" />
          </label>
          {(loadingMaster || masterError) && (
            <div className={masterError ? "internalError compact" : "internalNotice compact"}>
              {loadingMaster ? "Leyendo clientes desde el maestro de login..." : masterError}
            </div>
          )}

          <div className="internalProjectList">
            {filteredSummaries.map(({ entry, summary, error }) => (
              <button
                type="button"
                key={entry.id}
                className={selectedId === entry.id ? "active" : ""}
                onClick={() => setSelectedId(entry.id)}
              >
                <Logo src={summary.logoClient} fallback={(summary.name || "CL").slice(0, 2)} className="internalClientCardLogo" />
                <span>{summary.name}</span>
                <strong>{error ? "Revisar conexión" : `${summary.progress}%`}</strong>
                <small>{summary.manager} · {entry.source === "master" ? "Maestro login" : "Manual"}</small>
              </button>
            ))}
            {!allEntries.length && <p className="internalEmpty">No se encontraron clientes en el maestro todavía.</p>}
            {allEntries.length > 0 && !filteredSummaries.length && <p className="internalEmpty">No hay clientes con ese filtro.</p>}
          </div>
        </aside>

        <section className="internalDetail">
          {loading && <div className="internalNotice">Cargando información desde Google Sheets...</div>}

          {!selectedSummary && (
            <div className="internalBlank">
              <LockKeyhole size={34} />
              <h2>Panel interno listo</h2>
              <p>Conecta uno o varios Sheets de clientes para ver avance, reuniones, cobros, entregables y observaciones internas.</p>
            </div>
          )}

          {selectedSummary && (
            <>
              <div className="internalClientHero">
                <Logo src={selectedSummary.logoClient} fallback={(selectedSummary.name || "CL").slice(0, 2)} className="internalHeroLogo" />
                <div>
                  <span>{selectedSummary.service}</span>
                  <h2>{selectedSummary.name}</h2>
                  <p>{selectedSummary.manager} · {selectedSummary.status}</p>
                </div>
                <div className="internalProgressDial" style={{ "--progress": `${selectedSummary.progress}%` }}>
                  <strong>{selectedSummary.progress}%</strong>
                  <span>avance</span>
                </div>
              </div>

              <section className="internalClientDashboard">
                <div className="internalClientKpis">
                  <article data-tip="Avance general de este cliente según su RIV."><BarChart3 size={18} /><span>Avance</span><strong>{selectedSummary.progress}%</strong></article>
                  <article data-tip="Hitos completados frente al total de hitos de este cliente."><Flag size={18} /><span>Hitos</span><strong>{selectedSummary.completed}/{selectedSummary.totalMilestones || 0}</strong><small>{selectedMilestonePct}% cerrado</small></article>
                  <article data-tip="Pendientes abiertos que dependen del cliente."><AlertTriangle size={18} /><span>Pendientes cliente</span><strong>{selectedSummary.activePending}</strong></article>
                  <article data-tip="Cobros de este cliente que no aparecen como pagados."><Clock3 size={18} /><span>Cobros pendientes</span><strong>{selectedChargeDashboard.pending}</strong></article>
                </div>
                <div className="internalClientCharts">
                  <article className="internalClientChart" data-tip="Estado de los entregables GSE del cliente seleccionado.">
                    <div className="internalChartTitle">
                      <h2>Entregables del cliente</h2>
                      <span>{selectedDeliverableTotal} total</span>
                    </div>
                    <div className="internalStackedChart client">
                      <i tabIndex="0" className="done" data-tip={`${selectedSummary.deliverableSummary.finished}`} style={{ left: 0, width: `${selectedDeliverableTotal ? (selectedSummary.deliverableSummary.finished / selectedDeliverableTotal) * 100 : 0}%` }} />
                      <i tabIndex="0" className="inProgress" data-tip={`${selectedSummary.deliverableSummary.inProgress}`} style={{ left: `${selectedDeliverableTotal ? (selectedSummary.deliverableSummary.finished / selectedDeliverableTotal) * 100 : 0}%`, width: `${selectedDeliverableTotal ? (selectedSummary.deliverableSummary.inProgress / selectedDeliverableTotal) * 100 : 0}%` }} />
                      <i tabIndex="0" className="pending" data-tip={`${selectedSummary.deliverableSummary.pending}`} style={{ left: `${selectedDeliverableTotal ? ((selectedSummary.deliverableSummary.finished + selectedSummary.deliverableSummary.inProgress) / selectedDeliverableTotal) * 100 : 0}%`, width: `${selectedDeliverableTotal ? (selectedSummary.deliverableSummary.pending / selectedDeliverableTotal) * 100 : 0}%` }} />
                    </div>
                    <div className="internalChartLegend inline">
                      <span><i className="done" /> Finalizados {selectedSummary.deliverableSummary.finished}</span>
                      <span><i className="inProgress" /> En desarrollo {selectedSummary.deliverableSummary.inProgress}</span>
                      <span><i className="pending" /> Pendientes {selectedSummary.deliverableSummary.pending}</span>
                    </div>
                  </article>
                  <article className="internalClientChart" data-tip="Estado de pagos del cliente seleccionado.">
                    <div className="internalChartTitle">
                      <h2>Cobros del cliente</h2>
                      <span>{selectedSummary.charges.length} registros</span>
                    </div>
                    <div className="internalChartLegend inline">
                      <span><i className="done" /> Pagados {selectedChargeDashboard.paid}</span>
                      <span><i className="inProgress" /> Pendientes {selectedChargeDashboard.pending}</span>
                      <span><i className="pending" /> Vencidos {selectedChargeDashboard.late}</span>
                    </div>
                  </article>
                </div>
              </section>

              {selected?.error && <div className="internalError">{selected.error}</div>}

              <div className="internalInfoGrid">
                <article>
                  <CalendarDays size={19} />
                  <span>Siguiente reunión</span>
                  <strong>{selectedSummary.meetingDate}</strong>
                  <p>{selectedSummary.meetingTitle}</p>
                  {selectedSummary.meetingLink && <a href={selectedSummary.meetingLink} target="_blank" rel="noreferrer">Abrir reunión</a>}
                </article>
                <article>
                  <Flag size={19} />
                  <span>Próximo paso</span>
                  <strong>{selectedSummary.nextDate}</strong>
                  <p>{selectedSummary.nextStep}</p>
                </article>
                <article>
                  <Clock3 size={19} />
                  <span>Próximo cobro</span>
                  <strong>{selectedSummary.paymentDate}</strong>
                  <p>{[selectedSummary.paymentStatus, selectedSummary.paymentAmount].filter(Boolean).join(" · ")}</p>
                </article>
                <article>
                  <Target size={19} />
                  <span>Ruta</span>
                  <strong>{selectedSummary.completed}/{selectedSummary.totalMilestones || 0}</strong>
                  <p>Hitos completados</p>
                </article>
              </div>

              <nav className="internalClientTabs" aria-label="Detalle del cliente">
                <button type="button" className={clientTab === "cobros" ? "active" : ""} onClick={() => setClientTab("cobros")}><Clock3 size={16} /> Cobros</button>
                <button type="button" className={clientTab === "entregables" ? "active" : ""} onClick={() => setClientTab("entregables")}><FileText size={16} /> Entregables</button>
                <button type="button" className={clientTab === "observaciones" ? "active" : ""} onClick={() => setClientTab("observaciones")}><MessageCircle size={16} /> Observaciones</button>
              </nav>

              {clientTab === "cobros" && (
                <section className="internalChargePanel">
                  <div className="internalSectionHead">
                    <h3>Seguimiento de cobro</h3>
                  </div>
                  {internalActionMessage && <p className="internalActionMessage">{internalActionMessage}</p>}
                  {selectedSummary.charges.length > 0 ? (
                    <div className="internalChargeMatrix">
                      <div className="internalChargeHead">
                        <span>Pago</span>
                        <span>Estado</span>
                        <span>Fecha pago</span>
                        <span>Fecha pago actual</span>
                        <span>Días vencimiento</span>
                        <span>Recordatorios</span>
                      </div>
                      <div className="internalChargeBody">
                        {selectedSummary.charges.map((charge, index) => {
                          const chargeStatus = normalizeSystemName(charge.paymentStatus || charge.cutStatus || "");
                          const chargeClass = chargeStatus.includes("pagado") || chargeStatus.includes("cobrado") || chargeStatus.includes("cancelado")
                            ? "paid"
                            : chargeStatus.includes("vencido") || chargeStatus.includes("mora")
                              ? "late"
                              : "pending";
                          return (
                            <article key={`${charge.id || charge.payment}-${index}`}>
                              <strong>{charge.payment || `Pago ${index + 1}`}</strong>
                              <button type="button" className={`internalTableButton ${chargeClass}`} onClick={() => cycleChargeStatus(charge)}>{charge.paymentStatus || charge.cutStatus || "Sin estado"}</button>
                              <span>{charge.originalDueDate || "Sin fecha"}</span>
                              <span>{charge.adjustedDueDate || "Sin ajuste"}</span>
                              <span>{charge.daysDue || "Sin cálculo"}</span>
                              <p>
                                <b>5 días:</b> {charge.reminder5Days || "Sin fecha"}<br />
                                <b>24 h:</b> {charge.reminder24Hours || "Sin fecha"}<br />
                                <b>Vence:</b> {charge.dueDayMessage || "Sin fecha"}<br />
                                <b>+24 h:</b> {charge.after24HoursMessage || "Sin fecha"}<br />
                                <b>+72 h:</b> {charge.after72HoursMessage || "Sin fecha"}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="internalEmpty">No hay cobros registrados en el Sheet del cliente.</p>
                  )}
                </section>
              )}

              {clientTab === "entregables" && (
              <div className="internalSplit">
                <section className="internalDeliverablesPanel">
                  <div className="internalSectionHead">
                    <h3>Entregables GSE</h3>
                    <button type="button" onClick={() => openClientRiv(selectedSummary)}>Abrir RIV cliente</button>
                  </div>
                  {internalActionMessage && <p className="internalActionMessage">{internalActionMessage}</p>}
                  {selectedSummary.deliverables.length > 0 ? (
                    <div className="internalDeliverablesMatrix">
                      <div className="internalDeliverablesHead">
                        <span>Entregable</span>
                        <span>Estado</span>
                        <span>Fecha</span>
                        <span>Vencido</span>
                        <span>Link</span>
                      </div>
                      <div className="internalDeliverablesBody">
                        {selectedSummary.deliverables.map((item, index) => {
                          const overdue = String(item.overdue || "").trim();
                          const isOverdue = normalizeSystemName(overdue).includes("si") || normalizeSystemName(overdue).includes("vencido");
                          const statusKey = normalizeSystemName(item.status || "");
                          const statusClass = statusKey.includes("finalizado") || statusKey.includes("aprobado") || statusKey.includes("terminado")
                            ? "done"
                            : statusKey.includes("desarrollo") || statusKey.includes("progreso")
                              ? "progress"
                              : "pending";
                          return (
                            <article key={`${item.deliverable}-${index}`} className={isOverdue ? "isOverdue" : ""}>
                              <div>
                                <strong>{item.deliverable || item.deliverableGSE || "Entregable GSE"}</strong>
                                <small>{[item.milestone, item.system].filter(Boolean).join(" · ") || "Sin hito asociado"}</small>
                              </div>
                              <button type="button" className={`internalTableButton ${statusClass}`} onClick={() => cycleDeliverableStatus(item)}>{item.status || "Sin estado"}</button>
                              <span>{item.date || "Sin fecha"}</span>
                              <button type="button" className={`internalTableButton ${isOverdue ? "late" : "done"}`} onClick={() => toggleDeliverableOverdue(item)}>{overdue || "No"}</button>
                              {safeUrl(item.link) ? (
                                <a className="internalTableButton link" href={safeUrl(item.link)} target="_blank" rel="noreferrer">Abrir</a>
                              ) : (
                                <button type="button" className="internalTableButton empty" onClick={() => updateDeliverableLink(item)}>Cargar link</button>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="internalEmpty">No hay entregables en el Sheet o falta la pestaña Entregables.</p>
                  )}
                </section>
              </div>
              )}

              {clientTab === "observaciones" && (
              <section className="internalNotesPanel internalNotesFull">
                <h3>Observaciones internas</h3>
                <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Añadir observación para el equipo GSE..." />
                <button type="button" onClick={addNote} disabled={notesLoading}><MessageCircle size={17} /> Añadir observación</button>
                {(notesLoading || noteMessage) && (
                  <div className={noteMessage.includes("modo local") ? "internalNotice compact" : "internalError compact"}>
                    {notesLoading ? "Cargando observaciones desde el Sheet del cliente..." : noteMessage}
                  </div>
                )}
                <div className="internalNotesList">
                  {selectedNotes.map((note, index) => (
                    <article key={`${note.id || note.stamp}-${index}`}>
                      <div className="internalNoteHeader">
                        <span>{note.stamp}{note.edited ? " · editado" : ""}</span>
                        <div>
                          <button type="button" onClick={() => startEditNote(index, note.text)}>Editar</button>
                          <button type="button" onClick={() => deleteNote(index)} aria-label="Eliminar observación"><X size={14} /></button>
                        </div>
                      </div>
                      {editingNoteIndex === index ? (
                        <div className="internalNoteEditor">
                          <textarea value={editingNoteText} onChange={(event) => setEditingNoteText(event.target.value)} />
                          <div>
                            <button type="button" onClick={() => saveEditedNote(index)}>Guardar</button>
                            <button type="button" onClick={cancelEditNote}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <p>{note.text}</p>
                      )}
                    </article>
                  ))}
                  {!selectedNotes.length && <p className="internalEmpty">Sin observaciones todavía.</p>}
                </div>
              </section>
              )}

            </>
          )}
        </section>
      </section>
      )}
      </div>
    </main>
  );
}

function Root() {
  const params = new URLSearchParams(window.location.search);
  const isInternalRoute = window.location.pathname.replace(/\/$/, "") === "/interno" || params.get("interno") === "1";

  if (isInternalRoute) {
    return <InternalProjectsPortal />;
  }

  return <App />;
}

function App() {
  const [session, setSession] = useState(() => getStoredClientSession());
  const [view, setView] = useState("portal");
  const [data, setData] = useState(demoData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] = useState("");
  const [selectedHito, setSelectedHito] = useState("");
  const [previousView, setPreviousView] = useState("portal");

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

  const { project, milestones, findings, pending, deliverables, updates, education, meetings = [], documents = [], architectureRoles = [], indicators = [], processesAsIs = [], processesToBe = [], coeAsIs = [], coeToBe = [] } = data;

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

  const navigate = (nextView) => {
    if (!nextView || nextView === view) return;
    setPreviousView(view);
    setView(nextView);
  };

  if (!session?.sheetId) {
    return <ClientLogin onLogin={setSession} />;
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={navigate} project={project} />

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
          setView={navigate}
          setSelectedHito={setSelectedHito}
          setSelectedDeliverable={setSelectedDeliverable}
          onLogout={handleLogout}
        />

        <div className={`content view-${view}`}>
          <div className="mobileTabs">
            {[
              ["portal", "Portal"],
              ["resumen", "Resumen"],
              ["calendario", "Calendario"],
              ["ruta", "Ruta"],
              ["procesos", "Procesos"],
              ["coe", "COE"],
              ["hallazgos", "Hallazgos"],
              ["pendientes", "Pendientes"],
              ["entregables", "Entregables"],
              ["entregables-clientes", "Entregables clientes"],
              ["indicadores", "Indicadores"],
              ["documentos", "Documentos"],
              ["educacion", "Lo que vas a recibir"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => navigate(value)} className={view === value ? "active" : ""}>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="errorBox">{error}</div>}

          {view === "portal" && (
            <>
              <MobilePortalHome
                project={project}
                milestones={milestones}
                pending={pending}
                meetings={meetings}
                updates={updates}
                findings={findings}
                deliverables={deliverables}
                documents={documents}
                education={education}
                architectureRoles={architectureRoles}
                coeAsIs={coeAsIs}
                coeToBe={coeToBe}
                setView={navigate}
              />
              <PortalProject project={project} milestones={milestones} pending={pending} setView={navigate} />
            </>
          )}

          {view === "resumen" && (
            <SummaryCanvaDashboard
              project={project}
              milestones={milestones}
              pending={pending}
              findings={findings}
              deliverables={deliverables}
              architectureRoles={architectureRoles}
              processesAsIs={processesAsIs}
              processesToBe={processesToBe}
              coeAsIs={coeAsIs}
              coeToBe={coeToBe}
              updates={updates}
              meetings={meetings}
              setView={navigate}
            />
          )}

          {view === "calendario" && <CalendarView meetings={meetings} />}

          {view === "ruta" && (
            <>
              <MobileRouteView milestones={milestones} deliverables={deliverables} pending={pending} setView={navigate} setSelectedDeliverable={setSelectedDeliverable} />
              <div className="desktopRouteView">
                <Timeline milestones={milestones} deliverables={deliverables} detailed setView={navigate} setSelectedDeliverable={setSelectedDeliverable} selectedHito={selectedHito} setSelectedHito={setSelectedHito} />
              </div>
            </>
          )}
          {view === "procesos" && <ProcessesMasterList project={project} processesAsIs={processesAsIs} processesToBe={processesToBe} pending={pending} setView={navigate} previousView={previousView} />}
          {view === "estructura" && <StructureView project={project} architectureRoles={architectureRoles} />}
          {view === "indicadores" && <ImplementationIndicators indicators={indicators} />}
          {view === "coe" && <COEDashboard coeAsIs={coeAsIs} coeToBe={coeToBe} pending={pending} setView={navigate} previousView={previousView} />}
          {view === "hallazgos" && <Findings findings={findings} pending={pending} setView={navigate} previousView={previousView} />}
          {view === "pendientes" && <PendingClient pending={pending} setView={navigate} previousView={previousView} />}
          {view === "entregables" && <Deliverables deliverables={deliverables} selectedDeliverable={selectedDeliverable} setSelectedDeliverable={setSelectedDeliverable} setView={navigate} previousView={previousView} pending={pending} />}
          {view === "entregables-clientes" && <ClientDeliverables findings={findings} project={project} />}
          {view === "documentos" && <DocumentsUpload documents={documents} project={project} setView={navigate} previousView={previousView} pending={pending} />}
          {view === "educacion" && <Education education={education} setView={navigate} previousView={previousView} pending={pending} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Root />);


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



































