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

## Current validation status

The local build, syntax, preference/runtime tests and Marketplace stylesheet-removal tests pass. The manual-install path has been exercised in Spotify. Public GitHub Pages delivery and an actual Marketplace install/switch/reinstall remain pending until the repository is published. Do not describe these pending checks as passed.

Official reference: https://github.com/spicetify/marketplace/wiki/Publishing-to-Marketplace
