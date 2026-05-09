# ✦ Inspira

> Weisheiten, die bewegen — eine minimalistische Zitat-App mit animierten Themes.

Ein schlankes, dependency-freies Web-App das täglich inspirierende Zitate von Buddha, Osho, Rumi, Goethe und vielen anderen zeigt. Komplett im Browser, kein Build-Step, kein Framework.

---

## Features

- **100 Zitate** — Deutsch & Englisch, von der Antike bis heute
- **12 animierte Themes** — von Glassmorphism bis Matrix-Regen
- **Kategorie-Filter** — 25 Kategorien als Pills
- **Autoplay-Modus** — automatischer Zitatwechsel alle 15 Sekunden mit Fortschrittsbalken
- **Favoriten** — lokal gespeichert via `localStorage`
- **Kopieren & Teilen** — Clipboard API mit Web Share API Fallback
- **Responsive** — funktioniert auf Desktop und Mobile
- **Kein Build-Step** — reines HTML, CSS und JavaScript

---

## Schnellstart

```bash
python3 -m http.server 8081
```

Dann im Browser öffnen: [http://localhost:8081](http://localhost:8081)

> **Hinweis:** Die App muss über einen HTTP-Server ausgeliefert werden — `file://` blockiert `fetch()`.

---

## Themes

| Theme | Charakter | Animation |
|---|---|---|
| **Dunkel** | Klassisches Indigo-Dunkel | — |
| **Hell** | Helles Blau-Violett | — |
| **Aurora** | Tiefblau mit Smaragdgrün | — |
| **Frutiger Aero** | Himmelblau, Aqua-Gloss | Glasshine-Sweep, schwebende Orbs |
| **Cyberpunk** | Neon-Pink & Cyan | Glow-Puls, RGB-Glitch, Scanlines |
| **Matrix** | Terminal-Grün auf Schwarz | Canvas-Zeichenregen (Katakana) |
| **LCARS** | Star Trek LCARS, Orange & Lila | Scanner-Sweep, Badge-Blinken |
| **Vaporwave** | Pastell-Pink & Cyan | Perspektiv-Grid, Glow-Puls |
| **Synthwave** | Orange & Magenta | Retro-Sonnenuntergang, Raster-Grid |
| **Polarlichter** | Dunkelblau, Grün & Lila | Canvas-Aurora-Bänder |
| **Underwater** | Tiefseeblau & Türkis | Canvas-Blasen, Caustic-Shimmer |
| **Papier** | Warm-Beige, Tinte | Papier-Noise-Textur |

---

## Eigenes Theme hinzufügen

1. Neuen `[data-theme="name"]`-Block in `css/themes.css` anlegen (alle ~24 Variablen befüllen)
2. Option in `index.html` unter `#themeSelect` eintragen
3. Optional: Animationsregeln in `css/app.css` ergänzen

Canvas-Effekte (wie Matrix oder Polarlichter) werden in `js/effects.js` registriert — dort ein Objekt mit `start` und `draw` in die `EFFECTS`-Map eintragen und den Theme-Namen als Key verwenden.

---

## Eigene Zitate hinzufügen

Zitate leben in `quotes.json`. Jeder Eintrag folgt diesem Schema:

```json
{
  "text": "Das Zitat.",
  "author": "Vorname Nachname",
  "description": "Kurze Beschreibung der Person",
  "lang": "de",
  "category": "Weisheit"
}
```

`lang` ist `"de"` oder `"en"`. `category` erscheint automatisch als Filter-Pill.

---

## Projektstruktur

```
quote-generator/
├── index.html          # Markup (keine Logik)
├── quotes.json         # Zitate-Daten
├── css/
│   ├── themes.css      # CSS Custom Properties pro Theme
│   └── app.css         # Layout, Komponenten, Animationen
└── js/
    ├── theme.js        # Theme-Wechsel & localStorage
    ├── app.js          # Kernlogik (Quotes, Favoriten, Filter, Autoplay)
    └── effects.js      # Canvas-Animationen (Matrix, Aurora, Underwater)
```

---

## Lizenz

[MIT](LICENSE) © 2026 netlusche
