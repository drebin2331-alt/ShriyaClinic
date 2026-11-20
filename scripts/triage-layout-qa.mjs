import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const out = 'scratch/triage-review';
mkdirSync(out, { recursive: true });
const browser = await Browser.launch();
const page = await browser.newPage({ width: 390, height: 844 });
const results = [];
try {
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['https://*/rest/*', 'https://*/auth/*', 'https://*/functions/*', '*/api/*'] });
  await page.goto('http://127.0.0.1:4173');
  await page.eval(() => {
    localStorage.setItem('smilecare_auth_user', JSON.stringify({ id: 'usr-admin-01', email: 'admin@clinic.com', role: 'admin', name: 'ADMIN' }));
    sessionStorage.setItem('smilecare_active_view', 'staff-checkin');
  });
  await page.goto('http://127.0.0.1:4173/admin', { settleMs: 800 });
  assert.ok(await page.eval(() => {
    const button = [...document.querySelectorAll('button')].find(el => el.getClientRects().length && /walk.in token/i.test([el.textContent,el.title].join(' ')));
    button?.click();
    return Boolean(button);
  }), 'Walk-in entry is available');
  await sleep(250);
  for (const width of [320,360,375,390,412,430,768,1024,1440]) {
    for (const enlarged of [false,true]) {
      await page.setViewport({ width, height: 844 });
      await page.eval(enlarged => { document.documentElement.style.fontSize = enlarged ? '125%' : ''; }, enlarged);
      await sleep(100);
      const result = await page.eval(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const options = [...dialog.querySelectorAll('.priority-options label')];
        const panel = dialog.firstElementChild.getBoundingClientRect();
        const labels = options.map(el => {
          const box = el.getBoundingClientRect();
          const span = el.querySelector('span').getBoundingClientRect();
          return { width:box.width,height:box.height,fits:span.left>=box.left && span.right<=box.right+1 };
        });
        return { labels, fits:panel.left>=0 && panel.right<=innerWidth+1, actions:[...dialog.querySelectorAll('.walkin-actions button')].map(el => ({ height:el.getBoundingClientRect().height, fits:el.scrollWidth<=el.clientWidth+1 })) };
      });
      assert.equal(result.labels.length,3);
      assert.ok(result.fits);
      assert.equal(result.actions.length,2);
      assert.ok(result.labels.every(el => el.height>=43 && el.fits), JSON.stringify({width,enlarged,...result}));
      assert.ok(result.actions.every(el => el.height>=43 && el.fits), 'Footer actions fit');
      results.push({ width,enlarged,...result });
    }
  }
  await page.eval(() => { document.documentElement.style.fontSize = ''; });
  for (const width of [320,360,375,390,412,430]) {
    await page.setViewport({width,height:360});
    await sleep(100);
    const short = await page.eval(() => {
      const footer=document.querySelector('.walkin-actions').getBoundingClientRect();
      const fields=document.querySelector('.walkin-fields');
      return {footerVisible:footer.top>=0 && footer.bottom<=innerHeight,
        fieldsScrollable:fields.scrollHeight>fields.clientHeight};
    });
    await page.screenshot({path:out+'/short-'+width+'.jpg'});
    assert.ok(short.footerVisible && short.fieldsScrollable, JSON.stringify({width,...short}));
    results.push({width,height:360,...short});
  }
  await page.eval(() => { document.documentElement.style.fontSize = ''; document.querySelector('.priority-options input[value="Emergency"]').click(); });
  assert.equal(await page.eval(() => document.querySelector('.priority-options input:checked').value), 'Emergency');
  await page.setViewport({ width:390,height:844 });
  await page.screenshot({ path:out+'/walk-in-390.jpg',fullPage:false });
  assert.equal(page.consoleErrors.length,0);
  writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify({ checks:results.length,selection:true,exceptions:page.consoleErrors }));
} finally {
  await browser.close();
}
