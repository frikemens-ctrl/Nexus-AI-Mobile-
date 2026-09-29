# Nexus AI — lista wdrożenia

## Wdrożone

- [x] Polski interfejs: czat, historia, ustawienia, placeholdery, komunikaty i etykiety dostępności.
- [x] Czat podłączony do backendowego `chat.send` z realnym LLM.
- [x] Wybór plików przez `input type=file`.
- [x] Drag & drop plików do kompozytora.
- [x] Wklejanie obrazów i plików ze schowka przez Ctrl+V / Cmd+V.
- [x] Podgląd załączników przed wysłaniem.
- [x] Usuwanie załączników przed wysłaniem.
- [x] Walidacja typu, liczby plików i limitu 25 MB na plik.
- [x] Upload przez `POST /api/attachments/upload` do wbudowanego storage.
- [x] Wysyłanie załączników razem z wiadomością do backendu AI.
- [x] Miniatury obrazów i linki do pozostałych plików w historii rozmowy.
- [x] Lokalna trwała historia rozmowy przez AsyncStorage.
- [x] Nagrywanie głosu przez Expo Audio, upload audio i transkrypcja po polsku przez wewnętrzny Whisper/STT.
- [x] Testy walidacji załączników i helperów Nexus AI.

## Zweryfikowane

- [x] `pnpm check` — bez błędów TypeScript.
- [x] `pnpm test -- --run` — 6 testów przechodzi, 1 istniejący test auth pozostaje pominięty zgodnie z szablonem.
- [x] Realne wywołanie `chat.send` przez publiczne API.
- [x] Realny upload PNG i odpowiedź JSON z adresem storage.
- [x] Screenshot `/`, `/history`, `/settings` przy widoku telefonu 375×812.

## Świadome ograniczenie

- W środowisku webowym przeglądarka musi udzielić zgody na mikrofon po kliknięciu przycisku; bez zgody aplikacja pokazuje polski komunikat i nie wysyła audio.

## Integracja web–mobile

- [x] Zidentyfikowano archiwum jako osobny klient webowy TanStack/Vite, a nie patch Expo.
- [x] Utworzono bezpieczną kopię webową w `/home/ubuntu/nexus-ai-web-connected-fallback`.
- [x] Przepięto webowy chat na mobilny backend przez HTTP/tRPC.
- [x] Przepięto webowy upload załączników i audio na wspólne endpointy mobilne.
- [x] Rozszerzono `chat.send` o opcjonalną historię do 20 tur.
- [x] Dodano pasek statusu asystenta w webie i pasek fali audio w aplikacji mobilnej.
- [x] Build webowy przechodzi `npm run typecheck` i `npx vite build`.
- [ ] Zarejestrować osobny projekt WebDev webowy po odblokowaniu inicjalizacji w sesji.
- [ ] Zastąpić tymczasowy adres API zmienną środowiskową w publikacji webowej.
- [x] Cztery motywy interfejsu w mobile i web: Mgła, Nocny grafit, Szmaragdowy neon, Fioletowy zmierzch.
- [x] Motyw mobilny zapisuje się przez AsyncStorage; motyw webowy przez localStorage.
