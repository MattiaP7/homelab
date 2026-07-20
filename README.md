# Homelab Media Server — Guida Completa

Guida passo-passo per costruire un homelab personale dedicato allo streaming multimediale: un server domestico che scarica automaticamente film e serie TV, li organizza e li rende disponibili in streaming, in modo sicuro e senza esporre nulla pubblicamente su Internet.

Sito pubblicato: https://mattiap7.github.io/homelab/

## Il progetto

Questa guida accompagna chi vuole costruire da zero un proprio "homelab", cioè un piccolo server che gira in casa e si occupa di tre cose: cercare contenuti, scaricarli e renderli disponibili in streaming a te e alla tua famiglia, come una specie di Netflix personale.

Il percorso è diviso in sezioni che seguono l'ordine naturale con cui si costruisce il sistema: si parte dai concetti di base, si passa alla scelta dell'hardware, si configura la rete e la sicurezza, si installa la piattaforma software, si mette in piedi lo stack di automazione (ricerca e download dei contenuti) e infine il media server vero e proprio, con una parte finale dedicata a manutenzione e risoluzione dei problemi.

## Le motivazioni

L'obiettivo della guida è spiegare le cose in modo semplice, partendo sempre dal perché prima ancora di arrivare al come. Molte guide tecniche si limitano a elencare comandi da copiare senza spiegare cosa fanno davvero: qui l'approccio è diverso.

Ogni argomento viene introdotto prima a livello concettuale (a cosa serve, che problema risolve) e solo dopo si passa alla pratica (comandi, configurazioni). In questo modo chi segue la guida non si limita a copiare istruzioni, ma capisce cosa sta succedendo. Questo è utile soprattutto quando qualcosa non funziona, cosa che prima o poi capita sempre: capire il ragionamento dietro ogni passaggio permette di risolvere i problemi da soli, invece di restare bloccati.

Non è richiesta nessuna esperienza da amministratore di sistema. La guida è pensata per chi parte da zero ma ha voglia di capire.

## Cosa vedrete

La guida è organizzata in sezioni progressive:

1. **Inizia qui** — i concetti di base: cos'è un homelab, come funziona un torrent, panoramica generale dell'architettura del sistema
2. **Hardware** — cosa comprare, da un semplice laptop riciclato fino a un server dedicato ed espandibile, con un percorso di crescita graduale
3. **Setup Iniziale** — scelta del sistema operativo, installazione di Ubuntu Server, primi passi con SSH, installazione di CasaOS e Portainer
4. **Rete e Sicurezza** — IP statico, firewall, VPN con kill switch, accesso remoto sicuro tramite Tailscale, DNS
5. **Piattaforma Server** — la base software su cui gira tutto il resto, con le relative convenzioni di configurazione
6. **Stack \*arr** — il cuore dell'automazione: ricerca, download e organizzazione automatica dei contenuti (Prowlarr, Radarr, Sonarr, Bazarr, qBittorrent)
7. **Jellyfin** — installazione del media server, personalizzazione e plugin utili
8. **Manutenzione** — backup, migrazione e risoluzione dei problemi più comuni

L'intero flusso è protetto da una VPN con kill switch (se la VPN cade, il download si ferma automaticamente e non scarica mai senza protezione), da un firewall che lascia passare solo il traffico necessario, e reso raggiungibile da fuori casa in modo sicuro tramite Tailscale, senza mai esporre nulla direttamente su Internet.

## Aiuto per la scrittura del sito

Sono benvenuti contributi per migliorare la guida, in particolare su questi fronti:

- **Correzioni grammaticali e ortografiche**: refusi, errori di battitura, punteggiatura, concordanze
- **Miglioramento dello stile**: frasi poco chiare, ripetizioni, paragrafi che si possono rendere più scorrevoli o più semplici da leggere
- **Aggiunta di contenuti mancanti**: sezioni o passaggi che risultano incompleti, casi d'uso non coperti, alternative non menzionate
- **Aggiunta di dettagli tecnici**: esempi pratici, screenshot, note su versioni specifiche del software, avvertenze su problemi noti
- **Segnalazione di parti poco chiare**: se un concetto non è spiegato bene o manca il collegamento tra il "perché" e il "come", è utile segnalarlo così da poterlo rivedere

Per contribuire, il modo più semplice è aprire una issue o una pull request sulla repository GitHub del progetto: https://github.com/MattiaP7/homelab, oppure cliccare sul tasto "Modifica pagina" su una pagina del sito, questo vi farà creare una fork della repo da cui aprirete poi la pull request.
