const listaNoti = document.querySelector("#lista-noti");
const busquedaNoti = document.querySelector("#busqueda-noti");
const filtroCategoria = document.querySelector("#filtro-categoria");
const contadorNoti = document.querySelector("#contador-noti");

let publicaciones = [];

function normalizar(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function crearTarjeta(publicacion) {
  const articulo = document.createElement("article");
  articulo.className = "tarjeta-noti";

  const enlaceValido = publicacion.enlace && publicacion.enlace !== "#";

  articulo.innerHTML = `
    <div>
      <span class="etiqueta-noti">${publicacion.categoria}</span>
      <h3>${publicacion.titulo}</h3>
      <p>${publicacion.resumen}</p>
    </div>
    <div>
      <p class="fecha-noti">${publicacion.fecha}</p>
      ${enlaceValido ? `<a class="enlace-noti" href="${publicacion.enlace}">Ver recurso</a>` : ""}
    </div>
  `;

  return articulo;
}

function mostrarPublicaciones() {
  const textoBusqueda = normalizar(busquedaNoti.value.trim());
  const categoriaSeleccionada = filtroCategoria.value;

  const resultados = publicaciones.filter((publicacion) => {
    const coincideCategoria = categoriaSeleccionada === "todas" || publicacion.categoria === categoriaSeleccionada;
    const contenido = normalizar(`${publicacion.titulo} ${publicacion.categoria} ${publicacion.resumen}`);
    const coincideBusqueda = contenido.includes(textoBusqueda);

    return coincideCategoria && coincideBusqueda;
  });

  listaNoti.innerHTML = "";

  if (resultados.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "estado-vacio";
    vacio.textContent = "No se encontraron publicaciones con esos criterios.";
    listaNoti.appendChild(vacio);
  } else {
    resultados.forEach((publicacion) => {
      listaNoti.appendChild(crearTarjeta(publicacion));
    });
  }

  contadorNoti.textContent = `${resultados.length} publicación(es) encontrada(s).`;
}

function cargarCategorias() {
  const categorias = [...new Set(publicaciones.map((publicacion) => publicacion.categoria))].sort((a, b) => {
    return a.localeCompare(b, "es");
  });

  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    filtroCategoria.appendChild(opcion);
  });
}

async function iniciarNotiInclusivos() {
  try {
    const respuesta = await fetch("noticias.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar noticias.json");
    }

    publicaciones = await respuesta.json();
    cargarCategorias();
    mostrarPublicaciones();
  } catch (error) {
    listaNoti.innerHTML = `
      <p class="estado-vacio">
        No se pudieron cargar las publicaciones. Verifica que el archivo noticias.json esté disponible.
      </p>
    `;
    contadorNoti.textContent = "";
  }
}

busquedaNoti.addEventListener("input", mostrarPublicaciones);
filtroCategoria.addEventListener("change", mostrarPublicaciones);

iniciarNotiInclusivos();
