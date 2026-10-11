export interface FileNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FileNode>;
  size?: number;
  permissions?: string;
}

export class VirtualFileSystem {
  private root: FileNode;
  private currentPath: string = '/home/kali';

  constructor(initialUserFiles: Record<string, string> = {}) {
    const homeKaliChildren: Record<string, FileNode> = {
      Desktop: { name: 'Desktop', type: 'dir', children: {}, permissions: 'drwxr-xr-x' },
      Downloads: { name: 'Downloads', type: 'dir', children: {}, permissions: 'drwxr-xr-x' },
      tools: { name: 'tools', type: 'dir', children: {}, permissions: 'drwxr-xr-x' },
    };

    // Populate user files in /home/kali
    Object.entries(initialUserFiles).forEach(([fileName, content]) => {
      // Check if it's in a subfolder like 'wordlists/common.txt'
      if (fileName.includes('/')) {
        const parts = fileName.split('/');
        const folder = parts[0];
        const file = parts[1];
        if (!homeKaliChildren[folder]) {
          homeKaliChildren[folder] = { name: folder, type: 'dir', children: {}, permissions: 'drwxr-xr-x' };
        }
        if (homeKaliChildren[folder].children) {
          homeKaliChildren[folder].children[file] = {
            name: file,
            type: 'file',
            content,
            size: content.length,
            permissions: '-rw-r--r--'
          };
        }
      } else {
        homeKaliChildren[fileName] = {
          name: fileName,
          type: 'file',
          content,
          size: content.length,
          permissions: '-rw-r--r--'
        };
      }
    });

    this.root = {
      name: '/',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      children: {
        home: {
          name: 'home',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          children: {
            kali: {
              name: 'kali',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              children: homeKaliChildren
            }
          }
        },
        etc: {
          name: 'etc',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          children: {
            passwd: {
              name: 'passwd',
              type: 'file',
              content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:kali,,,:/home/kali:/bin/zsh\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
              permissions: '-rw-r--r--'
            },
            hosts: {
              name: 'hosts',
              type: 'file',
              content: '127.0.0.1\tlocalhost\n127.0.1.1\tkali\n192.168.1.50\ttarget-srv01.lan',
              permissions: '-rw-r--r--'
            },
            issue: {
              name: 'issue',
              type: 'file',
              content: 'Kali GNU/Linux Rolling \\n \\l',
              permissions: '-rw-r--r--'
            }
          }
        },
        usr: {
          name: 'usr',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          children: {
            bin: { name: 'bin', type: 'dir', children: {}, permissions: 'drwxr-xr-x' },
            share: {
              name: 'share',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              children: {
                wordlists: {
                  name: 'wordlists',
                  type: 'dir',
                  permissions: 'drwxr-xr-x',
                  children: {
                    'rockyou.txt': {
                      name: 'rockyou.txt',
                      type: 'file',
                      content: '123456\npassword\n12345678\nqwerty\n123456789\n12345\n1234\n111111\n1234567\ndragon\nadmin123\nCyberSecHero2026',
                      permissions: '-rw-r--r--'
                    },
                    'common.txt': {
                      name: 'common.txt',
                      type: 'file',
                      content: 'admin\nlogin\nupload\napi\nconfig\nsecret_backup_admin\nbackup\nrobots.txt',
                      permissions: '-rw-r--r--'
                    }
                  }
                }
              }
            }
          }
        },
        var: {
          name: 'var',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          children: {
            log: {
              name: 'log',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              children: {
                'auth.log': {
                  name: 'auth.log',
                  type: 'file',
                  content: 'Oct 11 08:30:01 kali sshd[1240]: Accepted publickey for kali from 192.168.1.15',
                  permissions: '-rw-r-----'
                }
              }
            }
          }
        },
        tmp: {
          name: 'tmp',
          type: 'dir',
          permissions: 'drwxrwxrwt',
          children: {}
        },
        root: {
          name: 'root',
          type: 'dir',
          permissions: 'drwx------',
          children: {
            'flag.txt': {
              name: 'flag.txt',
              type: 'file',
              content: 'KALI{metasploit_meterpreter_root_pwn}',
              permissions: '-rw-------'
            }
          }
        }
      }
    };
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  // Display prompt path: replaces /home/kali with ~
  getDisplayPath(): string {
    if (this.currentPath === '/home/kali') {
      return '~';
    }
    if (this.currentPath.startsWith('/home/kali/')) {
      return `~${this.currentPath.slice('/home/kali'.length)}`;
    }
    return this.currentPath;
  }

  resolvePath(targetPath: string): string {
    if (!targetPath || targetPath === '~') {
      return '/home/kali';
    }
    if (targetPath.startsWith('~/')) {
      targetPath = `/home/kali/${targetPath.slice(2)}`;
    }

    let absolute: string;
    if (targetPath.startsWith('/')) {
      absolute = targetPath;
    } else {
      absolute = this.currentPath === '/' ? `/${targetPath}` : `${this.currentPath}/${targetPath}`;
    }

    const segments = absolute.split('/').filter(Boolean);
    const resolvedSegments: string[] = [];

    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        resolvedSegments.pop();
      } else {
        resolvedSegments.push(seg);
      }
    }

