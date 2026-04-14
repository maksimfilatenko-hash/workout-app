const CACHE = "workout-v2"; // Обновил версию

const files = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(files))
  );
  self.skipWaiting(); // Активируем сразу
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ========== УВЕДОМЛЕНИЯ ==========
self.addEventListener("notificationclick", e => {
  e.notification.close();
  
  // Открываем или фокусируем приложение при клике на уведомление
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(windowClients => {
        // Если окно уже открыто, фокусируем его
        for (let client of windowClients) {
          if (client.url.includes("/workout-app/") && "focus" in client) {
            return client.focus();
          }
        }
        // Иначе открываем новое
        if (clients.openWindow) {
          return clients.openWindow("/workout-app/");
        }
      })
  );
});

// Получение уведомления от страницы
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const options = {
      body: event.data.body || "Отдых окончен! Пора делать следующий подход 💪",
      icon: "/workout-app/icon.png",
      badge: "/workout-app/icon.png",
      vibrate: [200, 100, 200],
      tag: "timer-end",
      renotify: true,
      requireInteraction: true, // Уведомление не исчезает само
      silent: false
    };
    
    self.registration.showNotification("⏰ Workout Tracker", options)
      .catch(err => console.log("Ошибка уведомления:", err));
  }
});