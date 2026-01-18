# Speed Reader

A cross-platform desktop application for rapid serial visual presentation (RSVP) reading. Drop documents or paste URLs, and read text one word at a time at adjustable speeds.

![Electron](https://img.shields.io/badge/Electron-40-47848F?logo=electron)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **RSVP Reading** - Words presented one at a time at a fixed focal point, eliminating eye movement
- **ORP Highlighting** - Optimal Recognition Point highlighted in red for faster word processing
- **Multiple Formats** - Drag and drop PDF, Word documents (.docx), text files, or paste URLs
- **Speed Control** - Adjustable from 100-1000 WPM with keyboard shortcuts
- **Smart Timing** - Variable word display based on length and punctuation
- **Multiple Fonts** - 6 serif fonts to choose from, cycle with 'F' key
- **Progress Saving** - Automatically saves and resumes reading position per document
- **Offline** - Works completely offline once installed

## Installation

```bash
# Clone the repository
git clone https://github.com/owenobyrne/speed-reader.git
cd speed-reader

# Install dependencies
npm install

# Run the app
npm start
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `↑` / `↓` | Increase/Decrease speed (50 WPM) |
| `←` / `→` | Jump back/forward one sentence |
| `Shift + ←` / `→` | Jump back/forward one paragraph |
| `[` / `]` | Decrease/Increase font size |
| `F` | Cycle through fonts |
| `R` | Restart from beginning |

## How It Works

RSVP (Rapid Serial Visual Presentation) works by displaying words one at a time at a fixed point, eliminating the need for eye movement across a page. The red-highlighted letter marks the Optimal Recognition Point (ORP) - typically slightly left of center - which helps the brain process words faster.

## Tech Stack

- **Electron** - Cross-platform desktop app
- **pdf-parse** - PDF text extraction
- **mammoth** - Word document parsing
- **@mozilla/readability** - Web article extraction

## Fonts

The bundled fonts are licensed under the [SIL Open Font License](fonts/OFL.txt):

- Tinos
- EB Garamond
- Merriweather
- Libre Baskerville
- Spectral

Plus system Times New Roman.

## License

MIT License - see [LICENSE](LICENSE) for details.

Font files in `/fonts` are under the SIL Open Font License - see [fonts/OFL.txt](fonts/OFL.txt).
