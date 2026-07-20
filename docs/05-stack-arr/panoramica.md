# Panoramica dello Stack \*arr

Lo "stack \*arr" prende il nome dal fatto che quasi tutte le applicazioni che lo compongono finiscono con "-arr" (Sonarr, Radarr, Prowlarr, Bazarr...). Insieme formano una catena di automazione completa: da "voglio guardare questo film" a "eccolo pronto in libreria", senza intervento manuale.

## Il ruolo di ogni componente

```mermaid
flowchart TB

    U[Utente]
    JS[Jellyseerr]
    RS[Radarr / Sonarr]
    P[Prowlarr]
    I[Indexer]
    QB[qBittorrent]

    U -->|1. Richiede un contenuto| JS
    JS -->|2. Invia la richiesta| RS
    RS -->|3. Richiede gli indexer| P
    P -->|4. Interroga| I
    I -. Risultati .-> P
    P -. Indexer disponibili .-> RS
    RS -->|5. Avvia il download| QB
```

| Componente      | Cosa fa                                                    | Analogia semplice                     |
| --------------- | ---------------------------------------------------------- | ------------------------------------- |
| **Prowlarr**    | Cerca sugli indexer (i "motori di ricerca" dei torrent)    | Il bibliotecario che sa dove cercare  |
| **Radarr**      | Gestisce la libreria film: cosa monitorare, cosa scaricare | Il responsabile acquisti per i film   |
| **Sonarr**      | Stessa cosa di Radarr, ma per le serie TV                  | Il responsabile acquisti per le serie |
| **Bazarr**      | Cerca e scarica sottotitoli automaticamente                | L'addetto ai sottotitoli              |
| **qBittorrent** | Esegue materialmente il download                           | Il corriere che porta il pacco        |
| **Jellyseerr**  | Interfaccia semplice per le richieste degli utenti         | Il modulo "richiedi un film"          |
| **Jellyfin**    | Mostra il contenuto pronto per la visione                  | La vetrina/lo scaffale finale         |

## Il workflow completo end-to-end

Per prima cosa avviene quindi la richiesta del contenuto

```mermaid
sequenceDiagram
    participant U as Utente
    participant JS as Jellyseerr
    participant RS as Radarr / Sonarr
    participant P as Prowlarr

    U->>JS: Richiede un contenuto
    JS->>RS: Invia la richiesta
    RS->>P: Cerca sugli indexer
    P-->>RS: Restituisce le release
```

Trovata la release avviene il download del contenuto

```mermaid
sequenceDiagram
    participant RS as Radarr / Sonarr
    participant QB as qBittorrent
    participant B as Bazarr
    participant JF as Jellyfin

    RS->>QB: Avvia il download
    QB-->>RS: Download completato
    RS->>B: Cerca i sottotitoli
    RS->>JF: Aggiorna la libreria
```

## Perché serve ogni pezzo — non è ridondanza

Un dubbio comune di chi inizia: "perché non basta un solo programma che fa tutto?". La risposta è **separazione delle responsabilità**: ogni componente fa una cosa sola e la fa bene, e se uno si rompe, gli altri restano operativi.

```mermaid
flowchart LR
    A[Se Prowlarr si rompe] --> A1[Radarr/Sonarr non trovano\nnuovi contenuti,\nma la libreria esistente\nresta accessibile]
    B[Se qBittorrent si rompe] --> B1[Nessun nuovo download,\nma ricerca e libreria\nrestano funzionanti]
    C[Se Jellyfin si rompe] --> C1[Download continuano,\nsolo la visione\nè temporaneamente ferma]
```

## Cosa imparerai nelle prossime pagine

1. **Prowlarr** — come configurare gli indexer, cosa sono, come gestire siti protetti da Cloudflare
2. **Radarr e Sonarr** — configurazione completa, collegamento al download client, qualità e lingua
3. **Bazarr** — sottotitoli automatici
4. **qBittorrent** — impostazioni di sicurezza specifiche (già introdotte nella sezione VPN, qui le colleghiamo allo stack)

!!! tip "Ordine di configurazione consigliato"
Configura sempre in quest'ordine: prima Prowlarr (la fonte di ricerca), poi Radarr/Sonarr (che dipendono da Prowlarr), poi Bazarr (che dipende da Radarr/Sonarr). Jellyseerr va configurato per ultimo, dato che si collega a tutti gli altri.

Si parte da Prowlarr, il punto di ingresso di tutta la ricerca.
