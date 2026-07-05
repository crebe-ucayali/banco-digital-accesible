"use strict";

(function(){
  const CLAVE_CONTRASTE = "bda-accesibilidad-contraste";
  const CLAVE_TEXTO = "bda-accesibilidad-texto-grande";

  const pasosBase = [
    {
      selector:".navegacion",
      titulo:"Navegación principal",
      texto:"En esta zona puedes regresar al Banco Digital Accesible, volver al inicio principal o abrir el contacto institucional."
    },
    {
      selector:".portada",
      titulo:"Portada del módulo",
      texto:"Aquí se presenta la identidad del recurso y una breve descripción de su finalidad educativa."
    },
    {
      selector:".hero-busqueda, .panel-busqueda, .panel-biblioteca",
      titulo:"Área de consulta",
      texto:"Este bloque reúne las opciones principales de búsqueda, filtros, accesos o presentación del contenido disponible."
    },
    {
      selector:".grid-materiales, .galeria, .lista-tarjetas, .lista-recursos, #lista-biblioteca, #lista-gutendex",
      titulo:"Resultados o tarjetas",
      texto:"En esta sección aparecen los módulos, recursos, señas, signos, libros o resultados que puedes revisar."
    },
    {
      selector:".footer-crebe",
      titulo:"Pie de página institucional",
      texto:"Al final encontrarás enlaces relacionados, contacto y reconocimiento de autoría del desarrollo original."
    }
  ];

  let panel = null;
  let botonAbrir = null;
  let resaltado = null;
  let cajaGuia = null;
  let pasosActivos = [];
  let indicePaso = 0;

  document.addEventListener("DOMContentLoaded", iniciarAccesibilidad);

  function iniciarAccesibilidad(){
    document.documentElement.classList.add("js-activo");
    aplicarPreferenciasGuardadas();
    crearPanelAccesibilidad();
    prepararEventosGlobales();
  }

  function aplicarPreferenciasGuardadas(){
    if(localStorage.getItem(CLAVE_CONTRASTE) === "true"){
      document.body.classList.add("modo-contraste");
    }

    if(localStorage.getItem(CLAVE_TEXTO) === "true"){
      document.documentElement.classList.add("texto-grande");
    }
  }

  function crearPanelAccesibilidad(){
    const contenedor = document.createElement("div");
    contenedor.className = "control-accesibilidad";
    contenedor.setAttribute("aria-label","Opciones de accesibilidad");

    botonAbrir = document.createElement("button");
    botonAbrir.className = "boton-accesibilidad";
    botonAbrir.type = "button";
    botonAbrir.setAttribute("aria-expanded","false");
    botonAbrir.setAttribute("aria-controls","panel-accesibilidad-bda");
    botonAbrir.textContent = "Accesibilidad";

    panel = document.createElement("section");
    panel.id = "panel-accesibilidad-bda";
    panel.className = "panel-accesibilidad";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby","titulo-panel-accesibilidad-bda");

    panel.innerHTML = `
      <h2 id="titulo-panel-accesibilidad-bda">Opciones de accesibilidad</h2>
      <p>Activa apoyos visuales para navegar con mayor comodidad.</p>
      <div class="opciones-accesibilidad">
        <button class="opcion-accesibilidad" type="button" data-accion="contraste" aria-pressed="false">Alto contraste</button>
        <button class="opcion-accesibilidad" type="button" data-accion="texto" aria-pressed="false">Aumentar texto</button>
        <button class="opcion-accesibilidad" type="button" data-accion="recorrido">Iniciar recorrido</button>
        <button class="opcion-accesibilidad" type="button" data-accion="restablecer">Restablecer</button>
      </div>
    `;

    contenedor.appendChild(panel);
    contenedor.appendChild(botonAbrir);
    document.body.appendChild(contenedor);

    actualizarEstadoBotones();

    botonAbrir.addEventListener("click", () => {
      const abierto = panel.hidden;
      panel.hidden = !abierto;
      botonAbrir.setAttribute("aria-expanded", String(abierto));
    });

    panel.addEventListener("click", (evento) => {
      const boton = evento.target.closest("button[data-accion]");
      if(!boton) return;

      const accion = boton.dataset.accion;
      if(accion === "contraste") alternarContraste();
      if(accion === "texto") alternarTexto();
      if(accion === "recorrido") iniciarRecorrido();
      if(accion === "restablecer") restablecerAccesibilidad();
    });
  }

  function alternarContraste(){
    document.body.classList.toggle("modo-contraste");
    localStorage.setItem(CLAVE_CONTRASTE, String(document.body.classList.contains("modo-contraste")));
    actualizarEstadoBotones();
  }

  function alternarTexto(){
    document.documentElement.classList.toggle("texto-grande");
    localStorage.setItem(CLAVE_TEXTO, String(document.documentElement.classList.contains("texto-grande")));
    actualizarEstadoBotones();
  }

  function restablecerAccesibilidad(){
    document.body.classList.remove("modo-contraste");
    document.documentElement.classList.remove("texto-grande");
    localStorage.removeItem(CLAVE_CONTRASTE);
    localStorage.removeItem(CLAVE_TEXTO);
    cerrarRecorrido();
    actualizarEstadoBotones();
  }

  function actualizarEstadoBotones(){
    const botonContraste = panel?.querySelector('[data-accion="contraste"]');
    const botonTexto = panel?.querySelector('[data-accion="texto"]');

    if(botonContraste){
      botonContraste.setAttribute("aria-pressed", String(document.body.classList.contains("modo-contraste")));
    }

    if(botonTexto){
      botonTexto.setAttribute("aria-pressed", String(document.documentElement.classList.contains("texto-grande")));
    }
  }

  function obtenerPasos(){
    const pasos = [];

    pasosBase.forEach((paso) => {
      const elemento = document.querySelector(paso.selector);
      if(elemento && elemento.offsetParent !== null){
        pasos.push({...paso, elemento});
      }
    });

    const personalizados = Array.from(document.querySelectorAll("[data-guia-titulo], [data-guia-texto]"));
    personalizados.forEach((elemento) => {
      if(elemento.offsetParent === null) return;
      if(pasos.some((paso) => paso.elemento === elemento)) return;
      pasos.push({
        elemento,
        titulo:elemento.dataset.guiaTitulo || "Sección de la página",
        texto:elemento.dataset.guiaTexto || "Revisa este bloque para conocer mejor el contenido disponible."
      });
    });

    return pasos;
  }

  function iniciarRecorrido(){
    pasosActivos = obtenerPasos();
    if(!pasosActivos.length) return;

    panel.hidden = true;
    botonAbrir.setAttribute("aria-expanded","false");
    indicePaso = 0;
    crearElementosGuia();
    mostrarPaso();
  }

  function crearElementosGuia(){
    cerrarRecorrido();

    resaltado = document.createElement("div");
    resaltado.className = "guia-resaltado";
    resaltado.setAttribute("aria-hidden","true");

    cajaGuia = document.createElement("section");
    cajaGuia.className = "caja-guia";
    cajaGuia.setAttribute("role","dialog");
    cajaGuia.setAttribute("aria-modal","true");
    cajaGuia.setAttribute("aria-live","polite");

    document.body.appendChild(resaltado);
    document.body.appendChild(cajaGuia);
  }

  function mostrarPaso(){
    const paso = pasosActivos[indicePaso];
    if(!paso || !resaltado || !cajaGuia) return;

    paso.elemento.scrollIntoView({behavior:"smooth", block:"center", inline:"nearest"});

    window.setTimeout(() => {
      posicionarResaltado(paso.elemento);
      posicionarCaja(paso.elemento);
    }, 220);

    cajaGuia.innerHTML = `
      <p class="guia-progreso">Paso ${indicePaso + 1} de ${pasosActivos.length}</p>
      <h2>${escaparHtml(paso.titulo)}</h2>
      <p>${escaparHtml(paso.texto)}</p>
      <div class="controles-guia">
        <button type="button" data-tour="anterior" ${indicePaso === 0 ? "disabled" : ""}>Anterior</button>
        <button type="button" data-tour="cerrar">Cerrar</button>
        <button type="button" data-tour="siguiente">${indicePaso === pasosActivos.length - 1 ? "Finalizar" : "Siguiente"}</button>
      </div>
    `;

    cajaGuia.querySelector('[data-tour="siguiente"]')?.focus({preventScroll:true});
  }

  function posicionarResaltado(elemento){
    const rect = elemento.getBoundingClientRect();
    const margen = 8;

    resaltado.style.top = `${Math.max(rect.top - margen, 8)}px`;
    resaltado.style.left = `${Math.max(rect.left - margen, 8)}px`;
    resaltado.style.width = `${Math.min(rect.width + margen * 2, window.innerWidth - 16)}px`;
    resaltado.style.height = `${Math.min(rect.height + margen * 2, window.innerHeight - 16)}px`;
  }

  function posicionarCaja(elemento){
    const rect = elemento.getBoundingClientRect();
    const espacio = 14;
    const ancho = Math.min(360, window.innerWidth - 32);
    const altoEstimado = 220;

    let top = rect.bottom + espacio;
    let left = Math.min(Math.max(rect.left, 16), window.innerWidth - ancho - 16);

    if(top + altoEstimado > window.innerHeight){
      top = Math.max(16, rect.top - altoEstimado - espacio);
    }

    cajaGuia.style.top = `${top}px`;
    cajaGuia.style.left = `${left}px`;
  }

  function avanzarPaso(){
    if(indicePaso >= pasosActivos.length - 1){
      cerrarRecorrido();
      return;
    }
    indicePaso += 1;
    mostrarPaso();
  }

  function retrocederPaso(){
    if(indicePaso <= 0) return;
    indicePaso -= 1;
    mostrarPaso();
  }

  function cerrarRecorrido(){
    resaltado?.remove();
    cajaGuia?.remove();
    resaltado = null;
    cajaGuia = null;
  }

  function prepararEventosGlobales(){
    document.addEventListener("click", (evento) => {
      const boton = evento.target.closest("button[data-tour]");
      if(!boton) return;

      const accion = boton.dataset.tour;
      if(accion === "anterior") retrocederPaso();
      if(accion === "siguiente") avanzarPaso();
      if(accion === "cerrar") cerrarRecorrido();
    });

    document.addEventListener("keydown", (evento) => {
      if(!cajaGuia) return;
      if(evento.key === "Escape") cerrarRecorrido();
      if(evento.key === "ArrowRight") avanzarPaso();
      if(evento.key === "ArrowLeft") retrocederPaso();
    });

    window.addEventListener("resize", reposicionarGuia);
    window.addEventListener("scroll", reposicionarGuia, {passive:true});
  }

  function reposicionarGuia(){
    if(!cajaGuia || !resaltado || !pasosActivos[indicePaso]) return;
    const elemento = pasosActivos[indicePaso].elemento;
    posicionarResaltado(elemento);
    posicionarCaja(elemento);
  }

  function escaparHtml(texto){
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }
})();
