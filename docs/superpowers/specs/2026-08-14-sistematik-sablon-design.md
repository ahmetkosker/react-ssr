# 2026-08-14-sistematik-sablon-design.md

## Amaç

react-ssr şablonunu ~10 kişilik bir ekibin sıkıntısız kullanacağı sistematik bir
başlangıç noktasına dönüştürmek. Üç öncelik: kod kalitesi disiplini,
sıfır sürtünmeli dev deneyimi ve katkı rehberi.

## Kapsam

### 1. Kod kalitesi disiplini

- ESLint (flat config) + Prettier eklenir:
  - `eslint`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `prettier`
- Script'ler:
  - `format` = `prettier --write .`
  - `lint` = `prettier --check . && eslint .`
  - `lint:fix` = `eslint --fix .`
  - `typecheck` ayrı kalır (`tsc --noEmit`)
  - `ci` = `yarn lint && yarn typecheck && yarn test && yarn build`
- tsconfig'e `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch` eklenir; ortaya çıkan tip hataları düzeltilir.
- Kod tabanı bir kez Prettier ile formatlanır (ayrı commit).
- Prettier ayarları mevcut stile uyumlu: 2 boşluk, çift tırnak, noktalı virgül,
  `trailingComma: "all"`.

### 2. Scaffolding: `yarn generate:page <Name>`

- `scripts/generatePage.ts` (ts-node ile çalışır; ts-node zaten devDep — doğrulama fonksiyonları test edilebilir şekilde export edilir):
  - İsim doğrulama: PascalCase ve benzersizlik; ihlalde net hata mesajı.
  - Üretir:
    - `src/client/pages/<Name>/<Name>.tsx` (Layout'lu sayfa bileşeni)
    - `src/client/pages/<Name>/client.ts` (`createApp` çağrısı)
    - `src/shared/types.ts` içine `<Name>RouteData` tipi (marker: `// GENERATE:TYPE`)
    - `src/server/server.tsx` içine `createDynamicRoute` kaydı (marker: `// GENERATE:ROUTE`)
  - Üretilen dosyalar `prettier --write` ile formatlanır.
- Doğrulama fonksiyonları ayrı modülde tutulur ve node:test ile test edilir.

### 3. Dokümantasyon

- `CONTRIBUTING.md`: sayfa ekleme (script + manuel yol), i18n akışı, env
  değişkenleri, komut tablosu, commit düzeni.
- README: env değişkenleri bölümü, yeni script'ler, CONTRIBUTING bağlantısı.
- AGENTS.md: değişen komutlar güncellenir.

### 4. Operasyonel emniyetler

- `src/server/config.ts` fail-fast: ayarlı ama geçersiz değerler
  (örn. `PORT=abc`, bozuk `PUBLIC_BASE_URL`) başlangıçta net mesajla hata verir;
  boş değişkenlerde mevcut varsayılanlar korunur. Testler eklenir.
- `.env.example`: tüm değişkenler + varsayılanlar + açıklamalar.
- `.nvmrc` (`20`) ve `package.json` `engines: { "node": ">=20" }` (CI parity).
- Dev watch build'leri: minify kaldırılır, `--sourcemap` eklenir.
- `prestart`: build artifact'ları yoksa "önce `yarn build`" diyen net hata
  (`scripts/checkBuild.mjs`).

### 5. CI

- Workflow aynı kalır; `yarn ci` yeni zinciri çalıştırır. Node 20 korunur.

## Kapsam dışı (YAGNI)

- Pre-commit hook'ları (husky/lint-staged)
- ESLint harici linter'lar, test framework değişikliği
- Docker/deploy altyapısı

## Doğrulama

- Her adımdan sonra `yarn ci` yeşil olmalı.
- `yarn generate:page Demo` ile uçtan uca smoke test.
- Config fail-fast davranışı testlerle kanıtlanır.
