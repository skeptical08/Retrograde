# Retrograde Lyrics

Retrograde Lyrics is bundled in the theme’s existing companion script. Installing Retrograde installs the listening features together; no second extension or competing lyrics provider is required. Editable modules live in src/lyrics.js, fullscreen.js, listening-controls.js, lyric-effects.js and romanization.js. Generated dist/Retrograde/theme.js contains the complete runtime.

Open Spotify’s Lyrics button, then select Fullscreen in the listening toolbar. This requests actual system fullscreen and fills the display. The main app toolbar, library, Queue, native lyric toolbar and playback strip are hidden. A compact transport appears below the song information card: previous, play/pause, next, volume, seek, time and Preferences. Exit fullscreen or Escape restores the normal app. If system fullscreen is unavailable, a clearly announced full-window fallback remains reversible. Native fullscreen controls are hidden within Retrograde’s listening view.

Under Preferences → Lyrics & artwork:
- Current lyric line color defaults to white and supports both a color picker and validated hex entry. It is independent of the shell accent and color presets.
- Album backdrop behind lyrics and Album backdrop in artwork view independently control the zoomed, blurred and faded cover. Blur and visibility are shared controls.
- Cover image beside lyrics and Cover image in artwork view independently hide the foreground cover while retaining song information.
- Current-line visual effect offers None, Soft glow, Breathing glow or Letter wave. Moving effects respect Reduce interface animation and OS reduced-motion settings.
- Romanization supports Japanese, Korean and Mandarin. Information position, text size and external-lyrics compatibility settings remain available.

The bundled companion now has an independent renderer for genuine word/syllable timestamps: partially filled word highlights follow the player clock, including paused and backward-seek positions. It supports foreground/background vocals, source attribution and keyboard line seeking. Native glow/wave effects still follow whole lines when no word timing is available. Retrograde never invents word timestamps. Automatic provider access is optional and remains unverified pending approved provider setup; see KARAOKE-SETUP.md. Native lyric text, selection semantics and seeking remain owned by Spotify. Letter effects use an aria-hidden, non-interactive overlay only on the current line; original text is retained, and grapheme clusters preserve accented characters and emoji.

Existing custom lyric views remain extension-owned in Automatic compatibility mode, so the bundled renderer does not overwrite Spicy/Beautiful Lyrics animation or romanization. Select Retrograde native to use the bundled listening layout instead.

## Verification — 2026-11-02

Windows, Spotify 1.3.6.1921, Spicetify 2.46.4.

- Real Spotify system fullscreen entered via the new button. The native document root became fullscreen, the listening stage filled the viewport, app bars were hidden and the compact card transport was visible. Escape exited fullscreen and restored the playback strip.
- Show artwork used the actual cover URL, 48px blur and transparent foreground-card background. Each cover/backdrop toggle was exercised in real Preferences and immediately changed the corresponding view’s computed display state. A custom #88ccff lyric color rendered as rgb(136,204,255); original white and artwork settings were restored.
- A temporary native-markup test line produced 15 animated letter glyphs with 2.4s animation, preserving original text and pointer-events:none on the overlay. The fixture was removed and motion/effect preferences restored. This is a fixture test, not a claimed live word-timed lyric session.
- Spotify subsequently returned Couldn’t load the lyrics for this song; Home also reported a loading error. The native unavailable message is retained and styled at a readable size. A fresh complete live-song timing pass was therefore unavailable during the last regression session.
- 44 automated tests cover fullscreen entry/exit/fallback, transport API wiring, seek and volume, event cleanup, Unicode-safe glyph splitting, preferences, romanization and compatibility. Playback transport actions were tested against a mocked Player API; actual player methods were inspected and the real controls mounted, but every transport action was not exercised on the user’s remote playback.

Full-app entry, Escape, setting updates and native artwork rendering were verified. The timestamp renderer was additionally verified in Spotify with a temporary synthetic line: the current word rendered 50% filled and future words 0%, with source attribution visible. The fixture was removed without changing playback. A new full-song provider session remains unverified. The packaged README documents bundling; the complete bundle was published through pull request #1 and the live Marketplace script was verified against the public build.

## Word timing controls
Preferences → Word timing · optional keeps Spotify native as the default. Provider access requires an authorized publishable client key. The client uses fetch with credentials omitted and never sends a Spotify token. Secret keys are rejected. Provider cache is memory-only, capped at eight tracks and 15 minutes. A failed or unauthorized request leaves the native view available and is not retried in a loop. Personal timing JSON can be imported locally; nothing is uploaded, and the imported timeline is bound to the current Spotify track for this session.
