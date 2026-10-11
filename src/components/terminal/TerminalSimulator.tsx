import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Lab } from '../../types/cyber';
import { sounds } from '../../utils/audio';
import { VirtualFileSystem } from '../../utils/virtualFileSystem';
import { trafficSync } from '../../utils/trafficSync';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface TerminalSimulatorProps {
  lab: Lab;
  onCommandRun: (cmd: string) => void;
  onObjectiveTrigger?: (cmd: string) => void;
  shellType: 'kali' | 'powershell';
  onShellTypeChange: (shell: 'kali' | 'powershell') => void;
}

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'banner' | 'msf';
  text: string;
  promptDisplay?: string;
}

interface InteractiveSession {
  type: 'ftp' | 'telnet' | 'ssh';
  step: 'awaiting_user' | 'awaiting_password' | 'connected';
  host: string;
  user?: string;
  banner?: string;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  lab,
  onCommandRun,
  onObjectiveTrigger,
  shellType,
  onShellTypeChange,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Metasploit and root shell states
  const [isMsfConsole, setIsMsfConsole] = useState(false);
  const [msfModule, setMsfModule] = useState<string>('');
  const [msfRhosts, setMsfRhosts] = useState<string>('');
  const [inRootShell, setInRootShell] = useState(false);

  // Protocol interactive sessions (FTP, SSH, Telnet)
  const [interactiveSession, setInteractiveSession] = useState<InteractiveSession | null>(null);

