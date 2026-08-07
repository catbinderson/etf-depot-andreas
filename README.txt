ETF DEPOT ANDREAS – VERSION 13 ANALYTICS & CHARTS

Neu in Version 13
-----------------
- Depotentwicklung als interaktives Chart
- Gewinnverlauf als eigenes Chart
- ETF-Performance-Vergleich: Seit Kauf und seit Jahresbeginn
- Performance-Heatmap für alle ETF-Positionen
- Chart-KPIs für Zeitraum, Spanne und aktuelle Werte
- neue Tagesstände speichern ab jetzt zusätzlich:
  * Gesamtgewinn
  * Einstandskapital
  * YTD-Gewinn
  * Werte/Gewinne/Einstandswerte jeder ETF-Position
- dadurch wächst die historische Analyse automatisch mit jedem Tagesstand
- Supabase-Cloud-Sync, Offline-Queue, Konfliktschutz und Geräte-Sync bleiben vollständig erhalten

iPhone-Optimierung
------------------
Der grüne Synchronisationsstatus im Kopfbereich ist auf kleinen Displays deutlich
kleiner und kompakter. Er nimmt nicht mehr die große vertikale Fläche im Header ein.

Wichtig zur Gewinnhistorie
--------------------------
Alte Tagesstände aus Version 10.x enthalten nur den Depotwert. Version 13 erfindet
dafür keine historischen Gewinnwerte. Der Gewinnverlauf beginnt deshalb ab dem
ersten in Version 13 gespeicherten Tagesstand und wird danach automatisch erweitert.

Supabase
--------
Kein neues SQL-Setup erforderlich. Beim nächsten Cloud-Speichern setzt die App
schema_version automatisch auf 13.0.

Installation
------------
1. ZIP entpacken.
2. Inhalt in das Root des GitHub-Repositories hochladen.
3. Vorhandene Dateien ersetzen.
4. Commit changes.
5. GitHub Pages Deployment abwarten.
6. Auf iPhone/Mac Seite einmal neu laden.

GitHub Pages
------------
main → /(root)
