# T-G-Apps Device Display Optimizer

A dependency-free browser package shared by T-G-Apps LLC web apps. It runs before
the app bootstrap, identifies the platform and the best model/manufacturer signal
the browser permits, and publishes responsive display information to CSS and JS.

Browsers intentionally limit hardware fingerprinting. Chromium on Android may
provide a model through User-Agent Client Hints; iOS reports Apple/iPhone or iPad
but not the exact hardware generation. Apps must treat `Unknown` as valid.

## Include

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="/packages/device-display-optimizer/device-display-optimizer.css">
<script src="/packages/device-display-optimizer/device-display-optimizer.js"></script>
```

The files in this directory are the distributable package. Copy the directory or
reference it as shown above; do not create or commit a ZIP or other binary archive.
This keeps package updates compatible with text-only pull-request workflows.

The package sets `data-tg-manufacturer`, `data-tg-model`, and `data-tg-platform`
on `<html>`, plus screen-size/orientation classes and viewport/safe-area CSS
variables. `TGAppsDeviceOptimizer.ready` resolves to the enhanced profile. Listen
for `tgapps:devicechange` to react to initial detection, rotation, resize, or the
on-screen keyboard. Add `.tg-safe-area` to a shell only when it needs automatic
notch and home-indicator padding.
