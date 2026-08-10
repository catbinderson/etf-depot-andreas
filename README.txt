ETF DEPOT ANDREAS – VERSION 1.5.1 STABILITÄTSUPDATE

Version 1.5.1 verhindert, dass ein fehlendes oder noch nicht geladenes Bedienelement
die gesamte App-Initialisierung stoppt. Das JavaScript wartet außerdem auf das
vollständige HTML-Dokument. Das behebt den Safari-Fehler „onclick … is null“.

Warum diese Version?
--------------------
Safari auf dem iPhone kann beim Wechsel einer PWA-Version kurz alte und neue
Dateien mischen. Das kann einmalig zu „App-Fehler: Script error.“ führen.

Version 1.5 verhindert diesen Mischzustand so weit wie technisch möglich:

1. Die neue Version wird zunächst vollständig in einen neuen Cache geladen.
2. index.html, app.js, styles.css, Manifest und Icons müssen erfolgreich geladen sein.
3. Erst danach wird der neue Service Worker aktiviert.
4. Erst nach der Aktivierung wird die App neu gestartet.
5. Alte App-Caches werden erst beim Aktivieren der neuen Version gelöscht.

Neu
---
- zweistufiges Safe-Update
- vollständige Precache-Prüfung vor Aktivierung
- kein automatisches skipWaiting während des Downloads
- Navigation verwendet Network-First mit Cache-Fallback
- statische App-Dateien kommen aus einem konsistenten aktiven Cache
- version.json wird nie aus dem Cache gelesen
- Update-Fehler führen nicht zu einem halb installierten Release

Bestehende Funktionen
---------------------
- Persistent Login
- Supabase Auto-Sync
- FNZ Flexkonto und Gesamtvermögen
- Analytics, Charts, Benchmark, Smart Insights
- iPhone / iPad / Mac

Supabase
--------
Kein neues SQL erforderlich.
Beim nächsten Cloud-Speichern wird schema_version auf 1.5 gesetzt.
