// Run with an available Playwright installation; no project dependency is required.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node docs/ui-editorial/verify.mjs
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.UI_BASE_URL || 'http://localhost:4323'
const screenshotDir = new URL('./screenshots/', import.meta.url).pathname
await mkdir(screenshotDir, { recursive: true })
const launch = { headless: true }
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH
const browser = await chromium.launch(launch)
const results = { base, matrix: [], interactions: [], externalFailures: [] }
const page = await browser.newPage()
page.on('requestfailed', request => {
  if (!request.url().startsWith(base)) results.externalFailures.push({ url: request.url(), error: request.failure()?.errorText })
})
async function go(path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' })
  assert.equal(response?.status(), 200, path)
  await page.locator('h1').first().waitFor()
  await page.evaluate(() => document.fonts.ready)
}
function normalizedPath(url) { return new URL(url, base).pathname.replace(/\/$/, '') || '/' }
async function screenshot(name) {
  await page.waitForFunction(() => [...document.querySelectorAll('.anim-fade-up, .anim-fade')].every(el => getComputedStyle(el).opacity === '1'))
  await page.waitForFunction(() => [...document.querySelectorAll('.count-up')].every(el => el.textContent.trim() === Number(el.dataset.target).toFixed(Number(el.dataset.decimals || 0)) + (el.dataset.suffix || '')))
  await page.screenshot({ path: `${screenshotDir}${name}.png` })
}
try {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await go('/')
  const articlePath = await page.locator('.cover-copy h2 a').getAttribute('href')
  const topicPath = await page.locator('.topic-list a').first().getAttribute('href')
  const routes = [['home','/'],['archive','/blog'],['older','/blog/page/2'],['article',articlePath],['topic',topicPath],['dives','/dives'],['ski','/ski'],['explore','/explore']]
  for (const theme of ['dark', 'light']) {
    for (const width of [1440, 390, 320, 769]) {
      await page.setViewportSize({ width, height: width <= 768 ? 844 : 1000 })
      await page.evaluate(theme => localStorage.setItem('theme', theme), theme)
      for (const [name, path] of routes) {
        await go(path)
        const state = await page.evaluate(() => ({
          width: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          headers: document.querySelectorAll('#top-nav').length,
          dark: document.documentElement.classList.contains('dark'),
          desktopNav: getComputedStyle(document.querySelector('.desktop-sections')).display,
          mobileNav: getComputedStyle(document.querySelector('.bottom-tab-bar')).display,
          canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map(link => link.href),
        }))
        assert.equal(state.overflow, false, `${name}/${theme}/${width} overflow`)
        assert.equal(state.headers, 1)
        assert.equal(state.dark, theme === 'dark')
        assert.equal(state.desktopNav === 'none', width <= 768)
        assert.equal(state.mobileNav === 'none', width > 768)
        assert.equal(state.canonicals.length, 1)
        assert.equal(new URL(state.canonicals[0]).origin, 'https://blog.blesscat.dev')
        assert.equal(normalizedPath(state.canonicals[0]), normalizedPath(path))
        results.matrix.push({ page: name, theme, ...state })
        const viewport = width === 390 ? 'mobile' : 'desktop'
        const finalViewport = width === 1440 || width === 390
        const desktopLight = theme === 'light' && width === 1440
        const mobileDark = theme === 'dark' && width === 390
        const corePage = ['archive', 'article', 'dives', 'ski', 'explore'].includes(name)
        const topicCapture = name === 'topic' && theme === 'light' && width === 390
        const capture = finalViewport && (name === 'home' || (corePage && (desktopLight || mobileDark)) || topicCapture)
        if (capture) {
          await screenshot(`${name}-${viewport}-${theme}`)
          if (name === 'article') {
            await page.locator('.prose-content').scrollIntoViewIfNeeded()
            await screenshot(`article-reading-${viewport}-${theme}`)
          }
        }
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await go('/')
  assert.equal(await page.locator('#zhumao-peek').isVisible(), false)
  await page.locator('.skip-link').focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.evaluate(() => {
    const rect = document.activeElement.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= innerHeight
  }), true)
  results.interactions.push('Inactive back-to-top control is hidden from keyboard navigation; reached focus is onscreen')
  await page.getByRole('button', { name: '切換深色模式', exact: true }).click()
  await page.getByRole('link', { name: '所有文章', exact: true }).click()
  assert.equal(await page.evaluate(() => localStorage.getItem('theme')), 'dark')
  assert.equal(await page.locator('html').getAttribute('class'), 'dark')
  results.interactions.push('Theme toggle persists through real link navigation')
  await page.getByRole('button', { name: '搜尋文章', exact: true }).click()
  await page.locator('#search-input').fill('Hermes')
  await page.locator('.search-result').first().waitFor({ timeout: 15000 })
  const searchLinks = await page.locator('.search-result').evaluateAll(links => links.map(link => link.getAttribute('href')))
  assert(searchLinks.every(path => path.startsWith('/blog/') && !path.includes('/tag/')))
  await screenshot('search-mobile-dark')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#search-toggle').evaluate(el => el === document.activeElement), true)
  await page.locator('#search-toggle').click()
  await page.locator('#search-input').fill('Hermes')
  await page.locator('.search-result').first().waitFor()
  await page.locator('#search-input').focus()
  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.locator('.search-result').last().evaluate(el => el === document.activeElement), true)
  await page.keyboard.press('Escape')
  await page.locator('#search-toggle').click()
  await page.waitForFunction(() => document.activeElement?.id === 'search-input')
  await page.keyboard.press('Tab')
  assert.equal(await page.locator('#search-close').evaluate(el => el === document.activeElement), true)
  await page.keyboard.press('/')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#search-toggle').evaluate(el => el === document.activeElement), true)
  results.interactions.push('Repeated search shortcut while open preserves trigger focus on Escape')
  results.interactions.push(`Pagefind returns ${searchLinks.length} real article links; Escape restores focus and modal focus wraps`)
  await go(topicPath)
  const topicTitle = await page.locator('h1').innerText()
  const topicCount = await page.locator('.journal-post').count()
  assert(topicCount > 20)
  const firstTopicArticle = await page.locator('.journal-post h2 a').first().getAttribute('href')
  await page.locator('.journal-post h2 a').first().click()
  assert.equal(normalizedPath(page.url()), normalizedPath(firstTopicArticle))
  results.interactions.push(`Real topic ${topicTitle} lists ${topicCount} articles and opens the original article URL`)
  await go('/blog/page/2')
  await page.getByRole('link', { name: '← 較新的文章' }).click()
  assert.equal(normalizedPath(page.url()), '/blog')
  results.interactions.push('Older archive pagination returns to /blog')
  await go(articlePath)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.locator('#copy-link-btn').click()
  await page.waitForFunction(() => document.getElementById('copy-link-btn').textContent.includes('已複製'))
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), page.url())
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('clipboard blocked') } } }))
  await page.locator('#copy-link-btn').click()
  await page.waitForFunction(() => document.getElementById('copy-link-btn').textContent.includes('無法複製'))
  results.interactions.push('Sharing copies the actual article URL; rejected clipboard access shows truthful failure feedback')
  assert.equal(await page.locator('#remark42').count(), 1)
  assert.equal(await page.locator('script[src="https://remark42.blesscat.dev/web/embed.js"]').count(), 1)
  await page.locator('.prose-content h2').first().scrollIntoViewIfNeeded()
  await page.waitForFunction(() => parseFloat(document.getElementById('reading-progress-bar').style.width) > 0)
  results.interactions.push('Article content, reading progress, comments container/embed, and sharing control remain present')
  for (const [path, row] of [['/dives','.dive-row'], ['/ski','.ski-row']]) {
    await go(path)
    const total = await page.locator(row).count()
    await page.locator('[data-ref="search"]').fill('no-such-place-verify')
    await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent.includes('顯示 0 /'))
    await page.locator('[data-ref="search"]').fill('')
    await page.locator('[data-ref="year-select"]').selectOption('2024')
    await page.waitForFunction(() => !document.querySelector('[data-ref="count"]').textContent.includes('顯示 0 /'))
    const count = await page.locator('[data-ref="count"]').innerText()
    await page.locator('[data-ref="year-select"]').selectOption('')
    await page.locator('.map-el').scrollIntoViewIfNeeded()
    await page.locator('.map-el.leaflet-container').waitFor({ timeout: 20000 })
    await page.locator('[data-chart]').first().scrollIntoViewIfNeeded()
    await page.waitForFunction(() => window.Chart && [...document.querySelectorAll('canvas[data-chart]')].some(canvas => window.Chart.getChart(canvas)), { timeout: 20000 })
    results.interactions.push(`${path}: ${total} rows; zero-result search, year filter (${count}), Leaflet map, and Chart.js rendering work`)
    if (path === '/dives') {
      const toggle = page.locator('.mini-map-toggle').first()
      const number = await toggle.getAttribute('data-dive')
      await toggle.click()
      await page.locator(`#mini-map-${number}.leaflet-container`).waitFor({ timeout: 20000 })
      await toggle.click()
      assert.equal(await page.locator(`#map-panel-${number}`).isVisible(), false)
      const chartToggle = page.locator('.chart-toggle').first()
      const chartNumber = await chartToggle.getAttribute('data-dive')
      await chartToggle.click()
      await page.locator(`#chart-panel-${chartNumber}`).waitFor({ state: 'visible' })
      results.interactions.push('Dive entry/exit mini-map opens/closes and depth curve panel expands')
    }
  }
  await go('/explore')
  await page.locator('#explore-map.leaflet-container').waitFor({ timeout: 20000 })
  const beforeStats = await page.locator('#explore-stats').innerText()
  await page.locator('#toggle-dive').click()
  await page.waitForFunction(previous => document.querySelector('#explore-stats').textContent !== previous, beforeStats)
  await page.locator('#toggle-dive').click()
  await page.locator('#year-slider').fill(await page.locator('#year-slider').getAttribute('min'))
  await page.locator('#year-slider').dispatchEvent('input')
  results.interactions.push('Explore Leaflet map, dive layer toggle, and year slider update without losing controls')
} finally {
  results.externalFailures = [...new Map(results.externalFailures.map(item => [item.url, item])).values()]
  await writeFile(new URL('./runtime-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n')
  await browser.close()
}
console.log(`PASS: ${results.matrix.length} viewport/theme/page checks; ${results.interactions.length} interaction checks`)
