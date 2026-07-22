"use strict";

const formularioPractica = document.querySelector("#formulario-practica");
const resultadoPractica = document.querySelector("#resultado-practica");
const botonConstancia = document.querySelector("#ver-constancia");
const dialogoConstancia = document.querySelector("#constancia-dialogo");
const cerrarConstancia = document.querySelector("#cerrar-constancia");
const imprimirConstancia = document.querySelector("#imprimir-constancia");
const nombreConstancia = document.querySelector("#constancia-nombre");
const fechaConstancia = document.querySelector("#constancia-fecha");
const codigoConstancia = document.querySelector("#constancia-codigo");

const respuestasCorrectas = {
  pregunta1: "⠁",
  pregunta2: "⠉",
  pregunta3: "⠑",
  pregunta4: "⠇",
  pregunta5: "⠏"
};

let constanciaHabilitada = false;

function limpiarNombre(nombre) {
  return String(nombre || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function crearCodigoConstancia(nombre) {
  const fecha = new Date();
  const base = limpiarNombre(nombre)
    .toLocaleUpperCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5)
    .padEnd(5, "X");
  const fechaCompacta = [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0")
  ].join("");
  const aleatorio = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EVA-BRL-${fechaCompacta}-${base}-${aleatorio}`;
}

function mostrarResultado(mensaje, tipo) {
  resultadoPractica.hidden = false;
  resultadoPractica.className = `resultado-practica ${tipo}`;
  resultadoPractica.textContent = mensaje;
  resultadoPractica.focus();
}

function completarConstancia(nombre) {
  const fecha = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());

  nombreConstancia.textContent = nombre;
  fechaConstancia.textContent = fecha;
  codigoConstancia.textContent = crearCodigoConstancia(nombre);
}

function evaluarPractica(evento) {
  evento.preventDefault();

  const datos = new FormData(formularioPractica);
  const nombre = limpiarNombre(datos.get("nombreParticipante"));

  if (!nombre) {
    mostrarResultado("Escribe el nombre del participante antes de revisar la práctica.", "reintento");
    document.querySelector("#nombre-participante").focus();
    return;
  }

  const preguntasSinResponder = Object.keys(respuestasCorrectas).filter(
    (pregunta) => !datos.get(pregunta)
  );

  if (preguntasSinResponder.length > 0) {
    mostrarResultado(
      `Falta responder ${preguntasSinResponder.length === 1 ? "1 ejercicio" : `${preguntasSinResponder.length} ejercicios`}. Completa toda la práctica para obtener el resultado.`,
      "reintento"
    );
    return;
  }

  const aciertos = Object.entries(respuestasCorrectas).reduce(
    (total, [pregunta, respuesta]) => total + (datos.get(pregunta) === respuesta ? 1 : 0),
    0
  );
  const porcentaje = Math.round((aciertos / Object.keys(respuestasCorrectas).length) * 100);

  if (porcentaje === 100) {
    constanciaHabilitada = true;
    completarConstancia(nombre);
    botonConstancia.hidden = false;
    mostrarResultado(
      "¡Excelente! Lograste 5 de 5 respuestas correctas (100 %). Se habilitó tu constancia simbólica de participación.",
      "exito"
    );
    botonConstancia.focus();
    return;
  }

  constanciaHabilitada = false;
  botonConstancia.hidden = true;
  mostrarResultado(
    `Obtuviste ${aciertos} de 5 respuestas correctas (${porcentaje} %). Revisa el banco Braille e inténtalo nuevamente. La constancia se habilita únicamente con 100 %.`,
    "reintento"
  );
}

function abrirConstancia() {
  if (!constanciaHabilitada) return;

  if (typeof dialogoConstancia.showModal === "function") {
    dialogoConstancia.showModal();
  } else {
    dialogoConstancia.setAttribute("open", "");
  }
}

function cerrarDialogo() {
  if (typeof dialogoConstancia.close === "function") {
    dialogoConstancia.close();
  } else {
    dialogoConstancia.removeAttribute("open");
  }
}

function reiniciarPractica() {
  constanciaHabilitada = false;
  botonConstancia.hidden = true;
  resultadoPractica.hidden = true;
  resultadoPractica.className = "resultado-practica";
}

if (formularioPractica) {
  formularioPractica.addEventListener("submit", evaluarPractica);
  formularioPractica.addEventListener("reset", () => {
    window.setTimeout(reiniciarPractica, 0);
  });
}

if (botonConstancia) {
  botonConstancia.addEventListener("click", abrirConstancia);
}

if (cerrarConstancia) {
  cerrarConstancia.addEventListener("click", cerrarDialogo);
}

if (imprimirConstancia) {
  imprimirConstancia.addEventListener("click", () => window.print());
}

if (dialogoConstancia) {
  dialogoConstancia.addEventListener("click", (evento) => {
    if (evento.target === dialogoConstancia) cerrarDialogo();
  });
}
