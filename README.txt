ETF DEPOT ANDREAS – VERSION 10.1 CLOUD FINAL

Ziel
----
Ein gemeinsamer Depotstand auf Mac, iPhone und iPad.
Supabase ist die zentrale Datenquelle. Der lokale Browser-Speicher ist nur Cache/Offline-Warteschlange.

Neu in 10.1
-----------
- Auto-Sync nach Änderungen (Debounce)
- Auto-Sync beim Start, Fokuswechsel, Rückkehr zur App und nach Wiederherstellung der Internetverbindung
- automatisches Nachladen eines neueren Cloud-Stands
- sichtbarer Live-Cloudstatus: Synchronisiert / Synchronisiere / Offline / Konflikt / Fehler
- Zeitstempel des letzten erfolgreichen Syncs
- Synchronisationsprotokoll
- Offline-Queue: lokale Änderungen bleiben erhalten und werden später übertragen
- Konfliktschutz: lokale und neuere Cloud-Änderungen werden nicht still überschrieben
- Geräteübersicht
- Cloud-Versionshistorie / Wiederherstellungspunkte
- weiterhin Rebalancing, Performance-Auswertung, CSV, Backup und PDF/Druck

Supabase
--------
Deine bestehenden Version-10-Tabellen funktionieren weiter.
SUPABASE_SETUP.sql muss nicht erneut ausgeführt werden, wenn portfolio_sync,
portfolio_devices und portfolio_sync_versions bereits existieren.

Erster Test
-----------
1. Auf dem Mac anmelden.
2. Einen Wert ändern.
3. 2–3 Sekunden warten.
4. Supabase → Table Editor → portfolio_sync prüfen: updated_at muss sich ändern.
5. Auf dem iPhone dieselbe App öffnen und mit derselben E-Mail anmelden.
6. Nach wenigen Sekunden muss der Mac-Stand erscheinen.

GitHub Pages
------------
Repository: etf-depot-andreas
Settings → Pages → Deploy from a branch → main → /(root)
