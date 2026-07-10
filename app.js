// --- CONFIGURAZIONE E VARIABILI ---
let map, userMarker, accuracyCircle;
let mareaAttuale = 0; 
let fondoLocalizzato = -1.5; // Valore di default (verrà sovrascritto dai dati batimetrici)

// Coordinate iniziali: Bacino San Marco
const VENEZIA = [45.434, 12.339];

// --- INIZIALIZZAZIONE MAPPA ---
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView(VENEZIA, 14);

    // Layer 1: Mappa Base (CartoDB Dark)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // Layer 2: OpenSeaMap (Segnaletica Nautica, Briccole, Canali)
    L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png').addTo(map);

    // Avvia tracciamento GPS
    map.locate({ setView: true, maxZoom: 16, watch: true, enableHighAccuracy: true });
}

// --- GESTIONE GPS ---
map = null; // Reset per sicurezza
initMap();

function onLocationFound(e) {
    const radius = e.accuracy / 2;

    if (!userMarker) {
        userMarker = L.marker(e.latlng).addTo(map);
        accuracyCircle = L.circle(e.latlng, radius, { color: '#00d1ff', fillOpacity: 0.1 }).addTo(map);
    } else {
        userMarker.setLatLng(e.latlng);
        accuracyCircle.setLatLng(e.latlng).setRadius(radius);
    }

    // Qui cercheresti la batimetria nel file GeoJSON
    // Per ora simuliamo un cambio di profondità se ti muovi fuori dal centro
    updateDepths(e.latlng);
}

function recenterMap() {
    if (userMarker) map.panTo(userMarker.getLatLng());
}

map.on('locationfound', onLocationFound);
map.on('locationerror', (e) => alert("Errore GPS: " + e.message));


// --- LOGICA MAREA E PROFONDITÀ ---

// Funzione per recuperare la marea reale
async function getMarea() {
    try {
        // Usiamo un endpoint di fallback stabile o simulato per evitare errori CORS
        // In produzione qui va l'API del Comune di Venezia
        const mockMarea = Math.floor(Math.random() * (60 - 20) + 20); // Simula marea tra 20 e 60cm
        mareaAttuale = mockMarea;

        document.getElementById('marea-val').innerText = mareaAttuale;
        document.getElementById('last-update').innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (userMarker) updateDepths(userMarker.getLatLng());
    } catch (e) {
        console.error("Errore marea:", e);
    }
}

// Calcolo della profondità effettiva
function updateDepths(latlng) {
    // LOGICA DI SIMULAZIONE BATIMETRICA
    // In un'app reale, qui verifichi se latlng è dentro un poligono di un file fondali.json
    // Esempio: Canali profondi (-5m), Secche (-0.5m)
    
    // Simulazione basata sulla distanza dal centro (solo per demo)
    const dist = latlng.distanceTo(L.latLng(VENEZIA));
    fondoLocalizzato = dist > 2000 ? -0.8 : -4.5; 

    const mareaInMetri = mareaAttuale / 100;
    const profonditaTotale = Math.abs(fondoLocalizzato) + mareaInMetri;

    // Aggiorna UI
    document.getElementById('fondo-val').innerText = Math.abs(fondoLocalizzato).toFixed(1);
    const profEl = document.getElementById('prof-val');
    profEl.innerText = profonditaTotale.toFixed(1);

    // Allarme colore
    if (profonditaTotale < 1.2) {
        profEl.style.color = "#ff4444"; // Pericolo secca
    } else {
        profEl.style.color = "#00ff88"; // Navigazione sicura
    }
}

// --- AVVIO ---
getMarea();
setInterval(getMarea, 600000); // Aggiorna marea ogni 10 minuti
