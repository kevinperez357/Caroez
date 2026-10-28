import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const form = document.getElementById('appointmentForm');
const statusText = document.getElementById('mensaje-status');

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

// Manejo de Selección de Tarjetas de Servicio (con opción de deseleccionar con un segundo clic)
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        const inputServicio = document.getElementById('servicio');
        const valorActual = card.getAttribute('data-value');

        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            inputServicio.value = ""; 
        } else {
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            inputServicio.value = valorActual; 
        }
    });
});

// Evento submit con validación en Firebase y botón de WhatsApp
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreCliente = document.getElementById('nombre').value;
    const telefonoCliente = document.getElementById('telefono').value;
    const servicioCliente = document.getElementById('servicio');

    // Validación extra por si intentan enviar sin elegir servicio en las tarjetas
    if (!servicioCliente || !servicioCliente.value) {
        statusText.innerText = "Por favor selecciona un servicio de la lista.";
        statusText.style.color = "#d9534f";
        return;
    }

    const servicioValor = servicioCliente.value;
    const fechaSeleccionada = document.getElementById('fecha').value;
    const horaSeleccionada = document.getElementById('hora').value;

    statusText.innerText = "Verificando disponibilidad...";
    statusText.style.color = "var(--text-color)";

    try {
        // 1. Consultar si ya existe una cita en esa misma fecha y hora en Firebase
        const citasRef = collection(db, "citas");
        const q = query(
            citasRef, 
            where("fecha", "==", fechaSeleccionada), 
            where("hora", "==", horaSeleccionada)
        );
        
        const querySnapshot = await getDocs(q);

        // 2. Si ya hay una cita, bloqueamos el registro de inmediato
        if (!querySnapshot.empty) {
            statusText.innerText = "Lo sentimos, este horario ya ha sido reservado. Por favor elige otro.";
            statusText.style.color = "#d9534f"; 
            return; 
        }

        // 3. Si está libre, guardamos la cita en Firebase
        statusText.innerText = "Guardando tu cita...";

        await addDoc(collection(db, "citas"), {
            nombre: nombreCliente,
            telefono: telefonoCliente,
            servicio: servicioValor,
            fecha: fechaSeleccionada,
            hora: horaSeleccionada,
            creadoEn: new Date()
        });

        // --- CONFIGURACIÓN DE NOTIFICACIÓN A WHATSAPP ---
        // Reemplaza con el número real de la dueña (código de país + número, ej: 52133...)
        const numeroDuenia = "523311550203"; 

        const mensajeWA = `Hola Caroez, acabo de agendar una cita en la web:%0A- *Nombre:* ${encodeURIComponent(nombreCliente)}%0A- *Teléfono:* ${encodeURIComponent(telefonoCliente)}%0A- *Servicio:* ${encodeURIComponent(servicioValor)}%0A- *Fecha:* ${encodeURIComponent(fechaSeleccionada)}%0A- *Hora:* ${encodeURIComponent(horaSeleccionada)}`;
        
        const urlWhatsApp = `https://wa.me/${numeroDuenia}?text=${mensajeWA}`;

        // Mostrar éxito y botón para notificar por WhatsApp
        statusText.innerHTML = `
            <p style="color: #6b705c; margin-bottom: 12px; font-weight: 600;">¡Cita registrada con éxito!</p>
            <a href="${urlWhatsApp}" target="_blank" class="btn-confirmar" style="display: inline-block; text-decoration: none; text-align: center; padding: 12px 20px; font-size: 14px; background-color: #25D366; color: #ffffff;">
                Notificar cita por WhatsApp 📲
            </a>
        `;

        // Limpiamos el formulario y selecciones
        form.reset();
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
        if(servicioCliente) servicioCliente.value = "";
        document.getElementById('hora').innerHTML = '<option value="">Primero selecciona una fecha</option>';

    } catch (error) {
        console.error("Error al agendar:", error);
        statusText.innerText = "Hubo un error al guardar. Intenta de nuevo.";
        statusText.style.color = "#d9534f";
    }
});