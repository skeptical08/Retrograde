# Readability and layout refinement — Retrograde 1.0

Environment: Windows, Spotify 1.3.6.1921, Spicetify 2.46.4. The prior source and configuration are retained under work/refinement-next. No account/library mutations or playback transfers were performed.

## Changes

- Artist content tint is removed separately from its real banner. The artist action row uses 42px play and 36px secondary controls in a compact row.
- Daylist's existing image layer is visible through the header scroll wrapper; normal content surfaces remain solid.
- Native cinema's idle margins are neutralized, with persistent header/player geometry. A zoomed cover is blurred and faded behind transparent lyric wrappers; native lyric timing, scrolling and provider text remain intact.
- The default playback strip is 56px; preferences permit 48–72px and 12–18px song text. Compact typography is capped by available strip height. Expanded metadata grows to contain larger text. The artwork dock uses the sidebar's interior width and meets the player border.
- Library collapse no longer changes the artwork preference. The listening composition reserves space for an open independent dock.
- Type glyphs stay at the left of text library rows; Liked Songs uses a heart. A separate Library cover thumbnails preference places native covers on the far right. The collapsed native artwork rail remains available.
- Preferences has six groups, individual control descriptions and 18 presets. Full hex/RGB Spicetify token updates prevent stale palette colors. Toolbar and bevel tint is editable and changes with each preset.

## Verification actually performed

- All 19 automated tests pass, including migration and sanitization of new controls, palette serialization, 31,104 existing layout/palette combinations, preservation of independent settings across palettes, runtime scheduling and Marketplace removal cleanup.
- Build and Marketplace manifest checks pass.
- All 18 presets were selected through the real Preferences handlers in the installed Spotify renderer. Each selected-state marker and chrome tint matched; main RGB tokens refreshed each time. Every grouped layout control has an associated description. Original palette was restored.
- Real-client observations confirmed the daylist image banner, artist banner, removal of the artist color wash, blurred lyric backdrop, native Queue beside lyrics, and readable compact/expanded song details.
- An eight-second native lyric idle check retained a zero margin, y=73.99px top and y=929.91px bottom with a 55.99px player strip. A three-second idle scheduling check added zero Retrograde feature passes. Earlier active-layout/resize diagnostics included large forced-layout outliers; this record does not claim a universal frame-rate guarantee.
- Settled compact-player measurements placed transport and volume centers within 0.03px, with the 44px cover and 14px song text inside the 56px strip. The smallest 48px strip bounded the compact text to 14.4px when 18px was requested, avoiding overflow.
- A clean client restart preserved new preferences and produced one settings button. Subsequent user changes to the compact-player choice and sidebar width were preserved.

Verification focuses on changed surfaces. It is not an exhaustive test of every Spotify backend state, language, feature or arbitrary Marketplace extension/snippet combination. Private Spotify CSS hooks are isolated in source and may need updates after future Spotify releases.
