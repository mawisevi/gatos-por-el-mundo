<template>
  <footer class="footer-color text-white pt-5 pb-3">
    <div class="container">
      <div class="row">
        <!-- Columna Descripción -->
        <div class="col-md-5 mb-4">
          <h3 class="h4 mb-3">GATOS POR EL MUNDO</h3>
          <p class="text-light opacity-75">Descubre las características únicas de cada raza felina y encuentra tu compañero perfecto.</p>
        </div>

        <!-- Columna Enlaces -->
        <div class="col-md-2 mb-4">
          <h4 class="h5 mb-3">ENLACES</h4>
          <ul class="list-unstyled">
            <li class="mb-2"><router-link class="text-light text-decoration-none" to="/home">Inicio</router-link></li>
            <li class="mb-2"><router-link href="#" class="text-light text-decoration-none" to="/gatos">Gatos</router-link></li>
            <li class="mb-2"><router-link href="#" class="text-light text-decoration-none" to="/favoritos">Favoritos</router-link></li>
          </ul>
        </div>

        <!-- Columna Contacto -->
        <div class="col-md-3 mb-4">
          <h4 class="h5 mb-3">CONTACTO</h4>
          <ul class="list-unstyled text-light">
            <li class="mb-2">
              <i class="fas fa-envelope me-2"></i> info@razasdegatos.com
            </li>
            <li class="mb-2">
              <i class="fas fa-phone me-2"></i> +34 123 456 789
            </li>
          </ul>
        </div>

        <!-- Columna Newsletter -->
        <div class="col-md-2 mb-4">
          <h4 class="h5 mb-3">NEWSLETTER</h4>
          <div class="input-group">
            <input type="email" class="form-control form-control-sm" placeholder="Escribe tu email...">
            <button class="btn btn-sm btn-light" type="button">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <hr class="my-4 bg-light opacity-25">

      <div class="row align-items-center">
        <div class="col-md-6 mb-3 mb-md-0">
          <p class="mb-0 small">&copy; 2025 Gatos por el Mundo. Todos los derechos reservados.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <a href="#" class="text-light me-3"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="text-light me-3"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-light"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer-color {
  background-color: #6b4396; /* Color morado de tu diseño */
}

footer {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
}

footer a {
  transition: opacity 0.3s;
}

footer a:hover {
  opacity: 0.8;
}

.input-group {
  max-width: 250px;
}

.form-control {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.btn-light {
  background-color: white;
  color: #9E78D2;
}
</style>