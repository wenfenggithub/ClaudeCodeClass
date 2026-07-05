import { afterEach, describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import {
  __setSMTPTestSocketFactory,
  sendResetEmail,
} from "./mailer";

const SMTP_ENV = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "SMTP_SECURE",
  "SMTP_REQUIRE_TLS",
] as const;

const originalEnv = Object.fromEntries(
  SMTP_ENV.map((key) => [key, process.env[key]]),
);

class FakeSocket extends EventEmitter {
  commands: string[] = [];
  message = "";
  private dataMode = false;

  setEncoding() {}
  setTimeout() {}
  end() {}
  destroy(error?: Error) {
    if (error) this.emit("error", error);
  }

  write(data: string): boolean {
    for (const rawLine of data.split(/\r?\n/)) {
      if (!rawLine && !this.dataMode) continue;
      if (this.dataMode) {
        if (rawLine === ".") {
          this.dataMode = false;
          this.emit("data", "250 queued\r\n");
        } else {
          this.message += `${rawLine}\n`;
        }
        continue;
      }
      this.commands.push(rawLine);
      if (/^EHLO /i.test(rawLine)) this.emit("data", "250-fake\r\n250 AUTH LOGIN\r\n");
      else if (/^AUTH LOGIN/i.test(rawLine)) this.emit("data", "334 VXNlcm5hbWU6\r\n");
      else if (rawLine === Buffer.from("user@example.com").toString("base64")) this.emit("data", "334 UGFzc3dvcmQ6\r\n");
      else if (rawLine === Buffer.from("secret").toString("base64")) this.emit("data", "235 ok\r\n");
      else if (/^MAIL FROM:/i.test(rawLine)) this.emit("data", "250 ok\r\n");
      else if (/^RCPT TO:/i.test(rawLine)) this.emit("data", "250 ok\r\n");
      else if (/^DATA/i.test(rawLine)) {
        this.dataMode = true;
        this.emit("data", "354 end with dot\r\n");
      } else if (/^QUIT/i.test(rawLine)) {
        this.emit("data", "221 bye\r\n");
      }
    }
    return true;
  }
}

afterEach(() => {
  __setSMTPTestSocketFactory(null);
  for (const key of SMTP_ENV) {
    const value = originalEnv[key];
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("sendResetEmail", () => {
  it("SMTP 已配置时真实投递邮件", async () => {
    const socket = new FakeSocket();
    __setSMTPTestSocketFactory({
      connect: () => {
        queueMicrotask(() => {
          socket.emit("connect");
          socket.emit("data", "220 fake smtp\r\n");
        });
        return socket;
      },
    });

    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "2525";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "user@example.com";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_REQUIRE_TLS = "false";

    const result = await sendResetEmail(
      "receiver@example.com",
      "http://localhost/reset?token=abc",
    );

    expect(result.delivered).toBe(true);
    expect(socket.commands).toContain("AUTH LOGIN");
    expect(socket.commands).toContain("MAIL FROM:<user@example.com>");
    expect(socket.commands).toContain("RCPT TO:<receiver@example.com>");
    expect(socket.message).toContain("To: <receiver@example.com>");
    expect(socket.message).toContain("http://localhost/reset?token=abc");
  });
});
