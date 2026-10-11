# Computer Shop 2026

Projekt sklepu komputerowego wykonany w ramach laboratorium z Programowania BackEnd.

## Autor

Artur Lech

## Technologie

- Node.js 24 LTS
- Next.js
- React
- TypeScript
- ESLint
- Vitest

## Instalacja i uruchomienie

Projekt wykorzystuje `package-lock.json`, dlatego zależności należy odtworzyć poleceniem:

```bash
npm ci
```

Uruchomienie aplikacji w trybie deweloperskim:

```bash
npm run dev
```

Aplikacja jest domyślnie dostępna pod adresem:

`http://localhost:3000`

### Wersja produkcyjna

Zbudowanie aplikacji:

```bash
npm run build
```

Uruchomienie zbudowanej wersji:

```bash
npm run start
```

## Weryfikacja projektu

Sprawdzenie kodu za pomocą ESLint:

```bash
npm run lint
```

Uruchomienie testów:

```bash
npm run test
```

Zbudowanie wersji produkcyjnej:

```bash
npm run build
```

Przed oddaniem projektu wykonano:

```bash
npm ci
npm run lint
npm run test
npm run build
```

## Testy

Do testów wykorzystano Vitest.

Testy obejmują między innymi:

- sortowanie produktów po nazwie,
- sortowanie produktów po dacie,
- sprawdzenie, czy sortowanie nie modyfikuje danych źródłowych,
- filtrowanie produktów dostępnych,
- filtrowanie produktów niedostępnych,
- filtrowanie produktów według kategorii,
- obsługę nieistniejącego identyfikatora produktu,
- odrzucanie produktu z ujemną ceną,
- wykrywanie zduplikowanych identyfikatorów,
- wykrywanie zduplikowanych kodów produktów.

Testy znajdują się w:

`lib/products/repository.test.ts`

## Trasy aplikacji

| Trasa | Opis |
| --- | --- |
| `/` | Strona główna i informacje o projekcie |
| `/product-list` | Katalog produktów |
| `/basket` | Koszyk – funkcjonalność przewidziana do dalszej implementacji |
| `/order-history` | Historia zamówień – funkcjonalność przewidziana do dalszej implementacji |
| `/about` | Informacje o projekcie |

Nieznane adresy są obsługiwane przez własną stronę `not-found.tsx`.

## Dane produktów

Dane katalogu znajdują się w:

`data/products.json`

Projekt zawiera 100 deterministycznie wygenerowanych produktów należących do kategorii:

- `cpu`,
- `gpu`,
- `ram`,
- `disk`.

Produkty można wygenerować ponownie za pomocą:

```bash
node scripts/generate-products.mjs
```

Generator wykorzystuje stałe ziarno:

```text
2026
```

Dzięki temu ponowne uruchomienie generatora z tym samym ziarnem daje ten sam zestaw danych.

Pole `price` przechowuje cenę jako liczbę całkowitą w groszach. Dopiero warstwa prezentacji przelicza i formatuje cenę w złotych.

Przykład:

```text
129999 groszy = 1299,99 zł
```

## Walidacja danych

Dane wczytywane z pliku JSON są sprawdzane w czasie działania aplikacji.

Walidowane są między innymi:

- dodatni, całkowity `id`,
- unikalność `id`,
- poprawność i unikalność `code`,
- niepusta nazwa,
- dozwolona kategoria produktu,
- nieujemna cena całkowita,
- nieujemny stan magazynowy,
- poprawność daty,
- ścieżka do grafiki.

Repozytorium nie opiera się wyłącznie na rzutowaniu danych za pomocą `as Product[]`.

## Repozytorium produktów

Dostęp do danych został wydzielony do:

`lib/products/repository.ts`

Repozytorium udostępnia asynchroniczne funkcje do:

- pobierania i sortowania produktów,
- pobierania dostępnych produktów,
- pobierania niedostępnych produktów,
- filtrowania według kategorii,
- wyszukiwania produktu po identyfikatorze.

Repozytorium korzysta z `server-only`, dzięki czemu warstwa dostępu do danych pozostaje po stronie serwera.

Sortowanie wykonywane jest na kopii tablicy, dzięki czemu źródłowy zbiór danych nie jest modyfikowany.

