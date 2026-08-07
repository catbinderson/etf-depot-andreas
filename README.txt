ETF DEPOT ANDREAS – VERSION 10.0 PROFESSIONAL CLOUD

Kernprinzip
-----------
Supabase bleibt die zentrale Datenquelle. Mac, iPhone und iPad verwenden denselben Datenbestand.
Der Browser speichert nur einen Offline-Cache.

Neu in Version 10
-----------------
- Zielgewichtungen je ETF
- Rebalancing-Analyse mit Abweichung in Prozentpunkten
- Empfehlung, welcher ETF bei der nächsten Sparrate bevorzugt werden sollte
- Portfolio-Intelligence: Seit-Start-Performance, CAGR, Allzeithoch und Abstand zum Hoch
- Änderungsprotokoll (Audit-Log), das über Supabase mit synchronisiert wird
- Depotbericht über Browser-Druckdialog; auf Mac/iPhone kann als PDF gesichert werden
- Cloud-Abgleich im Vordergrund alle 15 Sekunden
- weiterhin automatischer Sync beim Öffnen, Fokuswechsel und Wiederherstellen der Internetverbindung
- neuer Service-Worker-Cache v10 für saubere Updates
- bestehende Version-9.1-Daten werden automatisch übernommen

Supabase
--------
Wenn Version 9.1 bereits mit Supabase funktioniert:
- SUPABASE_SETUP.sql kann erneut ausgeführt werden.
- Kein neues Konto nötig.
- Mit demselben Supabase-Konto auf allen Geräten anmelden.
- Version 10 übernimmt vorhandene Cloud-Daten und ergänzt neue Felder automatisch.

GitHub Pages
------------
Repository: etf-depot-andreas
Settings → Pages → Deploy from a branch → main → /(root)

Upload
------
1. Vorher in der laufenden App optional ein Backup erstellen.
2. ZIP entpacken.
3. Den INHALT des Ordners in das Root des GitHub-Repositories hochladen.
4. Vorhandene Dateien ersetzen.
5. Commit changes.
6. Pages-Build abwarten.
7. Seite neu laden.

Hinweis
-------
Die App ist eine persönliche Depotübersicht und keine Anlageberatung.
