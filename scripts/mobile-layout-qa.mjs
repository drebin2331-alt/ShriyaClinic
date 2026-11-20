import { mkdirSync, writeFileSync } from 'node:fs';
import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

// Component-level checks. A page can fit its viewport even when an overflow
// container hides a patient name, a primary action, or an invoice total.
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const out = process.env.QA_OUT || 'scratch/handset-review';
mkdirSync(out, { recursive: true });
const browser = await Browser.launch();
const page = await browser.newPage({ width: 390, height: 844 });
const results = [];
const widths = [320, 360, 390, 430, 600, 768, 820, 940, 1024, 1280, 1440];

async function openView(view) {
  await page.eval(view => {
    localStorage.setItem('smilecare_auth_user', JSON.stringify({ id: 'usr-admin-01', name: 'ADMIN', email: 'admin@clinic.com', role: 'admin' }));
    sessionStorage.setItem('smilecare_active_view', view);
  }, view);
  await page.goto(base + '/admin', { settleMs: 400 });
}

async function clickButton(pattern) {
  const found = await page.eval(pattern => {
    const button = [...document.querySelectorAll('button')].find(el => el.getClientRects().length && new RegExp(pattern, 'i').test([el.textContent, el.title, el.ariaLabel].join(' ')));
    if (!button) return false;
    button.click();
    return true;
  }, pattern);
  if (!found) throw Error('Missing control for ' + pattern);
  await sleep(120);
}

async function measure(view, width, enlarged = false) {
  await page.setViewport({ width, height: 844 });
  await page.eval(large => { document.documentElement.style.fontSize = large ? '125%' : ''; }, enlarged);
  await sleep(140);
  const problems = await page.eval(view => {
    const errors = new Set();
    function fits(el, label) {
      if (!el || !el.getClientRects().length) { errors.add(label + ' missing'); return; }
      const r = el.getBoundingClientRect();
      if (r.left < -1 || r.right > innerWidth + 1) errors.add(label + ' outside viewport');
      for (let box = el.parentElement; box; box = box.parentElement) {
        if (!/(auto|hidden|clip|scroll)/.test(getComputedStyle(box).overflowX)) continue;
        const parent = box.getBoundingClientRect();
        if (r.left < parent.left - 1 || r.right > parent.right + 1) errors.add(label + ' clipped inside container');
      }
      if (el.clientWidth && el.scrollWidth > el.clientWidth + 1) errors.add(label + ' text clipped');
    }
    const visible = selector => [...document.querySelectorAll(selector)].filter(el => el.getClientRects().length);
    if (document.documentElement.scrollWidth > innerWidth + 1) errors.add('page overflow');
    if (view === 'appointments') {
      const controls = visible('main button').filter(b => /^(Daily list|List|Week(ly view)?|Calendar( view)?|(?:Online )?Enquiries(?:\s*\d+)?|\+?\s*New booking)$/i.test(b.textContent.trim()));
      if (controls.length !== 5) errors.add('appointment navigation missing');
      for (const button of controls) {
        fits(button, 'appointment action');
        if (button.clientHeight < 43 && innerWidth < 768) errors.add('short appointment action');
      }
    } else if (view === 'patients' && innerWidth < 768) {
      const heading = visible('main article h3, main .md\\:hidden h3')[0];
      fits(heading, 'patient name');
      if (heading) {
        const card = heading.closest('article') || heading.closest('[class*=cursor-pointer]');
        for (const action of card.querySelectorAll('a,button')) {
          fits(action, 'patient action');
          if (action.getBoundingClientRect().height < 43) errors.add('short patient action');
          const walker = document.createTreeWalker(action, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            for (const word of walker.currentNode.textContent.matchAll(/\S+/g)) {
              const range = document.createRange();
              range.setStart(walker.currentNode, word.index);
              range.setEnd(walker.currentNode, word.index + word[0].length);
              if (range.getClientRects().length > 1) errors.add('split action label');
            }
          }
        }
        const id = card.querySelector('.patient-record-id, .font-mono');
        if (id) {
          const range = document.createRange();
          range.selectNodeContents(id);
          if (range.getClientRects().length > 1) errors.add('broken OP number');
        }
        for (const el of card.querySelectorAll('.truncate')) fits(el, 'truncated patient detail');
      }
    } else if (view === 'invoice') {
      const sheet = document.getElementById('invoice-letterhead-sheet');
      fits(sheet, 'invoice');
      if (sheet) {
        const paper = sheet.getBoundingClientRect();
        for (const el of sheet.querySelectorAll('th,td,dd,h1,h2,strong,table')) {
          if (!el.getClientRects().length || el.closest('.sr-only')) continue;
          const box = el.getBoundingClientRect();
          if (box.width <= 1 || box.height <= 1) continue;
          if (box.right > paper.right + 1 || box.left < paper.left - 1) errors.add('invoice content outside paper');
          if (!el.closest('thead')) fits(el, 'invoice detail');
        }
        for (const el of sheet.closest('[role="dialog"]').querySelectorAll('button')) fits(el, 'invoice action');
      }
    }
    return [...errors];
  }, view);
  results.push({ view, width, enlarged, problems });
  if (width === 390 && !enlarged) {
    await page.eval(view => {
      if (view === 'patients') {
        const card = [...document.querySelectorAll('main article, main .md\\:hidden h3')].find(e => e.getClientRects().length);
        if (card) window.scrollTo(0, card.getBoundingClientRect().top + scrollY - 84);
      }
    }, view);
    await sleep(450);
    await page.screenshot({ path: out + '/' + view + '-390.jpg' });
  }
}

