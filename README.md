# fizz-ws-reconnect

Fizz の **WS 再接続バックオフ計算**(§7 Hub)。再接続の試行回数から次に待つ遅延(ms)を
計算する。

openaituber `wsClient.ts` は現状「固定 1500ms」で再試行する。サーバ復帰時に全
クライアントが同時殺到する(thundering herd)のを避けるため、**指数バックオフ + 上限 +
equal jitter** に改良したのがこの部品。`setTimeout`/`WebSocket` は JS の I/O、遅延の
計算ポリシーは純粋なので Almide に集約。

- `delay_ms(attempt)` = `min(base * 2^attempt, cap)`(base 500ms, cap 30s、attempt は 0 始まり)
- `delay_jittered_ms(attempt, rand01)` = equal jitter で `[delay/2, delay]` に散らす
  (Almide に非決定乱数は無いので `rand01` は呼び出し側が注入)

## native

```sh
almide build src/main.almd -o build/fizz-ws-reconnect
./build/fizz-ws-reconnect
# {"attempt":0,"delay_ms":500,...} {"attempt":2,"delay_ms":2000,...} ... cap 30000
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/rc.wasm
```

`delay_ms(attempt) -> Float` / `delay_jittered_ms(attempt, rand01) -> Float`。すべて
数値で授受。グルー例 [`browser/reconnect-driver.js`](./browser/reconnect-driver.js)
(`Math.random()` を rand01 に渡す)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
