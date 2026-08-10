const CACHE="etf-depot-andreas-v1-5-2-date-update";
const ASSETS=["./","./index.html","./styles.css?v=1.5.2","./app.js?v=1.5.2","./manifest.webmanifest","./icon-192.png","./icon-512.png","./version.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type==="SKIP_WAITING"){
    self.skipWaiting();
    return;
  }
  if(data.type==="PREPARE_UPDATE"){
    event.waitUntil((async()=>{
      try{
        const cache=await caches.open(CACHE);

        // Fetch every critical file from network with no-store and only
        // switch versions after every one succeeded.
        for(const asset of ASSETS){
          const url=new URL(asset,self.registration.scope);
          url.searchParams.set("_precache",Date.now().toString());
          const response=await fetch(url.toString(),{cache:"no-store"});
          if(!response.ok)throw new Error(`${asset}: HTTP ${response.status}`);
          await cache.put(asset,response.clone());
        }

        // Validate the two most important resources before activation.
        const jsResp=await cache.match("./app.js?v=1.5.2");
        const htmlResp=await cache.match("./index.html");
        if(!jsResp||!htmlResp)throw new Error("Kritische App-Dateien fehlen im neuen Cache");

        event.ports?.[0]?.postMessage({ok:true,cache:CACHE});
      }catch(err){
        event.ports?.[0]?.postMessage({ok:false,error:String(err?.message||err)});
      }
    })());
  }
});

self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);

  if(url.pathname.endsWith("/version.json")){
    e.respondWith(fetch(e.request,{cache:"no-store"}));
    return;
  }

  if(e.request.mode==="navigate"){
    e.respondWith((async()=>{
      try{
        const net=await fetch(e.request,{cache:"no-store"});
        if(net.ok){
          const cache=await caches.open(CACHE);
          await cache.put("./index.html",net.clone());
        }
        return net;
      }catch(err){
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  const isAppAsset =
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/manifest.webmanifest") ||
    url.pathname.endsWith("/icon-192.png") ||
    url.pathname.endsWith("/icon-512.png");

  if(isAppAsset){
    e.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(e.request,{ignoreSearch:false}) || await cache.match(url.pathname.split("/").pop());
      if(cached)return cached;
      const net=await fetch(e.request,{cache:"no-store"});
      if(net.ok)await cache.put(e.request,net.clone());
      return net;
    })());
  }
});