  // Virtual File System per lab
  const vfs = useMemo(() => new VirtualFileSystem(lab.initialFiles), [lab.id, lab.initialFiles]);
  const [currentPathDisplay, setCurrentPathDisplay] = useState('~');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    setCurrentPathDisplay(vfs.getDisplayPath());
    const bannerLines: OutputLine[] = [
      {
        id: 'b-1',
        type: 'banner',
        text: shellType === 'kali'
          ? `Linux kali 6.6.9-amd64 #1 SMP PREEMPT Kali GNU/Linux Rolling
kali@kali:~$ Escribe "help" para ver la lista de comandos disponibles.`
          : `Windows PowerShell 7.4 Security Edition
Copyright (C) Microsoft Corporation. Todos los derechos reservados.
PS C:\\Users\\kali> Escribe "help" para ver la lista de comandos.`
      }
    ];
    setLines(bannerLines);
    setIsMsfConsole(false);
    setMsfModule('');
    setMsfRhosts('');
    setInRootShell(false);
    setInteractiveSession(null);
  }, [lab.id, shellType, vfs]);

  // Auto-scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Auto-focus input on mount or lab change
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [lab.id, shellType]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const addLine = (type: OutputLine['type'], text: string, promptDisplay?: string) => {
    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type,
        text,
        promptDisplay
      }
    ]);
  };

  // Autocomplete with TAB
  const handleTabComplete = () => {
    sounds.playKeyClick();
    const val = input.trim();
    if (!val) return;

    const parts = input.split(' ');
    const lastWord = parts[parts.length - 1];

    const linuxCmds = [
      'nmap', 'ping', 'ftp', 'telnet', 'ssh', 'sqlmap', 'gobuster', 'hydra', 'john', 'aircrack-ng', 
      'msfconsole', 'cat', 'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 
      'mv', 'echo', 'grep', 'clear', 'help', 'whoami', 'id', 'curl', 'wget', 
      'ifconfig', 'uname', 'head', 'tail', 'chmod', 'ps', 'date', 'uptime', 
      'base64', 'exit', 'powershell'
    ];

    const psCmds = [
      'Get-Service', 'Get-Process', 'Test-NetConnection', 'Invoke-WebRequest', 
      'dir', 'type', 'cd', 'cls', 'clear', 'help', 'whoami', 'kali'
    ];

    const currentComps = vfs.getCompletions(lastWord);
    const commandList = shellType === 'kali' ? linuxCmds : psCmds;
    const cmdComps = commandList.filter(c => c.toLowerCase().startsWith(lastWord.toLowerCase()));

    const candidates = [...currentComps, ...cmdComps];

    if (candidates.length > 0) {
      parts[parts.length - 1] = candidates[0];
      setInput(parts.join(' '));
    }
  };

  // Execute command
  const executeCommand = (cmdToRun: string) => {
    const rawCmd = cmdToRun.trim();
    if (!rawCmd && !interactiveSession) return;

    sounds.playCommandRun();

    // Mask passwords in history and terminal display if awaiting password
    const isPasswordPrompt = interactiveSession && interactiveSession.step === 'awaiting_password';
    if (!isPasswordPrompt && rawCmd) {
      setHistory((prev) => [...prev, rawCmd]);
    }
    setHistoryIndex(-1);

    // Current Prompt string
    let promptStr = '';
    if (interactiveSession) {
      if (interactiveSession.type === 'ftp') {
        if (interactiveSession.step === 'awaiting_user') {
          promptStr = `Name (${interactiveSession.host}:kali): `;
        } else if (interactiveSession.step === 'awaiting_password') {
          promptStr = `Password: `;
        } else {
          promptStr = `ftp> `;
        }
      } else if (interactiveSession.type === 'telnet') {
        if (interactiveSession.step === 'awaiting_user') {
          promptStr = `login: `;
        } else if (interactiveSession.step === 'awaiting_password') {
          promptStr = `Password: `;
        } else {
          promptStr = `${interactiveSession.user || 'admin'}@${lab.target.hostname}:~$ `;
        }
      } else if (interactiveSession.type === 'ssh') {
        if (interactiveSession.step === 'awaiting_password') {
          promptStr = `${interactiveSession.user || 'admin'}@${interactiveSession.host}'s password: `;
        } else {
          promptStr = `${interactiveSession.user || 'admin'}@${lab.target.hostname}:~$ `;
        }
      }
    } else if (inRootShell) {
      promptStr = `root@${lab.target.hostname}:~# `;
    } else if (isMsfConsole) {
      promptStr = `msf6 ${msfModule ? `(${msfModule})` : ''} > `;
    } else if (shellType === 'kali') {
      promptStr = `kali@kali:${currentPathDisplay}$ `;
    } else {
      promptStr = `PS C:\\Users\\kali> `;
    }

    const displayText = isPasswordPrompt ? '••••••••' : rawCmd;
    addLine('input', displayText, promptStr);

    if (rawCmd) {
      onCommandRun(rawCmd);
      if (onObjectiveTrigger) {
        onObjectiveTrigger(rawCmd);
      }
      trafficSync.recordCommandTraffic(lab.id, rawCmd, lab.target.ip);
    }

    processCommand(rawCmd);
    setInput('');
  };

  const processCommand = (cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    const parts = cmd.trim().split(/\s+/);
    const mainCmd = parts[0]?.toLowerCase();

    // INTERACTIVE PROTOCOL SESSION HANDLER (FTP / TELNET / SSH)
    if (interactiveSession) {
      // Allow user to exit/quit at any stage
      if (lower === 'exit' || lower === 'quit' || lower === 'bye') {
        const exitingType = interactiveSession.type.toUpperCase();
        setInteractiveSession(null);
        addLine('output', `221 Goodbye. Conexión ${exitingType} cerrada. Retornando a Kali Linux.`);
        return;
      }

      // 1. FTP Session
      if (interactiveSession.type === 'ftp') {
        if (interactiveSession.step === 'awaiting_user') {
          const userEntered = cmd.trim() || 'anonymous';
          setInteractiveSession({
            ...interactiveSession,
            step: 'awaiting_password',
            user: userEntered
          });
          addLine('output', `331 Please specify the password.`);
          addLine('output', `Password: `);
          return;
        }

        if (interactiveSession.step === 'awaiting_password') {
          const passEntered = cmd.trim();
          const isAnon = (interactiveSession.user?.toLowerCase() === 'anonymous' || interactiveSession.user?.toLowerCase() === 'ftp');
          
          if (isAnon || passEntered.length > 0) {
            setInteractiveSession({
              ...interactiveSession,
              step: 'connected'
            });
            sounds.playSuccess();
            addLine('success', `230 Login successful. Acceso concedido al servidor vsftpd 2.3.4.\nRemote system type is UNIX.\nUsing binary mode to transfer files.\n[+] Bandera de banner FTP: KALI{nmap_service_discovery_recon}`);
            addLine('output', `Escribe "ls" o "dir" para ver archivos disponibles, o "help" para ver comandos FTP.`);
          } else {
            addLine('error', `530 Login incorrect. Introduce un usuario válido (ejemplo: anonymous) y contraseña.`);
            sounds.playError();
            setInteractiveSession(null);
          }
          return;
        }

        if (interactiveSession.step === 'connected') {
          if (lower === 'ls' || lower === 'dir') {
            addLine('output', `229 Entering Extended Passive Mode (|||49153|)
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp           248 Oct 11 08:30 banner.txt
-rw-r--r--    1 ftp      ftp            42 Oct 11 08:35 flag.txt
-rw-r--r--    1 ftp      ftp          1024 Oct 11 08:40 backup_pub.tar.gz
226 Directory send OK.`);
            return;
          }
          if (lower.startsWith('get ') || lower.startsWith('cat ')) {
            const file = parts[1] || 'flag.txt';
            if (file.includes('flag')) {
              addLine('success', `200 PORT command successful.\n150 Opening BINARY mode data connection for ${file} (42 bytes).\nKALI{nmap_service_discovery_recon}\n226 Transfer complete.`);
              sounds.playSuccess();
            } else if (file.includes('banner')) {
              addLine('output', `200 PORT command successful.\nvsFTPd 2.3.4 - Servidor oficial vulnerable.\n226 Transfer complete.`);
            } else {
              addLine('output', `226 Archivo ${file} transferido correctamente.`);
            }
            return;
          }
          if (lower === 'pwd') {
            addLine('output', `257 "/" is the current directory`);
            return;
          }
          if (lower === 'help') {
            addLine('output', `Comandos FTP soportados: ls, dir, get <archivo>, pwd, status, type, binary, quit, bye, exit`);
            return;
          }
          if (lower === 'status') {
            addLine('output', `Connected to ${interactiveSession.host}.\nMode: stream; Type: binary; Form: non-print; Structure: file\nVerbose: on; Bell: off; Prompting: on; Globbing: on`);
            return;
          }
          addLine('output', `200 Comando FTP no reconocido. Escribe "help" o "ls".`);
          return;
        }
      }

      // 2. SSH Session
      if (interactiveSession.type === 'ssh') {
        if (interactiveSession.step === 'awaiting_password') {
          const passEntered = cmd.trim();
          const targetUser = interactiveSession.user || 'admin';
          // Check for valid password (Dragon2024! from Hydra lab, or toor/root/admin)
          const isValidPass = (passEntered === 'Dragon2024!' || passEntered === 'password' || targetUser === 'root' && passEntered === 'CyberSecHero2026');

          if (isValidPass || passEntered === 'admin' || passEntered === '123456') {
            setInteractiveSession({
              ...interactiveSession,
              step: 'connected'
            });
            sounds.playSuccess();
            addLine('success', `Linux bastion-host 5.10.0-8-amd64 #1 SMP Debian\n============================================================\n¡Bienvenido al servidor Bastion Interno!\nSesión iniciada con éxito para el usuario "${targetUser}".\nBandera del reto SSH: KALI{hydra_brute_force_ssh_pwned}\n============================================================`);
            addLine('output', `Escribe "whoami", "id", "ls" o "cat flag.txt" para explorar.`);
          } else {
            addLine('error', `Permission denied, please try again.`);
            sounds.playError();
            addLine('output', `${targetUser}@${interactiveSession.host}'s password: `);
          }
          return;
        }

        if (interactiveSession.step === 'connected') {
          if (lower === 'ls' || lower === 'dir') {
            addLine('output', `flag.txt  notes.txt  scripts/  backup/`);
            return;
          }
          if (lower === 'whoami') {
            addLine('output', interactiveSession.user || 'admin');
            return;
          }
          if (lower === 'id') {
            addLine('output', `uid=1001(${interactiveSession.user || 'admin'}) gid=1001(${interactiveSession.user || 'admin'}) groups=1001,27(sudo)`);
            return;
          }
          if (lower.includes('flag') || lower === 'cat flag.txt') {
            addLine('success', `KALI{hydra_brute_force_ssh_pwned}`);
            sounds.playSuccess();
            return;
          }
          if (lower === 'pwd') {
            addLine('output', `/home/${interactiveSession.user || 'admin'}`);
            return;
          }
          addLine('output', `Comando ejecutado en el servidor remoto.`);
          return;
        }
      }

      // 3. Telnet Session
      if (interactiveSession.type === 'telnet') {
        if (interactiveSession.step === 'awaiting_user') {
          const userEntered = cmd.trim() || 'admin';
          setInteractiveSession({
            ...interactiveSession,
            step: 'awaiting_password',
            user: userEntered
          });
          addLine('output', `Password: `);
          return;
        }

        if (interactiveSession.step === 'awaiting_password') {
          setInteractiveSession({
            ...interactiveSession,
            step: 'connected'
          });
          sounds.playSuccess();
          addLine('success', `Ubuntu 22.04 LTS\nBienvenido a la sesión remota por Telnet.\nBandera: KALI{telnet_unencrypted_access_granted}`);
          return;
        }

        if (interactiveSession.step === 'connected') {
          if (lower === 'ls') {
            addLine('output', `system.log  config.ini  flag.txt`);
            return;
          }
          if (lower.includes('flag')) {
            addLine('success', `KALI{telnet_unencrypted_access_granted}`);
            sounds.playSuccess();
            return;
          }
          addLine('output', `Telnet remote shell: ${cmd}`);
          return;
        }
      }
    }

    // Clear
    if (lower === 'clear' || lower === 'cls') {
      setLines([]);
      return;
    }

    // Switch Shell
    if (lower === 'powershell' || lower === 'pwsh') {
      onShellTypeChange('powershell');
      addLine('output', 'Cambiando a Windows PowerShell 7.4...');
      return;
    }
    if (lower === 'bash' || lower === 'kali' || lower === 'zsh') {
      onShellTypeChange('kali');
      addLine('output', 'Cambiando a Kali Linux (bash)...');
      return;
    }

    // Inside Metasploit console
    if (isMsfConsole) {
      if (lower === 'exit' || lower === 'back') {
        if (msfModule && lower === 'back') {
          setMsfModule('');
          addLine('output', 'Regresando a consola general.');
        } else {
          setIsMsfConsole(false);
          setMsfModule('');
          addLine('output', 'Saliendo de Metasploit. Retornando a Kali Linux.');
        }
        return;
      }

      if (lower.startsWith('use ')) {
        const mod = parts[1] || 'exploit/unix/ftp/vsftpd_234_backdoor';
        setMsfModule(mod);
        addLine('output', `[+] Módulo cargado: ${mod}\nPara ver parámetros ejecuta: show options\nPara configurar el objetivo: set RHOSTS ${lab.target.ip}`);
        return;
      }

      if (lower.startsWith('set rhosts') || lower.startsWith('set rhost')) {
        const targetIp = parts[2] || lab.target.ip;
        setMsfRhosts(targetIp);
        addLine('output', `RHOSTS => ${targetIp}`);
        return;
      }

      if (lower === 'show options') {
        addLine('output', `Opciones del Módulo (${msfModule || 'exploit/unix/ftp/vsftpd_234_backdoor'}):
  Nombre     Configurado       Requerido  Descripción
  ------     -----------       ---------  -----------
  RHOSTS     ${msfRhosts || lab.target.ip}     sí         Dirección IP del objetivo
  RPORT      21                sí         Puerto FTP objetivo

Payload options (cmd/unix/interact):
  Sesión interactiva en el puerto 6200/TCP.`);
        return;
      }

      if (lower === 'exploit' || lower === 'run') {
        addLine('output', `[*] Iniciando exploit contra ${msfRhosts || lab.target.ip}:21
[*] Enviando usuario malicioso: USER test:) ...
[*] Enviando contraseña de activación...
[+] ¡Backdoor activado con éxito! Puerto 6200 abierto en ${lab.target.ip}.
[*] Sesión interactiva 1 abierta (192.168.1.15:43210 -> ${lab.target.ip}:6200)

============================================================
¡SHELL DE ROOT OBTENIDA EN EL SISTEMA VÍCTIMA!
============================================================
root@${lab.target.hostname}:~# id
uid=0(root) gid=0(root) groups=0(root)
root@${lab.target.hostname}:~# cat /root/flag.txt
KALI{metasploit_meterpreter_root_pwn}`);
        setInRootShell(true);
        sounds.playSuccess();
        return;
      }

      if (lower.startsWith('search ')) {
        const query = parts.slice(1).join(' ');
        addLine('output', `Resultados de búsqueda para '${query}':
  #  Nombre                                   Divulgación  Rango      Check  Descripción
  -  -----------------------------            -----------  -----      -----  -----------
  0  exploit/unix/ftp/vsftpd_234_backdoor     2011-07-03   excelente  No     VSFTPD v2.3.4 Smiley Backdoor Execution`);
        return;
      }

      addLine('output', `Comando de Metasploit desconocido: "${cmd}". Usa: use <modulo>, set RHOSTS <ip>, show options, exploit, o exit.`);
      return;
    }

    // Inside Root Shell of Victim
    if (inRootShell) {
      if (lower === 'exit') {
        setInRootShell(false);
        setIsMsfConsole(false);
        addLine('output', 'Sesión cerrada. Regresando a Kali Linux.');
        return;
      }
      if (lower.includes('flag') || lower === 'cat /root/flag.txt') {
        addLine('success', `KALI{metasploit_meterpreter_root_pwn}\n[!] ¡Bandera encontrada! Cópiala y canjéala en el panel de misiones.`);
        sounds.playSuccess();
        return;
      }
      if (lower === 'ls' || lower === 'dir') {
        addLine('output', 'bin   dev  home  lib64       mnt  proc  run   srv  tmp  var\nboot  etc  lib   lost+found  opt  root  sbin  sys  usr');
        return;
      }
      if (lower === 'whoami' || lower === 'id') {
        addLine('output', 'uid=0(root) gid=0(root) groups=0(root)');
        return;
      }
      addLine('output', `root@${lab.target.hostname}:~# comando ejecutado.`);
      return;
    }

    // CD (Change Directory)
    if (lower === 'cd' || lower.startsWith('cd ')) {
      const dest = parts[1] || '~';
      const res = vfs.changeDirectory(dest);
      if (res.success) {
        setCurrentPathDisplay(vfs.getDisplayPath());
      } else {
        addLine('error', res.error || 'cd: error al cambiar de directorio');
        sounds.playError();
      }
      return;
    }

    // PWD (Print Working Directory)
    if (lower === 'pwd') {
      addLine('output', vfs.getCurrentPath());
      return;
    }

    // LS / DIR (List directory)
    if (lower === 'ls' || lower.startsWith('ls ') || lower === 'dir') {
      const showAll = lower.includes('-a') || lower.includes('-la');
      const targetArg = parts.find(p => p !== 'ls' && p !== 'dir' && !p.startsWith('-'));
      const res = vfs.listDirectory(targetArg, showAll);
      if (res.success && res.items) {
        if (res.items.length === 0) {
          addLine('output', '(directorio vacío)');
        } else {
          const formatted = res.items.map(it => {
            if (it.type === 'dir') return `📁 \x1b[34m${it.name}/\x1b[0m`;
            if (it.name.endsWith('.txt') || it.name.endsWith('.list')) return `📄 ${it.name}`;
            if (it.name.endsWith('.cap') || it.name.endsWith('.pcap')) return `📦 ${it.name}`;
            return `📄 ${it.name}`;
          }).join('    ');
          addLine('output', formatted);
        }
      } else {
        addLine('error', res.error || 'ls: no se pudo listar el directorio');
        sounds.playError();
      }
      return;
    }

    // MKDIR
    if (lower.startsWith('mkdir ')) {
      const dirName = parts[1];
      if (!dirName) {
        addLine('error', 'mkdir: falta el operando');
        return;
      }
      const res = vfs.createDirectory(dirName);
      if (!res.success) {
        addLine('error', res.error || 'mkdir: fallo');
      }
      return;
    }

    // TOUCH
    if (lower.startsWith('touch ')) {
      const fileName = parts[1];
      if (!fileName) {
        addLine('error', 'touch: falta el operando de archivo');
        return;
      }
      vfs.writeFile(fileName, '');
      return;
    }

    // RM (Remove)
    if (lower.startsWith('rm ')) {
      const isRecursive = parts.includes('-r') || parts.includes('-rf');
      const fileName = parts.find(p => p !== 'rm' && !p.startsWith('-'));
      if (!fileName) {
        addLine('error', 'rm: falta el operando');
        return;
      }
      const res = vfs.remove(fileName, isRecursive);
      if (!res.success) {
        addLine('error', res.error || 'rm: fallo');
      }
      return;
    }

    // CAT / TYPE
    if (lower.startsWith('cat ') || lower.startsWith('type ')) {
      const fileName = parts[1];
      if (!fileName) {
        addLine('error', 'cat: falta el operando');
        return;
      }
      const res = vfs.readFile(fileName);
      if (res.success) {
        addLine('output', res.content || '');
      } else {
        addLine('error', res.error || `cat: ${fileName}: No such file or directory`);
        sounds.playError();
      }
      return;
    }

    // ECHO with redirection (> or >>)
    if (lower.startsWith('echo ')) {
      if (cmd.includes(' > ') || cmd.includes(' >> ')) {
        const isAppend = cmd.includes(' >> ');
        const splitOperator = isAppend ? ' >> ' : ' > ';
        const [echoPart, targetFile] = cmd.split(splitOperator);
        const textToWrite = echoPart.replace(/^echo\s+/i, '').replace(/^["']|["']$/g, '');
        const res = vfs.writeFile(targetFile.trim(), textToWrite, isAppend);
        if (!res.success) {
          addLine('error', res.error || 'echo: error de escritura');
        }
        return;
      }
      const echoText = cmd.replace(/^echo\s+/i, '').replace(/^["']|["']$/g, '');
      addLine('output', echoText);
      return;
    }

    // BASE64
    if (lower.includes('base64') && lower.includes('-d')) {
      if (cmd.includes('S0FMSXtkbnNfdHVubmVsaW5nX2MyX2V4ZmlsdHJhdGlvbl91bmNvdmVyZWR9')) {
        addLine('success', `KALI{dns_tunneling_c2_exfiltration_uncovered}`);
        sounds.playSuccess();
        return;
      }
      try {
        const b64Match = cmd.match(/["']?([A-Za-z0-9+/=]{16,})["']?/);
        if (b64Match && b64Match[1]) {
          const decoded = atob(b64Match[1]);
          addLine('success', decoded);
          return;
        }
      } catch {
        addLine('error', 'base64: entrada no válida');
        return;
      }
      addLine('output', 'KALI{dns_tunneling_c2_exfiltration_uncovered}');
      return;
    }

    // HEAD / TAIL
    if (lower.startsWith('head ') || lower.startsWith('tail ')) {
      const fileName = parts[parts.length - 1];
      const res = vfs.readFile(fileName);
      if (res.success && res.content) {
        const fileLines = res.content.split('\n');
        const slice = lower.startsWith('head') ? fileLines.slice(0, 5) : fileLines.slice(-5);
        addLine('output', slice.join('\n'));
      } else {
        addLine('error', res.error || 'Archivo no encontrado');
      }
      return;
    }

    // GREP
    if (lower.startsWith('grep ')) {
      const pattern = parts[1]?.replace(/["']/g, '');
      const fileName = parts[2];
      if (!pattern || !fileName) {
        addLine('error', 'Uso: grep <patron> <archivo>');
        return;
      }
      const res = vfs.readFile(fileName);
      if (res.success && res.content) {
        const matching = res.content.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
        addLine('output', matching.length > 0 ? matching.join('\n') : '(sin coincidencias)');
      } else {
        addLine('error', res.error || 'Archivo no encontrado');
      }
      return;
    }

    // WHOAMI / ID
    if (lower === 'whoami') {
      addLine('output', shellType === 'kali' ? 'kali' : 'kali');
      return;
    }
    if (lower === 'id') {
      addLine('output', 'uid=1000(kali) gid=1000(kali) groups=1000(kali),24(cdrom),27(sudo),100(users)');
      return;
    }

    // DATE / UPTIME
    if (lower === 'date') {
      addLine('output', new Date().toUTCString());
      return;
    }
    if (lower === 'uptime') {
      addLine('output', ' 08:48:12 up 3:15,  1 user,  load average: 0.12, 0.08, 0.05');
      return;
    }

    // PS / PS AUX
    if (lower === 'ps' || lower === 'ps aux' || lower === 'get-process') {
      addLine('output', `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168340  8944 ?        Ss   05:32   0:01 /sbin/init
kali      1240  0.1  0.3  23100  9800 pts/0    Ss+  08:14   0:00 -bash
kali      1380  0.2  0.5  45200 14200 pts/0    S+   08:42   0:00 kali-terminal`);
      return;
    }

    // WHICH
    if (lower.startsWith('which ')) {
      const tool = parts[1];
      addLine('output', `/usr/bin/${tool}`);
      return;
    }

    // UNAME
    if (lower.startsWith('uname')) {
      addLine('output', 'Linux kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 (2024-01-08) x86_64 GNU/Linux');
      return;
    }

    // IFCONFIG / IP A
    if (lower === 'ifconfig' || lower === 'ip a') {
      addLine('output', `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.15  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 08:00:27:fa:21:0a  txqueuelen 1000  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`);
      return;
    }

    // PING
    if (lower.startsWith('ping')) {
      const targetIp = lab.target.ip;
      addLine('output', `PING ${targetIp} (${targetIp}) 56(84) bytes of data.
64 bytes from ${targetIp}: icmp_seq=1 ttl=64 time=0.412 ms
64 bytes from ${targetIp}: icmp_seq=2 ttl=64 time=0.389 ms
64 bytes from ${targetIp}: icmp_seq=3 ttl=64 time=0.405 ms

--- ${targetIp} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.389/0.402/0.412/0.015 ms`);
      return;
    }

    // NMAP - Clean ports: only show ports strictly related to the lab!
    if (lower.startsWith('nmap')) {
      const isVersionScan = lower.includes('-sv') || lower.includes('-a') || lower.includes('-s');
      const openPorts = lab.target.openPorts;
      const services = lab.target.services;

      let portRows = '';
      openPorts.forEach((port, idx) => {
        const srv = services[idx] || 'unknown';
        portRows += `${port}/tcp   open   ${srv}\n`;
      });

      if (isVersionScan) {
        addLine('output', `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-11
Nmap scan report for ${lab.target.hostname} (${lab.target.ip})
Host is up (0.00041s latency).
MAC Address: 08:00:27:9B:44:C1 (Oracle VirtualBox)
Not shown: 999 closed ports

PORT     STATE SERVICE VERSION
${portRows}
OS details: ${lab.target.os}
${openPorts.includes(21) ? 'Banner FTP: KALI{nmap_service_discovery_recon}\n' : ''}
Nmap done: 1 IP address (1 host up) scanned in 2.34 seconds`);
      } else {
        addLine('output', `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${lab.target.hostname} (${lab.target.ip})
Host is up (0.00038s latency).

PORT     STATE SERVICE
${portRows}
Nmap done: 1 IP address (1 host up) scanned in 1.12 seconds`);
      }
      return;
    }

    // HYDRA
    if (lower.startsWith('hydra')) {
      addLine('output', `Hydra v9.5 (c) 2023 by van Hauser / THC
[*] Objetivo: ${lab.target.ip} | Servicio: ssh | Tareas: 16
[*] Iniciando ataque de diccionario con wordlist.txt...
[ATTEMPT] admin : 123456 -> Fallo
[ATTEMPT] admin : password -> Fallo
[ATTEMPT] admin : admin123 -> Fallo
[ATTEMPT] admin : qwerty -> Fallo
[22][ssh] host: ${lab.target.ip}   login: admin   password: Dragon2024!
[STATUS] 1 password found
Credenciales encontradas: admin / Dragon2024!
Bandera: KALI{hydra_brute_force_ssh_pwned}`);
      sounds.playSuccess();
      return;
    }

    // FTP Interactive Client (e.g. ftp 192.168.1.50)
    if (lower.startsWith('ftp ') || lower === 'ftp') {
      const targetHost = parts[1] || lab.target.ip;
      if (targetHost !== lab.target.ip && !['192.168.1.50', 'localhost', '127.0.0.1'].includes(targetHost)) {
        addLine('error', `ftp: connect to ${targetHost}: Connection refused`);
        sounds.playError();
        return;
      }

      setInteractiveSession({
        type: 'ftp',
        step: 'awaiting_user',
        host: targetHost,
        banner: 'Connected to ' + targetHost + '.\n220 (vsFTPd 2.3.4)\n220-Bienvenido al servidor FTP corporativo\n220-Acceso anónimo (anonymous) habilitado en el puerto 21.'
      });

      addLine('output', `Connected to ${targetHost}.\n220 (vsFTPd 2.3.4)\n220-Bienvenido al servidor FTP corporativo\n220-Acceso anónimo (anonymous) habilitado.`);
      addLine('output', `Name (${targetHost}:kali): `);
      return;
    }

    // TELNET Interactive Client
    if (lower.startsWith('telnet ') || lower === 'telnet') {
      const targetHost = parts[1] || lab.target.ip;
      const port = parts[2] || '23';

      if (targetHost !== lab.target.ip && !['192.168.1.50', 'localhost', '127.0.0.1'].includes(targetHost)) {
        addLine('error', `telnet: Unable to connect to remote host: Connection refused`);
        sounds.playError();
        return;
      }

      setInteractiveSession({
        type: 'telnet',
        step: 'awaiting_user',
        host: targetHost,
        banner: `Trying ${targetHost}...\nConnected to ${targetHost}.\nEscape character is '^]'.\n\nUbuntu 22.04 LTS\nlogin: `
      });

      addLine('output', `Trying ${targetHost}...\nConnected to ${targetHost}.\nEscape character is '^]'.\nUbuntu 22.04 LTS`);
      addLine('output', `login: `);
      return;
    }

    // SSH Interactive Client (e.g. ssh admin@192.168.1.75 or ssh 192.168.1.75)
    if (lower.startsWith('ssh ') || lower === 'ssh') {
      const targetArg = parts[1] || '';
      let targetUser = 'kali';
      let targetHost = lab.target.ip;

      if (targetArg.includes('@')) {
        const [u, h] = targetArg.split('@');
        targetUser = u || 'kali';
        targetHost = h || lab.target.ip;
      } else if (targetArg) {
        targetHost = targetArg;
      }

      // Check if port 22 is open on target or matches lab
      const hasSsh = lab.target.openPorts.includes(22) || lab.id === 'lab-03-hydra-ssh' || targetHost === '192.168.1.75';
      if (!hasSsh && targetHost !== lab.target.ip) {
        addLine('error', `ssh: connect to host ${targetHost} port 22: Connection refused`);
        sounds.playError();
        return;
      }

      setInteractiveSession({
        type: 'ssh',
        step: 'awaiting_password',
        user: targetUser,
        host: targetHost
      });

      addLine('output', `${targetUser}@${targetHost}'s password: `);
      return;
    }

    // GOBUSTER
    if (lower.startsWith('gobuster')) {
      addLine('output', `===============================================================
Gobuster v3.6 - Directory Brute Forcing
===============================================================
[+] Url:         http://target.internal
[+] Wordlist:    wordlists/common.txt
===============================================================
/login                (Status: 200) [Size: 1420]
/admin                (Status: 403) [Size: 280]
/secret_backup_admin  (Status: 301) [Size: 0] [--> /secret_backup_admin/]
===============================================================
Finished in 1.84s.`);
      return;
    }

    // CURL
    if (lower.startsWith('curl')) {
      if (lower.includes('config.backup')) {
        addLine('output', `HTTP/1.1 200 OK
Content-Type: text/plain

# BACKUP CONFIDENCIAL - SOC CORP
DB_HOST=127.0.0.1
DB_USER=root
API_SECURITY_FLAG=KALI{gobuster_hidden_endpoint_leaked}
FLAG_VERIFIED=TRUE`);
        sounds.playSuccess();
        return;
      }
      addLine('output', `<!DOCTYPE html><html><body><h1>Servidor Web Activo (${lab.target.ip})</h1></body></html>`);
      return;
    }

    // SQLMAP
    if (lower.startsWith('sqlmap')) {
      if (lower.includes('--dump')) {
        addLine('output', `[+] Tabla volcada: corporate_db.secret_vault
+----+----------------------+-------------------------------------+
| id | user_account         | secret_token                        |
+----+----------------------+-------------------------------------+
| 1  | root_administrator   | KALI{sqlmap_dumped_corporate_vault} |
+----+----------------------+-------------------------------------+
[INFO] 1 entrada extraída. ¡Bandera capturada!`);
        sounds.playSuccess();
      } else if (lower.includes('--tables')) {
        addLine('output', `Base de datos: corporate_db
[3 tables]
+-------------------------+
| products                |
| sessions                |
| secret_vault            |
+-------------------------+`);
      } else if (lower.includes('--dbs')) {
        addLine('output', `[*] Parameter 'id' is vulnerable (boolean-based blind / UNION query).
available databases [3]:
[*] information_schema
[*] corporate_db
[*] mysql`);
      } else {
        addLine('output', `Uso: sqlmap -u "<URL>" --dbs | -D <db> --tables | -T <tabla> --dump`);
      }
      return;
    }

    // JOHN THE RIPPER
    if (lower.startsWith('john')) {
      if (lower.includes('--show')) {
        addLine('output', `root:CyberSecHero2026:19245:0:99999:7:::
operador:password:19245:0:99999:7:::
2 password hashes cracked.
Bandera: KALI{john_ripper_hash_cracked_root}`);
        sounds.playSuccess();
      } else {
        addLine('output', `Loaded 2 password hashes with 2 salts (sha512crypt)
CyberSecHero2026 (root)
password         (operador)
DONE. Use "--show" to display all cracked passwords.`);
      }
      return;
    }

    // AIRCRACK-NG
    if (lower.startsWith('aircrack-ng')) {
      if (lower.includes('-w')) {
        addLine('output', `                   Aircrack-ng 1.7
                   [00:00:03] 8/8 keys tested (2.67 k/s)
   KEY FOUND! [ CorpWiFiSecure2026! ]
   WPA2-PSK Flag : KALI{aircrack_wpa2_handshake_cracked}`);
        sounds.playSuccess();
      } else {
        addLine('output', `Aircrack-ng 1.7
  #  BSSID              ESSID               Encryption
  1  00:14:6C:7E:40:80  WiFi-AP_CorpOffice  WPA (1 handshake)
Handshake 4-Way EAPOL verificado.`);
      }
      return;
    }

    // MSFCONSOLE
    if (lower === 'msfconsole') {
      setIsMsfConsole(true);
      addLine('output', `
       =[ metasploit v6.3.35-dev                          ]
+ -- --=[ 2350 exploits - 1221 auxiliary - 413 post       ]
+ -- --=[ 965 payloads - 46 encoders - 11 nops            ]

msf6 > `);
      return;
    }

    // HELP
    if (lower === 'help') {
      addLine('output', shellType === 'kali'
        ? `COMANDOS DISPONIBLES:
Navegación:  cd, pwd, ls, mkdir, touch, rm, cat, head, tail, grep, echo, cp, mv
Sistema:     whoami, id, date, uptime, ps, ifconfig, ping, curl, clear, history, exit
Seguridad:   nmap, sqlmap, gobuster, hydra, john, aircrack-ng, msfconsole, base64 -d`
        : `COMANDOS POWERSHELL:
cd, dir, pwd, type, cls, Get-Service, Get-Process, Test-NetConnection, Invoke-WebRequest, kali`);
      return;
    }

    // Default not found
    addLine('error', shellType === 'kali'
      ? `bash: ${cmd}: orden no encontrada. Escribe "help" para ver los comandos.`
      : `${cmd} : El término '${cmd}' no se reconoce como un cmdlet válido.`);
    sounds.playError();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else {
      sounds.playKeyClick();
    }
  };

  // Cursor navigation for mobile left/right arrows
  const moveCursor = (direction: 'left' | 'right') => {
    sounds.playKeyClick();
    if (!inputRef.current) return;
    const currentPos = inputRef.current.selectionStart || 0;
    const newPos = direction === 'left' ? Math.max(0, currentPos - 1) : Math.min(input.length, currentPos + 1);
    inputRef.current.setSelectionRange(newPos, newPos);
    inputRef.current.focus();
  };

  const handleCopyHistory = () => {
    const textToCopy = lines.map(l => l.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
      className={`flex flex-col bg-[#0b0f19] text-slate-100 border border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full rounded-xl'
      }`}
      onClick={handleContainerClick}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#090d16] border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          {/* Authentic Kali dot indicators */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>

          <span className="text-xs font-mono font-bold text-slate-200 tracking-wide flex items-center gap-1">
            {shellType === 'kali' ? (
              <span className="flex items-center gap-0.5">
                <span className="text-[#38bdf8] font-bold">kali@kali</span>
                <span className="text-slate-400">:</span>
                <span className="text-blue-400 font-semibold">{currentPathDisplay}</span>
              </span>
            ) : (
              <span className="text-blue-400">PowerShell 7.4</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Shell Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newShell = shellType === 'kali' ? 'powershell' : 'kali';
              onShellTypeChange(newShell);
            }}
            className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors border border-slate-700/50"
            title="Cambiar shell"
          >
            {shellType === 'kali' ? 'Cambiar a PowerShell' : 'Cambiar a Kali (bash)'}
          </button>

          {/* Copy history */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyHistory();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Copiar texto"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>

          {/* Clear */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLines([]);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Limpiar"
          >
            <Trash2 size={13} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs sm:text-[13px] leading-relaxed space-y-1.5 select-text bg-[#070b14]">
        {lines.map((line) => {
          if (line.type === 'banner') {
            return (
              <pre key={line.id} className="text-slate-300 whitespace-pre-wrap font-mono text-xs p-2 rounded bg-slate-900/40 border border-slate-800/60">
                {line.text}
              </pre>
            );
          }

          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex items-center gap-1.5 pt-0.5">
                {line.promptDisplay ? (
                  <span className="font-bold whitespace-nowrap flex items-center font-mono">
                    {line.promptDisplay.includes('kali') ? (
                      <>
                        <span className="text-[#38bdf8] font-bold">kali</span>
                        <span className="text-slate-400 font-normal">@</span>
                        <span className="text-[#38bdf8] font-bold">kali</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-blue-400 font-semibold">{currentPathDisplay}</span>
                        <span className="text-slate-100 font-bold">$ </span>
                      </>
                    ) : (
                      <span className="text-amber-400">{line.promptDisplay}</span>
                    )}
                  </span>
                ) : (
                  <span className="font-bold whitespace-nowrap flex items-center font-mono">
                    <span className="text-[#38bdf8] font-bold">kali</span>
                    <span className="text-slate-400 font-normal">@</span>
                    <span className="text-[#38bdf8] font-bold">kali</span>
                    <span className="text-slate-400 font-normal">:</span>
                    <span className="text-blue-400 font-semibold">{currentPathDisplay}</span>
                    <span className="text-slate-100 font-bold">$ </span>
                  </span>
                )}
                <span className="text-slate-100 font-semibold">{line.text}</span>
              </div>
            );
          }

          if (line.type === 'msf') {
            return (
              <div key={line.id} className="text-rose-400 font-semibold">
                {line.text}
              </div>
            );
          }

          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 whitespace-pre-wrap pl-2 border-l-2 border-rose-500/50">
                {line.text}
              </div>
            );
          }

          if (line.type === 'success') {
            return (
              <div key={line.id} className="text-emerald-400 font-semibold bg-emerald-950/30 p-2 rounded border border-emerald-800/40 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }

          return (
            <div key={line.id} className="text-slate-300 whitespace-pre-wrap break-all leading-normal">
              {line.text}
            </div>
          );
        })}

        {/* Active Command Line in Form for flawless mobile Android execution */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(input);
          }}
          className="pt-0.5 flex items-center gap-1.5 w-full"
        >
          {interactiveSession ? (
            <span className="font-bold whitespace-nowrap font-mono text-cyan-300">
              {interactiveSession.type === 'ftp' ? (
                interactiveSession.step === 'awaiting_user' ? (
                  `Name (${interactiveSession.host}:kali): `
                ) : interactiveSession.step === 'awaiting_password' ? (
                  `Password: `
                ) : (
                  `ftp> `
                )
              ) : interactiveSession.type === 'telnet' ? (
                interactiveSession.step === 'awaiting_user' ? (
                  `login: `
                ) : interactiveSession.step === 'awaiting_password' ? (
                  `Password: `
                ) : (
                  `${interactiveSession.user || 'admin'}@${lab.target.hostname}:~$ `
                )
              ) : interactiveSession.type === 'ssh' ? (
                interactiveSession.step === 'awaiting_password' ? (
                  `${interactiveSession.user || 'admin'}@${interactiveSession.host}'s password: `
                ) : (
                  `${interactiveSession.user || 'admin'}@${lab.target.hostname}:~$ `
                )
              ) : ''}
            </span>
          ) : inRootShell ? (
            <span className="text-rose-500 font-bold whitespace-nowrap">
              root@{lab.target.hostname}:~#
            </span>
          ) : isMsfConsole ? (
            <span className="text-rose-400 font-bold whitespace-nowrap">
              msf6 {msfModule ? `(${msfModule})` : ''} &gt;
            </span>
          ) : shellType === 'kali' ? (
            <span className="whitespace-nowrap font-bold flex items-center font-mono">
              <span className="text-[#38bdf8] font-bold">kali</span>
              <span className="text-slate-400 font-normal">@</span>
              <span className="text-[#38bdf8] font-bold">kali</span>
              <span className="text-slate-400 font-normal">:</span>
              <span className="text-blue-400 font-semibold">{currentPathDisplay}</span>
              <span className="text-slate-100 font-bold">$ </span>
            </span>
          ) : (
            <span className="text-blue-400 font-bold whitespace-nowrap font-mono">
              PS C:\Users\kali&gt;
            </span>
          )}

          <div className="flex-1 flex items-center gap-1 bg-transparent">
            <input
              ref={inputRef}
              type={interactiveSession && interactiveSession.step === 'awaiting_password' ? 'password' : 'text'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs sm:text-[13px] font-semibold caret-emerald-400 min-w-0"
              autoFocus
              placeholder={interactiveSession?.step === 'awaiting_user' ? 'ej. anonymous' : interactiveSession?.step === 'awaiting_password' ? 'introduce contraseña' : ''}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {input.trim() && (
              <button
                type="submit"
                className="px-1.5 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold active:scale-95 transition-all shadow"
                title="Ejecutar comando (Enter)"
              >
                ↵
              </button>
            )}
          </div>
        </form>
        <div ref={terminalEndRef} />
      </div>

      {/* ONLY Essential Touch Keys Bar: TAB, CTRL+C, and 4 Arrows */}
      <div className="bg-[#080c16] border-t border-slate-800 p-1.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          {/* TAB */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTabComplete();
            }}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold active:scale-95 transition-transform border border-slate-700/60"
            title="Autocompletar (Tab)"
          >
            TAB
          </button>

          {/* CTRL+C */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playError();
              if (interactiveSession) {
                const sType = interactiveSession.type.toUpperCase();
                setInteractiveSession(null);
                addLine('error', `^C\nSesión ${sType} cancelada por el usuario. Retornando a Kali Linux.`);
              } else {
                addLine('error', '^C');
              }
              setInput('');
            }}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-mono font-bold active:scale-95 transition-transform border border-slate-700/60"
            title="Interrumpir proceso (Ctrl+C)"
          >
            CTRL+C
          </button>
        </div>

        {/* The 4 Arrow Keys (↑, ↓, ←, →) */}
        <div className="flex items-center gap-1">
          {/* LEFT Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveCursor('left');
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform border border-slate-700/60"
            title="Mover cursor a la izquierda"
          >
            <ArrowLeft size={15} />
          </button>

          {/* UP Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (history.length === 0) return;
              const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
              setHistoryIndex(newIndex);
              setInput(history[newIndex] || '');
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform border border-slate-700/60"
            title="Comando anterior"
          >
            <ArrowUp size={15} />
          </button>

          {/* DOWN Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (historyIndex === -1) return;
              const newIndex = historyIndex + 1;
              if (newIndex >= history.length) {
                setHistoryIndex(-1);
                setInput('');
              } else {
                setHistoryIndex(newIndex);
                setInput(history[newIndex] || '');
              }
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform border border-slate-700/60"
            title="Siguiente comando"
          >
            <ArrowDown size={15} />
          </button>

          {/* RIGHT Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveCursor('right');
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-transform border border-slate-700/60"
            title="Mover cursor a la derecha"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
