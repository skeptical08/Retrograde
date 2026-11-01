# Development and compatibility

Retrograde 1.0 targets the Windows Spotify 1.3.6.1921 renderer and Spicetify 2.46.4 observed during development. It is not a compatibility promise for future versions. Native title-bar endpoints and a few media selectors are private compatibility hooks isolated in src/chrome.js and src/lyrics.js. Unsupported caption APIs fall back to native controls. About-card identification currently depends on English labels.

## Build

Node.js 22 or later is recommended. There are no npm dependencies.

```sh
npm run build
npm test
npm run validate
```

src/preferences.js holds defaults, palettes and validation. src/runtime.js contains frame scheduling and Marketplace lifecycle cleanup. src/features.js handles sidebars, Queue and small fully rendered artist tables. src/lyrics.js uses native media/lyrics behavior and a bounded album-year cache. src/chrome.js isolates native caption controls. src/theme.js provides Preferences and persisted local settings. src/user.css scopes the presentation to known Spotify surfaces.

The build embeds the supplied classic-logo PNG in the generated theme.js. Dist files are committed for Marketplace; consumers do not need Node.js. The logo and music artwork are not licensed by the project's MIT license; see THIRD_PARTY.md.

Marketplace loads the companion script through manifest.include. When its injected Retrograde stylesheet is removed/replaced, a narrow observer disposes the runtime, listeners and theme controls. Manual installation adds no Marketplace watcher. Native list virtualization and scrolling remain Spotify-owned.

## Verification scope

Local checks covered Home/library scrolling, populated playlist scrolling, artist navigation/banner/Popular table, track context-menu opening/dismissal, Preferences palette preview/restoration/close, native lyrics with library/Queue, Queue close/reopen and right-sidebar resizing. Automated tests cover corrupt preference recovery, validation, palette/layout combinations, scheduling and Marketplace stylesheet cleanup.

These checks do not cover every Spotify feature, all permutations of extensions/snippets/apps, other platforms, all languages or backend states. Marketplace delivery checks are tracked separately in MARKETPLACE.md. The original source and backups are retained only in the development workspace, not public release files.
