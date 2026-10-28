// --- Lógica de Modo Oscuro para Caroez ---
const toggleBtn = document.getElementById('darkModeToggle');
const body = document.body;

// Revisar si el usuario ya había activado el modo oscuro en su visita anterior
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Guardar la preferencia en el navegador
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}