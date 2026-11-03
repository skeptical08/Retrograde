# Listening refinement — Retrograde 1.0

Verified November 2–3, 2026 on Windows, Spotify 1.3.6.1921 and Spicetify 2.46.4. Package revision 1.0.4; visible branding remains Retrograde 1.0.

## Changes
- Scoped grid-slot markers cancel Spotify cinema idle margins and transforms only while Retrograde lyrics are open. The Queue, library rail, toolbar and playback strip retain their normal rows and columns. Markers and observers are cleaned up when leaving.
- A consolidated src/listening.css controls the listening layout. Fluid typography, current-line focus, a balanced artwork/detail column and a compact horizontal card at narrow widths replace the former overlapping layout overrides.
- Cinema fills the Spotify window without requesting system fullscreen. Fullscreen uses the actual fullscreen API. Both hide app bars and place vector-icon transport controls, inset silver sliders and lyrics Preferences beneath the song details. Escape restores the preceding layout.
- The Lyrics preferences toolbar button and transport sliders button open only Lyrics & artwork and Word timing groups. Theme preferences remain available from the main toolbar. Reset in the lyrics dialog resets listening preferences without changing the theme palette. Closing its dialog with Escape leaves the listening mode active.
- Focus and centered/left alignment are saved separately from color presets. Original lyric text, source credit, native line seeking and the optional genuine-timestamp renderer are retained. Native line effects do not invent word timing.

## Verification
- 48 automated tests passed: fullscreen entry/exit/fallback, Cinema without system fullscreen, fullscreen-to-Cinema transition, Escape with a dialog open, transport API wiring and cleanup, preference migration/persistence across presets, timestamp rendering, romanization, extension ownership and runtime scheduling.
- In the real Spotify app, a 10-second cursor-idle comparison with Queue open found identical stage/header/Queue/rail/player rectangles. At the tested maximized size, Queue occupied x1395/y74/w360/h856 CSS pixels and the playback row remained y930/h56 instead of receiving native negative margins.
- Real Cinema: no document.fullscreenElement; stage filled the viewport; native playback bar hidden; exactly one companion transport. Real Fullscreen: document.fullscreenElement present; stage filled the viewport; bar hidden. Escape restored the normal player. Lyrics Preferences opened from the transport; Escape dismissed the dialog while retaining Cinema.
- Actual native window sizes were tested at approximately 1600×900, 1222×742 and 983×643 physical pixels (renderer viewports approximately 1754×985, 1338×812 and 1076×704 at the existing fractional zoom). Narrow lyrics switched to a horizontal song card alongside a 360-CSS-pixel Queue; the header fit its available width. The narrow dialog was 720×656 CSS pixels inside a 1076×704 viewport, exposed only two lyric groups, and had no horizontal overflow.
- Left alignment updated the rendered data attribute and local storage; the original centered setting was restored after the test. Source and generated files are editable/reproducible; previous installed files are backed up before applying.

## Scope
This is targeted regression evidence, not a claim that every Spotify screen, backend state, Marketplace extension or OS DPI combination was exhaustively tested. Native advertisements and unsynchronized/unavailable lyrics remain Spotify-owned. No playback, queue contents, saved music or playlist data was changed during these visual checks. Automatic online word timing remains blocked on the provider transport described in PROVIDER-TRANSPORT.md.

## Design references
The focus hierarchy and immersive presentation were informed by Spicy Lyrics (https://github.com/Spikerko/spicy-lyrics), Beautiful Lyrics (https://github.com/surfbryce/beautiful-lyrics), and Liquid Lyrics (https://github.com/NMWplays/Liquid-Lyrics). Cinema follows Liquid Lyrics' distinction between filling the app window and system fullscreen. This revision uses original Retrograde layout/controller code and does not copy those projects' implementation or assets.