try {
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['https://*/rest/*', 'https://*/auth/*', 'https://*/functions/*', '*/api/*'] });
  await page.goto(base);
  for (const [view, route] of [['appointments', 'appointment-mgmt'], ['patients', 'admin-patients'], ['invoice', 'billing']]) {
    await openView(route);
    if (view === 'invoice') await clickButton('View & Print Invoice|View invoice|Preview Invoice');
    for (const width of widths) await measure(view, width);
    await measure(view, 320, true);
    await page.eval(() => { document.documentElement.style.fontSize = ''; });
    if (view === 'invoice') {
      // Exercise the actual print control without opening the OS print dialog.
      await clickButton('Print / Save PDF');
      await page.eval(() => {
        const frame = [...document.querySelectorAll('iframe')].find(f => f.contentDocument?.getElementById('invoice-letterhead-sheet'));
        if (!frame) throw Error('Invoice print frame missing');
        frame.contentWindow.print = () => { frame.dataset.printCalled = 'true'; };
        frame.style.width = '190mm';
      });
      await page.send('Emulation.setEmulatedMedia', { media: 'print' });
      await sleep(420);
      const problems = await page.eval(() => {
        const frame = document.querySelector('iframe[data-print-called]');
        const sheet = frame?.contentDocument?.getElementById('invoice-letterhead-sheet');
        if (!sheet) return ['Print action did not reach the invoice'];
        const headers = sheet.querySelectorAll('thead th');
        const table = sheet.querySelector('table').getBoundingClientRect();
        const bounds = sheet.getBoundingClientRect();
        return headers.length === 5 && headers[4].getBoundingClientRect().width > 10 &&
          table.left >= bounds.left && table.right <= bounds.right + 1 ? [] : ['Printed invoice columns do not fit'];
      });
      results.push({ view: 'invoice-print', problems });
      await page.send('Emulation.setEmulatedMedia', { media: 'screen' });
    }
  }
  const failures = results.filter(r => r.problems.length);
  writeFileSync(out + '/results.json', JSON.stringify({ results, exceptions: page.consoleErrors }, null, 2));
  console.log(JSON.stringify({ checks: results.length, failures: failures.length, issues: [...new Set(failures.flatMap(r => r.problems))], exceptions: page.consoleErrors }));
  if (failures.length || page.consoleErrors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
