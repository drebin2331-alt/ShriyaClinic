import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const b=await Browser.launch();const p=await b.newPage({width:320,height:640});const out='scratch/responsive-roles';mkdirSync(out,{recursive:true});const results=[];
await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['https://*/rest/*','https://*/auth/*','https://*/functions/*','*/api/*']});
try{
 await p.goto('http://127.0.0.1:4173');
 // Billing has no built-in demo account. Exercise its read-only UI with a local browser fixture.
 await p.eval(()=>{localStorage.setItem('smilecare_auth_user',JSON.stringify({id:'qa-billing',name:'QA Billing',role:'billing',email:'qa@example.invalid'}));sessionStorage.setItem('smilecare_active_view','admin-dashboard');});
 await p.goto('http://127.0.0.1:4173/admin',{settleMs:500});
 for(const view of ['admin-dashboard','billing']){
  if(view==='billing')await p.eval(()=>[...document.querySelectorAll('button')].find(el=>el.textContent.trim()==='Open billing').click());
  await sleep(300);
  for(const width of [320,768,1440]){
   await p.setViewport({width,height:844});
   const layout=await p.eval(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,heading:document.querySelector('h1')?.textContent}));
   if(!layout.heading)throw Error('Billing role page heading missing');
   results.push({role:'billing',view,...layout});
  }
 }
 const accounts=[{id:'staff-1792653030970',email:'doctor@gmail.com',name:'DOCTOR TEST',role:'doctor'},{id:'staff-1792774723829',email:'desk@gmail.com',name:'TEST DESK',role:'receptionist'}];
 for(const account of accounts)for(const view of['admin-dashboard','staff-checkin','tokens','appointment-mgmt','admin-patients','patient-profile','billing']){
  await p.eval(({account,view})=>{localStorage.setItem('smilecare_auth_user',JSON.stringify(account));sessionStorage.setItem('smilecare_active_view',view);const patient=JSON.parse(localStorage.getItem('smilecare_patients_list')||'[]')[0];if(patient)sessionStorage.setItem('smilecare_selected_patient',JSON.stringify(patient));},{account,view});
  await p.goto('http://127.0.0.1:4173/admin',{settleMs:250});
  for(const width of[320,768,1440]){await p.setViewport({width,height:844});await sleep(50);results.push({role:account.role,view,...await p.eval(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}))});}
 }
 await p.setViewport({width:320,height:640});
 await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'k',code:'KeyK',modifiers:2});await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'k',code:'KeyK',modifiers:2});await sleep(100);
 await p.eval(()=>{const d=document.querySelector('[role="dialog"]');const all=[...d.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>x.getClientRects().length&&!x.disabled);all.at(-1)?.focus();});
 await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 const focusTrapped=await p.eval(()=>{const d=document.querySelector('[role="dialog"]');return d?.contains(document.activeElement)&&document.activeElement===d.querySelector('input');});
 await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
 const dismissed=await p.eval(()=>!document.querySelector('[role="dialog"]')&&document.body.style.overflow!=='hidden');
 const failures=results.filter(r=>r.scrollWidth>r.width+1);const report={checks:results.length,failures,focusTrapped,dismissed,exceptions:p.consoleErrors,results};writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined}));if(failures.length||!focusTrapped||!dismissed||p.consoleErrors.length)process.exitCode=1;
}finally{await b.close();}