    return `/${resolvedSegments.join('/')}`;
  }

  getNode(pathStr: string): FileNode | null {
    const cleanPath = this.resolvePath(pathStr);
    if (cleanPath === '/') return this.root;

    const parts = cleanPath.split('/').filter(Boolean);
    let curr: FileNode = this.root;

    for (const part of parts) {
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }

    return curr;
  }

  changeDirectory(targetPath: string): { success: boolean; error?: string } {
    const resolved = this.resolvePath(targetPath);
    const node = this.getNode(resolved);

    if (!node) {
      return { success: false, error: `cd: no such file or directory: ${targetPath}` };
    }
    if (node.type !== 'dir') {
      return { success: false, error: `cd: not a directory: ${targetPath}` };
    }

    this.currentPath = resolved;
    return { success: true };
  }

  listDirectory(pathStr?: string, showAll: boolean = false): { success: boolean; items?: Array<{ name: string; type: 'file' | 'dir'; size?: number; permissions?: string }>; error?: string } {
    const target = pathStr ? this.resolvePath(pathStr) : this.currentPath;
    const node = this.getNode(target);

    if (!node) {
      return { success: false, error: `ls: cannot access '${pathStr}': No such file or directory` };
    }
    if (node.type === 'file') {
      return { success: true, items: [{ name: node.name, type: 'file', size: node.size, permissions: node.permissions }] };
    }

    const children = node.children || {};
    const items = Object.values(children).map(c => ({
      name: c.name,
      type: c.type,
      size: c.size || (c.type === 'dir' ? 4096 : 0),
      permissions: c.permissions || (c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--')
    }));

    return { success: true, items };
  }

  readFile(pathStr: string): { success: boolean; content?: string; error?: string } {
    const node = this.getNode(this.resolvePath(pathStr));
    if (!node) {
      return { success: false, error: `cat: ${pathStr}: No such file or directory` };
    }
    if (node.type === 'dir') {
      return { success: false, error: `cat: ${pathStr}: Is a directory` };
    }
    return { success: true, content: node.content ?? '' };
  }

  writeFile(pathStr: string, content: string, append: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(pathStr);
    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const fileName = resolved.slice(lastSlash + 1);

    const dirNode = this.getNode(dirPath);
    if (!dirNode || dirNode.type !== 'dir' || !dirNode.children) {
      return { success: false, error: `cannot write to '${pathStr}': No such directory` };
    }

    if (dirNode.children[fileName]) {
      const existing = dirNode.children[fileName];
      if (existing.type === 'dir') {
        return { success: false, error: `'${pathStr}' is a directory` };
      }
      existing.content = append ? `${existing.content || ''}${content}` : content;
      existing.size = (existing.content || '').length;
    } else {
      dirNode.children[fileName] = {
        name: fileName,
        type: 'file',
        content,
        size: content.length,
        permissions: '-rw-r--r--'
      };
    }

    return { success: true };
  }

  createDirectory(pathStr: string): { success: boolean; error?: string } {
    const resolved = this.resolvePath(pathStr);
    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const dirName = resolved.slice(lastSlash + 1);

    const parent = this.getNode(dirPath);
    if (!parent || parent.type !== 'dir' || !parent.children) {
      return { success: false, error: `mkdir: cannot create directory '${pathStr}': No such file or directory` };
    }
    if (parent.children[dirName]) {
      return { success: false, error: `mkdir: cannot create directory '${dirName}': File exists` };
    }

    parent.children[dirName] = {
      name: dirName,
      type: 'dir',
      children: {},
      permissions: 'drwxr-xr-x'
    };
    return { success: true };
  }

  remove(pathStr: string, recursive: boolean = false): { success: boolean; error?: string } {
    const resolved = this.resolvePath(pathStr);
    const lastSlash = resolved.lastIndexOf('/');
    const dirPath = lastSlash === 0 ? '/' : resolved.slice(0, lastSlash);
    const name = resolved.slice(lastSlash + 1);

    const parent = this.getNode(dirPath);
    if (!parent || !parent.children || !parent.children[name]) {
      return { success: false, error: `rm: cannot remove '${pathStr}': No such file or directory` };
    }

    const target = parent.children[name];
    if (target.type === 'dir' && !recursive) {
      return { success: false, error: `rm: cannot remove '${pathStr}': Is a directory (use -r)` };
    }

    delete parent.children[name];
    return { success: true };
  }

  // Get autocomplete list from current directory and PATH
  getCompletions(partial: string): string[] {
    const curr = this.getNode(this.currentPath);
    const fileComps = curr?.children ? Object.keys(curr.children) : [];
    return fileComps.filter(c => c.toLowerCase().startsWith(partial.toLowerCase()));
  }
}
