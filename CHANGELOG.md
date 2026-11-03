# Changelog

## Retrograde 1.0

### Lyrics and Queue completion

- Dark text on the Queue's silver section headers and tabs, including narrow panels.
- Lyrics temporarily collapses expanded player artwork, then restores the saved preference when closed.
- Remove the artist-image mode from the lyric toolbar.
- Bundled, lazy local Japanese/Korean/Mandarin phonetic readings with an Aa toggle, preserved original text and a Han-reading override. Japanese dictionaries download on first use; failures leave originals visible.

### Readability, banners and Preferences

- Restore native daylist image banners and prevent artist artwork colors from washing into the content.
- Thin artist page controls while retaining the artist banner.
- Stable lyric viewport during native cinema idle states; zoomed, blurred, faded album backdrop with visibility and blur controls.
- Readable compact and expanded song details; configurable playback height and text size, with aligned controls.
- Independent library and artwork collapse, optional trailing library type icons and a Liked Songs heart.
- Six described preference groups and eighteen complete palettes with matching chrome tints.
- Refresh both hex and RGB Spicetify tokens together; restore owned tokens on theme disposal without overwriting newer external values.

### Classic player refinement

- Subtle native device status above the timeline, without a second row or shifted transport controls.
- Flush cover and metadata edges with no widget margins, row gaps or space above the playback strip.
- Hover/focus artwork toggle with a persistent compact-player option in Preferences.
- Center-aligned transport controls with shuffle and repeat immediately after volume.

- Native high-resolution artwork and track details dock above the lower-left controls when the library is expanded.
- One-line silver transport strip with left-side previous/play/next and volume controls, a long timeline, and native utility controls at the right.
- The explicit compact-player option keeps the song widget inside the strip.
- Expanded real-client gallery covering Home, artist, album, Queue and color schemes.

- Silver desktop controls and graphite surfaces inspired by early-2010s Spotify.
- Classic library rows, compact track tables and resizable sidebars.
- Queue and history tables with left-aligned artist columns.
- Integrated native lyrics layout with an artwork/metadata card.
- Preferences with eighteen palettes, editable colors, density, typography and motion options.
- Surface-specific animation-frame scheduling that avoids unrelated work during native list scrolling.
- Marketplace stylesheet-removal cleanup and reproducible dependency-free builds.

Tested locally on Windows with Spotify 1.3.6.1921 and Spicetify 2.46.4. Other versions and platforms are unverified.

- Corrected library customization: type symbols stay on the left; the separate Library cover thumbnails toggle places native covers on the far right.

- Added automatic lyrics extension ownership, preserved extension animation and sidebar cards, and provided a manual extension-owned compatibility mode.

- Bundled Retrograde Lyrics: immersive fullscreen with card transport, white/custom lyric highlights, independent foreground/background artwork toggles, and optional line-synced glow/pulse/letter-wave effects. Added cleanup, settings validation and fullscreen/transport tests.

- Added an independent word/syllable-timed karaoke renderer with real timestamp fill, line seeking, background vocals, always-visible source attribution and bounded memory caching. Native lyrics remain the default; automatic provider access awaits authorized setup. Added optional local timing import and four timing/security tests plus preference validation.
