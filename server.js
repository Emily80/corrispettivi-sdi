// Importazione dei moduli necessari
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xml2js = require('xml2js');
const https = require('https');
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

// Endpoint per ricevere i corrispettivi, generare il file XML conforme e inviarlo tramite SDI
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

    // Configurazione della richiesta HTTPS con certificati digitali (placeholder)
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')), // Certificato client
      key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),   // Chiave privata
      ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem'))      // Certificato dell'autorità di certificazione
    });

    // Invio simulato al sistema SDI (modificare con l'URL reale quando disponibile)
    const sdiResponse = await axios.post('https://test.sdi.gov.it/invio', xml, {
      httpsAgent,
      headers: {
        'Content-Type': 'application/xml'
      }
    });

    console.log('Risposta SDI:', sdiResponse.data);

    // Risposta positiva al client
    res.status(200).send({ messaggio: 'Corrispettivi inviati con successo allo SDI.', risposta: sdiResponse.data });
  } catch (error) {
    console.error(`Errore durante l'invio dei corrispettivi allo SDI:`, error.message);
    // Risposta di errore al client con dettagli
    res.status(500).send({ errore: `Errore durante l'invio dei corrispettivi allo SDI: ${error.message}` });
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

