// reconnect-driver.js — WS 自動再接続スケジューラのグルー例(遅延計算=wasm、WS/timer=JS)。
export async function loadReconnect(wasmUrl) {
  const bytes = await (await fetch(wasmUrl)).arrayBuffer();
  const mod = await WebAssembly.compile(bytes);
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  let attempt = 0;
  return {
    reset() { attempt = 0; },
    // 次の再接続までの遅延 (ms)。equal jitter で thundering herd を分散。
    nextDelay() {
      const d = ex.delay_jittered_ms(attempt, Math.random());
      attempt += 1;
      return d;
    },
  };
}
