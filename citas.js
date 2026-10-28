import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAR9Gmv1JTmXY79uzjncYnMDVA06-gV5xs",
    authDomain: "caroez-d895c.firebaseapp.com",
    projectId: "caroez-d895c",
    storageBucket: "caroez-d895c.firebasestorage.app",
    messagingSenderId: "709825348582",
    appId: "1:70982534582:web:c513884c6d6576f9c42d17",
    measurementId: "G-51ED6K7XGF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const inputFecha = document.getElementById('fecha');
const selectHora = document.getElementById('hora');

// Cambiar horarios según el día seleccionado
inputFecha.addEventListener('change', (e) => {
    const fechaSeleccionada = new Date(e.target.value + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay(); // 0 Domingo, 6 Sábado

    selectHora.innerHTML = '<option value="">Selecciona horario</option>';
    let horariosDisponibles = [];

    if (diaSemana === 6) {
        // Sábados: Máximo hasta las 2:00 PM
        horariosDisponibles = ["08:00 AM","9:30 AM","11:00 AM","12:30 PM", "02:00 PM"];
    } else if (diaSemana === 0) {
        alert("Los domingos permanezcemos cerrados. Por favor elige otro día.");
        inputFecha.value = "";
        return;
    } else {
        // Lunes a Viernes: 8:00 AM a 5:00 PM
        horariosDisponibles = ["08:00 AM","9:30 AM","11:00 AM","12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"];
    }

    horariosDisponibles.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        selectHora.appendChild(option);
    });
});

// Guardar en Firebase
const form = document.getElementById('appointmentForm');
const statusText = document.getElementById('mensaje-status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    statusText.innerText = "Guardando tu cita...";
    statusText.style.color = "#ffffff";

    try {
        await addDoc(collection(db, "citas"), {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            servicio: document.getElementById('servicio').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            creadoEn: new Date()
        });

        statusText.innerText = "¡Cita registrada con éxito! Te contactaremos pronto.";
        statusText.style.color = "#b1d235";
        form.reset();
        selectHora.innerHTML = '<option value="">Primero selecciona una fecha</option>';

    } catch (error) {
        console.error("Error al agendar:", error);
        statusText.innerText = "Hubo un error al guardar. Intenta de nuevo.";
        statusText.style.color = "#ff4d4d";
    }
});

// Manejo de Selección de Tarjetas de Servicio
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        const inputServicio = document.getElementById('servicio');
        const valorActual = card.getAttribute('data-value');

        // Si la tarjeta ya estaba seleccionada, la deseleccionamos
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            inputServicio.value = ""; // Limpia el valor oculto
        } else {
            // Remover clase 'selected' de todas las demás tarjetas
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            
            // Seleccionar la tarjeta actual
            card.classList.add('selected');
            inputServicio.value = valorActual; // Asigna el nuevo valor
        }
    });
});