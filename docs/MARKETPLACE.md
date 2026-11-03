# Marketplace publication

Target repository: https://github.com/skeptical08/Retrograde

## Files

The repository root contains manifest.json and preview.png. The manifest points to dist/Retrograde/user.css and color.ini, and includes the companion script served by GitHub Pages. Source is in src; run `npm run build` before publishing changes. Commit the generated dist files too.

## First publication

1. Create the public skeptical08/Retrograde repository with default branch main.
2. Upload the prepared public repository contents. Do not upload local work/, backups/, outputs/, configuration files or unreviewed screenshots.
3. In repository Settings > Pages, choose deployment from the main branch, root folder. The .nojekyll file keeps the built assets available unchanged.
4. Verify https://skeptical08.github.io/Retrograde/dist/Retrograde/theme.js returns JavaScript, not an HTML error page. Verify the manifest paths and preview image.
5. Test installation through Marketplace's theme developer/custom-repository tooling if available. Otherwise wait for discovery after adding the `spicetify-themes` repository topic. Check installation, Preferences, reload, restart, switching away and reinstalling. Themes with included JavaScript may require Marketplace's requested reload.
6. Publish GitHub release tag v1.0.0, title Retrograde 1.0. Attach the installable release ZIP. Marketplace uses the repository manifest and files; the release ZIP is for manual installation.

The topic is the discovery mechanism, not an approval or compatibility certification. GitHub search/indexing, Marketplace caching and rate limits may delay visibility.

## Publication and validation status — 2026-11-01

- Public repository: https://github.com/skeptical08/Retrograde
- Release: https://github.com/skeptical08/Retrograde/releases/tag/v1.0.0
- Required spicetify-themes topic is configured and Retrograde appeared in the installed Marketplace 1.0.12 Themes search under skeptical08.
- GitHub Pages serves the companion script as application/javascript over HTTPS; its SHA-256 matches the released file.
- GitHub CI passed build, all 17 tests, manifest validation and generated-file reproducibility. A fresh public clone also passed locally.
- Installed Retrograde from its actual Marketplace card and completed the requested reload. The theme loaded and Preferences opened with Retrograde 1.0 branding and retained local settings.
- The companion cleanup is covered by automated tests. Live Marketplace uninstall/reinstall was not exercised. The later classic-player revision was installed locally and verified after a normal full Spotify restart; see PLAYER-REFINEMENT.md.
- The README includes real-client Home, artist, album, lyrics, Queue, Now Playing and Preferences captures, plus Arctic Blue, Amber Studio, Midnight Cobalt and Plum in action. Public crops omit personal library text and unrelated overlays.

The theme is published and discoverable. This is not a compatibility certification for other Spotify/Spicetify versions or platforms.

Official reference: https://github.com/spicetify/marketplace/wiki/Publishing-to-Marketplace

## Pending local update — 2026-11-02
Public release remains v1.0.1. The local 1.0.3 candidate includes readability, romanization and corrected library artwork controls. It is not published: GitHub file writes returned 403 Resource not accessible by integration, and the publishing browser was unavailable. The prepared source archive can be uploaded when repository write access is restored. Local checks now include 24 passing tests.
