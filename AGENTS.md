# AGENTS.md

## Komutlar

- `yarn start:dev` — geliştirme sunucusu: önce `yarn build`, sonra esbuild watch (client+server, minify'sız + sourcemap) + Tailwind watch + nodemon (`nodemon.json` config'i ile).
- `yarn build` — client sayfalarını, sunucuyu ve Tailwind CSS'i gitignored klasörlere derler. `yarn start` öncesi zorunlu (artifaktlar repoya commit edilmez).
- `yarn start` — yalnızca derlenmiş sunucuyu çalıştırır; build yoksa `scripts/checkBuild.mjs` net mesajla durdurur.
- `yarn typecheck` — `tsc --noEmit`. `yarn lint` — Prettier check + ESLint (flat config `eslint.config.mjs`); typecheck ayrı çalıştırılır.
- `yarn lint:fix` / `yarn format` — ESLint otomatik düzeltme / Prettier ile formatlama.
- `yarn test` — ts-node üzerinden node:test. Tek dosya: `node --require ts-node/register --test tests/server/config.test.ts`.
- `yarn generate:page <Ad>` — yeni sayfa iskeleti (bileşen + client.ts + shared tip + server.tsx route kaydı; marker'lar: `// GENERATE:TYPE`, `// GENERATE:IMPORT`, `// GENERATE:ROUTE`).
- `yarn ci` — tam doğrulama zinciri (lint → typecheck → test → build); CI da tam olarak bunu çalıştırır.

## Yapı ve mimari

- Yarn 4 (node-modules linker), Express + React 18 SSR, esbuild, Tailwind. Framework yok, bundler config dosyası yok — esbuild bayrakları package.json script'lerinde.
- Node 20+ (`engines` + `.nvmrc`), Node 18 desteklenmez.
- Sunucu girişi `src/server/server.tsx` → `src/server/build/server.js`; sayfa bazlı client girişleri `src/client/pages/<Page>/client.ts` → `src/client/dist/<Page>/client.js`.
- Yeni sayfa eklemek 3 parça gerektirir: sayfa bileşeni, `createApp` çağıran `client.ts` ve `server.tsx` içinde `id` değeri sayfa klasörüyle eşleşen `createDynamicRoute` kaydı (`<script src="/dist/<id>/client.js">` bunu belirler). Bunu `yarn generate:page` otomatik yapar.
- SSR veri akışı: `fetchInitialData` → `window.__DATA__` (inline script) → `src/lib/client/createApp.tsx` ile hydration.
- i18n: i18next, `src/locales/{en,fr}.json`. Yeni dil eklemek HEM `src/server/i18n.ts` HEM `src/client/i18n.ts` kaynak haritalarını güncellemeyi gerektirir. Dil çözümü: `lang` cookie → Accept-Language → `en`.
- Config yalnızca process.env ile (dotenv yok), `src/server/config.ts`: `PORT`, `NODE_ENV`, `PUBLIC_BASE_URL`, `FETCH_TIMEOUT_MS`, `SITE_NAME`. Geçersiz değer başlangıçta throw eder (fail-fast). Tam liste: `.env.example`.

## Dikkat edilecekler

- CSP `server.tsx` içinde sabittir; `connect-src` yalnızca `https://jsonplaceholder.typicode.com`'a izin verir — harici API çağrısı eklerken güncelle.
- `src/client/public/index.html` repoda var ama kullanılmıyor (HTML `src/server/helpers/renderHtml.tsx` içinde üretiliyor); düzenleme.
- `src/client/dist/` ve `src/server/build/` gitignored derleme çıktılarıdır — düzenleme veya commit etme.
- Testler `node:assert/strict` + `node:test` ile, `src/` yapısını yansıtan `tests/` klasöründe.
- `.env.example` Prettier'ı desteklemediği için `.prettierignore`'da; formatlama gerektirmez.
