/* Agenda service worker: offline shell + push notifications */
const CACHE='agenda-v7';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('supabase.co'))return; // data always live
  if(r.mode==='navigate'){ // network first, so updates arrive; cache when offline
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||u.hostname==='cdn.jsdelivr.net'||u.hostname.endsWith('gstatic.com')||u.hostname.endsWith('googleapis.com'))){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(err){d={title:'Agenda',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Agenda',{body:d.body||'',tag:d.tag||undefined,icon:'./icons/icon-192.png',badge:'./icons/badge-96.png',data:{hash:String(d.tag||'').startsWith('over:')?'tasques':'avui'},renotify:false}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const hash=(e.notification.data&&e.notification.data.hash)||'avui';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){c.postMessage({hash});return c.focus()}}
    return self.clients.openWindow('./#'+hash);
  }));
});
