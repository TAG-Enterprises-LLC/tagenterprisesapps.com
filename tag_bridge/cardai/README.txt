GENERATED: the cardai card engine compiled to WebAssembly (the web build's robots and hints).
Do not edit these files. They come from dev/cardai/bindings/web/out and must match the C
engine the phones use, or the web robots will play differently:
  - after any change to dev/cardai C code (or to an app's game rules, which the engine copies:
    see the note at the top of the app's rules file), run
        dev/cardai/bindings/web/check_wasm_fresh.sh
    and follow what it prints (build_wasm.sh needs Emscripten: source ~/emsdk/emsdk_env.sh);
  - copy a new build here with dev/cardai/bindings/dart/tool/sync_web_engine.sh <this app>.
Details: dev/cardai/docs/web-engine.md
