// Importazione dei moduli necessari
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xml2js = require('xml2js');
const axios = require('axios');
const path = require('path');

// Inizializza l'app Express
const app = express();
const port = 3000;

// Middleware per gestire il body delle richieste in formato JSON
app.use(bodyParser.json());

// Route per la radice del server
app.get('/', (req, res) => {
  res.send('Benvenuto nel server SDI Corrispettivi!');
});

// Endpoint per ricevere i corrispettivi, generare il file XML conforme e simularne l'invio
app.post('/invia-corrispettivi', async (req, res) => {
  try {
    const dati = req.body; // Ricezione dei dati dal client

    // Costruzione manuale della struttura XML conforme alle specifiche
    const corrispettivi = {
      Corrispettivi: {
        Esercente: dati.esercente,
        Data: dati.data,
        Vendite: {
          Prodotto: dati.vendite.map((vendita) => ({
            Nome: vendita.prodotto,
            Quantita: vendita.quantita,
            PrezzoUnitario: vendita.prezzo,
            Totale: (vendita.quantita * vendita.prezzo).toFixed(2)
          }))
        }
      }
    };

    // Converte i dati JSON ricevuti in XML
    const builder = new xml2js.Builder({ headless: true, rootName: 'Corrispettivi' });
    const xml = builder.buildObject(corrispettivi);

    // Salva il file XML nella directory corrente
    const filePath = './corrispettivi.xml';
    fs.writeFileSync(filePath, xml);

    // Simulazione invio senza certificati
    console.log('Simulazione invio al sistema SDI con il seguente XML:\n', xml);

    // Simula una risposta di successo
    res.status(200).send({ messaggio: 'Simulazione completata con successo. Corrispettivi inviati.', risposta: xml });
  } catch (error) {
    console.error(`Errore durante l'invio simulato dei corrispettivi:`, error.message);
    // Risposta di errore al client con dettagli
    res.status(500).send({ errore: `Errore durante l'invio simulato dei corrispettivi: ${error.message}` });
  }
});

// Endpoint per ricevere notifiche dallo SDI (Ricezione)
app.post('/ricevi-notifica', (req, res) => {
  try {
    const notifica = req.body;
    console.log('Notifica ricevuta dallo SDI:', notifica);
    // Conferma di ricezione al sistema SDI
    res.status(200).send({ messaggio: 'Notifica ricevuta con successo.' });
  } catch (error) {
    console.error('Errore nella ricezione della notifica:', error);
    res.status(500).send({ errore: "Errore durante la ricezione della notifica." });
  }
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server REST in ascolto su http://localhost:${port}`);
});
