ETF DEPOT ANDREAS – VERSION 1.4 AUTO-UPDATE

Neu in 1.4
----------
- automatische Update-Erkennung über version.json
- Prüfung beim App-Start
- Prüfung beim Zurückkehren in die App
- Prüfung beim Browser-Fokus
- zusätzliche regelmäßige Prüfung einmal pro Stunde
- sichtbarer Hinweis „Neue Version verfügbar“
- Ein-Klick-Button „Jetzt aktualisieren“
- Service Worker wird jetzt aktiv registriert
- Service Worker wird ohne Browser-Cache auf Updates geprüft
- alte App-Caches werden beim Update bereinigt
- „Nach Update suchen“ im Systemstatus
- bestehender Persistent Login aus Version 1.3 bleibt vollständig erhalten

So funktionieren spätere Updates
---------------------------------
Bei jeder neuen Version muss im Repository nur version.json auf die neue
Versionsnummer gesetzt werden. Sobald GitHub Pages den neuen Stand ausliefert,
erkennen Mac, iPhone und iPad die neue Version automatisch.

Wichtig
-------
Die App installiert Updates nicht still während du arbeitest.
Sie zeigt einen Hinweis an und du entscheidest mit „Jetzt aktualisieren“.
Dadurch gehen keine gerade bearbeiteten Eingaben verloren.

Supabase
--------
Kein neues SQL erforderlich.
Beim nächsten Cloud-Speichern wird schema_version auf 1.4 gesetzt.
