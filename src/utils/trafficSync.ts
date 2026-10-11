import { PacketDetail, TcpStream } from '../types/cyber';

export interface TrafficEvent {
  id: string;
  command: string;
  timestamp: number;
  packets: PacketDetail[];
  stream?: TcpStream;
}

type TrafficListener = (packets: PacketDetail[]) => void;

class TrafficSyncManager {
  private listeners: Set<TrafficListener> = new Set();
  private dynamicPacketsByLab: Record<string, PacketDetail[]> = {};
  private packetCounter: number = 5000;

  public subscribe(listener: TrafficListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getDynamicPackets(labId: string): PacketDetail[] {
    return this.dynamicPacketsByLab[labId] || [];
  }

  public clearDynamicPackets(labId: string) {
    this.dynamicPacketsByLab[labId] = [];
    this.notify([]);
  }

  private notify(packets: PacketDetail[]) {
    this.listeners.forEach((listener) => {
      try {
        listener(packets);
      } catch (err) {
        console.error('TrafficListener error:', err);
      }
    });
  }

  public recordCommandTraffic(labId: string, cmd: string, targetIp: string): PacketDetail[] {
    const trimmed = cmd.trim().toLowerCase();
    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0];
    const generated: PacketDetail[] = [];
    const now = Number((Date.now() / 1000 % 10000).toFixed(3));

    // 1. PING (ICMP Echo Request & Echo Reply)
    if (mainCmd === 'ping') {
      const p1: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'ICMP',
        length: 98,
        info: `Echo (ping) request  id=0x${Math.floor(Math.random()*65535).toString(16)}, seq=1/256, ttl=64`,
        layers: {
          frame: { number: this.packetCounter, length: 98, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'ICMP (1)' },
          transport: { type: 'ICMP' }
        },
        hexPayload: '45000054000040004001c6ecc0a8010fc0a8013208008b8b1a4f0001',
        asciiPayload: 'E..T..@.@.......2...O..'
      };

      const p2: PacketDetail = {
        id: ++this.packetCounter,
        time: Number((now + 0.001).toFixed(3)),
        source: targetIp,
        destination: '192.168.1.15',
        protocol: 'ICMP',
        length: 98,
        info: `Echo (ping) reply    id=0x${Math.floor(Math.random()*65535).toString(16)}, seq=1/256, ttl=64`,
        layers: {
          frame: { number: this.packetCounter, length: 98, time: `${Number((now + 0.001).toFixed(3))} s` },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'ICMP (1)' },
          transport: { type: 'ICMP' }
        },
        hexPayload: '45000054a1b040004001253dc0a80132c0a8010f0000938b1a4f0001',
        asciiPayload: 'E..T..@.@.%...2.....O..'
      };

