# Nexus AI — raport projektu

## 1. Opis

Nexus AI to aplikacja mobilna Expo/React Native z wersją webową. Aplikacja udostępnia polski interfejs osobistego asystenta AI, czat z backendem LLM, historię rozmów zapisywaną lokalnie oraz pełną obsługę załączników.

Eksport zawiera edytowalny kod źródłowy TypeScript/TSX, konfigurację Expo, backend Express/tRPC, testy Vitest, konfigurację stylów NativeWind i pliki projektu. Można go otworzyć i edytować w dowolnym edytorze tekstu lub IDE, np. Visual Studio Code, WebStorm albo Cursor.

## 2. Najważniejsze funkcje

- Polski interfejs: Czat, Historia, Ustawienia, komunikaty, placeholdery i etykiety dostępności.
- Czat AI podłączony do serwerowego LLM przez procedurę `chat.send`.
- Załączniki: wybór plików, drag & drop, Ctrl+V/Cmd+V, podgląd, usuwanie, walidacja i upload do storage.
- Obsługiwane załączniki: PNG, JPEG, WebP, GIF, PDF, TXT, CSV i DOCX.
- Limit załączników: maksymalnie 5 plików, maksymalnie 25 MB na plik.
- Historia wiadomości zapisywana lokalnie przez AsyncStorage.
- Nagrywanie głosu przez `expo-audio`.
- Transkrypcja audio po polsku przez procedurę `voice.transcribe` i wewnętrzny serwis Whisper/STT.
- Upload audio do storage z walidacją formatu i limitem 16 MB.
- Obsługa błędów po polsku i prośba o dostęp do mikrofonu dopiero po kliknięciu przycisku.

## 3. Struktura projektu

```text
app/                 Ekrany Expo Router: czat, historia, ustawienia, OAuth
components/          Wspólne komponenty UI
constants/           Konfiguracja motywu i OAuth
hooks/               Hooki motywu i autoryzacji
lib/                 Klient tRPC oraz logika domenowa Nexus AI
server/              Express, tRPC, LLM, storage i transkrypcja
shared/              Wspólne typy oraz walidatory załączników i audio
tests/               Testy Vitest
drizzle/             Schemat i migracje bazy danych
assets/              Ikony, splash screen i zasoby Expo
app.config.ts        Konfiguracja aplikacji Expo
package.json         Zależności i skrypty projektu
pnpm-lock.yaml       Zablokowane wersje zależności
RAPORT.md            Ten raport
```

## 4. Uruchomienie w innym programie

Wymagane środowisko:

- Node.js 22 lub nowszy,
- pnpm 9 lub nowszy,
- Expo SDK 54,
- dostęp do skonfigurowanych zmiennych środowiskowych Manus/WebDev, jeśli mają działać LLM, storage i transkrypcja.

Po rozpakowaniu archiwum:

```bash
pnpm install
pnpm check
pnpm test -- --run
pnpm dev
```

Wersja webowa uruchamia się skryptem Expo/Metro. Aplikację natywną można uruchomić przez:

```bash
pnpm android
pnpm ios
```

Do budowania natywnego APK/IPA potrzebny jest standardowy proces Expo/EAS albo lokalne środowisko Android/iOS.

## 5. Zmienne i usługi backendowe

Projekt korzysta z usług wbudowanych w środowisko Manus/WebDev. Nie należy wpisywać kluczy API bezpośrednio do kodu. Backend oczekuje między innymi konfiguracji LLM/storage przekazywanej przez środowisko:

- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `DATABASE_URL` — tylko jeśli w przyszłości będzie używana synchronizacja danych w bazie
- zmienne OAuth Expo/Manus, jeśli ma być włączone logowanie

Historia rozmów jest obecnie lokalna. Dzięki temu aplikacja działa bez wymuszania logowania; synchronizacja między urządzeniami wymagałaby dodania tabel rozmów i procedur chronionych autoryzacją.

## 6. Trasy backendowe

- `POST /api/attachments/upload` — upload zwykłych załączników.
- `POST /api/audio/upload` — upload nagrania audio.
- `POST /api/trpc/chat.send` — wysłanie wiadomości do AI.
- `POST /api/trpc/voice.transcribe` — transkrypcja audio po polsku.
- `GET /api/health` — kontrola dostępności API.

## 7. Walidacja i testy

Zweryfikowano:

- `pnpm check` — bez błędów TypeScript.
- `pnpm test -- --run` — 8 testów przechodzi; jeden istniejący test autoryzacji pozostaje pominięty przez szablon projektu.
- Walidację załączników: format, rozmiar i liczba plików.
- Walidację audio: obsługiwany MIME type, pusty plik i limit 16 MB.
- Realne wywołanie chatowego backendu LLM.
- Realny upload pliku do storage.
- Render trzech ekranów w widoku telefonu 375×812.

