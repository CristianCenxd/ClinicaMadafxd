document.addEventListener('DOMContentLoaded', () => {
    // Vistas
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const appView = document.getElementById('app-view');

    // Formularios
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Botones y Enlaces
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logoutBtn');
    const testMedicoBtn = document.getElementById('testMedico');
    const testPacienteBtn = document.getElementById('testPaciente');
    const testCajeroBtn = document.getElementById('testCajero');
    const testFarmaceuticoBtn = document.getElementById('testFarmaceutico');
    const testAdminBtn = document.getElementById('testAdmin');
    
    // --- NUEVOS ELEMENTOS DEL MODAL ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close');

    const API_URL = 'http://localhost:3000/api';

    // --- LÓGICA DEL MODAL ---
    const showModal = (title, message, isError = false) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalTitle.className = isError ? 'error' : 'success';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- NAVEGACIÓN ENTRE VISTAS ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        appView.classList.add('hidden');
        loginView.classList.remove('hidden');
        showModal('Sesión Cerrada', 'Has cerrado sesión exitosamente. ¡Vuelve pronto!');
    });

    // --- LÓGICA DE LA APLICACIÓN ---

    const showAppView = () => {
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        appView.classList.remove('hidden');
    };

    // Registrar usuario
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            nombre: document.getElementById('registerNombre').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            rol: document.getElementById('registerRol').value
        };

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw data;
            
            showModal('¡Registro Exitoso!', 'Tu cuenta ha sido creada. Ahora, por favor, inicia sesión.');
            registerView.classList.add('hidden');
            loginView.classList.remove('hidden');

        } catch (error) {
            showModal('Error en el Registro', error.message || 'Ocurrió un problema.', true);
        }
    });

    // Iniciar sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw data;

            localStorage.setItem('token', data.token);
            showModal('¡Bienvenido!', 'Has iniciado sesión correctamente.');
            showAppView();
        } catch (error) {
            showModal('Error de Autenticación', error.message || 'Credenciales incorrectas.', true);
        }
    });

    // Probar ruta protegida
    const testProtectedRoute = async (endpoint) => {
        const token = localStorage.getItem('token');
        if (!token) {
            showModal('Acceso Denegado', 'No hay un token guardado. Por favor, inicia sesión primero.', true);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/test/${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw data;

            showModal('Acceso Concedido', data.message);
        } catch (error) {
            showModal('Acceso Denegado', error.message || 'No tienes permiso para ver este recurso.', true);
        }
    };

    testMedicoBtn.addEventListener('click', () => testProtectedRoute('medico'));
    testPacienteBtn.addEventListener('click', () => testProtectedRoute('paciente'));
    testCajeroBtn.addEventListener('click', () => testProtectedRoute('cajero'));
    testFarmaceuticoBtn.addEventListener('click', () => testProtectedRoute('farmaceutico'));
    testAdminBtn.addEventListener('click', () => testProtectedRoute('admin'));

    // Comprobar si ya existe un token al cargar la página
    const token = localStorage.getItem('token');
    if (token) {
        showAppView();
    }
});