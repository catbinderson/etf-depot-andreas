ETF DEPOT ANDREAS – VERSION 9.1 CLOUD FIRST

Hauptänderung
-------------
Supabase ist nach der Anmeldung die führende Datenquelle.
Depotwerte müssen nicht mehr getrennt auf Mac und iPhone erfasst werden.

So funktioniert es
-------------------
1. SUPABASE_SETUP.sql einmal im Supabase SQL Editor ausführen.
2. Die App auf dem Mac öffnen und unter „Cloud-Einstellungen“ anmelden.
3. Wenn in Supabase noch kein Datensatz existiert, wird der vorhandene Version-9-Datenstand einmalig hochgeladen.
4. Auf iPhone/iPad dieselbe Website öffnen und mit demselben Supabase-Konto einmalig anmelden.
5. Danach werden Änderungen automatisch zu Supabase geschrieben.
6. Andere angemeldete Geräte laden neue Cloud-Daten automatisch beim Öffnen, beim Zurückkehren zur App, nach Wiederherstellung der Internetverbindung und regelmäßig im Vordergrund.

Cloud-First Verhalten
---------------------
- Supabase = zentraler Master-Datenstand
- lokaler Browser-Speicher = Offline-Cache / Fallback
- automatische Speicherung nach Änderungen (Debounce)
- automatisches Laden neuer Cloud-Daten
- automatische Erneuerung abgelaufener Supabase Access Tokens
- manueller Button „Jetzt abgleichen“ bleibt als Notfall-/Kontrollfunktion
- bestehende Version-9-Daten werden beim ersten Cloud-Login übernommen
- gleicher Datenbestand auf Mac, iPhone und iPad

Weitere Funktionen aus 9.0 bleiben erhalten
-------------------------------------------
- Professional Dashboard
- Tages-, Wochen-, Monats- und Jahreskennzahlen
- Retina-Verlaufsgrafik und Historienverwaltung
- ETF-Renditevergleich
- Sparraten-/Einstandskapital-Automatik
- USD/EUR-Tageskurs
- Backup/Import und CSV-Export
- PWA/Offline-Unterstützung
- Dark/Light Mode

GitHub Pages
------------
Für das Repository etf-depot-andreas:
Settings → Pages → Deploy from a branch → main → /(root)

Wichtig
-------
Auf jedem neuen Gerät ist nur eine einmalige Supabase-Anmeldung nötig.
Danach müssen Depotwerte nur noch auf EINEM Gerät erfasst werden.
