import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const events = new Map();
const entries = new Map();
const removed = [];
let network;
const key = request => new URL(typeof request === 'string' ? request : request.url, 'https://clinic.example').pathname;
const cache = {
  async match(request) { return entries.get(key(request))?.clone(); },
  async put(request, response) { entries.set(key(request), response.clone()); },
};
vm.runInNewContext(readFileSync('public/sw.js', 'utf8'), {
  URL, Response,
  fetch: (...args) => network(...args),
  self: { location:{ origin:'https://clinic.example' }, addEventListener:(name, handler) => events.set(name, handler),
    skipWaiting:async()=>{}, clients:{ claim:async()=>{} } },
  caches: { open:async()=>cache, keys:async()=>['shriya-clinic-v1','shriya-clinic-v2','another-app'],
    delete:async name=>removed.push(name) },
});
async function request(path, mode = 'navigate', method = 'GET') {
  let response;
  events.get('fetch')({ request:{ url:'https://clinic.example'+path, mode, method },
    respondWith:value=>{ response=value; } });
  return response;
}
entries.set('/index.html',new Response('old shell'));
network=async()=>new Response('current shell');
assert.equal(await (await request('/admin')).text(),'current shell');
assert.equal(await entries.get('/index.html').clone().text(),'current shell');
network=async()=>{ throw Error('offline'); };
assert.equal(await (await request('/admin')).text(),'current shell');
assert.equal(await request('/api/state'),undefined);
assert.equal(await request('/api'),undefined);
assert.equal(await request('/assets/upload','cors','POST'),undefined);
network=async()=>new Response('current styles');
assert.equal(await (await request('/assets/current.css','cors')).text(),'current styles');
network=async()=>{ throw Error('offline'); };
assert.equal(await (await request('/assets/current.css','cors')).text(),'current styles');
let activation;
events.get('activate')({ waitUntil:promise=>{ activation=promise; } });
await activation;
assert.deepEqual(removed,['shriya-clinic-v1']);
console.log('Passed shell refresh, offline fallback, static asset cache, request bypass, and scoped cache cleanup checks.');
