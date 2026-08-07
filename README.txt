ETF DEPOT ANDREAS – VERSION 14 PRO
Analytics & Intelligence

Neu
---
- alle Charts und Cloud-Funktionen aus Version 13
- Profi-Risikokennzahlen: Volatilität, Sharpe Ratio, Gewinntage, bester/schlechtester Tag
- Smart Insights: automatische lokale Auswertung des Depots
- Depot-Assistent für Fragen zu Rendite, ETFs, Drawdown, Volatilität, Sharpe Ratio, Kapital und Zielprognosen
- Benchmark-Vergleich gegen MSCI World, MSCI ACWI oder S&P 500
- Benchmarkdaten werden bewusst nicht erfunden: Import als CSV date,value
- mobile Bottom-Navigation für iPhone
- nochmals verkleinerter Synchronisationsstatus auf dem iPhone
- Supabase bleibt zentraler Master-Datenstand
- Benchmarkdaten werden im bestehenden Portfolio-JSON mit synchronisiert

Wichtig
-------
Der Depot-Assistent arbeitet lokal und regelbasiert mit den eigenen Depotdaten.
Er sendet keine Depotdaten an einen externen KI-Dienst.

Benchmark-CSV
-------------
Beispiel:
date,value
2026-01-02,100
2026-01-03,100.6

Es ist kein neues Supabase-SQL erforderlich.

Installation
------------
ZIP entpacken, Inhalt ins Root des GitHub-Repositories hochladen, vorhandene Dateien ersetzen,
Commit durchführen und GitHub Pages Deployment abwarten.
