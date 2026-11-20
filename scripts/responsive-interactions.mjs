import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const url=process.env.QA_URL||'http://127.0.0.1:4173';
const out='scratch/responsive-interactions';mkdirSync(out,{recursive:true});
const b=await Browser.launch();const p=await b.newPage({width:320,height:640});
await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['https://*/rest/*','https://*/auth/*','https://*/functions/*','*/api/*']});
const results=[];
async function navigate(view,staff=true){
 await p.eval(({view,staff})=>{sessionStorage.setItem('smilecare_active_view',view);if(staff)localStorage.setItem('smilecare_auth_user',JSON.stringify({id:'usr-admin-01',email:'admin@clinic.com',name:'ADMIN',role:'admin'}));else localStorage.removeItem('smilecare_auth_user');const patients=JSON.parse(localStorage.getItem('smilecare_patients_list')||'[]');if(patients[0])sessionStorage.setItem('smilecare_selected_patient',JSON.stringify(patients[0]));},{view,staff});
 await p.goto(url+(staff?'/admin':''),{settleMs:600});
}
async function click(pattern){return p.eval(pattern=>{const re=new RegExp(pattern,'i');const el=[...document.querySelectorAll('button')].find(e=>e.getClientRects().length&&re.test((e.getAttribute('aria-label')||'')+' '+(e.getAttribute('title')||'')+' '+e.textContent));if(!el){
    const select=[...document.querySelectorAll('.work-picker-field select')].find(s=>s.getClientRects().length);
    const option=select && [...select.options].find(o=>re.test(o.textContent));
    if(!option)return false;
    select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));return option.text;
  }el.scrollIntoView({block:'center'});el.click();return el.textContent.trim()||el.getAttribute('aria-label');},pattern);}
async function measure(name){await sleep(150);const r=await p.eval(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].at(-1);if(!d)return{dialog:false,buttons:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>e.textContent.trim()).slice(-45)};const panels=[...d.children].map(x=>{const r=x.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height,scroll:x.scrollHeight,client:x.clientHeight};});return{dialog:true,locked:document.body.style.overflow==='hidden',width:innerWidth,height:innerHeight,panels,focusInside:d.contains(document.activeElement),overflow:document.documentElement.scrollWidth>innerWidth+1};});results.push({name,...r});await p.screenshot({path:`${out}/${name}.jpg`});return r;}
try{
 await p.goto(url);
 for(const [name,view,pattern,staff,setup]of[
  ['public-enquiry','landing','Book Consultation|^ Book ',false],
  ['staff-drawer','admin-dashboard','Toggle Side Menu',true],
  ['global-search','admin-patients','^Search| Search ',true],
  ['profile-sheet','admin-dashboard','Staff Profile',true],
  ['registration','admin-patients','Register.*Patient|New Patient|Add Patient',true],
  ['staff-account','admin-staff','Create Account',true],
  ['booking','appointment-mgmt','New Booking',true],
  ['case-sheet','patient-profile','Clinical Case Sheet',true],
  ['prescription','patient-profile','Write Rx',true],
  ['issue-token','patient-profile','Issue Token',true],
  ['medical-history','patient-profile','Edit Medical',true],
  ['report-preview','reports','PDF|Export Report',true],
  ['invoice-preview','billing','View & Print Invoice',true],
  ['payment-form','billing','Record Payment',true],
  ['payment-receipt','billing','View official digital receipt',true,'Payment Ledger'],
  ['clinical-note','patient-profile','New.*Note|Add.*Note|Record.*Visit',true,'Visits & Notes'],
  ['lab-order','patient-profile','Dispatch New Lab Order',true,'Lab Orders'],
  ['prescription-print','patient-profile','View / Pad',true,'Prescriptions'],
 ]){
  await navigate(view,staff);if(setup){await click(setup);await sleep(100);}const clicked=await click(pattern);const r=await measure(name);r.clicked=clicked;
  if(r.dialog){await p.setViewport({width:320,height:360});await measure(name+'-short');await p.setViewport({width:1440,height:900});await measure(name+'-desktop');await p.setViewport({width:320,height:640});await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await sleep(100);results.push({name:name+'-dismiss',closed:await p.eval(()=>!document.querySelector('[role="dialog"]')),unlocked:await p.eval(()=>document.body.style.overflow!=='hidden')});}
  console.log(name+': '+(r.dialog?'dialog checked':'TRIGGER NOT FOUND'));
 }
 await navigate('landing',false);await click('Toggle Navigation Menu');results.push({name:'public-menu',locked:await p.eval(()=>document.body.style.overflow==='hidden'),expanded:await p.eval(()=>document.querySelector('[aria-controls="public-mobile-menu"]')?.getAttribute('aria-expanded')==='true')});await click('Specialities & Treatments');results.push({name:'public-menu-navigation',closed:await p.eval(()=>!document.querySelector('#public-mobile-menu')),unlocked:await p.eval(()=>document.body.style.overflow!=='hidden')});
 // Inspect each clinical sub-screen using the existing selected patient's record.
 for(const [view,patterns]of[
 ['patient-profile',['3D Dental Chart','Treatment Plans','Visits & Notes','Lab Orders','Billing & Invoices','Documents','Prescriptions']],
 ['billing',['Payment Ledger','Create New Bill','Invoices & Bills']],
 ['appointment-mgmt',['Calendar','List']],
 ['staff-checkin',['Scheduled appointments','Online Inquiries']],
 ]){
  await navigate(view);
  for(const pattern of patterns){const clicked=await click(pattern);await sleep(180);for(const width of[320,768,1440]){await p.setViewport({width,height:844});const r=await p.eval(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));results.push({name:view+'-'+pattern,clicked,...r,errors:[...p.consoleErrors]});if(width===320)await p.screenshot({path:`${out}/${view}-${pattern.replace(/[^a-z0-9]+/gi,'-')}.jpg`,fullPage:true});}}
 }
 const failures=results.filter(r=>
  (r.dialog===false&&r.name!=='staff-drawer-desktop')||r.clicked===false||r.closed===false||r.locked===false||r.unlocked===false||r.expanded===false||r.focusInside===false||r.overflow||r.scrollWidth>r.width+1||
  (r.panels?.some(panel=>panel.left < -1 || panel.right > r.width+1 || panel.top < -1 || panel.bottom > r.height+1))
 );
 writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
 writeFileSync(`${out}/summary.json`,JSON.stringify({checks:results.length,failures,exceptions:p.consoleErrors},null,2));
 console.log(JSON.stringify({checks:results.length,failures:failures.map(r=>r.name),exceptions:p.consoleErrors}));
 if(failures.length||p.consoleErrors.length)process.exitCode=1;
}finally{await b.close();}
