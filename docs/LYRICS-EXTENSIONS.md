# Lyrics extension compatibility — Retrograde 1.0

Preferences → Lyrics & artwork → Lyrics extension compatibility defaults to Automatic.

| Extension | Integration |
| --- | --- |
| Spicy Lyrics | Detects /SpicyLyrics and #SpicyLyricsPage. Extension owns layout, backgrounds, timing and romanization. Keeps its NPV card. |
| Beautiful Lyrics | Detects /BeautifulLyrics and .BeautifulLyricsPage, including Contained/Fullscreen. Keeps #BeautifulLyrics-CardView. Extension owns its controls and romanization. |
| Simple Beautiful Lyrics | Detects its .lyrics-background-container in the native listening surface or main page. Retrograde removes its own listening card, layout and readings so the extension can style native lyrics. |
| More Lyrics | Provider-only integration. Retrograde does not wrap fetch or replace provider responses. Its native presentation and optional readings continue. |
| Lyrics Plus | Detects /lyrics-plus and nonempty #lyrics-cinema. Custom app controls its rendering. |
| Other plugins | Choose Extension-owned to disable Retrograde's native listening takeover while a lyric view is open. Unknown DOM layouts may need a targeted adapter. |

Automatic yields only while a detected view exists. On exit, native handling resumes and the saved expanded-artwork preference is restored. Custom views use the compact player. No extension is installed, removed, configured or patched by Retrograde. Presenters that replace the same lyrics surface should be used one at a time; this adapter does not make mutually exclusive extensions run together.

The theme’s animation suppression excludes known extension roots and yields when an external lyric view is active. OS reduced-motion preferences still apply. Extension sidebar lyric cards are retained even though Retrograde normally simplifies native Now Playing content. Retrograde inserts no companion text or toolbar into extension-owned lyrics.

## Source audit and verification

Reviewed on 2026-11-02:
- [Spicy Lyrics](https://github.com/Spikerko/spicy-lyrics) commit 34ad8c683204c522f227060475bf4f8aae36508e: src/app.tsx and src/css/ContentBox.css.
- [Beautiful Lyrics](https://github.com/surfbryce/beautiful-lyrics) commit 61ac582da092311e893423269ca7f09003108705: Extension/Source/LyricViews and Modules/LyricsRenderer.ts.
- [Simple Beautiful Lyrics and More Lyrics](https://github.com/Kamiloo13/spicetify-extensions) commit 8a9cdd355aeac8895884b544de08efe2ccfc0cb4: their source modules, styles and READMEs.

No upstream code is bundled or copied; these are independently written selector/route compatibility hooks.

29 automated tests pass, including route/root detection, provider-only behavior, manual modes, structural mutation filtering, preference migration and persistence through every color preset. Native Spotify loaded the adapter and accepted temporary source-matched containers; all fixtures were removed. Visual/animation fixture results while Spotify was minimized were inconclusive and are not treated as certification. No end-to-end live song session in each of these third-party extensions was completed. They are not installed in the local Spicetify extensions configuration; Lyrics Plus is installed as a custom app. Upstream installation, service availability and Spotify version support remain prerequisites. This theme cannot repair an extension that fails independently.
