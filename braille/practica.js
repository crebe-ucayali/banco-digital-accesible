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

const abecedarioBraille = [
  { letra: "A", braille: "⠁" },
  { letra: "B", braille: "⠃" },
  { letra: "C", braille: "⠉" },
  { letra: "D", braille: "⠙" },
  { letra: "E", braille: "⠑" },
  { letra: "F", braille: "⠋" },
  { letra: "G", braille: "⠛" },
  { letra: "H", braille: "⠓" },
  { letra: "I", braille: "⠊" },
  { letra: "J", braille: "⠚" },
  { letra: "K", braille: "⠅" },
  { letra: "L", braille: "⠇" },
  { letra: "M", braille: "⠍" },
  { letra: "N", braille: "⠝" },
  { letra: "Ñ", braille: "⠻" },
  { letra: "O", braille: "⠕" },
  { letra: "P", braille: "⠏" },
  { letra: "Q", braille: "⠟" },
  { letra: "R", braille: "⠗" },
  { letra: "S", braille: "⠎" },
  { letra: "T", braille: "⠞" },
  { letra: "U", braille: "⠥" },
  { letra: "V", braille: "⠧" },
  { letra: "W", braille: "⠺" },
  { letra: "X", braille: "⠭" },
  { letra: "Y", braille: "⠽" },
  { letra: "Z", braille: "⠵" }
];

const respuestasCorrectas = {};
const cantidadPreguntas = 5;
let constanciaHabilitada = false;

function mezclarElementos(elementos) {
  const lista = [...elementos];

  for (let indice = lista.length - 1; indice > 0; indice -= 1) {
    const posicionAleatoria = Math.floor(Math.random() * (indice + 1));
    [lista[indice], lista[posicionAleatoria]] = [lista[posicionAleatoria], lista[indice]];
  }

  return lista;
}

function crearOpcion(nombrePregunta, simbolo) {
  const etiqueta = document.createElement("label");
  etiqueta.className = "opcion-practica";

  const entrada = document.createElement("input");
  entrada.type = "radio";
  entrada.name = nombrePregunta;
  entrada.value = simbolo;

  const texto = document.createElement("span");
  texto.textContent = simbolo;

  etiqueta.append(entrada, texto);
  return etiqueta;
}

function generarPracticaAleatoria() {
  if (!formularioPractica) return;

  const contenedorPreguntas = formularioPractica.querySelector(".lista-preguntas");
  if (!contenedorPreguntas) return;

  Object.keys(respuestasCorrectas).forEach((clave) => delete respuestasCorrectas[clave]);

  const leyendaGeneral = contenedorPreguntas.querySelector(":scope > legend");
  contenedorPreguntas.querySelectorAll(":scope > .pregunta-practica").forEach((pregunta) => pregunta.remove());

  const letrasSeleccionadas = mezclarElementos(abecedarioBraille).slice(0, cantidadPreguntas);

  letrasSeleccionadas.forEach((elemento, indice) => {
    const nombrePregunta = `pregunta${indice + 1}`;
    respuestasCorrectas[nombrePregunta] = elemento.braille;

    const distractores = mezclarElementos(
      abecedarioBraille.filter((item) => item.letra !== elemento.letra)
    ).slice(0, 2);

    const alternativas = mezclarElementos([elemento, ...distractores]);

    const pregunta = document.createElement("fieldset");
    pregunta.className = "pregunta-practica";

    const leyenda = document.createElement("legend");
    leyenda.textContent = `${indice + 1}. ¿Cuál es la representación Braille de la letra ${elemento.letra}?`;

    const opciones = document.createElement("div");
    opciones.className = "opciones-practica";

    alternativas.forEach((alternativa) => {
      opciones.appendChild(crearOpcion(nombrePregunta, alternativa.braille));
    });

    pregunta.append(leyenda, opciones);
    contenedorPreguntas.appendChild(pregunta);
  });

  if (leyendaGeneral) {
    leyendaGeneral.textContent = "Cinco ejercicios aleatorios de reconocimiento Braille";
  }
}

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
  const totalPreguntas = Object.keys(respuestasCorrectas).length;
  const porcentaje = Math.round((aciertos / totalPreguntas) * 100);

  if (porcentaje === 100) {
    constanciaHabilitada = true;
    completarConstancia(nombre);
    botonConstancia.hidden = false;
    mostrarResultado(
      `¡Excelente! Lograste ${totalPreguntas} de ${totalPreguntas} respuestas correctas (100 %). Se habilitó tu constancia simbólica de participación.`,
      "exito"
    );
    botonConstancia.focus();
    return;
  }

  constanciaHabilitada = false;
  botonConstancia.hidden = true;
  mostrarResultado(
    `Obtuviste ${aciertos} de ${totalPreguntas} respuestas correctas (${porcentaje} %). Revisa el banco Braille e inténtalo nuevamente. La constancia se habilita únicamente con 100 %.`,
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
  generarPracticaAleatoria();
}

if (formularioPractica) {
  generarPracticaAleatoria();
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
