// 密码重置邮件。
//
// 配置 SMTP_* 后真实投递；未配置时仅把重置链接打印到服务端控制台。
// 为保持原型零依赖，这里使用 Node 内置 net/tls 实现最小 SMTP 客户端。

import net from "node:net";
import tls from "node:tls";
import { EventEmitter } from "node:events";

interface SendResult {
  /** 是否真的通过 SMTP 投递 */
  delivered: boolean;
}

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
  startTLS: boolean;
}

class SMTPClient {
  private socket: SMTPSocket | null = null;
  private buffer = "";

  constructor(private config: SMTPConfig) {}

  async send(to: string, raw: string): Promise<void> {
    await this.connect();
    try {
      await this.expect([220]);
      await this.command(`EHLO ${hostnameForEhlo()}`, [250]);
      if (this.config.startTLS) {
        await this.command("STARTTLS", [220]);
        await this.upgradeToTLS();
        await this.command(`EHLO ${hostnameForEhlo()}`, [250]);
      }
      await this.command("AUTH LOGIN", [334]);
      await this.command(Buffer.from(this.config.user).toString("base64"), [334]);
      await this.command(Buffer.from(this.config.pass).toString("base64"), [235]);
      await this.command(`MAIL FROM:<${this.config.from}>`, [250]);
      await this.command(`RCPT TO:<${to}>`, [250, 251]);
      await this.command("DATA", [354]);
      await this.command(`${escapeSMTPData(raw)}\r\n.`, [250]);
      await this.command("QUIT", [221]);
    } finally {
      this.socket?.end();
      this.socket = null;
    }
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const onError = (e: Error) => reject(e);
      const socket = socketFactory.connect(this.config);
      socket.setEncoding("utf8");
      socket.setTimeout(15000, () => {
        socket.destroy(new Error("SMTP 连接超时"));
      });
      socket.once("error", onError);
      socket.once(this.config.secure ? "secureConnect" : "connect", () => {
        socket.off("error", onError);
        socket.on("data", (chunk) => {
          this.buffer += chunk;
        });
        resolve();
      });
      this.socket = socket;
    });
  }

  private upgradeToTLS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("SMTP 连接未建立"));
        return;
      }
      const raw = this.socket;
      raw.removeAllListeners("data");
      const secure = socketFactory.upgrade(raw, this.config.host);
      secure.setEncoding("utf8");
      secure.setTimeout(15000, () => {
        secure.destroy(new Error("SMTP TLS 握手超时"));
      });
      secure.once("error", reject);
      secure.once("secureConnect", () => {
        secure.off("error", reject);
        secure.on("data", (chunk) => {
          this.buffer += chunk;
        });
        this.socket = secure;
        this.buffer = "";
        resolve();
      });
    });
  }

  private async command(cmd: string, expected: number[]): Promise<string> {
    if (!this.socket) throw new Error("SMTP 连接未建立");
    this.socket.write(`${cmd}\r\n`);
    return this.expect(expected);
  }

  private expect(expected: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const tick = () => {
        const parsed = parseSMTPReply(this.buffer);
        if (parsed) {
          this.buffer = this.buffer.slice(parsed.consumed);
          if (!expected.includes(parsed.code)) {
            reject(new Error(`SMTP 响应异常：${parsed.reply.trim()}`));
            return;
          }
          resolve(parsed.reply);
          return;
        }
        if (Date.now() - startedAt > 15000) {
          reject(new Error("SMTP 响应超时"));
          return;
        }
        setTimeout(tick, 10);
      };
      tick();
    });
  }
}

function smtpConfig(): SMTPConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  const from = process.env.SMTP_FROM?.trim() || user;
  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    startTLS: process.env.SMTP_REQUIRE_TLS
      ? process.env.SMTP_REQUIRE_TLS === "true"
      : port === 587,
  };
}

function hostnameForEhlo(): string {
  return process.env.SMTP_EHLO_HOST?.trim() || "localhost";
}

function parseSMTPReply(raw: string):
  | { code: number; reply: string; consumed: number }
  | null {
  const lines = raw.split(/\r?\n/);
  let consumed = 0;
  let reply = "";
  for (const line of lines) {
    if (!line) return null;
    consumed += line.length + (raw[consumed + line.length] === "\r" ? 2 : 1);
    reply += `${line}\r\n`;
    const match = line.match(/^(\d{3})([ -])/);
    if (!match) return null;
    if (match[2] === " ") {
      return { code: Number(match[1]), reply, consumed };
    }
  }
  return null;
}

function escapeSMTPData(raw: string): string {
  return raw
    .replace(/\r?\n/g, "\r\n")
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

function encodeHeader(value: string): string {
  if (/^[\x00-\x7f]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function buildResetMail(to: string, from: string, link: string): string {
  const subject = "安眠岛密码重置";
  const body = [
    "你好，",
    "",
    "你刚刚申请了重置安眠岛账户密码。请点击下面的链接完成重置：",
    "",
    link,
    "",
    "这个链接 30 分钟内有效，且只能使用一次。",
    "如果不是你本人操作，可以忽略这封邮件。",
    "",
    "安眠岛 Hush",
  ].join("\r\n");

  return [
    `From: ${encodeHeader("安眠岛 Hush")} <${from}>`,
    `To: <${to}>`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

export async function sendResetEmail(
  to: string,
  link: string,
): Promise<SendResult> {
  const config = smtpConfig();

  if (!config) {
    // eslint-disable-next-line no-console
    console.log(`\n[DEV 重置链接] 发给 ${to}:\n${link}\n`);
    return { delivered: false };
  }

  const raw = buildResetMail(to, config.from, link);
  await new SMTPClient(config).send(to, raw);
  return { delivered: true };
}

interface SMTPSocket extends EventEmitter {
  setEncoding(encoding: BufferEncoding): void;
  setTimeout(timeout: number, callback?: () => void): void;
  write(data: string): boolean;
  end(): void;
  destroy(error?: Error): void;
  removeAllListeners(event?: string | symbol): this;
}

interface SocketFactory {
  connect(config: SMTPConfig): SMTPSocket;
  upgrade(socket: SMTPSocket, host: string): SMTPSocket;
}

const socketFactory: SocketFactory = {
  connect(config) {
    return (config.secure
      ? (tls.connect({
          host: config.host,
          port: config.port,
          servername: config.host,
        }) as SMTPSocket)
      : (net.connect({
          host: config.host,
          port: config.port,
        }) as SMTPSocket));
  },
  upgrade(socket, host) {
    return tls.connect({
      socket: socket as unknown as net.Socket,
      servername: host,
    }) as SMTPSocket;
  },
};

export function __setSMTPTestSocketFactory(factory: Partial<SocketFactory> | null): void {
  socketFactory.connect = factory?.connect ?? ((config) =>
    config.secure
      ? (tls.connect({
          host: config.host,
          port: config.port,
          servername: config.host,
        }) as SMTPSocket)
      : (net.connect({
          host: config.host,
          port: config.port,
        }) as SMTPSocket));
  socketFactory.upgrade = factory?.upgrade ?? ((socket, host) =>
    tls.connect({
      socket: socket as unknown as net.Socket,
      servername: host,
    }) as SMTPSocket);
}
