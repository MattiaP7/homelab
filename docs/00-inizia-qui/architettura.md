# Panoramica dell'architettura

Prima di installare qualsiasi cosa, è importante avere in testa la mappa completa di come tutti i pezzi comunicano tra loro. Questa pagina è il "diagramma madre" a cui tornare ogni volta che ti perdi tra i dettagli delle sezioni successive.

## Architettura fisica

```mermaid
flowchart TB

    Internet --> Router

    Router --> Server

    Router --> PC
    Router --> TV
    Router --> Smartphone

    Server --> CasaOS
    Server --> Portainer
    Server --> Docker
```

## I tre livelli concettuali

### Livello 1 — Accesso e gestione

**CasaOS** e **Portainer** sono le due interfacce da cui gestisci il server. CasaOS per le operazioni semplici (aggiungere un container, cambiare una variabile), Portainer per configurazioni avanzate che CasaOS non espone (rete condivisa tra container, capacità di sistema). Ne parliamo nel dettaglio nella sezione Piattaforma Server.

### Livello 2 — Automazione (Stack \*arr)

Il cuore del sistema: **Prowlarr** cerca sugli indexer, **Radarr**/**Sonarr** decidono cosa scaricare e lo passano a **qBittorrent**, **Bazarr** aggiunge i sottotitoli, **Jellyseerr** è il punto di richiesta per gli utenti finali (te e la tua famiglia).

```mermaid
flowchart LR

    Jellyseerr --> Radarr
    Jellyseerr --> Sonarr

    Radarr --> Prowlarr
    Sonarr --> Prowlarr

    Prowlarr --> Indexer

    Radarr --> qBittorrent
    Sonarr --> qBittorrent

    qBittorrent --> Gluetun
    Gluetun --> VPN

    qBittorrent --> Libreria

    Libreria --> Jellyfin
```

### Livello 3 — Sicurezza di rete

**Gluetun** crea un tunnel VPN verso **Mullvad**, e **qBittorrent** è forzato a passare esclusivamente attraverso quel tunnel (nessuna rete propria). **UFW** controlla chi può raggiungere le interfacce web dei vari servizi. **Tailscale** permette accesso da fuori casa senza esporre nulla pubblicamente. **AdGuard Home** filtra le richieste DNS di tutta la rete domestica.

## Il flusso completo, passo per passo

```mermaid
sequenceDiagram
    participant U as Utente (famiglia)
    participant JS as Jellyseerr
    participant R as Radarr/Sonarr
    participant P as Prowlarr
    participant G as Gluetun (VPN)
    participant Q as qBittorrent
    participant J as Jellyfin

    U->>JS: Richiede un film/serie
    JS->>R: Inoltra la richiesta
    R->>P: Cerca sugli indexer
    P-->>R: Risultati trovati
    R->>Q: Invia il miglior risultato
    Note over G,Q: Tutto il traffico di Q<br/>passa OBBLIGATORIAMENTE da G
    Q->>G: Richiede connessione
    G->>G: Tunnel verso Mullvad attivo?
    alt VPN connessa
        G-->>Q: Connessione concessa (IP Mullvad)
        Q->>Q: Scarica il file
    else VPN non connessa
        G-->>Q: Nessuna rete disponibile
        Note over Q: Download bloccato (kill switch)
    end
    Q->>R: File completato
    R->>R: Importa con hardlink
    R->>J: Notifica nuovo contenuto
    J->>U: Contenuto pronto per la visione
```

Questo diagramma è la chiave di lettura di tutta la guida: ogni sezione successiva approfondisce uno di questi passaggi. Tienilo a mente mentre procedi.

## Perché questa architettura e non un'altra

Ogni scelta in questa guida risponde a un principio preciso:

- **Isolamento**: qBittorrent non ha mai accesso diretto a Internet, solo tramite Gluetun — se la VPN si rompe, il download si ferma, non "torna" alla rete normale
- **Automazione**: nessun passaggio manuale tra "richiesta" e "contenuto pronto"
- **Nessuna esposizione pubblica**: tutto è raggiungibile solo da LAN o tramite Tailscale, mai con porte aperte sul router
- **Separazione delle responsabilità**: ogni servizio fa una cosa sola (Prowlarr cerca, Radarr organizza, qBittorrent scarica, Jellyfin mostra) — se uno si rompe, gli altri restano operativi

Con questa mappa mentale, sei pronto per iniziare dalla scelta dell'hardware.
