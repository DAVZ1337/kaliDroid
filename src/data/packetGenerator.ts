import { PacketDetail, TcpStream } from '../types/cyber';

export function getPacketsForLab(labId: string, targetIp: string, customPackets?: PacketDetail[]): PacketDetail[] {
  if (customPackets && customPackets.length > 0) {
    return customPackets;
  }

  // Generate realistic packet captures based on the lab type
  switch (labId) {
    case 'lab-01-nmap':
      return [
        {
          id: 1,
          time: 0.000,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'ICMP',
          length: 98,
          info: `Echo (ping) request  id=0x1a4f, seq=1/256, ttl=64`,
          layers: {
            frame: { number: 1, length: 98, time: '0.000000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'ICMP (1)' },
            transport: { type: 'ICMP' }
          },
          hexPayload: '45000054000040004001c6ecc0a8010fc0a8013208008b8b1a4f0001',
          asciiPayload: 'E..T..@.@.......2...O..'
        },
        {
          id: 2,
          time: 0.001,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'ICMP',
          length: 98,
          info: `Echo (ping) reply    id=0x1a4f, seq=1/256, ttl=64 (reply in 0.41ms)`,
          layers: {
            frame: { number: 2, length: 98, time: '0.000410 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'ICMP (1)' },
            transport: { type: 'ICMP' }
          },
          hexPayload: '45000054a1b040004001253dc0a80132c0a8010f0000938b1a4f0001',
          asciiPayload: 'E..T..@.@.%...2.....O..'
        },
        {
          id: 3,
          time: 0.050,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'TCP',
          length: 66,
          info: `52410 → 21 [SYN] Seq=0 Win=1024 Len=0 MSS=1460 (Nmap Stealth Scan)`,
          tcpStreamId: 1,
          layers: {
            frame: { number: 3, length: 66, time: '0.050120 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 48, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 52410, dstPort: 21, flags: '[SYN]', seq: 0, ack: 0 }
          },
          hexPayload: '45000034a1b240003006352fc0a8010fc0a80132ccba0015',
          asciiPayload: 'E..4..@.0.5/...2...'
        },
        {
          id: 4,
          time: 0.052,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'TCP',
          length: 66,
          info: `21 → 52410 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 (Port 21 OPEN)`,
          tcpStreamId: 1,
          layers: {
            frame: { number: 4, length: 66, time: '0.052010 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 21, dstPort: 52410, flags: '[SYN, ACK]', seq: 0, ack: 1 }
          },
          hexPayload: '45000034a1b440004006252dc0a80132c0a8010f0015ccba',
          asciiPayload: 'E..4..@.@.%...2.....'
        },
        {
          id: 5,
          time: 0.075,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'TCP',
          length: 120,
          info: `Response: 220 (vsftpd 2.3.4) Service Ready. Banner: KALI{nmap_service_discovery_recon}`,
          tcpStreamId: 1,
          layers: {
            frame: { number: 5, length: 120, time: '0.075100 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 21, dstPort: 52410, flags: '[PSH, ACK]', seq: 1, ack: 1 },
            application: {
              name: 'File Transfer Protocol (FTP)',
              payload: '220 (vsftpd 2.3.4) - Banner Flag: KALI{nmap_service_discovery_recon}'
            }
          },
          hexPayload: '323230202876736674706420322e332e3429202d2042616e6e657220466c61673a204b414c497b',
          asciiPayload: '220 (vsftpd 2.3.4) - Banner Flag: KALI{'
        }
      ];

    case 'lab-03-hydra-ssh':
      return [
        {
          id: 1,
          time: 0.000,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'SSH',
          length: 110,
          info: `SSH-2.0-OpenSSH_8.4p1 Debian (Protocol exchange attempt: admin:123456)`,
          layers: {
            frame: { number: 1, length: 110, time: '0.000000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 48920, dstPort: 22 }
          },
          hexPayload: '5353482d322e302d4f70656e5353485f382e3470312044656269616e0d0a',
          asciiPayload: 'SSH-2.0-OpenSSH_8.4p1 Debian..'
        },
        {
          id: 2,
          time: 0.120,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'SSH',
          length: 74,
          info: `SSH-2.0 Authentication Failed: user admin (attempt 1/10)`,
          layers: {
            frame: { number: 2, length: 74, time: '0.120000 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 22, dstPort: 48920 }
          },
          hexPayload: '00000034050000000000000000000000',
          asciiPayload: '...4............'
        },
        {
          id: 3,
          time: 0.450,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'SSH',
          length: 128,
          info: `SSH-2.0 Authentication SUCCESS: user admin, password verified! [Dragon2024!]`,
          layers: {
            frame: { number: 3, length: 128, time: '0.450000 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 22, dstPort: 48928 }
          },
          hexPayload: '000000580a00000001000000000000004b414c497b68796472615f62727574655f666f7263655f',
          asciiPayload: '...X............KALI{hydra_brute_force_'
        }
      ];

    case 'lab-04-sqli-basic':
      return [
        {
          id: 1,
          time: 0.000,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'HTTP',
          length: 220,
          info: `GET /search.php?q=%27+OR+1%3D1-- HTTP/1.1 (SQL Injection Probe)`,
          layers: {
            frame: { number: 1, length: 220, time: '0.000000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 51200, dstPort: 80 },
            application: {
              name: 'Hypertext Transfer Protocol',
              headers: { 'Request URI': "/search.php?q=' OR 1=1 --", 'Host': 'shop.target.internal' }
            }
          },
          hexPayload: '474554202f7365617263682e7068703f713d2532372b4f522b31253344312d2d20485454502f31',
          asciiPayload: 'GET /search.php?q=%27+OR+1%3D1-- HTTP/1'
        },
        {
          id: 2,
          time: 0.045,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'HTTP',
          length: 512,
          info: `HTTP/1.1 200 OK (text/html) - Table dumped with flag KALI{sqli_union_bypass_auth_2026}`,
          layers: {
            frame: { number: 2, length: 512, time: '0.045000 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 80, dstPort: 51200 },
            application: {
              name: 'Hypertext Transfer Protocol',
              headers: { 'Response Code': '200 OK', 'Content-Type': 'text/html' },
              payload: '<td>superadmin</td><td>KALI{sqli_union_bypass_auth_2026}</td>'
            }
          },
          hexPayload: '485454502f312e3120323030204f4b0d0a436f6e74656e742d547970653a20746578742f68746d',
          asciiPayload: 'HTTP/1.1 200 OK..Content-Type: text/htm'
        }
      ];

    case 'lab-09-metasploit':
      return [
        {
          id: 1,
          time: 0.000,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'TCP',
          length: 66,
          info: `59210 → 21 [SYN] Seq=0 Win=64240 Len=0 (Metasploit Exploit init)`,
          tcpStreamId: 1,
          layers: {
            frame: { number: 1, length: 66, time: '0.000000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 59210, dstPort: 21, flags: '[SYN]', seq: 0, ack: 0 }
          },
          hexPayload: '45000034a11040004006c5fed3c20015',
          asciiPayload: 'E..4..@.@.......'
        },
        {
          id: 2,
          time: 0.025,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'TCP',
          length: 82,
          info: `FTP USER test:) - Smiley Backdoor Trigger sent by msfconsole`,
          tcpStreamId: 1,
          layers: {
            frame: { number: 2, length: 82, time: '0.025000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 59210, dstPort: 21, flags: '[PSH, ACK]', seq: 1, ack: 1 },
            application: { name: 'FTP', payload: 'USER test:)\r\nPASS password\r\n' }
          },
          hexPayload: '5553455220746573743a290d0a504153532070617373776f72640d0a',
          asciiPayload: 'USER test:)..PASS password..'
        },
        {
          id: 3,
          time: 0.150,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'TCP',
          length: 66,
          info: `43210 → 6200 [SYN] (Connecting to spawned root shell port 6200)`,
          tcpStreamId: 2,
          layers: {
            frame: { number: 3, length: 66, time: '0.150000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 43210, dstPort: 6200, flags: '[SYN]', seq: 0, ack: 0 }
          },
          hexPayload: '45000034a11240004006c5fc1838',
          asciiPayload: 'E..4..@.@....8'
        },
        {
          id: 4,
          time: 0.180,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'TCP',
          length: 120,
          info: `Root Shell Opened: uid=0(root) gid=0(root). Flag: KALI{metasploit_meterpreter_root_pwn}`,
          tcpStreamId: 2,
          layers: {
            frame: { number: 4, length: 120, time: '0.180000 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 6200, dstPort: 43210, flags: '[PSH, ACK]', seq: 1, ack: 1 },
            application: { name: 'Root Shell Stream', payload: 'id\nuid=0(root) gid=0(root)\ncat /root/flag.txt\nKALI{metasploit_meterpreter_root_pwn}\n' }
          },
          hexPayload: '7569643d3028726f6f7429206769643d3028726f6f74290a4b414c497b6d65746173706c6f6974',
          asciiPayload: 'uid=0(root) gid=0(root).KALI{metasploit'
        }
      ];

    default:
      // Generic active network packets for remaining labs
      return [
        {
          id: 1,
          time: 0.000,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'TCP',
          length: 66,
          info: `54120 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460`,
          layers: {
            frame: { number: 1, length: 66, time: '0.000000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 54120, dstPort: 80, flags: '[SYN]', seq: 0, ack: 0 }
          },
          hexPayload: '45000034a11240004006c5fc',
          asciiPayload: 'E..4..@.@...'
        },
        {
          id: 2,
          time: 0.002,
          source: targetIp,
          destination: '192.168.1.15',
          protocol: 'TCP',
          length: 66,
          info: `80 → 54120 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0`,
          layers: {
            frame: { number: 2, length: 66, time: '0.002000 s' },
            ethernet: { srcMac: '08:00:27:9b:44:c1', dstMac: '08:00:27:fa:21:0a', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: targetIp, dstIp: '192.168.1.15', ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 80, dstPort: 54120, flags: '[SYN, ACK]', seq: 0, ack: 1 }
          },
          hexPayload: '45000034a11440004006c5fa',
          asciiPayload: 'E..4..@.@...'
        },
        {
          id: 3,
          time: 0.010,
          source: '192.168.1.15',
          destination: targetIp,
          protocol: 'HTTP',
          length: 215,
          info: `GET / HTTP/1.1 (Host: ${targetIp})`,
          layers: {
            frame: { number: 3, length: 215, time: '0.010000 s' },
            ethernet: { srcMac: '08:00:27:fa:21:0a', dstMac: '08:00:27:9b:44:c1', type: 'IPv4 (0x0800)' },
            ip: { version: 4, srcIp: '192.168.1.15', dstIp: targetIp, ttl: 64, protocol: 'TCP (6)' },
            transport: { type: 'TCP', srcPort: 54120, dstPort: 80, flags: '[PSH, ACK]', seq: 1, ack: 1 },
            application: { name: 'Hypertext Transfer Protocol', headers: { 'Host': targetIp } }
          },
          hexPayload: '474554202f20485454502f312e310d0a',
          asciiPayload: 'GET / HTTP/1.1..'
        }
      ];
  }
}
