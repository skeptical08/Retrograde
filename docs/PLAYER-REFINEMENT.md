# Classic player refinement — 2026-11-01

The reference player is implemented using Spotify's existing song widget, transport buttons, timeline, volume and utility controls. Expanded library mode docks the native artwork and title/artist above a 44px player strip. Collapsed mode restores a compact widget inside that strip. React-owned nodes are not moved. Spotify's image CDN size variant supplies a sharp enlarged cover; the observer watches only native player image source/child changes and disconnects on theme disposal.

Verified in the real Spotify client on Windows, Spotify 1.3.6.1921 / Spicetify 2.46.4: play/pause, timeline seeking (51s to 1m56s), volume change (100% to 41%), Queue opening, library collapse/expand, 1600x900 maximized and 1222x742 restored windows. Volume and paused position were restored; the 51s position was confirmed after a normal restart. The installed local theme loaded after that restart. All 17 automated tests and manifest validation passed.

Testing is focused on the changed player and gallery surfaces; it does not establish universal compatibility with all Marketplace customizations. Native private Spotify CSS hooks for the widget's metadata wrappers are isolated in the reference-player section of user.css. Unsupported future layouts may need selector updates.

## Flush dock and compact toggle refinement

The live renderer measured the expanded cover/image at x=0, width=300 and height=300. The metadata and native save control share the next row at x=0..300; its top equals the image bottom within subpixel rounding. The widget's bottom equals the playback wrapper's top, so the dock meets the strip with no gap. Native padding and grid gaps are explicitly reset for this presentation.

A hover/focus toggle collapses the native widget inside the player. Its action was exercised in Spotify, with the resulting preference false and the complete widget bounded inside the 44px strip. Preferences includes an alternative toggle. One new automated test covers migration, invalid values, persistence and preserving the option across palettes; all 18 tests pass.

## Remote device status

The installed Spotify renderer implements its Connect announcement as a separate 24px row (`alQyi9QVSuY6ma3oYVy6`). Retrograde now positions this native element above the timeline inside the existing 44px strip. The original button, localized connection text, live announcement and device-picker handler are retained. Muted text and a small accent device icon replace the bright banner. Long labels truncate visually; their accessible text remains complete.

In-renderer layout checks using temporary native-markup fixtures confirmed unchanged transport, wrapper, artwork dock and strip geometry with and without the notice. After settling renderer frames, player widths of 900, 1222 and 1600px kept status separate from the timeline, with long-name truncation at 900px. These initial measurements used layout fixtures. A subsequent real phone session confirmed the native remote-device label in expanded and compact modes after a normal client restart. Clicking the label opened Spotify’s Connect sidebar and showed the phone as the current device. The picker was closed without transferring playback; expanded artwork was restored. No volume, seek or playback commands were issued during the remote-session check. All 18 automated tests and manifest validation passed. No additional timers, observers or API subscriptions are required by this CSS-only change.
