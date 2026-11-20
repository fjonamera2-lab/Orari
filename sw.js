try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');}catch(e){}
const CACHE = 'orari-v17';
const BADGE_CACHE = 'orari-badge';   // ruan numrin e njoftimeve të palexuara (nuk fshihet gjatë përditësimit të cache-s)
const CORE = ['./', './index.html', './orari_dita.html', './orari_kp.html', './grafiku_testimeve.html', './grafiku_testimeve.pdf', './stema.jpg', './icon-192.png', './apple-touch-icon.png', './stema.png', './icon-512.png', './manifest.webmanifest', './cilesimet.js', './mbyllja.js', './njoftim.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== BADGE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rrjeti fillimisht (orari gjithmonë i përditësuar), cache kur nuk ka internet
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req.url, {cache: 'no-cache'})
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

// Rrethi i kuq në ikonën e aplikacionit kur vjen njoftim i ri (kur aplikacioni nuk është i hapur)
const BADGE_KEY = new URL('__badge', self.registration.scope).href;
async function getCount(){
  try{ const c = await caches.open(BADGE_CACHE); const r = await c.match(BADGE_KEY); return r ? (parseInt(await r.text(), 10) || 0) : 0; }
  catch(e){ return 0; }
}
async function setCount(n){
  try{ const c = await caches.open(BADGE_CACHE); await c.put(BADGE_KEY, new Response(String(n))); }catch(e){}
}
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    if (wins.some(w => w.visibilityState === 'visible')) return;   // aplikacioni është hapur: s'ka nevojë për rreth
    const n = (await getCount()) + 1;
    await setCount(n);
    if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(n);
  })().catch(() => {}));
});
