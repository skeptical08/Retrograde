# Automatic word timing: provider transport blocker

Verified 2026-11-02 after the Retrograde Lyrics release was published.

Retrograde 1.0 with bundled lyrics is public at https://github.com/skeptical08/Retrograde/releases/tag/v1.0.3. Its native lyrics, fullscreen, effects, artwork controls and romanization require no provider account.

The owner approved submitting the prepared client-only provider template and its terms. The form refused submission with: A client key needs at least one allowed origin. The form also offers a no-Origin mode specifically mentioning Spicetify/native apps. That option was left unchecked because Retrograde currently uses browser fetch with an Authorization header, which requires Origin-based CORS; declaring that it sends no Origin would not describe the implemented transport.

The installed Spicetify 2.46.4 wrapper was inspected. Its CosmosAsync convenience methods route non-Spotify external HTTP requests through the configured CORS proxy. Retrograde does not use that route for provider credentials. No proxy, shared host allowlist, alternate account, demo access or header workaround was introduced. No provider application or key was created, and the template was not successfully submitted.

A provider-supported client transport for Spotify's shared xpui host must be confirmed before automatic word timing can be enabled and tested. The independent timestamp renderer remains available for personally authored local timing JSON. Its actual partial word fill was verified with a temporary fixture in Spotify, and 44 automated tests cover the bundle. This does not establish online provider compatibility.

## Prepared question for the provider — not sent

Recipient: hi@spicylyrics.org
Subject: Supported client transport for a Spicetify template

Retrograde Lyrics is a public Spicetify desktop viewer bundled with Retrograde. We want client-only per-user access with source/contributor attribution, 15-minute in-memory caching and no data export. The template form requires an origin or a declaration that the app sends no Origin. Our browser fetch sends Origin from Spotify's shared xpui host, and the installed Spicetify CosmosAsync convenience wrapper uses an external CORS proxy. We have not requested or shared a key, used a proxy for credentials, or selected the no-Origin declaration. Which supported transport and template configuration should this integration use? Source and release: https://github.com/skeptical08/Retrograde/releases/tag/v1.0.3