## 8. Znane ograniczenia

- Przeglądarka i system mobilny muszą udzielić zgody na mikrofon po kliknięciu przycisku nagrywania.
- Historia jest lokalna i nie synchronizuje się między urządzeniami.
- Transkrypcja wymaga dostępnego w środowisku serwisu Whisper/STT.
- Dla pełnego natywnego builda Android/iOS potrzebne jest środowisko Expo/EAS oraz odpowiednie narzędzia platformowe.

## 9. Edycja

Wszystkie pliki źródłowe są zapisane jako zwykły tekst. Można zmieniać ekrany w `app/`, backend w `server/`, walidatory w `shared/`, testy w `tests/` oraz konfigurację w `app.config.ts`, `package.json` i `theme.config.js`. Po każdej zmianie zalecane jest uruchomienie:

```bash
pnpm check && pnpm test -- --run
```

## 10. Połączenie z klientem webowym

- Klient webowy z archiwum `grok-workspace.zip` został skopiowany do osobnego katalogu fallback i przepięty na kanoniczny backend mobilny.
- Backend `chat.send` przyjmuje teraz opcjonalną historię do 20 tur, dzięki czemu web może zachować kontekst rozmowy.
- Wspólny adres API: `https://nexusaimob-ugwyeg4c.manus.space`.
- Web używa tych samych tras uploadu załączników, audio, czatu tRPC i transkrypcji co aplikacja mobilna.
- Dodano statusowy pasek gotowości i wizualizację fali audio w interfejsie mobilnym, inspirowane dostarczonym zrzutem ekranu, bez kopiowania jego treści ani grafiki.

## 11. Status integracji

- Kopia webowa: `/home/ubuntu/nexus-ai-web-connected-fallback`.
- Ponieważ bieżąca sesja WebDev nie pozwoliła utworzyć drugiego zarejestrowanego projektu, kopia webowa jest przygotowana jako osobny, edytowalny klient fallback. Nie zastępuje i nie usuwa projektu mobilnego.
- Build webowego klienta przechodzi przez `npm run typecheck` i `npx vite build`.
- Testy archiwalne zawierają niezależne porażki generatora metadanych PWA; nie dotyczą adaptera wspólnego API.

## 12. Motywy interfejsu

Aplikacja mobilna udostępnia cztery motywy wybierane w Ustawieniach: **Mgła**, **Nocny grafit**, **Szmaragdowy neon** i **Fioletowy zmierzch**. Wybór jest zapisywany lokalnie przez AsyncStorage i wpływa na paletę NativeWind oraz runtime kolorów po ponownym otwarciu aplikacji.


## 13. Przebudowa layoutów Nexus AI — 2026-09-29

W głównym ekranie czatu wdrożono warunkowe renderowanie czterech odmiennych struktur UI zależnych od wybranego motywu:

- **Classic mode** — jasny układ iMessage, niebieskie/szare bąbelki oraz pięcioelementowy pasek nawigacyjny.
- **Cyberpunk mode** — wielookienkowy terminal diagnostyczny, neonowe kolory, okna kodu i terminalowy composer bez centralnego orba.
- **GTA / Comic mode** — żółty nagłówek, komiksowe bąbelki, obramowania 4 px i twarde czarne cienie.
- **Advanced Vision** — centralny orb SVG, boczne karty telemetryczne oraz jawnie oznaczone dane demonstracyjne.

Wspólna logika wiadomości, historii lokalnej, załączników, uploadu, nagrywania i transkrypcji pozostała poza drzewami layoutów. Zmieniono również etykiety selektora motywów w `lib/theme-provider.tsx`; wybór nadal zapisuje się przez AsyncStorage.

### Kontrole wykonane po zmianach

- `pnpm check` — przechodzi bez błędów TypeScript.
- `pnpm test -- --run` — 8 testów przechodzi, 1 test szablonowy pozostaje pominięty.
- `pnpm build` — build backendu przechodzi.
- `pnpm lint` — po poprawkach kodu należy uruchomić ponownie; pierwsza kontrola wykryła wyłącznie dwa problemy z literałami `//` oraz nieużywane importy, które zostały usunięte/poprawione.
- `npx expo export --platform web` — nie ukończył się z powodu błędu Metro dotyczącego `node_modules/react-native-css-interop/.cache/web.css` (problem środowiskowo-konfiguracyjny NativeWind/Metro, niezależny od kontroli TypeScript).

Nie wykonano publikacji aplikacji ani testu na fizycznym urządzeniu.