## Server Components

Strona katalogu produktów jest Server Componentem.

Dane są pobierane bezpośrednio przez repozytorium:

```text
products.json
      ↓
walidacja
      ↓
repozytorium
      ↓
Server Component
      ↓
widok katalogu
```

Komponent katalogu nie importuje bezpośrednio pliku JSON.

Takie rozdzielenie pozwala w przyszłości zastąpić plik JSON innym źródłem danych, np. bazą danych, bez konieczności przebudowy warstwy prezentacji.

## Grafiki produktów

Grafiki produktów znajdują się w:

`public/images/products/`

Wykorzystano współdzielone grafiki dla kategorii:

- CPU,
- GPU,
- RAM,
- SSD.

Grafiki zastępcze zostały wygenerowane przy użyciu OpenAI ChatGPT na potrzeby projektu laboratoryjnego.

Do wyświetlania grafik wykorzystywany jest komponent `Image` z Next.js. Obrazy posiadają określone wymiary oraz tekst alternatywny `alt`.

## Dostępność

Aplikacja wykorzystuje semantyczne elementy HTML oraz logiczną hierarchię nagłówków.

Nawigacja jest zbudowana przy użyciu komponentu `Link` z Next.js.

Elementy interaktywne posiadają widoczny stan `focus-visible`, dzięki czemu aplikację można obsługiwać za pomocą klawiatury.

Język dokumentu został ustawiony na polski:

```html
<html lang="pl">
```

## Obsługa pustego wyniku i błędów

Pusty katalog jest prawidłowym stanem aplikacji i powoduje wyświetlenie komunikatu o braku produktów.

Nieznany adres URL jest obsługiwany przez:

`app/not-found.tsx`

Nieoczekiwane błędy podczas renderowania są obsługiwane przez:

`app/error.tsx`

Strona błędu wyświetla użytkownikowi bezpieczny komunikat oraz umożliwia ponowienie operacji.

Szczegółowe informacje o błędzie nie są prezentowane użytkownikowi.

## Pytania architektoniczne

### Czym różni się `page.tsx` od `layout.tsx`?

`page.tsx` definiuje zawartość konkretnej trasy, natomiast `layout.tsx` definiuje wspólny układ dla stron znajdujących się w danym segmencie routingu.

Główny `app/layout.tsx` obejmuje całą aplikację i zawiera wspólny nagłówek, nawigację oraz stopkę.

### Dlaczego nie utworzono dodatkowego layoutu katalogu?

Dodatkowy layout powinien istnieć tylko wtedy, gdy zawiera element rzeczywiście wspólny dla danej sekcji.

W obecnej wersji projektu nie ma takiego elementu, dlatego katalog korzysta z głównego root layoutu. Nie utworzono pustego layoutu wyłącznie w celu zwiększenia liczby plików.

### Co pozostaje wspólne podczas nawigacji przez `Link`?

Wspólny layout może pozostać zamontowany podczas nawigacji pomiędzy stronami. Zmieniana jest zawartość odpowiedniego segmentu aplikacji bez konieczności klasycznego pełnego przeładowania dokumentu.

### Dlaczego komponent katalogu nie importuje bezpośrednio `products.json`?

Widok korzysta z kontraktu repozytorium, a nie z konkretnego źródła danych.

Dzięki temu źródło danych może zostać w przyszłości zastąpione, np. bazą danych, bez istotnych zmian w komponencie katalogu.

### Czy `"use client"` oznacza brak początkowego HTML generowanego na serwerze?

Nie. `"use client"` wyznacza granicę komponentów klienta i umożliwia ich interaktywność oraz hydratację w przeglądarce. Nie oznacza automatycznie, że początkowy HTML nie może zostać wygenerowany po stronie serwera.

### Czym różni się pusty wynik, 404 i awaria aplikacji?

Pusty wynik jest poprawnym stanem danych i powoduje wyświetlenie informacji o braku produktów.

404 oznacza, że żądana trasa nie istnieje i jest obsługiwane przez `not-found.tsx`.

Nieoczekiwana awaria podczas renderowania jest obsługiwana przez `error.tsx`, który prezentuje bezpieczny komunikat i możliwość ponowienia operacji.