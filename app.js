const map = L.map('map').setView([45.434, 12.339], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Funzione per caricare i canali
async function caricaCanali() {
    try {
        const response = await fetch('canali.json');
        if (!response.ok) throw new Error("File canali.json non trovato sul server");
        const data = await response.json();
        
        L.geoJSON(data, {
            style: { color: "#00d1ff", weight: 4 },
            onEachFeature: (feature, layer) => {
                layer.bindPopup("Canale: " + feature.properties.name + "<br>Fondo: " + feature.properties.depth + "m");
            }
        }).addTo(map);
        console.log("Canali caricati con successo!");
    } catch (err) {
        console.error("Errore caricamento canali:", err);
        alert("Attenzione: Non ho trovato il file canali.json nella tua cartella GitHub.");
    }
}

caricaCanali();

// GPS
map.locate({setView: true, watch: true, enableHighAccuracy: true});
map.on('locationfound', (e) => {
    L.circle(e.latlng, e.accuracy/2).addTo(map);
    // Qui andrà la logica per calcolare la profondità
});
