// 1. Inizializzazione Mappa (Centrata su Venezia)
const map = L.map('map').setView([45.437, 12.333], 13);

// Layer Base: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Layer Nautico: OpenSeaMap (aggiunge briccole e canali)
L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png').addTo(map);

let mareaAttuale = 0; // marea in cm rispetto allo zero idrografico

// 2. Funzione per ottenere la marea in tempo reale (Simulata/API)
async function fetchMarea() {
    try {
        // Nota: In un'app reale useresti l'API del Comune di Venezia
        // Esempio: fetch('https://portale.comune.venezia.it/marea/api/v1/dati-reali')
        // Per ora simuliamo un valore di +45cm
        mareaAttuale = 45; 
        document.getElementById('marea-val').innerText = mareaAttuale + " cm";
    } catch (e) {
        console.error("Errore recupero marea", e);
    }
}

// 3. Gestione Posizione GPS
map.locate({setView: true, maxZoom: 16, watch: true, enableHighAccuracy: true});

function onLocationFound(e) {
    const radius = e.accuracy / 2;

    // Rimuovi marker precedente se esiste
    if (window.userMarker) map.removeLayer(window.userMarker);

    window.userMarker = L.circle(e.latlng, radius).addTo(map)
        .bindPopup("Sei entro " + radius.toFixed(0) + " metri da qui").openPopup();

    // Calcolo Profondità (Logica core)
    calculateDepth(e.latlng);
}
map.on('locationfound', onLocationFound);

// 4. Calcolo Profondità (Mock Data)
function calculateDepth(latlng) {
    // In un'app reale, qui interrogheresti un file GeoJSON o un database PostGIS
    // che contiene le profondità del fondale (es: Canale Giudecca = -12m, Barene = -0.5m)
    
    // ESEMPIO SIMULATO:
    // Se sei vicino a San Marco il fondo è profondo, se sei in laguna nord è basso.
    let fondoBase = -2.0; // Supponiamo un fondo di 2 metri sotto lo zero idrografico
    
    // Profondità Totale = Fondo (assoluto) + Marea
    let profonditaReale = Math.abs(fondoBase) + (mareaAttuale / 100);

    document.getElementById('fondo-val').innerText = Math.abs(fondoBase).toFixed(1) + " m";
    document.getElementById('prof-val').innerText = profonditaReale.toFixed(1) + " m";
    
    // Allarme secca
    if (profonditaReale < 1.0) {
        document.getElementById('prof-val').style.color = "red";
    } else {
        document.getElementById('prof-val').style.color = "#00ff88";
    }
}

// Avvio
fetchMarea();
setInterval(fetchMarea, 600000); // Aggiorna marea ogni 10 minuti