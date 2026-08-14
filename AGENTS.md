# AGENTS.md

## Komutlar
- `yarn start:dev` — geliştirme sunucusu: esbuild watch (client+server) + Tailwind watch + nodemon. Önce derler, sonra `src/server/build/server.js` çalıştırır.
- `yarn build` — client sayfalarını ve sunucuyu gitignored klasörlere derler. `yarn start` öncesi zorunlu (artifaktlar repoya commit edilmez).
- `yarn start` — yalnızca derlenmiş sunucuyu çalıştırır; `yarn build` yapılmadıysa hata verir.
- `yarn typecheck` / `yarn lint` — `lint`, `tsc --noEmit` için bir alias'tır; ESLint/Prettier yoktur.
- `yarn test` — ts-node üzerinden node:test. Tek dosya: `node --require ts-node/register --test tests/server/config.test.ts`.
- `yarn ci` — tam doğrulama zinciri (lint → test → build); CI da tam olarak bunu çalıştırır.

## Yapı ve mimari
- Yarn 4 (node-modules linker), Express + React 18 SSR, esbuild, Tailwind. Framework yok, bundler config dosyası yok — esbuild bayrakları package.json script'lerinde.
- Sunucu girişi `src/server/server.tsx` → `src/server/build/server.js`; sayfa bazlı client girişleri `src/client/pages/<Page>/client.ts` → `src/client/dist/<Page>/client.js`.
- Yeni sayfa eklemek 3 parça gerektirir: sayfa bileşeni, `createApp` çağıran `client.ts` ve `server.tsx` içinde `id` değeri sayfa klasörüyle eşleşen `createDynamicRoute` kaydı (`<script src="/dist/<id>/client.js">` bunu belirler).
- SSR veri akışı: `fetchInitialData` → `window.__DATA__` (inline script) → `src/lib/client/createApp.tsx` ile hydration.
- i18n: i18next, `src/locales/{en,fr}.json`. Yeni dil eklemek HEM `src/server/i18n.ts` HEM `src/client/i18n.ts` kaynak haritalarını güncellemeyi gerektirir. Dil çözümü: `lang` cookie → Accept-Language → `en`.
- Config yalnızca process.env ile (dotenv yok), `src/server/config.ts`: `PORT`, `NODE_ENV`, `PUBLIC_BASE_URL`, `FETCH_TIMEOUT_MS`, `SITE_NAME`.

## Dikkat edilecekler
- CSP `server.tsx` içinde sabittir; `connect-src` yalnızca `https://jsonplaceholder.typicode.com`'a izin verir — harici API çağrısı eklerken güncelle.
- `src/client/public/index.html` repoda var ama kullanılmıyor (HTML `src/server/helpers/renderHtml.tsx` içinde üretiliyor); düzenleme.
- `src/client/dist/` ve `src/server/build/` gitignored derleme çıktılarıdır — düzenleme veya commit etme.
- Testler `node:assert/strict` + `node:test` ile, `src/` yapısını yansıtan `tests/` klasöründe.
