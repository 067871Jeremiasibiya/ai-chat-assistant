#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_BIN ?? '/usr/local/bin/google-chrome';
const userDataDir = '/tmp/job-copilot-smoke-profile';
const screenshotPath = resolve(process.cwd(), 'job-copilot-smoke.webp');
const appUrl = 'http://localhost:3002';
const debugPort = 9223;
const runHeadless = process.env.SMOKE_HEADLESS !== '0';

const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

const requestJson = (url) =>
  new Promise((resolveRequest, rejectRequest) => {
    const req = request(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolveRequest(JSON.parse(body));
        } catch (error) {
          rejectRequest(error);
        }
      });
    });
    req.on('error', rejectRequest);
    req.end();
  });

const waitForChrome = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const pages = await requestJson(`http://127.0.0.1:${debugPort}/json`);
      if (Array.isArray(pages) && pages.length > 0) return pages[0];
    } catch {
      await wait(200);
    }
  }
  throw new Error('Chrome debugging endpoint did not start.');
};

const connect = (webSocketDebuggerUrl) =>
  new Promise((resolveConnect, rejectConnect) => {
    const socket = new WebSocket(webSocketDebuggerUrl);
    let messageId = 0;
    const pending = new Map();

    socket.addEventListener('open', () => {
      const send = (method, params = {}) =>
        new Promise((resolveSend, rejectSend) => {
          messageId += 1;
          pending.set(messageId, { resolve: resolveSend, reject: rejectSend });
          socket.send(JSON.stringify({ id: messageId, method, params }));
        });

      const close = () => socket.close();
      resolveConnect({ send, close });
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;

      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
    });

    socket.addEventListener('error', rejectConnect);
  });

const evaluate = async (client, expression) => {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'Browser evaluation failed.';
    throw new Error(detail);
  }

  return result.result.value;
};

rmSync(userDataDir, { recursive: true, force: true });
mkdirSync(userDataDir, { recursive: true });

const chromeArgs = [
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  '--window-size=1440,1400',
  appUrl,
];

if (runHeadless) {
  chromeArgs.unshift('--headless=new');
}

const chrome = spawn(chromePath, chromeArgs);

try {
  const page = await waitForChrome();
  const client = await connect(page.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await evaluate(
    client,
    `new Promise((resolve) => {
      if (document.querySelector('[data-testid="profile-name"]')) resolve(true);
      const interval = setInterval(() => {
        if (document.querySelector('[data-testid="profile-name"]')) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    })`,
  );

  await evaluate(
    client,
    `(() => {
      localStorage.clear();
      location.reload();
      return true;
    })()`,
  );
  await wait(800);

  await evaluate(
    client,
    `(() => {
      const setNativeValue = (element, value) => {
        const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').set;
        setter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      setNativeValue(document.querySelector('[data-testid="profile-name"]'), 'Jeremia Sibiya');
      setNativeValue(document.querySelector('[data-testid="target-role"]'), 'Backend Developer');
      setNativeValue(document.querySelector('[data-testid="new-job-company"]'), 'CloudHire Labs');
      setNativeValue(document.querySelector('[data-testid="new-job-role"]'), 'Junior Backend Developer');
      setNativeValue(document.querySelector('[data-testid="new-job-stack"]'), 'Node.js, Express, SQL, Testing');
      setNativeValue(document.querySelector('[data-testid="new-job-source"]'), 'LinkedIn lead');
      document.querySelector('[data-testid="save-job"]').click();
      return true;
    })()`,
  );
  await wait(400);

  await evaluate(
    client,
    `(() => {
      const select = document.querySelector('[data-testid="job-status-cloudhire-labs"]');
      const setter = Object.getOwnPropertyDescriptor(select.constructor.prototype, 'value').set;
      setter.call(select, 'Applied');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`,
  );
  await wait(400);

  await client.send('Page.reload', { ignoreCache: true });
  await wait(1000);

  const state = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText;
      const profile = JSON.parse(localStorage.getItem('job-copilot-profile'));
      const jobs = JSON.parse(localStorage.getItem('job-copilot-jobs'));
      const cloudHire = jobs.find((job) => job.company === 'CloudHire Labs');
      return {
        name: profile.name,
        targetRole: profile.targetRole,
        jobCount: jobs.length,
        cloudHireStatus: cloudHire?.status,
        visibleCloudHire: text.includes('CloudHire Labs'),
        visiblePitch: text.includes('Hi CloudHire Labs team,'),
      };
    })()`,
  );

  if (
    state.name !== 'Jeremia Sibiya' ||
    state.targetRole !== 'Backend Developer' ||
    state.cloudHireStatus !== 'Applied' ||
    !state.visibleCloudHire ||
    !state.visiblePitch
  ) {
    throw new Error(`Persistence smoke failed: ${JSON.stringify(state)}`);
  }

  const screenshot = await client.send('Page.captureScreenshot', { format: 'webp', quality: 90, captureBeyondViewport: true });
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  writeFileSync(resolve(process.cwd(), 'job-copilot-smoke-result.json'), JSON.stringify(state, null, 2));
  console.log(`Browser smoke passed: ${JSON.stringify(state)}`);
  console.log(`Screenshot: ${screenshotPath}`);
  client.close();
} finally {
  chrome.kill();
  setTimeout(() => {
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }, 100);
}
