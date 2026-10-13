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

## Lab 07 – Dynamiczne trasy i filtrowanie katalogu

W ramach laboratorium aplikacja została rozszerzona o dynamiczne strony
szczegółów produktów oraz filtrowanie i sortowanie katalogu za pomocą
parametrów URL.

### Trasy

- `/` – strona główna
- `/product-list` – katalog produktów
- `/product-list/[id]` – szczegóły wybranego produktu
- `/basket` – koszyk
- `/order-history` – historia zamówień
- `/about` – informacje o projekcie
- `/api/products` – API produktów

### Szczegóły produktu

Szczegóły produktu dostępne są pod adresem:

`/product-list/<id>`

Przykład:

`/product-list/4`

Identyfikator produktu musi:
- składać się wyłącznie z cyfr,
- być liczbą całkowitą z zakresu 1–2147483647,
- nie zawierać znaku,
- nie zawierać zer wiodących.

Niepoprawny identyfikator lub poprawny identyfikator nieistniejącego
produktu powoduje wyświetlenie strony Not Found.

Awaria repozytorium nie jest traktowana jako brak produktu.

### Parametry katalogu

Stan filtrów katalogu jest przechowywany w URL.

Obsługiwane parametry:

#### `type`

Kategoria produktu:

- `all` – wszystkie produkty (domyślnie)
- `cpu` – procesory
- `gpu` – karty graficzne
- `ram` – pamięć RAM
- `disk` – dyski

#### `stock`

Dostępność:

- `all` – wszystkie produkty (domyślnie)
- `available` – produkty z `amount > 0`
- `unavailable` – produkty z `amount === 0`

#### `sort`

Sortowanie:

- `name` – nazwa rosnąco (domyślnie)
- `newest` – data malejąco, od najnowszych

W przypadku remisu sortowania produkty są dodatkowo sortowane
rosnąco według `id`.

### Przykładowe adresy

Wszystkie produkty:

`/product-list`

Dostępne karty graficzne:

`/product-list?type=gpu&stock=available`

Dostępne karty graficzne od najnowszych:

`/product-list?type=gpu&stock=available&sort=newest`

Niedostępne procesory:

`/product-list?type=cpu&stock=unavailable&sort=name`

Niepoprawna wartość parametru jest zastępowana wartością domyślną,
a użytkownik otrzymuje ostrzeżenie.

Przykład:

`/product-list?type=telefon&stock=available&sort=newest`

Powtórzony rozpoznawany parametr również otrzymuje wartość domyślną.

Przykład:

`/product-list?type=gpu&type=cpu&sort=newest`

W tym przypadku `type` przyjmuje `all`, natomiast poprawny
`sort=newest` pozostaje zachowany.

### Architektura

Katalog produktów pozostaje Server Componentem.

`searchParams` są odczytywane po stronie serwera i przekazywane do
`parseCatalogParams()`. Dopiero zwalidowane i typowane kryteria są
przekazywane do repozytorium.

Przepływ danych:

URL
→ searchParams
→ parseCatalogParams()
→ CatalogCriteria
→ getCatalogProducts()
→ widok

Dane produktów są odczytywane wyłącznie po stronie serwera.
Komponent katalogu nie wykonuje zapytania HTTP do własnego API,
ponieważ może bezpośrednio korzystać z repozytorium.

Komponent `Navigation` jest Client Componentem, ponieważ korzysta
z `usePathname()` do określenia aktywnej pozycji nawigacji.
Pozostała część layoutu nie została z tego powodu zamieniona na
Client Component.

URL jest źródłem stanu filtrów. Dzięki temu:
- odświeżenie strony zachowuje filtry,
- skopiowany adres odtwarza ten sam widok,
- przyciski Wstecz/Dalej odtwarzają poprzedni stan katalogu.

### Obsługa błędów

Rozróżniane są trzy przypadki:

1. Niepoprawny format identyfikatora → Not Found.
2. Poprawny identyfikator, ale brak produktu → Not Found.
3. Awaria repozytorium → błąd aplikacji, a nie Not Found.

Produkt z `amount === 0` nadal istnieje i może zostać wyświetlony.
Jest jedynie oznaczony jako niedostępny.

### Metadata

Strona szczegółów produktu wykorzystuje `generateMetadata()`.

Tytuł strony jest generowany na podstawie danych produktu, np.:

`Dysk SSD 004 | Computer Shop`