# Manuale di G-Timer

G-Timer è un **timer di registrazione a blocchi per la radio**. Costruisci i tuoi programmi come un elenco di blocchi a tempo, li registri con un conto alla rovescia 3·2·1, vedi gli sforamenti mentre accadono ed esporti un report alla fine. È una web app (PWA) gratuita di OnAir Garage che funziona offline dopo la prima visita.

## Aprire e installare

Apri G-Timer su `https://onairgarage.com/apps/g-timer/` (la pagina dello strumento è `https://onairgarage.com/tools/g-timer/`). Per usarlo non si installa nulla, e dopo la prima visita continua a funzionare in regia senza connessione. Puoi anche installarlo come app:

- **Chrome, Edge e Android**: premi il pulsante *Installa app* (compare quando il browser lo supporta).
- **iPhone e iPad (Safari)**: tocca l'icona Condividi, poi scegli «Aggiungi alla schermata Home».

L'app si apre sempre in inglese. Cambia lingua dall'intestazione (English, Italiano, Español): la scelta viene ricordata sul dispositivo.

## Le due modalità

In alto scegli la modalità:

- **Libero**: un conto alla rovescia rapido con preset (1, 2, 3, 5, 10, 15 minuti) o qualsiasi valore mm:ss che scrivi nei campi MIN e SEC.
- **Programma**: un programma fatto di blocchi, ciascuno con la sua durata prevista. Scegli un programma salvato dall'elenco; il pannello *Blocchi* di lato mostra tutti i suoi blocchi.

## Registrare

1. Premi **▶ Start**. Con l'opzione **Pre-roll 3·2·1** attiva (il predefinito), tre passi da un secondo contano alla rovescia prima che la ripresa inizi, con beep facoltativi (*Suono*, tasto `S`).
2. Mentre registri, il display mostra il tempo che resta. Diventa **giallo nell'ultimo minuto** e **rosso negli ultimi 10 secondi**; sotto zero lampeggia in rosso e conta lo **sforamento** (SFORAMENTO).
3. **⏸ Pausa** ferma l'orologio. In pausa puoi correggere il tempo residuo (±10 s, ±60 s, oppure scrivi un valore come `mm:ss`; un numero da solo sono minuti).
4. **⏭ Fine blocco** chiude il blocco e passa al successivo. **↻ Rifai** registra di nuovo lo stesso blocco; **◀ Indietro** torna al blocco precedente; **↺ Reset** azzera la ripresa corrente.
5. Alla fine dell'ultimo blocco il display dice FINE PROGRAMMA e si apre il report.

Tasti: SPAZIO avvia e mette in pausa, `N` chiude il blocco, `R` azzera, `F` schermo intero, `S` suono.

- **Conteggio dinamico (DIN)**: con *DIN* attivo, lo scarto di ogni blocco passa al successivo, così il programma finisce comunque in orario: il target del blocco *i* è il suo tempo previsto meno la somma di (effettivo − previsto) dei blocchi precedenti. Il pannello segna i target ricalcolati.
- **Più riprese**: registra un blocco in più riprese; le riprese si sommano.
- **Registrazione non lineare**: clicca un blocco qualsiasi nel pannello laterale per saltarci. *↺ Ripristina* nel pannello riporta le durate salvate.

## Programmi e logo

*Gestisci programmi* apre l'elenco dei tuoi programmi: **+ Nuovo** per crearne uno, e per ogni programma *Carica*, *Modifica*, *Duplica* ed *Elimina*. I programmi si possono importare (**⤓ Importa**) ed esportare (**⤒ Esporta**) come file JSON. Nell'editor dai un nome al programma, aggiungi blocchi (**+ Aggiungi blocco**) con un'etichetta e un tempo previsto, e premi **💾 Salva**. Un file di programmi conserva solo i programmi con un nome e almeno un blocco più lungo di 0 secondi.

*Logo della radio* (intestazione) carica il tuo logo (PNG, JPG o SVG); resta solo nel tuo browser.

## Il report

Alla fine di un programma, o con **📋 Report**, il report di registrazione elenca per ogni blocco il tempo **pianificato**, il tempo **effettivo** e lo **scarto**, poi il totale pianificato, il totale registrato e lo **scarto finale** (la somma di effettivo − previsto su tutti i blocchi). **⧉ Copia** lo mette negli appunti e **⤒ Esporta .txt** lo salva come file di testo.

## Privacy

Tutti i dati restano nel tuo browser: programmi, logo e impostazioni non vengono inviati da nessuna parte. La finestra *Informazioni* mostra la versione, la licenza e un piccolo riquadro mancia con il salvadanaio del sito e un pulsante che apre in una nuova scheda la pagina di sostegno di onairgarage.com nella tua lingua; è l'unico posto, e dentro l'app non viene mai chiesto nulla.

## Aggiornamenti

Quando una nuova versione è pronta, un avviso dice «È pronta una nuova versione di G-Timer.» con *⟳ Ricarica*. Ignorarlo lascia semplicemente in funzione la versione attuale.

## Limiti

- La risoluzione del display è di un secondo. Alcuni browser non contano il tempo che un computer passa in sospensione.
- **Tieni la scheda visibile e il computer sveglio** durante una registrazione: i browser possono rallentare il display nelle schede nascoste (il tempo trascorso viene comunque calcolato dall'orologio quando la scheda torna).
- G-Timer non è uno strumento certificato; misura con l'orologio del browser.

## Risoluzione dei problemi

| Problema | Cosa fare |
|---|---|
| Il pulsante *Installa app* non c'è | Il browser potrebbe non offrirlo: su iPhone e iPad usa Condividi → Aggiungi alla schermata Home. |
| Il logo non si può salvare | La memoria del browser è piena o disattivata: libera spazio o attivala per questo sito. |
| Un file di programmi non viene accettato | Deve essere un file JSON esportato da G-Timer, con un nome e almeno un blocco più lungo di 0 secondi. |
| L'orologio sembra lento in una scheda in secondo piano | Porta la scheda in primo piano: il tempo mostrato si riallinea con l'orologio. |

## Contatti

Graziano Melzi · OnAir Garage — `https://onairgarage.com` — `hello@onairgarage.com`. Pagina dello strumento: `https://onairgarage.com/tools/g-timer/`. Codice sorgente e release: `https://github.com/djgragra/g-timer`. Licenza: MIT © 2026 Graziano Melzi.
