self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open("race2025-cache").then(c=>{
      return c.addAll([
        "index.html","home.html","login.html",
        "manifest.json","database.json","requirements.json",
        "icon.png"
      ]);
    })
  );
});
self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
