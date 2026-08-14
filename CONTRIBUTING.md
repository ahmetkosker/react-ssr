# Contributing

Bu şablonu kullanan ekibin sıkıntısız çalışması için izlenecek akışlar.

## Geliştirme ortamı

1. Node 20+ (bkz. `.nvmrc`) ve Yarn 4 (`corepack enable`)
2. `yarn install`
3. `yarn start:dev` — build + watch (client/server/Tailwind) + nodemon

## Komutlar

| Komut                     | Açıklama                                                   |
| ------------------------- | ---------------------------------------------------------- |
| `yarn start:dev`          | Önce build, sonra watch modunda geliştirme sunucusu        |
| `yarn build`              | Production derlemesi (client + server + Tailwind CSS)      |
| `yarn start`              | Derlenmiş sunucuyu çalıştırır (build yoksa net hata verir) |
| `yarn test`               | Birim testleri (node:test)                                 |
| `yarn lint`               | Prettier check + ESLint                                    |
| `yarn lint:fix`           | ESLint otomatik düzeltme                                   |
| `yarn format`             | Kod tabanını Prettier ile formatlar                        |
| `yarn typecheck`          | `tsc --noEmit`                                             |
| `yarn generate:page <Ad>` | Yeni sayfa iskeleti oluşturur                              |
| `yarn ci`                 | Tam doğrulama: lint → typecheck → test → build             |

## Yeni sayfa ekleme

### Script ile (önerilen)

```bash
yarn generate:page TodoList
```

Bu komut şunları oluşturur:

- `src/client/pages/TodoList/TodoList.tsx` (Layout'lu sayfa bileşeni)
- `src/client/pages/TodoList/client.ts` (hydration girişi)
- `src/shared/types.ts` içine `TodoListRouteData` tipi
- `src/server/server.tsx` içine `/todo-list` route kaydı + import'lar

Sayfa adı PascalCase olmalı (örn. `TodoList`). Mevcut ad yeniden kullanılırsa script hata verir.

### Manuel

1. `src/client/pages/<Ad>/<Ad>.tsx` — sayfa bileşeni (`data` prop'u ile)
2. `src/client/pages/<Ad>/client.ts` — `createApp({ Page: <Ad> })`
3. `src/server/server.tsx` — `id` değeri sayfa klasörüyle aynı olan `createDynamicRoute` kaydı (hydration script'i `/dist/<id>/client.js` olarak yüklenir)
4. `src/shared/types.ts` — route data tipi

## i18n

- Dil dosyaları: `src/locales/{en,fr}.json`
- Yeni dil eklerken HEM `src/server/i18n.ts` HEM `src/client/i18n.ts` kaynak haritaları güncellenmeli
- Dil çözümü: `lang` cookie → Accept-Language → `en`

## Ortam değişkenleri

- dotenv yok; değişkenler shell'den export edilir
- Tam liste ve varsayılanlar: `.env.example`
- Geçersiz değerler (örn. `PORT=abc`) başlangıçta net mesajla hata verir

## Testler

- Framework: node:test + `node:assert/strict`
- `tests/` ağacı `src/` yapısını yansıtır (örn. `tests/server/…`, `tests/scripts/…`)
- Tek dosya: `node --require ts-node/register --test tests/server/config.test.ts`

## Commit mesajları

Prefix kullanılır (repo geçmişiyle tutarlı):

- `feat:` yeni özellik
- `fix:` hata düzeltme
- `refactor:` davranış değiştirmeyen yeniden yapılandırma
- `test:` test ekleme/güncelleme
- `docs:` dokümantasyon
- `chore:` araç/config bakımı
- `style:` formatlama
- `dev:` geliştirme deneyimi iyileştirmeleri
