import { defineConfig } from 'vite';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export default defineConfig({base:'./',plugins:[{name:'offline-assets',closeBundle(){
 const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name).replace(/^dist\//,'./')]);
 const assets=walk('dist').filter(p=>!p.endsWith('service-worker.js'));
 writeFileSync('dist/service-worker.js',`const CACHE='offside-v1-'+${JSON.stringify(Date.now().toString())};const ASSETS=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('offside-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match(new URL('./index.html',self.registration.scope)):Response.error())))});`);
 }}]});
