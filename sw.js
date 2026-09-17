const CACHE_NAME = "klavier-app-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  event.waitUntil(self.clients.claim());
});


/* ==========================================
   PUSH NOTIFICATION
   ========================================== */

self.addEventListener("push", event => {

  if (!event.data) return;

  let data;

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Klavierunterricht",
      body: event.data.text()
    };
  }

  const title =
    data.title || "Klavierunterricht";

  const options = {
    body: data.body || "Eine Unterrichtsstunde wurde angefragt.",
    icon: "./icon-192.png",
    badge: "./icon-192.png",

    vibrate: [
      300,
      120,
      300,
      120,
      600
    ],

    requireInteraction: true,

    data: {
      url: data.url || "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );

});


/* ==========================================
   NOTIFICATION CLICK
   ========================================== */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      event.notification.data?.url ||
      "./";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(clientList => {

        for (const client of clientList) {

          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }

        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

      })
    );

  }
);


/* ==========================================
   CACHE / NETWORK
   ========================================== */

self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );

});
