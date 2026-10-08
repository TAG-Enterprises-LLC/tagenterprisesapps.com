// cardai_worker.js — runs the WebAssembly engine (cardai.js + cardai.wasm, same folder) in a
// Web Worker so searches never freeze the page. Dart's web engine (engine_web.dart) posts
//   {id, op, args}  and receives  {id, ok: true, result}  or  {id, ok: false, error}.
// Ops: createSpades(rules Int32Array) -> handle; loadWeights(handle, Uint8Array);
// destroy(handle); spades(handle, op, view Int32Array, args Float64Array) -> Float64Array;
// createRummy(rules Int32Array) -> handle; rummy(handle, op, view, args) -> Float64Array; rummyGolden() -> [hi32, lo32]
// (layout in cardai_web.c); spadesGolden() -> [hi32, lo32]; spadesBench(samples) -> ms;
// bridge(op, view Int32Array, args Float64Array) -> Float64Array; bridgeMeaning(words) -> Float64Array.
// The page stops a running search by terminating this worker.
'use strict';

importScripts('cardai.js');

let M = null, loadError = null;
const ready = createCardai().then((m) => { M = m; }, (e) => { loadError = e; });

function withHeap(bytes, fn) {
  const p = M._malloc(Math.max(bytes, 8));
  if (!p) throw new Error('out of memory');
  try { return fn(p); } finally { M._free(p); }
}

function copyIn(typed) {
  const p = M._malloc(Math.max(typed.byteLength, 8));
  if (!p) throw new Error('out of memory');
  M.HEAPU8.set(new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength), p);
  return p;
}

function handle(op, a) {
  switch (op) {
    case 'createSpades': {
      const rules = a[0];
      const p = copyIn(rules);
      try {
        const ctx = M._cai_web_spades_create(p, rules.length);
        if (!ctx) throw new Error('cai_web_spades_create failed');
        return ctx;
      } finally { M._free(p); }
    }
    case 'createRummy': {
      const rules = a[0];
      const p = copyIn(rules);
      try {
        const ctx = M._cai_web_rummy_create(p, rules.length);
        if (!ctx) throw new Error('cai_web_rummy_create failed');
        return ctx;
      } finally { M._free(p); }
    }
    case 'rummy': {
      const view = a[2], args = a[3];
      const n = M._cai_web_out_max();
      const pv = copyIn(view), pa = copyIn(args);
      try {
        return withHeap(n * 8, (po) => {
          M._cai_web_rummy(a[0], a[1], pv, view.length, pa, po);
          return new Float64Array(M.HEAPF64.buffer, po, n).slice();
        });
      } finally { M._free(pv); M._free(pa); }
    }
    case 'rummyGolden':
      return withHeap(16, (po) => {
        const rc = M._cai_web_rummy_golden(po);
        if (rc !== 0) throw new Error('cai_web_rummy_golden failed: ' + rc);
        return [M.HEAPF64[po >> 3] >>> 0, M.HEAPF64[(po >> 3) + 1] >>> 0];
      });
    case 'loadWeights': {
      const blob = a[1];
      const p = copyIn(blob);
      try {
        const rc = M._cai_load_weights(a[0], p, blob.length);
        if (rc !== 0) throw new Error('cai_load_weights failed: ' + rc);
        return null;
      } finally { M._free(p); }
    }
    case 'destroy':
      M._cai_destroy(a[0]);
      return null;
    case 'spades': {
      const view = a[2], args = a[3];
      const n = M._cai_web_out_max();
      const pv = copyIn(view), pa = copyIn(args);
      try {
        return withHeap(n * 8, (po) => {
          M._cai_web_spades(a[0], a[1], pv, view.length, pa, po);
          return new Float64Array(M.HEAPF64.buffer, po, n).slice();
        });
      } finally { M._free(pv); M._free(pa); }
    }
    case 'bridge': {
      const view = a[1], args = a[2];
      const n = M._cai_web_out_max();
      const pv = copyIn(view), pa = copyIn(args);
      try {
        return withHeap(n * 8, (po) => {
          M._cai_web_bridge(a[0], pv, view.length, pa, po);
          return new Float64Array(M.HEAPF64.buffer, po, n).slice();
        });
      } finally { M._free(pv); M._free(pa); }
    }
    case 'bridgeMeaning': {
      const words = a[0];
      const n = M._cai_web_out_max();
      const pw = copyIn(words);
      try {
        return withHeap(n * 8, (po) => {
          M._cai_web_bridge_meaning(pw, words.length, po);
          return new Float64Array(M.HEAPF64.buffer, po, n).slice();
        });
      } finally { M._free(pw); }
    }
    case 'bridgeDdRemaining': {
      const words = a[0];
      const pw = copyIn(words);
      try {
        return withHeap(16, (po) => {
          M._cai_web_bridge_dd_remaining(pw, words.length, po);
          return [M.HEAPF64[po >> 3], M.HEAPF64[(po >> 3) + 1]];
        });
      } finally { M._free(pw); }
    }
    case 'spadesGolden':
      return withHeap(16, (po) => {
        const rc = M._cai_web_spades_golden(po);
        if (rc !== 0) throw new Error('golden failed: ' + rc);
        return [M.HEAPF64[po >> 3], M.HEAPF64[(po >> 3) + 1]];
      });
    case 'spadesBench':
      return M._cai_web_spades_bench(a[0]);
  }
  throw new Error('unknown op ' + op);
}

self.onmessage = async (e) => {
  await ready;
  const { id, op, args } = e.data;
  try {
    if (loadError) throw new Error('engine failed to load: ' + loadError);
    self.postMessage({ id, ok: true, result: handle(op, args) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message || err) });
  }
};
