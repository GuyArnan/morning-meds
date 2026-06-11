// Morning Meds — Service Worker
// Handles offline caching + background notification scheduling.
// Supports multiple reminder times per day.

'use strict';

const CACHE = 'morning-meds-v1';
const SHELL = ['./index.html', './manifest.json', './sw.js'];

// ── Install ─────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate ────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// ── Fetch: cache-first for shell, network for everything else ────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// ── Scheduling ──────────────────────────────────────────────────────
// _timers: Map<timeStr, timeoutId>
// _times:  string[]  — the full current set (kept so ALL_TAKEN can reschedule)
const _timers = new Map();
let   _times  = [];

/**
 * Schedule (or reschedule) all reminder times.
 * @param {string[]} times       Array of "HH:MM" strings
 * @param {boolean}  alreadyTaken  If true, skip any times that are still today
 */
function scheduleAll(times, alreadyTaken) {
  // Cancel everything currently scheduled
  for (const id of _timers.values()) clearTimeout(id);
  _timers.clear();

  _times = Array.isArray(times) ? times : [];
  _times.forEach(t => scheduleOne(t, alreadyTaken));
}

/**
 * Schedule a single reminder time, firing on the next future occurrence.
 * After firing it re-schedules itself for the following day.
 */
function scheduleOne(timeStr, alreadyTaken) {
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return;

  const now    = new Date();
  const target = new Date(now);
  target.setSeconds(0, 0);
  target.setHours(h, m);

  // Push to tomorrow if this time has already passed today
  if (target <= now) target.setDate(target.getDate() + 1);

  // If meds are already done AND the next occurrence is still today, push to tomorrow
  const isTargetToday =
    target.getDate()  === now.getDate()  &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear();
  if (alreadyTaken && isTargetToday) target.setDate(target.getDate() + 1);

  const ms = target.getTime() - Date.now();

  const id = setTimeout(async () => {
    _timers.delete(timeStr);
    await self.registration.showNotification('Morning Meds 💊', {
      body:     'Time to take your medications!',
      tag:      'morning-meds-' + timeStr,  // unique tag per slot
      renotify: false
    });
    // Re-schedule same time for tomorrow
    scheduleOne(timeStr, false);
  }, ms);

  _timers.set(timeStr, id);
}

// ── Messages from the page ──────────────────────────────────────────
self.addEventListener('message', event => {
  const { type, times, alreadyTaken } = event.data || {};

  if (type === 'SCHEDULE') {
    // times is string[] e.g. ['08:00', '20:00']
    scheduleAll(times || [], !!alreadyTaken);
  }

  if (type === 'ALL_TAKEN') {
    // All meds ticked off — cancel today's remaining slots, keep tomorrow's
    for (const id of _timers.values()) clearTimeout(id);
    _timers.clear();
    _times.forEach(t => scheduleOne(t, true));
  }

  if (type === 'CANCEL') {
    for (const id of _timers.values()) clearTimeout(id);
    _timers.clear();
    _times = [];
  }
});

// ── Tap notification → open / focus the app ─────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      for (const c of cs) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
