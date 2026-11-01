# Performance observations

Retrograde merges affected-surface work into one animation frame, avoids unrelated scans during native list virtualization, skips unchanged DOM/CSS writes and coalesces sidebar-resize motion per frame. Palette-only changes do not schedule layout adapters. Native scrolling is not intercepted.

On the same Windows Spotify 1.3.6.1921 / Spicetify 2.46.4 setup, two approximately 30-second library wheel-down/up samples measured:

| Metric | Earlier runtime | Optimized runtime |
|---|---:|---:|
| Theme adaptation | One full pass | Zero passes |
| Style recalculations | 83 | 17 |
| Style recalculation duration | 2.280 s | 0.226 s |
| Renderer task duration | 4.478 s | 1.717 s |

These are small observational samples, not a controlled benchmark or an FPS guarantee. Cache, native image loading and background work affect totals. Startup, navigation and resizing can still require substantial Spotify style/layout work; earlier observations included individual adaptation passes around 529 ms. Final width-only scheduling was narrowed further: one small Home/Queue drag produced only layout/artist passes around 6.7 ms and 0.4 ms, leaving panel, queue, media and toolbar counters unchanged.

Automated tests and targeted desktop checks are described in DEVELOPMENT.md. Public Marketplace delivery checks are tracked in MARKETPLACE.md. No claim of exhaustive Spotify or third-party-combination coverage is made.
