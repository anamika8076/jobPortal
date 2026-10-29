#!/usr/bin/env node

/**
 * Infrastructure Health Check Script
 * Tests whether Kafka (9092), Redis (6379), and PostgreSQL (5432) are reachable.
 * Also intelligently detects if Auth service is configured with Cloud Redis (e.g. Upstash).
 */

const net = require("net");
const tls = require("tls");
const fs = require("fs");
const path = require("path");

const TIMEOUT_MS = 2500;

function readAuthEnv() {
  try {
    const authEnvPath = path.resolve(__dirname, "../services/auth/.env");
    if (fs.existsSync(authEnvPath)) {
      const content = fs.readFileSync(authEnvPath, "utf8");
      const match = content.match(/Redis_url=(.*)/i);
      if (match) {
        return match[1].trim();
      }
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

function checkTcp(host, port, useTls = false) {
  return new Promise((resolve) => {
    let hasReturned = false;

    const onFinish = (isOnline, errorMsg = null) => {
      if (hasReturned) return;
      hasReturned = true;
      resolve({ isOnline, errorMsg });
    };

    try {
      const socket = useTls
        ? tls.connect(port, host, { timeout: TIMEOUT_MS, rejectUnauthorized: false }, () => {
            socket.destroy();
            onFinish(true);
          })
        : net.createConnection({ port, host, timeout: TIMEOUT_MS }, () => {
            socket.destroy();
            onFinish(true);
          });

      socket.setTimeout(TIMEOUT_MS);

      socket.on("timeout", () => {
        socket.destroy();
        onFinish(false, `Timed out after ${TIMEOUT_MS}ms`);
      });

      socket.on("error", (err) => {
        socket.destroy();
        onFinish(false, err.message);
      });
    } catch (err) {
      onFinish(false, err.message);
    }
  });
}

async function runCheck() {
  console.log("\n========================================================");
  console.log("       🔍 Hirely Infrastructure Health Check        ");
  console.log("========================================================\n");

  const services = [
    {
      name: "Kafka",
      host: "127.0.0.1",
      port: 9092,
      description: "Message Broker",
      fixCommand: "docker start <kafka-container> OR brew services start kafka",
    },
    {
      name: "PostgreSQL",
      host: "127.0.0.1",
      port: 5432,
      description: "Relational Database",
      fixCommand: "brew services start postgresql@14 OR docker start <postgres-container>",
    },
  ];

  let allHealthy = true;

  // 1. Check Kafka and PostgreSQL
  for (const svc of services) {
    const target = `${svc.host}:${svc.port}`;
    const res = await checkTcp(svc.host, svc.port);
    if (res.isOnline) {
      console.log(` \x1b[32m[✓] ONLINE \x1b[0m ${svc.name.padEnd(12)} (${target.padEnd(16)}) - ${svc.description}`);
    } else {
      allHealthy = false;
      console.log(` \x1b[31m[✗] OFFLINE\x1b[0m ${svc.name.padEnd(12)} (${target.padEnd(16)}) - ${svc.description}`);
      console.log(`     \x1b[33mReason:\x1b[0m ${res.errorMsg}`);
      console.log(`     \x1b[36mTo Start:\x1b[0m ${svc.fixCommand}\n`);
    }
  }

  // 2. Check Redis (Local vs Configured in services/auth/.env)
  const configuredRedisUrl = readAuthEnv();
  const localRedisRes = await checkTcp("127.0.0.1", 6379);

  if (localRedisRes.isOnline) {
    console.log(` \x1b[32m[✓] ONLINE \x1b[0m ${"Redis".padEnd(12)} (${"127.0.0.1:6379".padEnd(16)}) - In-memory Cache & Token Storage`);
  } else if (configuredRedisUrl && configuredRedisUrl.includes("upstash.io")) {
    // Auth service is configured to use Upstash Cloud Redis
    try {
      const parsed = new URL(configuredRedisUrl);
      const isTls = parsed.protocol === "rediss:";
      const port = Number(parsed.port) || (isTls ? 6379 : 6379);
      const host = parsed.hostname;

      const cloudRes = await checkTcp(host, port, isTls);
      if (cloudRes.isOnline) {
        console.log(` \x1b[32m[✓] ONLINE \x1b[0m ${"Redis (Cloud)".padEnd(12)} (${`${host}:${port}`.padEnd(16)}) - Upstash Redis (configured in services/auth/.env)`);
        console.log(`     \x1b[36mNotice:\x1b[0m Local 127.0.0.1:6379 is not running, but your Auth service is using Upstash Cloud Redis.`);
      } else {
        allHealthy = false;
        console.log(` \x1b[31m[✗] OFFLINE\x1b[0m Redis (Local & Upstash Cloud)`);
        console.log(`     Local 127.0.0.1:6379 is offline: ${localRedisRes.errorMsg}`);
        console.log(`     Upstash Cloud (${host}:${port}) is also unreachable: ${cloudRes.errorMsg}`);
        console.log(`     \x1b[36mTo Start Local Redis:\x1b[0m docker run -d --name redis -p 6379:6379 redis:alpine\n`);
      }
    } catch {
      allHealthy = false;
      console.log(` \x1b[31m[✗] OFFLINE\x1b[0m ${"Redis".padEnd(12)} (${"127.0.0.1:6379".padEnd(16)}) - In-memory Cache & Token Storage`);
      console.log(`     \x1b[33mReason:\x1b[0m ${localRedisRes.errorMsg}`);
      console.log(`     \x1b[36mTo Start:\x1b[0m docker run -d --name redis -p 6379:6379 redis:alpine OR brew services start redis\n`);
    }
  } else {
    allHealthy = false;
    console.log(` \x1b[31m[✗] OFFLINE\x1b[0m ${"Redis".padEnd(12)} (${"127.0.0.1:6379".padEnd(16)}) - In-memory Cache & Token Storage`);
    console.log(`     \x1b[33mReason:\x1b[0m ${localRedisRes.errorMsg}`);
    console.log(`     \x1b[36mTo Start Local Redis:\x1b[0m docker run -d --name redis -p 6379:6379 redis:alpine OR brew services start redis\n`);
  }

  console.log("\n--------------------------------------------------------");

  if (allHealthy) {
    console.log(" \x1b[32m✔ All infrastructure dependencies are reachable!\x1b[0m");
    console.log(" You can safely start the backend services with: \x1b[1mnpm run dev\x1b[0m\n");
    process.exit(0);
  } else {
    console.log(" \x1b[31m✖ One or more required services are not reachable.\x1b[0m");
    console.log(" Please ensure your dependencies are running before starting the backend.\n");
    process.exit(1);
  }
}

runCheck();
