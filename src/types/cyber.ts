export type DifficultyLevel = 'principiante' | 'intermedio' | 'avanzado';

export type LabCategory = 'redes' | 'web' | 'criptografia' | 'forense' | 'explotacion' | 'malware';

export interface PacketDetail {
  id: number;
  time: number; // seconds from start
  source: string;
  destination: string;
  protocol: 'HTTP' | 'TCP' | 'DNS' | 'SSH' | 'ARP' | 'TLSv1.3' | 'FTP' | 'ICMP';
  length: number;
  info: string;
  tcpStreamId?: number;
  layers: {
    frame: {
      number: number;
      length: number;
      time: string;
    };
    ethernet: {
      srcMac: string;
      dstMac: string;
      type: string;
    };
    ip: {
      version: 4;
      srcIp: string;
      dstIp: string;
      ttl: number;
      protocol: string;
    };
    transport: {
      type: 'TCP' | 'UDP' | 'ICMP';
      srcPort?: number;
      dstPort?: number;
      flags?: string;
      seq?: number;
      ack?: number;
    };
    application?: {
      name: string;
      headers?: Record<string, string>;
      payload?: string;
      data?: string;
    };
  };
  hexPayload: string;
  asciiPayload: string;
}

export interface TcpStream {
  id: number;
  packets: Array<{
    sender: 'client' | 'server';
    text: string;
  }>;
}

export interface LabObjective {
  id: string;
  text: string;
  completed: boolean;
  hint: string;
  requiredCommandPattern?: string;
  flagId?: string;
}

export interface LabFlag {
  id: string;
  flag: string;
  label: string;
  points: number;
}

export interface Lab {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  difficulty: DifficultyLevel;
  category: LabCategory;
  estimatedMinutes: number;
  xpReward: number;
  badge: {
    title: string;
    icon: string;
  };
  defaultShell: 'kali' | 'powershell';
  target: {
    ip: string;
    hostname: string;
    os: string;
    openPorts: number[];
    services: string[];
  };
  initialFiles: Record<string, string>;
  wiresharkEnabled?: boolean;
  wiresharkPackets?: PacketDetail[];
  wiresharkStreams?: TcpStream[];
  browserTargetUrl?: string;
  objectives: LabObjective[];
  flags: LabFlag[];
  theoryGuide: {
    concept: string;
    summary: string;
    tools: string[];
    cheatSheet: Array<{ command: string; explanation: string }>;
  };
}

export interface UserProgress {
  completedLabIds: string[];
  solvedFlags: string[];
  xp: number;
  completedObjectiveIds: string[];
  unlockedBadges: string[];
  terminalHistory: string[];
  notes: Record<string, string>;
  soundEnabled: boolean;
  crtEffect: boolean;
}
