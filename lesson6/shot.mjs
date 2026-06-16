import { spawn } from 'node:child_process';
import http from 'node:http';
import crypto from 'node:crypto';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const htmlPath = path.resolve(process.argv[2]);
const outPath = path.resolve(process.argv[3]);
const fileUrl = 'file://' + htmlPath;
const PORT = 9222;
const WIDTH = 1440;

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--force-device-scale-factor=2',
  `--window-size=${WIDTH},900`,
  'about:blank',
], { stdio: 'ignore' });

const waitPort = (port) => new Promise((res) => {
  const t = setInterval(() => {
    const s = net.connect(port, '127.0.0.1');
    s.on('connect', () => { clearInterval(t); s.end(); res(); });
    s.on('error', () => s.destroy());
  }, 150);
});

const getJSON = (url) => new Promise((res, rej) => {
  http.get(url, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(JSON.parse(d))); }).on('error', rej);
});

// minimal CDP-over-WebSocket client
class CDP {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.id = 0; this.pending = new Map(); }
  connect() {
    return new Promise((resolve, reject) => {
      const u = new URL(this.wsUrl);
      this.sock = net.connect(u.port, u.hostname, () => {
        const key = crypto.randomBytes(16).toString('base64');
        const req =
          `GET ${u.pathname} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\n` +
          `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`;
        this.sock.write(req);
      });
      this.buf = Buffer.alloc(0); this.handshook = false;
      this.sock.on('data', (chunk) => {
        this.buf = Buffer.concat([this.buf, chunk]);
        if (!this.handshook) {
          const idx = this.buf.indexOf('\r\n\r\n');
          if (idx === -1) return;
          this.buf = this.buf.slice(idx + 4); this.handshook = true; resolve();
        }
        this._drain();
      });
      this.sock.on('error', reject);
    });
  }
  _drain() {
    while (this.buf.length >= 2) {
      const b1 = this.buf[1]; let len = b1 & 127; let off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) return;
      const payload = this.buf.slice(off, off + len); this.buf = this.buf.slice(off + len);
      try { const msg = JSON.parse(payload.toString());
        if (msg.id && this.pending.has(msg.id)) { this.pending.get(msg.id)(msg.result); this.pending.delete(msg.id); }
      } catch {}
    }
  }
  send(method, params = {}) {
    const id = ++this.id;
    const data = JSON.stringify({ id, method, params });
    const payload = Buffer.from(data);
    const mask = crypto.randomBytes(4);
    let header;
    const n = payload.length;
    if (n < 126) header = Buffer.from([0x81, 0x80 | n]);
    else if (n < 65536) { header = Buffer.alloc(4); header[0]=0x81; header[1]=0x80|126; header.writeUInt16BE(n,2); }
    else { header = Buffer.alloc(10); header[0]=0x81; header[1]=0x80|127; header.writeBigUInt64BE(BigInt(n),2); }
    const masked = Buffer.alloc(n);
    for (let i=0;i<n;i++) masked[i] = payload[i] ^ mask[i%4];
    this.sock.write(Buffer.concat([header, mask, masked]));
    return new Promise((res) => this.pending.set(id, res));
  }
}

(async () => {
  await waitPort(PORT);
  await new Promise(r => setTimeout(r, 300));
  const targets = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const cdp = new CDP(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: fileUrl });
  await new Promise(r => setTimeout(r, 1500));
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: 'JSON.stringify({w:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),h:Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)})',
    returnByValue: true,
  });
  const dim = JSON.parse(result.value);
  const height = Math.ceil(dim.h);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height, deviceScaleFactor: 2, mobile: false,
  });
  await new Promise(r => setTimeout(r, 600));
  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: WIDTH, height, scale: 1 },
  });
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log(`Saved ${outPath} (${WIDTH}x${height} @2x)`);
  chrome.kill();
  process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
