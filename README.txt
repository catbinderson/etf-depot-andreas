ETF DEPOT ANDREAS – VERSION 10.2 CLOUD VERIFIED

Wichtigste Änderung gegenüber 10.1
----------------------------------
Version 10.1 hat bereits erfolgreich automatisch nach Supabase geschrieben.
Der Zeitstempel in Supabase wird in UTC angezeigt:
05:36 UTC = 07:36 Uhr Deutschland (MESZ).

Der sichtbare Wert schema_version blieb jedoch auf 10.0, weil die App bisher nur
portfolio_data und updated_at geschrieben hat. Version 10.2 behebt genau das.

Neu in 10.2
-----------
- schema_version wird bei jedem Cloud-Upsert explizit auf 10.2 gesetzt
- Nach jedem Schreiben liest die App den Datensatz erneut aus Supabase
- Schreibvorgang gilt erst dann als "Bestätigt", wenn updated_at und schema_version
  von Supabase zurückgelesen wurden
- Cloud-Schreibstatus direkt im Dashboard
- sichtbares Cloud-Schema
- Sync-Protokoll meldet "Supabase-Schreibtest bestätigt"

Supabase
--------
Kein neues SQL-Setup nötig. Deine Tabellen sind bereits korrekt eingerichtet.

Test
----
1. Version 10.2 auf GitHub hochladen und Deployment abwarten.
2. App neu laden.
3. Einen Depotwert minimal ändern.
4. 2–3 Sekunden warten.
5. Im Dashboard muss "Cloud-Schreibstatus: Bestätigt ✓" erscheinen.
6. In Supabase portfolio_sync muss schema_version = 10.2 stehen.
7. updated_at ist UTC; Deutschland im August liegt 2 Stunden davor (MESZ).

GitHub Pages
------------
main → /(root)
