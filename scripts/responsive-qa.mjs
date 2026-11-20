import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const url = process.env.QA_URL || 'http://127.0.0.1:3001';
const out = process.env.QA_OUT || 'scratch/responsive-qa';
mkdirSync(out,{recursive:true});
const widths=[320,360,375,390,414,430,600,768,1024,1280,1440];
const views = ['landing','booking','live-queue','patient-portal','customer-appointments','customer-token','customer-treatment','customer-records','customer-profile','customer-billing','admin-dashboard','staff-checkin','tokens','appointment-mgmt','admin-patients','patient-profile','billing','admin-staff','admin-doctors','admin-settings','whatsapp','reports','reception-tv'];
const browser=await Browser.launch();
const page=await browser.newPage({width:390,height:844});
// This layout suite uses the application's existing local data; never writes to a clinic backend.
await page.send('Network.enable');
await page.send('Network.setBlockedURLs',{urls:['https://*/rest/*','https://*/auth/*','https://*/functions/*','*/api/*']});
await page.goto(url);
const results=[];
try {
  for (const view of views) {
    const staff=views.indexOf(view)>=10;
    await page.eval(({view,staff})=>{
      sessionStorage.setItem('smilecare_active_view',view);
      if(staff) localStorage.setItem('smilecare_auth_user',JSON.stringify({id:'usr-admin-01',email:'admin@clinic.com',name:'ADMIN',role:'admin',title:'Clinic Managing Director & Chief Administrator',avatar:'👨‍⚕️'}));
      else localStorage.removeItem('smilecare_auth_user');
      const patients=JSON.parse(localStorage.getItem('smilecare_patients_list')||'[]');
      if(patients[0]) sessionStorage.setItem('smilecare_selected_patient',JSON.stringify(patients[0]));
    },{view,staff});
    await page.goto(url+(staff?'/admin':''),{settleMs:300});
    if(view==='patient-profile') {
      await page.setViewport({width:390,height:844});
      // Select an existing patient through the directory before inspecting their clinical profile.
      await page.eval(()=>sessionStorage.setItem('smilecare_active_view','admin-patients'));
      await page.goto(url+'/admin',{settleMs:900});
      await page.eval(()=>{ const b=document.querySelector('.patient-record-actions .record-open'); if(!b)throw Error('Patient record action missing'); b.click(); });
      for (let attempt=0;attempt<30;attempt++) {
        if(await page.eval(()=>Boolean(document.querySelector('.patient-chart-workspace')))) break;
        await sleep(200);
      }
      if(!await page.eval(()=>Boolean(document.querySelector('.patient-chart-workspace'))))throw Error('Clinical profile did not finish loading');
    }
    for(const width of widths){
      await page.setViewport({width,height:844});
      await sleep(70);
      const data=await page.eval(()=>{
        const visible=el=>el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
        const overflow=[...document.querySelectorAll('body *')].filter(el=>{
          if(!visible(el))return false;
          const r=el.getBoundingClientRect();
          if(r.right<=innerWidth+1 && r.left>=-1)return false;
          for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement)if(/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX))return false;
          return true;
        }).map(el=>({tag:el.tagName,text:el.textContent?.trim().slice(0,70),cls:typeof el.className==='string'?el.className:'',right:Math.round(el.getBoundingClientRect().right)}));
        return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.querySelector('h1,h2')?.textContent?.trim(),overflow};
      });
      results.push({view,...data,errors:[...page.consoleErrors]});
      if([320,768,1440].includes(width))await page.screenshot({path:`${out}/${view}-${width}.jpg`,fullPage:true});
    }
    console.log(view+': '+results.filter(r=>r.view===view && (r.overflow.length||r.scrollWidth>r.width+1)).map(r=>r.width).join(','));
  }
  // Dedicated admin entry must also work without a staff session.
  await page.eval(()=>localStorage.removeItem('smilecare_auth_user'));
  await page.goto(url+'/admin',{settleMs:200});
  for(const width of widths){await page.setViewport({width,height:844});results.push({view:'admin-signin',...await page.eval(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[]}))});}
  writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
  const failed=results.filter(r=>r.scrollWidth>r.width+1||r.overflow.length||r.errors?.length);
  console.log(JSON.stringify({checks:results.length,failed:failed.length}));
  if(failed.length)process.exitCode=1;
} finally {await browser.close();}
