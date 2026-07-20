# Cos'è un homelab

Un **homelab** è, letteralmente, un laboratorio informatico domestico: uno o più computer che tieni in casa, sempre accesi, che fanno lavorare dei servizi per te — al posto di affidarti a servizi cloud a pagamento gestiti da altri.

Nel caso di questa guida, l'obiettivo specifico è un **media server personale**: un sistema che funziona come Netflix, ma:

- i contenuti sono i tuoi, organizzati come vuoi tu
- nessun abbonamento mensile (a parte l'elettricità e, se scegli di usarla, la VPN)
- nessuno decide cosa rimuovere dal catalogo
- resta privato, non è raggiungibile da Internet a meno che non lo decidi tu

## Perché non un semplice PC con i file dentro

Potresti pensare: "perché non metto i film su una cartella condivisa e li guardo con VLC?" Funzionerebbe, ma perderesti tutto quello che rende utile un homelab vero:

- **Niente ricerca automatica**: nessuno cerca per te nuovi episodi appena escono
- **Niente organizzazione automatica**: dovresti rinominare/spostare ogni file a mano
- **Niente interfaccia bella**: niente copertine, trame, continua a guardare da dove hai lasciato
- **Niente sicurezza**: se scarichi torrent senza protezione, il tuo IP reale è esposto a chiunque nello swarm

L'homelab che costruiamo in questa guida risolve tutti questi punti con automazione vera.

## I tre pilastri di questa guida

L'intero sistema si basa su tre componenti fondamentali che lavorano insieme.

### Automazzione dei contenuti

Abbiamo bisogno di un sistema automatico che si occupi di cercare, scaricare e organizzare automaticamente i contenuti, riducendo al minimo gli interventi manuali. Questo avviene tramite il cosidetto **stack arr**, un insieme di applicazioni open-source progettate per automatizzare completamente la gestione della tua libreria multimediale. Ogni componente ha un ruolo specifico e comunica con gli altri tramite API per creare un flusso di lavoro senza interruzioni.

Ecco come funziona ogni singolo ingranaggio della macchina:

- **Prowlarr (Il Gestore degli Indexer):** È l'indice centrale. Invece di configurare i siti di torrent (indexer) su ogni singola applicazione, li inserisci una sola volta su Prowlarr. Sarà lui a sincronizzarli automaticamente con Sonarr e Radarr, centralizzando la gestione dei tracciatori.
- **Radarr (Il Gestore dei Film):** Monitora la tua libreria cinematografica. Quando aggiungi un film (o lo programmi per il futuro), Radarr interroga Prowlarr per cercare i file torrent disponibili, valuta la qualità migliore in base ai tuoi filtri (es. 1080p, 4K, bitrate) e invia il comando di download.
- **Sonarr (Il Gestore delle Serie TV):** Funziona esattamente come Radarr, ma è specializzato nella logica complessa delle serie televisive. Gestisce stagioni, episodi speciali, monitora i palinsesti e scarica automaticamente le nuove puntate non appena vengono rilasciate.
- **Bazarr (Il Gestore dei Sottotitoli):** Lavora in background una volta che il file è sul server. Monitora le cartelle di Radarr e Sonarr e, se rileva che un film o un episodio non ha i sottotitoli (o li desideri in una lingua specifica come l'italiano), li cerca e li scarica in automatico da vari database esterni.
- **Il Client Torrent (L'Esecutore):** Applicazioni come **qBittorrent** (che noi blinderemo sotto VPN) ricevono l'ordine da Radarr o Sonarr, scaricano fisicamente i file e, a download completato, avvisano lo stack. A quel punto, il file viene spostato, rinominato correttamente e indicizzato.

Sebbene sia possibile gestire tutto entrando direttamente nei pannelli di Radarr e Sonarr, noi porteremo l'intera infrastruttura al livello successivo integrando **Jellyseerr**.

- **Jellyseerr (Il Centralino delle Richieste):** Diventerà l'unica vera interfaccia di inserimento per te e per gli eventuali utenti del tuo server. Invece di impazzire tra diverse app, ti basterà aprire Jellyseerr (che ha un'interfaccia fantastica in stile Netflix), cercare un film o una serie con una barra di ricerca e cliccare su **"Richiedi"**.
- Jellyseerr interloquirà autonomamente con Radarr o Sonarr, verificherà se il contenuto è già presente su Jellyfin e, in caso negativo, avvierà l'intera catena di automazione senza che tu debba muovere un dito.

### Sicurezza

Un'infrastruttura di automazione non può prescindere da una protezione granitica. La sicurezza del nostro homelab non serve solo a difendere i dati personali, ma blinda le attività del server rendendole invisibili all'esterno e inattaccabili da malintenzionati. Non ci limiteremo a installare i servizi, ma li isoleremo dietro barriere crittografiche e logiche.

Ecco le componenti essenziali che compongono la nostra linea di difesa:

- **Gluetun (Il Tunnel VPN Dedicato):** È un container Docker specializzato che agisce come un proxy VPN (lo configureremo con Mullvad). Invece di far passare tutto il server sotto VPN, collegheremo solo qBittorrent all'interno della rete privata di Gluetun. In questo modo, l'IP pubblico reale del tuo homelab non sarà mai visibile sui tracker torrent.
- **Il Kill Switch Automatico:** Una feature cruciale integrata in Gluetun. Se la connessione con la VPN cade anche solo per un secondo, il Kill Switch blocca istantaneamente tutto il traffico di rete del client torrent, impedendo leak di dati o download accidentali in chiaro.
- **Network Interface Binding (La Doppia Serratura):** È la protezione definitiva che applicheremo direttamente dentro qBittorrent. Configureremo il client torrent per ascoltare _esclusivamente_ sull'interfaccia di rete creata da Gluetun (solitamente denominata `tun0` o `wg0`). In questo modo, anche nel caso remoto in cui il container di Gluetun dovesse crashare male o resettarsi saltando il kill switch, qBittorrent si troverà isolato dal mondo e non potrà scambiare nemmeno un singolo pacchetto dati attraverso la tua connessione di casa (eth0/wlan0).
- **UFW (Uncomplicated Firewall):** Il firewall di sistema della macchina host. Verrà configurato secondo il principio del _least privilege_: bloccherà preventivamente tutto il traffico in entrata non esplicitamente autorizzato, lasciando aperte solo le porte strettamente necessarie alla rete locale.
- **Tailscale (L'Accesso Remoto Sicuro):** Una VPN mesh basata sul protocollo WireGuard. Ti permette di accedere a Jellyfin, CasaOS e a tutti i pannelli di controllo dello stack anche quando sei fuori casa o su rete mobile, senza dover esporre alcuna porta sul tuo modem/router di casa (niente port forwarding) e azzerando i rischi di attacchi informatici.

### Esperienza utente

L'esperienza utente è il traguardo finale di tutto il progetto. Tutta la complessità tecnica dello stack e della sicurezza scompare dietro a un'interfaccia elegante, fluida e accessibile a chiunque, trasformando una cartella di file scaricati in un vero e proprio servizio di streaming proprietario e indipendente.

Il cuore pulsante di questa sezione è rappresentato da un unico ambiente centralizzato:

- **Jellyfin (Il Media Server Open Source):** È l'alternativa open-source e totalmente gratuita a Plex. Riceve i file organizzati dallo stack \*arr, scarica automaticamente i metadati (copertine, trame, attori, canzoni, loghi) e organizza la tua libreria in categorie pulite (Film, Serie TV, Anime).
- **Interfaccia stile Streaming:** Offre un'esperienza d'uso identica a quella delle piattaforme commerciali (Netflix, Prime Video). Include il tracciamento automatico di dove hai interrotto la visione, la gestione degli episodi successivi ("Prossimo episodio") e la suddivisione per stagioni.
- **Multi-utente e Profili Personalizzati:** Ti permette di creare account separati per amici o familiari. Ogni utente avrà la propria cronologia di visione, la propria lista di contenuti preferiti e, se necessario, restrizioni sui contenuti (es. Parental Control per i bambini).
- **Supporto Multi-dispositivo e Transcodifica:** Jellyfin possiede applicazioni native per Android, iOS, Android TV/Fire TV, PC e browser Web. Se un dispositivo non supporta il formato video nativo (es. un file 4K HEVC pesante riprodotto su un vecchio smartphone), il server si occuperà di convertire il flusso video in tempo reale (Transcodifica) per garantire una riproduzione fluida e senza buffering.

## Cosa NON è questa guida

Non è un incoraggiamento alla pirateria in sé — è una guida tecnica su come costruire un'infrastruttura di media server personale, sicura e ben progettata. Cosa ci scarichi sopra e con quali diritti è una tua responsabilità, valuta sempre le leggi del tuo paese.

## Prossimo passo

Prima di comprare hardware o installare software, è utile capire **come funziona davvero un torrent** — è il meccanismo alla base di tutto il download automatico, e capirlo ti aiuta a capire anche _perché_ servono VPN e kill switch. Vai alla pagina successiva.
