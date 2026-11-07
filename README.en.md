[简体中文](README.md) | **English**

# Xiaoshubao · Before-You-Go Checklist

Build a daily packing checklist from a child's timetable, turning parental reminders into a departure routine children can complete themselves.

[Open demo](https://drivinggodj.github.io/xiaoshubao/?demo=mon)

Created for the “小智能 · 创新行动” competition. Open it in a phone or desktop browser; no app installation is needed.

## Features

| Page | Function |
| --- | --- |
| Today | Combine timetable items, check them off and track completion |
| Timetable | Edit Monday–Sunday classes/activities and their required items |
| Items | 12 common presets and custom items |
| Achievements | Fully packed streaks, total checks and milestone badges |
| Settings | Change the demo day or clear data |

## Quick start

Open the demo link. `?demo=mon` forces Monday for presentation; remove it to use the device's actual date.

Locally, open `index.html` directly, or install Python 3 and serve the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Usage

Edit the timetable and item list, then check each item on Today. Data stays in the current browser's `localStorage`; there is no backend or device sync. Clearing site data or using the reset setting removes local records.

## Development and documentation

Built with plain HTML, CSS and JavaScript, with no dependencies or build step. After changes, check timetable editing, checklists, achievements and persistence in a browser.

- `index.html`: entry page; `app.js`: logic; `styles.css`: mobile-first styling.
- [Requirements (Chinese)](docs/需求文档.md) · [Design notes (Chinese)](docs/设计说明.md)
- [Report an issue](https://github.com/DrivingGodJ/xiaoshubao/issues)

## License and credits

No standalone repository-wide license is declared. Confirm permission before redistribution or commercial use.
