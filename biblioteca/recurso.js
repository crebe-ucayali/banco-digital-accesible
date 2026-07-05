const parametros = new URLSearchParams(window.location.search);
const recursoId = parametros.get('id');

const estadoFicha = document.getElementById('estado-ficha');
const contenedorFicha = document.getElementById('contenedor-ficha');
const tituloPortada = document.getElementById('titulo-portada-recurso');
const subtituloPortada = document.getElementById('subtitulo-portada-recurso');
const tipoFicha = document.getElementById('tipo-ficha-recurso');
const tituloFicha = document.getElementById('titulo-ficha-recurso');
const resumenFicha = document.getElementById('resumen-ficha-recurso');
const datosFicha = document.getElementById('datos-ficha-recurso');
const citaFicha = document.getElementById('cita-ficha-recurso');
const palabrasFicha = document.getElementById('palabras-ficha-recurso');
const estadoTextoFicha = document.getElementById('estado-texto-ficha');
const condicionTextoFicha = document.getElementById('condicion-texto-ficha');
const accionesFicha = document.getElementById('acciones-ficha-recurso');

function crearDato(nombre, valor){
  const caja = document.createElement('div');
  caja.className = 'ficha-dato';
  const etiqueta = document.createElement('span');
  etiqueta.textContent = nombre;
  const texto = document.createElement('p');
  texto.textContent = valor || 'Por definir';
  caja.append(etiqueta, texto);
  return caja;
}

function crearBoton(texto, href, clase = 'enlace-material'){
  const enlace = document.createElement('a');
  enlace.className = clase;
  enlace.href = href;
  enlace.textContent = texto;
  if(/^https?:\/\//.test(href)){
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
  }
  return enlace;
}

function mostrarFicha(recurso){
  document.title = `${recurso.titulo || 'Ficha de recurso'} | Biblioteca Digital Accesible`;
  tituloPortada.textContent = recurso.titulo || 'Ficha de recurso';
  subtituloPortada.textContent = recurso.descripcion || 'Consulta los datos completos del recurso seleccionado.';
  tipoFicha.textContent = recurso.subtipo || recurso.tipoEtiqueta || 'Recurso bibliográfico';
  tituloFicha.textContent = recurso.titulo || 'Recurso sin título';
  resumenFicha.textContent = recurso.resumen || recurso.descripcion || 'Este recurso todavía no cuenta con resumen ampliado.';

  datosFicha.innerHTML = '';
  datosFicha.append(
    crearDato('Autor / entidad', recurso.autor),
    crearDato('Año', recurso.anio),
    crearDato('Tipo', recurso.tipoEtiqueta),
    crearDato('Subtipo', recurso.subtipo),
    crearDato('Área', recurso.area),
    crearDato('Tema', recurso.tema),
    crearDato('Público', recurso.publico || recurso.nivel),
    crearDato('Idioma', recurso.idioma),
    crearDato('Fuente', recurso.fuente),
    crearDato('Repositorio', recurso.repositorio),
    crearDato('Formato', recurso.formato),
    crearDato('Licencia', recurso.licencia),
    crearDato('DOI', recurso.doi),
    crearDato('ISBN', recurso.isbn),
    crearDato('Fecha de publicación', recurso.fechaPublicacion || recurso.anio),
    crearDato('Fecha de revisión', recurso.fechaRevision)
  );

  citaFicha.textContent = recurso.cita ? `Cita sugerida: ${recurso.cita}` : 'Cita sugerida: pendiente de registro.';

  palabrasFicha.innerHTML = '';
  const palabras = Array.isArray(recurso.palabrasClave) ? recurso.palabrasClave : [];
  if(palabras.length){
    palabras.forEach((palabra) => {
      const item = document.createElement('span');
      item.className = 'ficha-palabra';
      item.textContent = palabra;
      palabrasFicha.appendChild(item);
    });
  }else{
    const item = document.createElement('span');
    item.className = 'ficha-palabra';
    item.textContent = 'Sin palabras clave';
    palabrasFicha.appendChild(item);
  }

  estadoTextoFicha.innerHTML = `<strong>Estado:</strong> ${recurso.estadoEtiqueta || 'Pendiente'}`;
  condicionTextoFicha.innerHTML = `<strong>Condición:</strong> ${recurso.condicion || 'Por definir'}`;

  accionesFicha.innerHTML = '';
  accionesFicha.appendChild(crearBoton('Volver al catálogo', 'index.html#resultados-biblioteca', 'boton-secundario'));

  if(recurso.enlace){
    accionesFicha.appendChild(crearBoton(recurso.accion || 'Acceder al recurso', recurso.enlace));
  }else if(recurso.urlFuente){
    accionesFicha.appendChild(crearBoton('Ver fuente', recurso.urlFuente));
  }else{
    const pendiente = document.createElement('span');
    pendiente.className = 'enlace-material deshabilitado';
    pendiente.textContent = recurso.accion || 'Recurso pendiente';
    accionesFicha.appendChild(pendiente);
  }

  estadoFicha.hidden = true;
  contenedorFicha.hidden = false;
}

async function cargarFicha(){
  if(!recursoId){
    estadoFicha.textContent = 'No se indicó el recurso que se desea consultar. Vuelve al catálogo y selecciona una ficha.';
    return;
  }

  try{
    const respuesta = await fetch('datos/recursos.json?v=3');
    if(!respuesta.ok){throw new Error('No se pudo cargar el catálogo.');}
    const recursos = await respuesta.json();
    const recurso = recursos.find((item) => item.id === recursoId);

    if(!recurso){
      estadoFicha.textContent = 'No se encontró la ficha solicitada. Verifica el enlace o vuelve al catálogo.';
      return;
    }

    mostrarFicha(recurso);
  }catch(error){
    estadoFicha.textContent = 'No se pudo cargar la ficha del recurso. Revisa la conexión o el archivo de datos.';
  }
}

cargarFicha();
