# Lyrics, readings and Queue verification — Retrograde 1.0

Tested on Windows, Spotify 1.3.6.1921 and Spicetify 2.46.4.

- Queue section headings and tab text were checked in the real client at the 240px minimum panel width: dark text on palette-tinted silver chrome, without white-on-silver inheritance.
- With the saved artwork preference enabled, opening lyrics set the rendered player dock to compact while preserving the saved preference. Native Minimise Now Playing view restored the expanded dock; reopening lyrics returned to compact. The user's original compact preference was restored after the test.
- Show artist image (native value hero) is hidden and absent from the visible accessibility controls. Artwork, Canvas, lyrics and full-screen controls are retained.
- Japanese, Korean and Mandarin readings are derived locally with bundled pinned engines. Japanese fetches generic kuromoji dictionaries from jsDelivr on first use; no lyric text is uploaded. Failed loading keeps the native original text visible. Automatic readings may differ from stylized singing pronunciations. Auto infers Japanese Han readings when kana is present; Preferences offers Japanese/Mandarin overrides for ambiguous mixed-language songs.
- A Japanese fixed phrase converted in the actual Spotify renderer after the real dictionary download. Temporary native-markup fixtures generated Korean and Japanese companion lines, and an isolated Mandarin fixture generated pinyin. These were test phrases, not a claimed live foreign-language song session.
- The real Aa control removed reading spans while retaining original text, then restored its enabled preference. Temporary fixtures were removed. Native line seeking remains owned by Spotify; no seek, playback, volume, queue or library mutations were used for these checks.
- All 23 automated tests pass, covering bundled Korean/Mandarin conversion, Japanese kana conversion and script hints, converter caching without String/XHR global patches, preference migration, all preset combinations, runtime scheduling and Marketplace cleanup. Build and manifest checks also pass.

Implementation: scoped native-text observers, idle-batched conversion, bounded dictionary requests, generation guards against stale track results, cache limits, disposal cleanup and scoped URL repair inside the vendored Japanese loader. No polling loop and no remote JavaScript execution are added.

This is scoped verification of the changed surfaces, not a guarantee for every backend state, language, custom app, extension or snippet. See ROMANIZATION-LICENSES.md for included package notices and READABILITY-REFINEMENT.md for the preceding layout/palette work.

## Library correction — 2026-11-02
Restored leading note/heart/artist symbols. Optional native cover thumbnails appear in a consistent right column; the collapsed artwork rail is unchanged. Checked cover toggle and 200px expanded sidebar geometry in Spotify. Native artwork rows keep their own row heights for virtualization. 24 automated tests pass.
