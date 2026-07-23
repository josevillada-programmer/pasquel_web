document.addEventListener("DOMContentLoaded", () => {
  cargarVacantes();
  verificarSesionUI();

  // Escuchar el envío del formulario de nueva vacante (Solo para admins)
  const formVacante = document.getElementById("form-nueva-vacante");
  if (formVacante) {
    formVacante.addEventListener("submit", (e) => {
      e.preventDefault();
      publicarVacanteEnBD();
    });
  }
});

// 1. Consultar las vacantes de la Base de Datos para mostrarlas en la página
function cargarVacantes() {
  const contenedor = document.getElementById("contenedor-vacantes");
  if (!contenedor) return;

  fetch('https://pasquel-web.onrender.com/api/vacantes')
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        contenedor.innerHTML = '<p class="w3-center">No hay vacantes disponibles en este momento.</p>';
        return;
      }
      
      let html = '';
      data.forEach(vacante => {
        html += `
          <div class="w3-col l4 m6 w3-margin-bottom">
            <div class="w3-card w3-white" style="padding: 24px; height: 100%;">
              <h3>${vacante.titulo}</h3>
              <p class="w3-opacity"><i class="fa fa-map-marker"></i> ${vacante.ubicacion}</p>
              <p>${vacante.descripcion}</p>
              <button class="w3-button w3-black w3-block" onclick="aplicar('${vacante.titulo}')">Postularme</button>
            </div>
          </div>
        `;
      });
      contenedor.innerHTML = html;
    })
    .catch(err => console.error("Error al cargar vacantes de la BD:", err));
}

// 2. Enviar la nueva vacante al Backend para que la guarde en la Base de Datos
function publicarVacanteEnBD() {
  const titulo = document.getElementById("admin-titulo").value;
  const ubicacion = document.getElementById("admin-ubicacion").value;
  const descripcion = document.getElementById("admin-descripcion").value;
  const sesion = JSON.parse(localStorage.getItem("usuario_sesion"));

  if (!sesion || sesion.rol !== "admin") {
    alert("Acción no autorizada. Solo cuentas corporativas pueden publicar.");
    return;
  }

  // Petición POST hacia tu API de Node.js con la URL completa
  fetch('https://pasquel-web.onrender.com/api/vacantes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      titulo, 
      ubicacion, 
      descripcion, 
      emailAdmin: sesion.email 
    })
  })
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      alert("¡Vacante guardada y publicada en la base de datos con éxito!");
      document.getElementById("form-nueva-vacante").reset();
      cargarVacantes(); // Actualiza la lista en tiempo real sin recargar la página
    } else {
      alert("Error al guardar en la BD: " + response.message);
    }
  })
  .catch(err => {
    console.error("Error de red al publicar:", err);
    alert("No se pudo conectar con el servidor.");
  });
}

// 3. Verificar la sesión activa para el botón superior y el panel admin
function verificarSesionUI() {
  const sesion = localStorage.getItem("usuario_sesion");
  const btnAuthNav = document.getElementById("btn-auth-nav");
  const panelAdmin = document.getElementById("admin-panel-container");

  if (sesion) {
    const user = JSON.parse(sesion);
    if (btnAuthNav) {
      btnAuthNav.innerHTML = `<i class="fa fa-user"></i> ${user.email} (SALIR)`;
      btnAuthNav.href = "#";
      btnAuthNav.style.backgroundColor = "#444";
      btnAuthNav.onclick = (e) => {
        e.preventDefault();
        if(confirm("¿Deseas cerrar sesión?")) {
          localStorage.removeItem("usuario_sesion");
          location.reload();
        }
      };
    }
    if (user.rol === "admin" && panelAdmin) {
      panelAdmin.style.display = "block";
    }
  }
}

// 4. Abrir el modal profesional de postulación
function aplicar(puesto) {
  document.getElementById("modal-titulo-puesto").innerText = "Postulación: " + puesto;
  document.getElementById("post-puesto").value = puesto;
  document.getElementById("modal-postulacion").style.display = "block";
}

function cerrarModalPostulacion() {
  document.getElementById("modal-postulacion").style.display = "none";
  document.getElementById("form-postularse").reset();
}

// 5. Enviar el formulario del modal (BD Local + FormSubmit)
function enviarPostulacionForm(e) {
  e.preventDefault();

  const puesto = document.getElementById("post-puesto").value;
  const nombre = document.getElementById("post-nombre").value;
  const email = document.getElementById("post-email").value;
  const telefono = document.getElementById("post-telefono").value;
  const fileInput = document.getElementById("post-cv");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor adjunta tu CV.");
    return;
  }

  alert("Enviando postulación, por favor espera...");

  // 1. Guardar en tu base de datos local (MySQL/Docker)
  const formDataBD = new FormData();
  formDataBD.append('vacante', puesto);
  formDataBD.append('nombre', nombre);
  formDataBD.append('email', email);
  formDataBD.append('telefono', telefono);
  formDataBD.append('cv', file);

  fetch('https://pasquel-web.onrender.com/api/postulaciones', {
    method: 'POST',
    body: formDataBD
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log("Guardado en BD con éxito");
    }
  })
  .catch(err => console.error("Error al guardar en BD local:", err));

  // 2. Enviar el correo usando FormSubmit hacia tu correo corporativo
  const formDataFormSubmit = new FormData();
  formDataFormSubmit.append('Vacante', puesto);
  formDataFormSubmit.append('Nombre Aspirante', nombre);
  formDataFormSubmit.append('Correo', email);
  formDataFormSubmit.append('Teléfono', telefono);
  formDataFormSubmit.append('CV (Archivo)', file);
  formDataFormSubmit.append('_subject', `Nueva Postulación: ${puesto} - ${nombre}`);
  formDataFormSubmit.append('_template', 'table');
  formDataFormSubmit.append('_captcha', 'false');

  fetch('https://formsubmit.co/jvillada@pasquelhermanos.com.mx', {
    method: 'POST',
    body: formDataFormSubmit
  })
  .then(response => {
    if (response.ok) {
      alert("¡Postulación enviada con éxito! Tus datos se registraron y se notificó.");
      cerrarModalPostulacion();
    } else {
      alert("Hubo un detalle al enviar la notificación por correo, pero tus datos principales fueron procesados.");
    }
  })
  .catch(err => {
    console.error("Error con FormSubmit:", err);
    alert("Error de red al enviar el correo.");
  });
}