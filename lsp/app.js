"use strict";

const BASE_ORIGINAL = "https://gabriel-lsp.github.io/banco-digital-lsp/";
const BASE_BDA = "https://gabriel-lsp.github.io/banco-digital-accesible/lsp/";
const RUTAS = [
  { url: BASE_ORIGINAL + "datos/diccionario_lsp.json", base: BASE_ORIGINAL },
  { url: "datos/diccionario_lsp.json", base: BASE_BDA },
  { url: BASE_BDA + "datos/diccionario_lsp.json", base: BASE_BDA }
];

const $ = (selector) => document.querySelector(selector);
const limpiarTexto = (texto) => String(texto || "").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
const nombrar = (texto) => String(texto || "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (letra) => letra.toLocaleUpperCase("es"));

const elementos = {
  busqueda: $("#busqueda"),
  categoria: $("#categoria"),
  contador: $("#contador"),
  mostrando: $("#mostrando"),
  estado: $("#estado"),
  galeria: $("#galeria"),
  cargarMas: $("#cargar-mas"),
  limpiar: $("#limpiar"),
  plantilla: $("#plantilla-tarjeta")
};

let banco = [];
let resultados = [];
let baseImagenes = BASE_ORIGINAL;
let visibles = 8;

function rutaImagen(ruta) {
  const limpia = String(ruta || "").trim();
  if (!limpia) return "";
  if (/^https?:\/\//i.test(limpia)) return limpia;
  return baseImagenes + limpia.replace(/^\.\//, "");
}

function cargarCategorias() {
  const categorias = [...new Set(banco.map((item) => item.categoria).filter(Boolean))].sort((a, b) => nombrar(a).localeCompare(nombrar(b), "es"));
  elementos.categoria.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = nombrar(categoria);
    elementos.categoria.appendChild(opcion);
  });
}

function filtrar() {
  const consulta = limpiarTexto(elementos.busqueda.value);
  const categoria = elementos.categoria.value;
  resultados = banco.filter((item) => {
    const texto = limpiarTexto(`${item.palabra || ""} ${item.categoria || ""} ${item.descripcion || ""}`);
    const coincideTexto = !consulta || texto.includes(consulta);
    const coincideCategoria = !categoria || item.categoria === categoria;
    return coincideTexto && coincideCategoria;
  }).sort((a, b) => String(a.palabra || "").localeCompare(String(b.palabra || ""), "es"));
}

function crearTarjeta(item) {
  const tarjeta = elementos.plantilla.content.firstElementChild.cloneNode(true);
  const imagen = tarjeta.querySelector(".imagen-sena");
  const categoria = tarjeta.querySelector(".categoria-tarjeta");
  const palabra = tarjeta.querySelector(".palabra-tarjeta");
  const descripcion = tarjeta.querySelector(".descripcion-tarjeta");
  const fuente = tarjeta.querySelector(".fuente-tarjeta");

  imagen.src = rutaImagen(item.archivo_imagen);
  imagen.alt = item.palabra ? `Representación visual de ${item.palabra} en Lengua de Señas Peruana` : "Representación visual en Lengua de Señas Peruana";
  imagen.onerror = () => {
    imagen.removeAttribute("src");
    imagen.alt = "Imagen de seña no disponible";
  };

  categoria.textContent = nombrar(item.categoria);
  palabra.textContent = item.palabra || "Contenido sin título";

  if (item.descripcion) {
    descripcion.textContent = item.descripcion;
    descripcion.hidden = false;
  }

  if (item.fuente) {
    fuente.textContent = item.fuente;
    fuente.hidden = false;
  }

  return tarjeta;
}

function renderizar() {
  filtrar();
  elementos.galeria.innerHTML = "";
  const total = resultados.length;
  const lista = resultados.slice(0, visibles);

  if (!total) {
    elementos.estado.hidden = false;
    elementos.estado.textContent = "No se encontraron señas con los criterios indicados.";
    elementos.contador.textContent = "Sin resultados";
    elementos.mostrando.textContent = "";
    elementos.cargarMas.hidden = true;
    return;
  }

  elementos.estado.hidden = true;
  const fragmento = document.createDocumentFragment();
  lista.forEach((item) => fragmento.appendChild(crearTarjeta(item)));
  elementos.galeria.appendChild(fragmento);

  elementos.contador.textContent = total === 1 ? "1 seña encontrada" : `${total} señas encontradas`;
  elementos.mostrando.textContent = `Mostrando ${lista.length} de ${total}`;
  elementos.cargarMas.hidden = lista.length >= total;
}

async function cargarDatos() {
  let errorFinal = null;
  elementos.estado.hidden = false;
  elementos.estado.textContent = "Preparando el banco de señas…";

  for (const ruta of RUTAS) {
    try {
      const respuesta = await fetch(ruta.url, { cache: "no-store" });
      if (!respuesta.ok) throw new Error("No disponible");
      const datos = await respuesta.json();
      if (!Array.isArray(datos)) throw new Error("Formato no válido");
      banco = datos;
      baseImagenes = ruta.base;
      cargarCategorias();
      renderizar();
      return;
    } catch (error) {
      errorFinal = error;
    }
  }

  console.error(errorFinal);
  elementos.estado.hidden = false;
  elementos.estado.textContent = "No fue posible cargar el banco original. Se requiere que el repositorio LSP original esté accesible o migrar sus datos e imágenes reales dentro de BDA.";
  elementos.contador.textContent = "Datos no disponibles";
  elementos.mostrando.textContent = "";
  elementos.cargarMas.hidden = true;
}

elementos.busqueda.addEventListener("input", () => { visibles = 8; renderizar(); });
elementos.categoria.addEventListener("change", () => { visibles = 8; renderizar(); });
elementos.limpiar.addEventListener("click", () => { elementos.busqueda.value = ""; elementos.categoria.value = ""; visibles = 8; renderizar(); elementos.busqueda.focus(); });
elementos.cargarMas.addEventListener("click", () => { visibles += 8; renderizar(); });

cargarDatos();
