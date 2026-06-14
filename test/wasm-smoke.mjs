import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/rc.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
let ok = true; const ck = (g, w, m) => { if (g !== w) { console.error(`FAIL ${m}: ${g}!=${w}`); ok = false; } };
ck(ex.delay_ms(0), 500, "a0"); ck(ex.delay_ms(2), 2000, "a2"); ck(ex.delay_ms(6), 30000, "cap"); ck(ex.delay_ms(10), 30000, "cap2");
ck(ex.delay_jittered_ms(1, 0), 500, "jitter half"); ck(ex.delay_jittered_ms(2, 0.5), 1500, "jitter mid");
console.log(ok ? "wasm OK — backoff matches native" : "FAIL"); if (!ok) process.exit(1);
