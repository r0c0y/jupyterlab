// With the notebook open, Highlight active line turned on in the settings
// registry, then off as the Settings editor saves it (codeCellConfig {}):
// does the cell already on screen follow?
const { chromium } = require(process.env.HOME + '/opensource/jupyterlab/node_modules/playwright');
const base = 'http://127.0.0.1:8899';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 520 } });
  await page.goto(base + '/lab/tree/t.ipynb');
  await page.waitForFunction(() => !!window.jupyterapp, null, { timeout: 120000 });
  await page.waitForSelector('.jp-Notebook .jp-Cell .cm-editor', { timeout: 120000 });
  await page.click('.jp-Notebook .jp-Cell .cm-content');
  await page.keyboard.press('ArrowDown');
  const set = value => page.evaluate(async value => {
    const app = window.jupyterapp;
    const plugins = app.pluginRegistry?._plugins || app._pluginMap || app._plugins;
    const entry = plugins.get ? plugins.get('@jupyterlab/apputils-extension:settings') : plugins['@jupyterlab/apputils-extension:settings'];
    const registry = entry.service;
    await registry.set('@jupyterlab/notebook-extension:tracker', 'codeCellConfig', value);
    return Object.keys(value).join(',') || '(none)';
  }, value);
  const active = () => page.$$eval('.jp-Notebook .jp-Cell .cm-activeLine', els => els.length);
  console.log('before any change, active lines:', await active());
  console.log('set keys:', await set({ highlightActiveLine: true }));
  await page.waitForTimeout(1500);
  console.log('after turning it on, active lines:', await active());
  await page.screenshot({ path: process.argv[2] + '-on.png', clip: { x: 0, y: 0, width: 1000, height: 260 } });
  console.log('set keys:', await set({}));
  await page.waitForTimeout(1500);
  console.log('after turning it off (key removed), active lines:', await active());
  await page.screenshot({ path: process.argv[2] + '-off.png', clip: { x: 0, y: 0, width: 1000, height: 260 } });
  await browser.close();
})().catch(e => { console.error('E2E ERROR', e.message); process.exit(1); });
