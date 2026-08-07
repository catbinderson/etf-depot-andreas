ETF DEPOT ANDREAS – VERSION 10 CLOUD PRO

Cloud Pro
---------
- Supabase URL und Publishable Key sind bereits vorkonfiguriert.
- Auf jedem Gerät nur einmal mit derselben E-Mail + Passwort anmelden.
- Supabase ist der zentrale Master-Datenstand.
- Automatischer Abgleich nach Änderungen und regelmäßig im Vordergrund.
- Offline-Änderungen werden lokal zwischengespeichert und später hochgeladen.
- Konfliktschutz: Wenn Cloud UND lokales Gerät seit dem letzten Sync geändert wurden, wird nichts still überschrieben.
- Geräteübersicht mit letzter Aktivität.
- Cloud-Wiederherstellungspunkte / Versionshistorie.
- bestehende Version-10-Daten werden übernommen.

Supabase einmalig vorbereiten
-----------------------------
1. Supabase → SQL Editor.
2. Inhalt von SUPABASE_SETUP.sql einfügen.
3. Run.
4. Erwartete Meldung: Success. No rows returned.

Danach
------
1. ETF-App öffnen.
2. Cloud-Einstellungen.
3. E-Mail + Passwort eingeben.
4. Anmelden.
5. Dasselbe einmal auf iPhone/iPad.
6. Danach Werte nur noch auf einem Gerät erfassen.

Sicherheit
----------
- In der Browser-App wird ausschließlich der Publishable Key verwendet.
- Niemals den Supabase Secret Key / service_role Key in die App eintragen.
- RLS begrenzt jeden Zugriff auf den aktuell angemeldeten Benutzer.

GitHub Pages
------------
Repository: etf-depot-andreas
Settings → Pages → Deploy from a branch → main → /(root)
