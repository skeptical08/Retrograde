# Word timing setup

Normal Retrograde Lyrics needs no key or extra install. The theme bundles its companion script, fullscreen, transport, artwork options, glow/wave effects and romanization.

## Automatic word timing — provider approval pending

A real timed-lyrics renderer is included. The optional adapter implements the documented [Spicy Lyrics endpoint](https://developers.spicylyrics.org/docs/reference/get.lyrics). It is not an unofficial copy of the extension's private access path.

For a public client, the provider recommends an approved [app template](https://developers.spicylyrics.org/docs/keys). Spotify runs extensions in a shared browser origin, so do not assume that adding that origin to an ordinary client key will be accepted. The prepared submission asks the reviewers to confirm the supported transport. Direct browser requests may still be refused until that is resolved; this has not been live-tested with an authorized key.

A template draft named Retrograde Lyrics has been filled in the signed-in dashboard but has NOT been submitted. No application or key has been created by this work. The source and listing need to be public and the template needs approval before it can become a simple Add-to-account link. Once an approved integration is available, the intended setup is:

1. Open the approved catalog listing and add Retrograde Lyrics to your provider account.
2. Copy only the publishable sl_pk_ client key into Preferences → Word timing · optional → Optional provider client key, then save it.
3. Select the optional provider. Word-level data uses the karaoke renderer; line-only, unavailable or failed responses leave native lyrics available.

Do not put an sl_sk_ secret key into Spotify or publish a key in the repository. Client keys are kept in a separate local storage field and are not included in getSettings, ZIPs or diagnostics. Use Save key with an empty field to remove it. No Spotify authorization headers or cookies are sent to the external provider. Requests include the Spotify track ID, the configured provider client key and ordinary network metadata. Source and community contributor credit remains on screen. Provider responses are not exported or saved to disk.

## Your own local timing

Import a JSON file for the current track under Preferences → Word timing · optional. This is optional and useful for personally authored timing. It is not a provider downloader. Values are milliseconds; each syllable must have its own real start and end time inside its line. joinNext joins a split syllable to the following one without a space. Imported files stay in memory for the Spotify session, survive theme preference changes, and are capped at ten tracks. Use Use native timing for this track to remove one.

Example with original test text:

~~~json
{"version":1,"source":"My own timing","lines":[{"startMs":1000,"endMs":4000,"syllables":[{"text":"Sample","startMs":1000,"endMs":2300},{"text":"timing","startMs":2400,"endMs":4000}]}]}
~~~

Keyboard Enter or Space seeks to a timed line. Manual scrolling pauses follow mode briefly. Word fill stays synchronized to the player clock, and visual lift respects reduced-motion preferences. The renderer does not change playlists, saved music or account settings.
