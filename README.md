# ✦ Inspira

> Weisheiten, die bewegen — eine minimalistische Zitat- und Lese-App mit animierten Themes.

Ein schlankes, dependency-freies Web-App mit 100 inspirierenden Zitaten und einer Textbibliothek mit 20 Langtext-Werken von Buddha bis Nietzsche. Komplett im Browser, kein Build-Step, kein Framework.

---

## Features

- **100 Zitate** — Deutsch & Englisch, von der Antike bis heute
- **Textbibliothek** — 20 Langtexte (Philosophie, Lyrik, Mystik) mit Reader-Ansicht und Kategorie-Filter
- **Featured Text** — zufällig ausgewählter Text als Teaser auf der Startseite
- **15 animierte Themes** — von Glassmorphism bis Matrix-Regen
- **Kategorie-Filter** — 7 Kategorien als Pills, Mehrfachauswahl möglich
- **Autoplay-Modus** — automatischer Zitatwechsel alle 15 Sekunden mit Fortschrittsbalken
- **Favoriten** — lokal gespeichert via `localStorage`
- **Kopieren & Teilen** — Clipboard API mit Web Share API Fallback
- **Social Share** — WhatsApp, Signal, Telegram, Facebook, Reddit, Link kopieren
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
| **Dunkel** | Mitternacht: Tiefgrün-Schieferblau, Jadegrün-Akzent | — |
| **Hell** | Papier & Tinte: Cremeweiß-Beige, Terrakotta-Akzent | — |
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
| **Steampunk** | Kupfer & Leder | CSS-Glow-Puls auf der Card |
| **Westeros** | Asche & Feuer | Canvas-Glutfunken |
| **Sakura** | Kirschblütenrosa | Canvas-Blütenblätter |
| **Cosmos** | Mitternachtsblau & Nebel | Canvas-Sterne & Nebula |
| **Wüste** | Sanddüne & Sonnenuntergang | Warme Orbs |

---

## Eigenes Theme hinzufügen

1. Neuen `[data-theme="name"]`-Block in `css/themes.css` anlegen (alle ~24 Variablen befüllen)
2. Option in `index.html` unter `#themeSelect` eintragen
3. Optional: Animationsregeln in `css/app.css` ergänzen

Canvas-Effekte werden in `js/effects.js` registriert — ein Objekt mit `start` und `draw` in die `EFFECTS`-Map eintragen und den Theme-Namen als Key verwenden.

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

Die 7 vorhandenen Kategorien: `Achtsamkeit & Innere Ruhe`, `Kreativität & Inspiration`, `Lebensweisheit & Sinn`, `Liebe & Mitgefühl`, `Mut & Resilienz`, `Selbst & Identität`, `Veränderung & Wachstum`.

---

## Eigene Langtexte hinzufügen

Texte werden in `texts.json` registriert und als Markdown-Dateien im `markdown/`-Ordner abgelegt:

```json
{
  "id": "autor-titel",
  "title": "Titel des Werks",
  "author": "Autor",
  "description": "Kurzbeschreibung",
  "category": "Philosophie & Weisheit",
  "lang": "de",
  "file": "markdown/autor-titel.md"
}
```

Der Mini-Markdown-Parser in `js/texts.js` unterstützt: Überschriften (`#`, `##`, `###`), Absätze, Kursiv (`*text*`), Fett (`**text**`) und horizontale Linien (`---`). Frontmatter (`---`-Block am Anfang) wird automatisch entfernt.

---

## Projektstruktur

```
Inspira/
├── index.html          # Markup (keine Logik)
├── quotes.json         # 100 Zitate (DE + EN)
├── texts.json          # 20 Langtexte (Metadaten + Dateipfade)
├── markdown/           # Langtext-Dateien als Markdown
├── css/
│   ├── themes.css      # CSS Custom Properties pro Theme
│   └── app.css         # Layout, Komponenten, Animationen
└── js/
    ├── theme.js        # Theme-Wechsel & localStorage
    ├── app.js          # Kernlogik (Quotes, Favoriten, Filter, Autoplay, Share)
    ├── effects.js      # Canvas-Animationen
    └── texts.js        # Textbibliothek, Reader, Section-Navigation
```

---

## Lizenz

[MIT](LICENSE) © 2026 netlusche
