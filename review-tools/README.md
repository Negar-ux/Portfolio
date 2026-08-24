# Review tooling

Local-only. Lets you leave notes directly on the portfolio, in numbered rounds,
so Claude can read them and act on them.

## Running it

```
python review-tools/review-server.py
```

Serves the site on <http://localhost:8080> exactly as `python -m http.server`
does. To review a page, add `?review=1`:

```
http://localhost:8080/fitness-app.html?review=1
http://localhost:8080/index.html?review=1
```

Any other port: `python review-tools/review-server.py 8090`

## Leaving notes

A panel appears top-right, headed with the round you're on.

- **Comment on an element** — then click anything on the page. The note is
  anchored to that element, and records which section it was in and the text it
  contained, so it stays findable even if the page moves around.
- **Add page note** — for anything about the page as a whole.
- **Show** — scrolls back to the element a note was left on and flashes it.
- **Submit review N** — closes the round and opens the next one. Notes from all
  pages go in together.

## How the rounds work

Notes accumulate in the open round. Submitting closes it and starts the next, so
each round is a batch of feedback with a clear boundary. Claude reads
`review-comments.json`, works through the submitted round, and writes a
`resolution` against each note plus `status: "addressed"`. Those show back in the
panel under **Earlier rounds**, struck through with what was done — so nothing
gets silently dropped.

## Why it works this way

The overlay is **injected by the server at request time**. No `<script>` tag is
added to any page, so the site's own files are untouched and there is no way for
this to appear on the live site. Without `?review=1` the pages serve byte for
byte as they always did.

Two further guards:

- `review-comments.json` is gitignored — your notes stay local.
- `.cpanel.yml` deletes `review-tools/` after deploying, because its `cp -R *`
  would otherwise copy this folder to the web root.
