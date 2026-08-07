ETF DEPOT ANDREAS – VERSION 1.3 PERSISTENT LOGIN

Neu
---
- einmal auf jedem Gerät anmelden
- Supabase-Session wird lokal gespeichert
- Access Token wird automatisch erneuert
- beim App-Start wird eine vorhandene Session automatisch wiederhergestellt
- nur bei wirklich abgelaufener/ungültiger Session muss erneut angemeldet werden
- Cloud-Dialog zeigt Konto, E-Mail und letzte Synchronisation
- aktives Abmelden löscht die gespeicherte Session

Wichtig
-------
Safari Private Browsing oder das Löschen von Website-Daten entfernt die lokale Session.
Dann ist eine erneute Anmeldung nötig.

Supabase
--------
Kein neues SQL erforderlich.
Beim nächsten Cloud-Speichern wird schema_version auf 1.3 gesetzt.
