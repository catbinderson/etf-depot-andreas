ETF DEPOT ANDREAS – VERSION 1.5.8 HEADER-SIGNATUR

Der Header zeigt jetzt unten die persönliche Signatur „designed & developed by
Andreas Binder“. Der Info-Schalter ist weiter nach links gerückt und hat damit
auf Desktop und iPhone einen klaren Abstand zur Hell-/Dunkelumschaltung.

VERSION 1.5.7 KENNZAHLENÄNDERUNGEN

Nach jeder Werteübernahme zeigen „Gewinn seit Eröffnung“ und „GuV seit
Jahresbeginn“ zusätzlich die Veränderung gegenüber dem unmittelbar vorherigen
Depotstand. Positive Änderungen erscheinen grün, negative rot.

Die zusätzlichen Zeitfenster 1 Tag, 3 Tage und 7 Tage machen Unterschiede
bereits mit der aktuell noch kurzen Historie sichtbar. Längere Zeitfenster
werden automatisch aussagekräftiger, sobald ältere echte Tagesstände vorliegen.

Die Auswahl 30 Tage, 90 Tage, 1 Jahr oder Gesamt aktualisiert jetzt gemeinsam
die Depotkurve, die Performance-Kennzahlen, den Gewinnverlauf und den
Benchmark-Vergleich. Zusätzlich zeigt die App die Anzahl der verwendeten
Tagesstände und deren tatsächlichen Datumsbereich an.

Beim manuellen Drücken auf „Kurs aktualisieren“ wird die Entwicklung des Euro
zum US-Dollar gegenüber der vorherigen manuellen Aktualisierung berechnet.
Ein stärkerer Euro erscheint grün mit Aufwärtspfeil, ein schwächerer Euro rot
mit Abwärtspfeil. Die automatische Kursabfrage verändert den Vergleich nicht.

„Werte übernehmen“ speichert automatisch einen vollständigen Tagesstand.
Bei mehreren Aktualisierungen am selben Kalendertag wird der vorhandene
Tagesstand ersetzt. Der zuletzt übernommene Stand bleibt damit maßgeblich.
Der separate Button „Tagesstand speichern“ wurde entfernt.

Version 1.5.2 trägt beim Aktualisieren der Depotwerte automatisch das heutige
Datum als neuen Stand ein. Unter „Erweiterte Angaben“ kann weiterhin bewusst
ein abweichender Stichtag ausgewählt werden.

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
