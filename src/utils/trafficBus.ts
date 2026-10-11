import { PacketDetail, TcpStream } from '../types/cyber';

type TrafficListener = (packets: PacketDetail[]) => void;

class TrafficCaptureManager {
  private packets: PacketDetail[] = [];
  private streams: TcpStream[] = [];
  private listeners: TrafficListener[] = [];
  private packetIdCounter = 1;
  private startTime = Date.now();

  initForLab(initialPackets: PacketDetail[] = [], initialStreams: TcpStream[] = []) {
    this.packets = [...initialPackets];
    this.streams = [...initialStreams];
    this.packetIdCounter = this.packets.length + 1;
    this.startTime = Date.now();
    this.notify();
  }

  getPackets(): PacketDetail[] {
    return this.packets;
  }

  getStreams(): TcpStream[] {
    return this.streams;
  }

  subscribe(listener: TrafficListener): () => void {
    this.listeners.push(listener);
    listener(this.packets);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.packets]));
  }

  clear() {
    this.packets = [];
    this.packetIdCounter = 1;
    this.startTime = Date.now();
    this.notify();
  }

  addPacket(packet: Omit<PacketDetail, 'id' | 'time'>) {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const newPacket: PacketDetail = {
      ...packet,
      id: this.packetIdCounter++,
      time: Number(elapsed.toFixed(3))
    };
    this.packets = [...this.packets, newPacket];
    this.notify();
  }

  // Handle command-triggered real network traffic
  recordCommandTraffic(cmd: string, targetIp: string, targetHostname: string) {
    const lower = cmd.toLowerCase().trim();
    const myIp = '192.168.1.15';

    // 1. PING Command
    if (lower.startsWith('ping')) {
      for (let seq = 1; seq <= 3; seq++) {
        setTimeout(() => {
          this.addPacket({
            source: myIp,
            destination: targetIp,
            protocol: 'ICMP',
            length: 98,
            info: `Echo (ping) request  id=0x1a4f, seq=${seq}/256, ttl=64`,
            layers: {
              frame: { number: this.packetIdCounter, length: 98, time: `${(seq * 0.4).toFixed(3)} s` },
              ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
              ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'ICMP (1)' },
              transport: { type: 'ICMP' }
            },
            hexPayload: '45000054000040004001c6ecc0a8010fc0a8013208008b8b1a4f',
            asciiPayload: 'E..T..@.@.......2...O'
          });

          this.addPacket({
            source: targetIp,
            destination: myIp,
            protocol: 'ICMP',
            length: 98,
            info: `Echo (ping) reply    id=0x1a4f, seq=${seq}/256, ttl=64 (reply in 0.41ms)`,
            layers: {
              frame: { number: this.packetIdCounter, length: 98, time: `${(seq * 0.4 + 0.001).toFixed(3)} s` },
              ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
              ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'ICMP (1)' },
              transport: { type: 'ICMP' }
            },
            hexPayload: '45000054a1b040004001253dc0a80132c0a8010f0000938b1a4f',
            asciiPayload: 'E..T..@.@.%...2.....O'
          });
        }, (seq - 1) * 200);
      }
      return;
    }

    // 2. NMAP Command
    if (lower.startsWith('nmap')) {
      const isVersionScan = lower.includes('-sv') || lower.includes('-s');
      const targetPort = targetIp.endsWith('.50') ? 21 : 80;

      // ARP who-has
      this.addPacket({
        source: myIp,
        destination: targetIp,
        protocol: 'ARP',
        length: 42,
        info: `Who has ${targetIp}? Tell ${myIp}`,
        layers: {
          frame: { number: this.packetIdCounter, length: 42, time: '0.000 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: 'ff:ff:ff:ff:ff:ff', type: 'ARP (0x0806)' },
          ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'ARP' },
          transport: { type: 'UDP' }
        },
        hexPayload: 'ffffffffffff080027fa210a08060001080006040001',
        asciiPayload: '......\'.!.......'
      });

      // TCP SYN scan
      this.addPacket({
        source: myIp,
        destination: targetIp,
        protocol: 'TCP',
        length: 66,
        info: `52410 → ${targetPort} [SYN] Seq=0 Win=1024 Len=0 (Nmap SYN Stealth Scan)`,
        tcpStreamId: 1,
        layers: {
          frame: { number: this.packetIdCounter, length: 66, time: '0.040 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 48, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 52410, dstPort: targetPort, flags: '[SYN]', seq: 0, ack: 0 }
        },
        hexPayload: '45000034a1b240003006352fc0a8010fc0a80132ccba',
        asciiPayload: 'E..4..@.0.5/...2..'
      });

      // Target responds with SYN, ACK
      this.addPacket({
        source: targetIp,
        destination: myIp,
        protocol: 'TCP',
        length: 66,
        info: `${targetPort} → 52410 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 (Port ${targetPort} OPEN)`,
        tcpStreamId: 1,
        layers: {
          frame: { number: this.packetIdCounter, length: 66, time: '0.042 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: targetPort, dstPort: 52410, flags: '[SYN, ACK]', seq: 0, ack: 1 }
        },
        hexPayload: '45000034a1b440004006252dc0a80132c0a8010f',
        asciiPayload: 'E..4..@.@.%...2...'
      });

      if (isVersionScan && targetPort === 21) {
        this.addPacket({
          source: targetIp,
          destination: myIp,
          protocol: 'TCP',
          length: 120,
          info: `21 → 52410 Response: 220 (vsftpd 2.3.4) Banner: KALI{nmap_service_discovery_recon}`,
          tcpStreamId: 1,
          layers: {
            frame: { number: this.packetIdCounter, length: 120, time: '0.065 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 21, dstPort: 52410, flags: '[PSH, ACK]', seq: 1, ack: 1 },
            application: { name: 'FTP', payload: '220 (vsftpd 2.3.4) Service ready - KALI{nmap_service_discovery_recon}' }
          },
          hexPayload: '323230202876736674706420322e332e34292053657276696365',
          asciiPayload: '220 (vsftpd 2.3.4) Service'
        });
      }
      return;
    }

    // 3. CURL / WGET
    if (lower.startsWith('curl') || lower.startsWith('wget')) {
      this.addPacket({
        source: myIp,
        destination: targetIp,
        protocol: 'HTTP',
        length: 210,
        info: `GET ${lower.includes('config.backup') ? '/secret_backup_admin/config.backup' : '/'} HTTP/1.1 (User-Agent: curl/8.5.0)`,
        layers: {
          frame: { number: this.packetIdCounter, length: 210, time: '0.010 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 53120, dstPort: 80, flags: '[PSH, ACK]' },
          application: { name: 'HTTP', headers: { 'User-Agent': 'curl/8.5.0', 'Host': targetHostname } }
        },
        hexPayload: '474554202f20485454502f312e310d0a',
        asciiPayload: 'GET / HTTP/1.1..'
      });

      this.addPacket({
        source: targetIp,
        destination: myIp,
        protocol: 'HTTP',
        length: 340,
        info: `HTTP/1.1 200 OK (${lower.includes('config.backup') ? 'text/plain; KALI{gobuster_hidden_endpoint_leaked}' : 'text/html'})`,
        layers: {
          frame: { number: this.packetIdCounter, length: 340, time: '0.025 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 53120, flags: '[PSH, ACK]' },
          application: { name: 'HTTP', headers: { 'Status': '200 OK' } }
        },
        hexPayload: '485454502f312e3120323030204f4b0d0a',
        asciiPayload: 'HTTP/1.1 200 OK..'
      });
      return;
    }

    // 4. HYDRA
    if (lower.startsWith('hydra')) {
      const passwords = ['123456', 'password', 'Dragon2024!'];
      passwords.forEach((pass, i) => {
        setTimeout(() => {
          this.addPacket({
            source: myIp,
            destination: targetIp,
            protocol: 'SSH',
            length: 110,
            info: `SSH-2.0 auth attempt: admin:${pass === 'Dragon2024!' ? 'Dragon2024! [SUCCESS]' : pass + ' [FAILED]'}`,
            layers: {
              frame: { number: this.packetIdCounter, length: 110, time: `${(0.1 * (i + 1)).toFixed(3)} s` },
              ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
              ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
              transport: { type: 'TCP', srcPort: 48920 + i, dstPort: 22 }
            },
            hexPayload: '5353482d322e302d4f70656e535348',
            asciiPayload: 'SSH-2.0-OpenSSH'
          });
        }, i * 200);
      });
      return;
    }

    // 5. GOBUSTER
    if (lower.startsWith('gobuster')) {
      const endpoints = ['/login', '/admin', '/secret_backup_admin', '/robots.txt'];
      endpoints.forEach((ep, i) => {
        setTimeout(() => {
          this.addPacket({
            source: myIp,
            destination: targetIp,
            protocol: 'HTTP',
            length: 195,
            info: `GET ${ep} HTTP/1.1 (Gobuster Fuzzing) → Status: ${ep === '/admin' ? '403' : ep === '/secret_backup_admin' ? '301' : '200'}`,
            layers: {
              frame: { number: this.packetIdCounter, length: 195, time: `${(0.08 * (i + 1)).toFixed(3)} s` },
              ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
              ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
              transport: { type: 'TCP', srcPort: 54100 + i, dstPort: 80 }
            },
            hexPayload: '474554202f20485454502f312e31',
            asciiPayload: 'GET / HTTP/1.1'
          });
        }, i * 150);
      });
      return;
    }

    // 6. SQLMAP
    if (lower.startsWith('sqlmap')) {
      this.addPacket({
        source: myIp,
        destination: targetIp,
        protocol: 'HTTP',
        length: 260,
        info: `GET /product.php?id=1%20UNION%20SELECT%201,table_name%20FROM%20information_schema.tables HTTP/1.1`,
        layers: {
          frame: { number: this.packetIdCounter, length: 260, time: '0.040 s' },
          ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 55210, dstPort: 80 }
        },
        hexPayload: '474554202f70726f647563742e706870',
        asciiPayload: 'GET /product.php'
      });

      this.addPacket({
        source: targetIp,
        destination: myIp,
        protocol: 'HTTP',
        length: 480,
        info: `HTTP/1.1 200 OK (Extracted: corporate_db.secret_vault -> KALI{sqlmap_dumped_corporate_vault})`,
        layers: {
          frame: { number: this.packetIdCounter, length: 480, time: '0.055 s' },
          ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
          ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'TCP (6)' },
          transport: { type: 'TCP', srcPort: 80, dstPort: 55210 }
        },
        hexPayload: '485454502f312e3120323030204f4b',
        asciiPayload: 'HTTP/1.1 200 OK'
      });
      return;
    }
  }

  // Record traffic from conventional browser interaction
  recordBrowserRequest(url: string, method: string = 'GET', data?: string) {
    const myIp = '192.168.1.15';
    let targetIp = '192.168.1.80';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      targetIp = parsed.hostname;
    } catch {}

    this.addPacket({
      source: myIp,
      destination: targetIp,
      protocol: 'HTTP',
      length: 240,
      info: `${method} ${url} HTTP/1.1 (Chrome for Android / Conventional Browser)`,
      layers: {
        frame: { number: this.packetIdCounter, length: 240, time: '0.010 s' },
        ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
        ip: { version: 4, srcIp: myIp, dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
        transport: { type: 'TCP', srcPort: 58200, dstPort: 80, flags: '[PSH, ACK]' },
        application: {
          name: 'HTTP',
          headers: { 'Method': method, 'URI': url, 'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/124.0.0.0 Mobile' },
          payload: data
        }
      },
      hexPayload: '474554202f20485454502f312e31',
      asciiPayload: `${method} / HTTP/1.1`
    });

    this.addPacket({
      source: targetIp,
      destination: myIp,
      protocol: 'HTTP',
      length: 420,
      info: `HTTP/1.1 200 OK (Content-Type: text/html; charset=utf-8)`,
      layers: {
        frame: { number: this.packetIdCounter, length: 420, time: '0.028 s' },
        ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
        ip: { version: 4, srcIp: targetIp, dstIp: myIp, ttl: 64, protocol: 'TCP (6)' },
        transport: { type: 'TCP', srcPort: 80, dstPort: 58200, flags: '[PSH, ACK]' },
        application: { name: 'HTTP', headers: { 'Status': '200 OK' } }
      },
      hexPayload: '485454502f312e3120323030204f4b',
      asciiPayload: 'HTTP/1.1 200 OK'
    });
  }
}

export const trafficManager = new TrafficCaptureManager();
