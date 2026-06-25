#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    subreddit: 'LocalLLaMA',
    profileDir: '',
    storageState: '',
    screenshot: 'tmp/reddit-session-probe.png',
    output: 'tmp/reddit-session-probe.json',
    waitMs: 5000,
    headless: true,
    jsonPath: 'new',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--') continue;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--subreddit' && next) args.subreddit = next, i++;
    else if (arg === '--profile-dir' && next) args.profileDir = next, i++;
    else if (arg === '--storage-state' && next) args.storageState = next, i++;
    else if (arg === '--screenshot' && next) args.screenshot = next, i++;
    else if (arg === '--output' && next) args.output = next, i++;
    else if (arg === '--wait-ms' && next) args.waitMs = Number(next), i++;
    else if (arg === '--json-path' && next) args.jsonPath = next.replace(/^\/+|\/+$/g, ''), i++;
    else if (arg === '--headful') args.headless = false;
    else if (arg === '--headless') args.headless = true;
    else throw new Error(`Unknown arg: ${arg}`);
  }

  return args;
}

function usage() {
  return `Reddit session probe (Playwright)

用途：先進 reddit 板頁養 session，再測試同 session 抓 JSON 是否成功。

執行方式：
  pnpm dlx --package=playwright node scripts/reddit/session-probe.mjs --help
  pnpm dlx --package=playwright node scripts/reddit/session-probe.mjs --subreddit LocalLLaMA --headful
  pnpm dlx --package=playwright node scripts/reddit/session-probe.mjs --profile-dir ~/.cache/reddit-pw --subreddit LocalLLaMA --headful
  pnpm dlx --package=playwright node scripts/reddit/session-probe.mjs --storage-state ./reddit-state.json --subreddit LocalLLaMA

參數：
  --subreddit <name>       預設 LocalLLaMA
  --profile-dir <dir>      用 persistent context 啟動，適合保留登入/session
  --storage-state <file>   從 Playwright storage state JSON 載入 cookies/localStorage
  --json-path <path>       預設 new，可改 hot / top / .json
  --wait-ms <ms>           進板後額外等待毫秒數，預設 5000
  --headful                顯示瀏覽器視窗
  --headless               無頭模式（預設）
  --screenshot <file>      預設 tmp/reddit-session-probe.png
  --output <file>          預設 tmp/reddit-session-probe.json

備註：
  - 若你要用「真人已登入 Reddit 的狀態」驗證，最穩是 --headful + --profile-dir。
  - 第一次跑可以手動登入 Reddit，之後同一個 profile-dir 會保留 session。
  - 這支腳本會同時測：
    1) page.evaluate(fetch ... credentials: include)
    2) context.request.get(...)`;
}

async function ensureParent(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function summarizeText(text, max = 500) {
  return String(text || '').replace(/\s+/g, ' ').slice(0, max);
}

async function tryReadJson(text) {
  try {
    const parsed = JSON.parse(text);
    const children = parsed?.data?.children;
    return {
      parsed: true,
      childCount: Array.isArray(children) ? children.length : null,
      sampleTitles: Array.isArray(children)
        ? children.slice(0, 3).map((x) => x?.data?.title).filter(Boolean)
        : [],
    };
  } catch {
    return { parsed: false, childCount: null, sampleTitles: [] };
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  let playwright;
  try {
    playwright = await import('playwright');
  } catch (error) {
    console.error('找不到 playwright 套件。');
    console.error('請先用其中一種方式執行：');
    console.error('  pnpm dlx --package=playwright node scripts/reddit/session-probe.mjs --help');
    console.error('或安裝後再跑：');
    console.error('  pnpm add -D playwright');
    throw error;
  }

  const { chromium } = playwright;
  const subreddit = args.subreddit.replace(/^r\//, '');
  const boardUrl = `https://www.reddit.com/r/${subreddit}/`;
  const jsonSuffix = args.jsonPath === '.json' ? '.json' : `${args.jsonPath}.json`;
  const jsonUrl = `https://www.reddit.com/r/${subreddit}/${jsonSuffix}?limit=3`;

  let browser;
  let context;
  let page;

  try {
    if (args.profileDir) {
      const profileDir = args.profileDir.replace(/^~\//, `${process.env.HOME}/`);
      context = await chromium.launchPersistentContext(profileDir, {
        headless: args.headless,
        viewport: { width: 1440, height: 1200 },
      });
      page = context.pages()[0] || await context.newPage();
    } else {
      browser = await chromium.launch({ headless: args.headless });
      context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        storageState: args.storageState || undefined,
      });
      page = await context.newPage();
    }

    const pageResp = await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(args.waitMs);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    await ensureParent(args.screenshot);
    await page.screenshot({ path: args.screenshot, fullPage: true }).catch(() => {});

    const cookies = await context.cookies();

    const fetchResult = await page.evaluate(async ({ jsonUrl }) => {
      try {
        const res = await fetch(jsonUrl, { credentials: 'include' });
        const text = await res.text();
        return {
          ok: res.ok,
          status: res.status,
          url: res.url,
          contentType: res.headers.get('content-type'),
          text,
        };
      } catch (error) {
        return { error: String(error) };
      }
    }, { jsonUrl });

    let requestResult;
    try {
      const res = await context.request.get(jsonUrl, {
        headers: {
          'User-Agent': await page.evaluate(() => navigator.userAgent),
          'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
          'Referer': boardUrl,
        },
        failOnStatusCode: false,
      });
      requestResult = {
        ok: res.ok(),
        status: res.status(),
        url: res.url(),
        contentType: res.headers()['content-type'] || null,
        text: await res.text(),
      };
    } catch (error) {
      requestResult = { error: String(error) };
    }

    const fetchJson = fetchResult.text ? await tryReadJson(fetchResult.text) : { parsed: false, childCount: null, sampleTitles: [] };
    const requestJson = requestResult.text ? await tryReadJson(requestResult.text) : { parsed: false, childCount: null, sampleTitles: [] };

    const summary = {
      boardUrl,
      jsonUrl,
      page: {
        finalUrl: page.url(),
        status: pageResp?.status() ?? null,
        title: await page.title(),
        bodyPreview: summarizeText(bodyText),
      },
      cookies: cookies.map((c) => ({
        name: c.name,
        domain: c.domain,
        path: c.path,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
      })),
      fetchFromPage: {
        ...(fetchResult.error ? { error: fetchResult.error } : {
          ok: fetchResult.ok,
          status: fetchResult.status,
          url: fetchResult.url,
          contentType: fetchResult.contentType,
          bodyPreview: summarizeText(fetchResult.text),
        }),
        json: fetchJson,
      },
      contextRequest: {
        ...(requestResult.error ? { error: requestResult.error } : {
          ok: requestResult.ok,
          status: requestResult.status,
          url: requestResult.url,
          contentType: requestResult.contentType,
          bodyPreview: summarizeText(requestResult.text),
        }),
        json: requestJson,
      },
      screenshot: args.screenshot,
      generatedAt: new Date().toISOString(),
    };

    await ensureParent(args.output);
    await fs.writeFile(args.output, JSON.stringify(summary, null, 2), 'utf8');

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await page?.close().catch(() => {});
    if (args.profileDir) await context?.close().catch(() => {});
    else {
      await context?.close().catch(() => {});
      await browser?.close().catch(() => {});
    }
  }
}

run().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
