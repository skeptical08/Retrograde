# Third-party notices

## Inspiration

Spicetify Throwback, by bluedrift and contributors: https://github.com/bluedrift/Spicetify-Throwback. Its MIT license was reviewed and is retained in Throwback-LICENSE.txt. Retrograde does not bundle Throwback's styles, code or artwork; its implementation is original.

Historical Spotify screenshots supplied by the project owner informed the design. The source reference screenshots are not distributed with this public repository. Public preview images show the implemented theme and may contain Spotify UI and third-party music artwork, which are not covered by Retrograde's MIT license.

## Classic logo

src/spotify-classic.png is a transparent cutout of the historical Spotify logo image supplied by the project owner. src/spotify-classic.svg is an earlier, unused interpretation retained in the source. Spotify's logo/name remain Spotify trademarks. No license to Spotify branding or third-party assets is granted by the MIT license for Retrograde's code, and no Spotify affiliation or endorsement is claimed.

## Technical/design references

- Spicetify documentation and the installed wrapper/renderer were inspected for APIs and DOM compatibility: https://spicetify.app/docs/development/
- Xumi (README declares MIT) was consulted for window-state and title-bar endpoint semantics: https://github.com/TokyoTF/Xumi. No Xumi code, styles, artwork or settings system is bundled.
- Spicy Lyrics (AGPL-3.0): https://github.com/Spikerko/spicy-lyrics; and SplashFix Lyrics Overlay (Apache-2.0): https://github.com/SplashFix/spicetify-lyrics-plus. These informed artwork/lyrics composition only. No code, assets, extension or lyric provider from those projects is bundled.
- Marketplace's publication guide and loading/removal implementation informed the manifest and lifecycle integration: https://github.com/spicetify/marketplace. No Marketplace code is bundled.
## Romanization engines

The bundled, lazy-initialized browser builds are Kuroshiro 1.2.0, kuroshiro-analyzer-kuromoji 1.1.0, Aromanize 0.1.5 and pinyin-pro 3.28.1. The Japanese analyzer uses kuromoji 0.1.2 dictionaries. Full licenses, transitive notices and dictionary notices are retained in ROMANIZATION-LICENSES.md. Original vendor files are checked in under src/vendor; the build repairs only the Japanese loader's malformed HTTPS URL and adds a dictionary-request timeout. Global XMLHttpRequest and String prototypes are not patched.

Spicetify's Lyrics Plus Translator.js was consulted for its engine choices: https://github.com/spicetify/cli/blob/main/CustomApps/lyrics-plus/Translator.js. No Translator.js implementation is bundled; Retrograde uses its own event-driven native-line integration.