      generated.push(p1, p2);
    }

    // 2. NMAP (SYN Stealth Port Scan & Responses)
    else if (mainCmd === 'nmap') {
      const stream = Math.floor(Math.random() * 50) + 10;
      const port = 21; // target open port
      const syn: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'TCP',
        length: 66,
        info: `54321 → ${port} [SYN] Seq=0 Win=1024 Len=0 (Nmap Scan Probe)`,
        tcpStreamId: stream,
        layers: {
          frame: { number: this.packetCounter, length: 66, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 48, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 54321, dstPort: port, flags: '[SYN]', seq: 0, ack: 0 }
        },
        hexPayload: '45000034a1b240003006352fc0a8010fc0a80132ccba0015',
        asciiPayload: 'E..4..@.0.5/...2...'
      };

      const synAck: PacketDetail = {
        id: ++this.packetCounter,
        time: Number((now + 0.002).toFixed(3)),
        source: targetIp,
        destination: '192.168.1.15',
        protocol: 'TCP',
        length: 66,
        info: `${port} → 54321 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 (Port ${port} OPEN)`,
        tcpStreamId: stream,
        layers: {
          frame: { number: this.packetCounter, length: 66, time: `${Number((now + 0.002).toFixed(3))} s` },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: port, dstPort: 54321, flags: '[SYN, ACK]', seq: 0, ack: 1 }
        },
        hexPayload: '45000034a1b440004006252dc0a80132c0a8010f0015ccba',
        asciiPayload: 'E..4..@.@.%...2.....'
      };

      generated.push(syn, synAck);
    }

    // 3. CURL / WGET / HTTP Requests
    else if (mainCmd === 'curl' || mainCmd === 'wget' || trimmed.startsWith('invoke-webrequest')) {
      const stream = Math.floor(Math.random() * 50) + 20;
      const path = parts[1] || '/';
      const cleanPath = path.startsWith('http') ? new URL(path).pathname || '/' : path;

      const httpReq: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'HTTP',
        length: 220,
        info: `GET ${cleanPath} HTTP/1.1 (User-Agent: curl/8.5.0)`,
        tcpStreamId: stream,
        layers: {
          frame: { number: this.packetCounter, length: 220, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 51220, dstPort: 80, flags: '[PSH, ACK]', seq: 1, ack: 1 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Request Method': 'GET',
              'Request URI': cleanPath,
              'Host': targetIp,
              'User-Agent': 'curl/8.5.0'
            }
          }
        },
        hexPayload: '474554202f20485454502f312e310d0a486f73743a20',
        asciiPayload: `GET ${cleanPath} HTTP/1.1..Host: ${targetIp}`
      };

      const httpRes: PacketDetail = {
        id: ++this.packetCounter,
        time: Number((now + 0.045).toFixed(3)),
        source: targetIp,
        destination: '192.168.1.15',
        protocol: 'HTTP',
        length: 340,
        info: `HTTP/1.1 200 OK (text/plain, 120 bytes)`,
        tcpStreamId: stream,
        layers: {
          frame: { number: this.packetCounter, length: 340, time: `${Number((now + 0.045).toFixed(3))} s` },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 51220, flags: '[PSH, ACK]', seq: 1, ack: 221 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'Response Code': '200 OK',
              'Content-Type': 'text/plain',
              'Server': 'Apache/2.4.56 (KaliDroid Target)'
            },
            payload: 'HTTP 200 OK Response from Target Server'
          }
        },
        hexPayload: '485454502f312e3120323030204f4b0d0a',
        asciiPayload: 'HTTP/1.1 200 OK..'
      };

      generated.push(httpReq, httpRes);
    }

    // 4. HYDRA / SSH (SSH Handshake and auth attempts)
    else if (mainCmd === 'hydra' || mainCmd === 'ssh') {
      const sshReq: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'SSH',
        length: 124,
        info: `SSH-2.0-OpenSSH_8.9p1 Ubuntu (Auth probe: admin)`,
        layers: {
          frame: { number: this.packetCounter, length: 124, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 52140, dstPort: 22 }
        },
        hexPayload: '5353482d322e302d4f70656e5353485f382e3970310d0a',
        asciiPayload: 'SSH-2.0-OpenSSH_8.9p1..'
      };

      const sshRes: PacketDetail = {
        id: ++this.packetCounter,
        time: Number((now + 0.05).toFixed(3)),
        source: targetIp,
        destination: '192.168.1.15',
        protocol: 'SSH',
        length: 98,
        info: `SSH-2.0 Protocol Response / Key Exchange Init`,
        layers: {
          frame: { number: this.packetCounter, length: 98, time: `${Number((now + 0.05).toFixed(3))} s` },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 22, dstPort: 52140 }
        },
        hexPayload: '000000480a000000',
        asciiPayload: '...H....'
      };

      generated.push(sshReq, sshRes);
    }

    // 5. GOBUSTER / SQLMAP (Web fuzzing probes)
    else if (mainCmd === 'gobuster' || mainCmd === 'sqlmap') {
      const toolProbe: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'HTTP',
        length: 245,
        info: `${mainCmd.toUpperCase()} Audit Probe → /${parts[2] || 'audit.php'} (Status 200 OK)`,
        layers: {
          frame: { number: this.packetCounter, length: 245, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 48920, dstPort: 80 },
          application: {
            name: 'Hypertext Transfer Protocol',
            headers: {
              'User-Agent': `${mainCmd}/v2.0 (Security Scanner)`,
              'Host': targetIp
            }
          }
        },
        hexPayload: '474554202f20485454502f312e31',
        asciiPayload: 'GET / HTTP/1.1..'
      };
      generated.push(toolProbe);
    }

    // 6. METASPLOIT / EXPLOIT
    else if (trimmed.includes('exploit') || trimmed.includes('msfconsole') || trimmed.startsWith('use ')) {
      const exploitPkt: PacketDetail = {
        id: ++this.packetCounter,
        time: now,
        source: '192.168.1.15',
        destination: targetIp,
        protocol: 'TCP',
        length: 110,
        info: `Metasploit Exploit Trigger: Port 21 vsftpd Backdoor payload`,
        layers: {
          frame: { number: this.packetCounter, length: 110, time: `${now} s` },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 54100, dstPort: 21 }
        },
        hexPayload: '5553455220746573743a290d0a',
        asciiPayload: 'USER test:)..'
      };
      generated.push(exploitPkt);
    }

    if (generated.length > 0) {
      if (!this.dynamicPacketsByLab[labId]) {
        this.dynamicPacketsByLab[labId] = [];
      }
      this.dynamicPacketsByLab[labId].push(...generated);
      this.notify(this.dynamicPacketsByLab[labId]);
    }

    return generated;
  }
}

export const trafficSync = new TrafficSyncManager();
