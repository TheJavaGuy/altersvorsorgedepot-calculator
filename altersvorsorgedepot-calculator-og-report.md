# OpenGraph report: thejavaguy.github.io/altersvorsorgedepot-calculator/

Analyzed: 2026-10-02. Live URL: https://thejavaguy.github.io/altersvorsorgedepot-calculator/

The best practices below come from the Ahrefs and DigitalGuider guides. The opengraph.io page loaded without its body text, so it was not used.

## Current state

| Tag | Status |
|---|---|
| `<title>` | Present, 70 characters |
| `meta description` | Present, 140 characters |
| `og:*` | **None** |
| `twitter:*` | **None** |
| `link rel="canonical"` | **Missing** |
| Favicon | **Missing** (`/favicon.ico` returns 404) |

When someone shares the page on Facebook, LinkedIn, X, Slack, WhatsApp or Signal, each platform has to guess the title and description, and the preview has no image.

## Required fixes

1. **Add the four core tags:** `og:title`, `og:type`, `og:url` and `og:image`. Ahrefs lists all four as required. DigitalGuider also counts `og:description` as mandatory.
2. **Create a share image** at 1200×630 px (a 1.91:1 ratio), as PNG or JPEG, well under 5 MB. The page has no image, so you need to make one. Show the title and one key fact, for example that the state tops up every euro you put into ETFs. Commit it as `og-image.png` and reference it by absolute URL.
3. **Declare the image's size** with `og:image:width="1200"` and `og:image:height="630"`. This lets platforms show the preview on the first share, before they have downloaded the image.
4. **Set `og:url` to the canonical URL**, with the trailing slash, and add a matching `<link rel="canonical">`.

## Recommended additions

5. **Add `og:description`.** You can reuse the 140-character meta description, which fits DigitalGuider's 150–200 character guidance.
6. **Shorten `og:title` to 60 characters or fewer.** Both guides use 60 as the limit, and Ahrefs suggests about 40 for mobile. A suggestion is "Altersvorsorgedepot 2027: your subsidy, calculated" (50 characters). The `<title>` can stay as it is.
7. **Add `og:site_name`**, for example "TheJavaGuy".
8. **Add `og:locale`.** The page is in English, so use `en_US`.
9. **Add `og:image:alt`.** This is good practice for screen readers, though neither guide covers it.
10. **Add Twitter/X card tags:** `twitter:card="summary_large_image"`, `twitter:site` and `twitter:creator` set to `@_The_Java_Guy_`, and `twitter:image:alt`. X falls back to the `og:*` tags for title, description and image. That fallback comes from X's own documentation, not from the guides.
11. **Add a favicon.** Some apps show it next to link previews.

## Suggested `<head>` block

```html
<link rel="canonical" href="https://thejavaguy.github.io/altersvorsorgedepot-calculator/">
<meta property="og:type" content="website">
<meta property="og:url" content="https://thejavaguy.github.io/altersvorsorgedepot-calculator/">
<meta property="og:title" content="Altersvorsorgedepot 2027: your subsidy, calculated">
<meta property="og:description" content="Interactive guide to the German Altersvorsorgedepot (AVD) reform: timeline, subsidies, costs, payout, inheritance and tax, with calculators.">
<meta property="og:site_name" content="TheJavaGuy">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="https://thejavaguy.github.io/altersvorsorgedepot-calculator/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Altersvorsorgedepot 2027 subsidy calculator">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@_The_Java_Guy_">
<meta name="twitter:creator" content="@_The_Java_Guy_">
<meta name="twitter:image:alt" content="Altersvorsorgedepot 2027 subsidy calculator">
```

## Check after deploying

- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/ (also clears Facebook's cached preview)
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- X no longer has a public Card Validator. To check, paste the link into the post composer and look at the preview.

## Sources

- https://ahrefs.com/blog/open-graph-meta-tags/
- https://digitalguider.com/blog/open-graph-meta-tags/
- https://www.opengraph.io/what-is-an-open-graph (no body content retrieved)
