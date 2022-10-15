<script>
  import Mensaje from './Mensaje.svelte'
  import { onMount } from 'svelte'
  import { diagnosticoStore } from '../store.js'
  import { goto } from '$app/navigation'
  import axios from 'axios'

  let iter = -1
  let datoIngresado = ''
  let chatbotMessages

  let mensajes = []
  let preguntasRespuestas
  let noHayMasPreguntas = false
  let esMensajeInvalido = false

  let especialidades
  let especialidadId
  let especialidadElegida

  let diagnosticoGenerado
  let seGeneroDiagnostico = false

  let esPreguntaEspecialidad = true
  $: esPreguntaSintoma = iter >= 0 && iter < cantidadPreguntas
  let cantidadPreguntas = 999

  $: if (
    (mensajes.length > 0 && mensajes[mensajes.length - 1].esPregunta) ||
    seGeneroDiagnostico ||
    noHayMasPreguntas
  ) {
    scrollToBottom()
  }

  // al cargar el componente
  onMount(async () => {
    // obtener las especialidades
    const response = await axios.get(
      'http://localhost:10002/diagnosticos/especialidades'
    )

    // si hay especialidades, mostrar la primera pregunta (especialidad)
    if (response.status === 200 && response.data) {
      especialidades = [...response.data.items]

      mensajes.push({
        esPregunta: true,
        contenido: 'Elija una especialidad',
        opciones: especialidades.map((especialidad) => especialidad.nombre),
        opcionElegida: '',
      })

      actualizarMensajes()
    }
  })

  function actualizarMensajes() {
    mensajes = mensajes
  }

  // al presionar enter en el input
  async function enterTextHandler(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      await enviarDato(datoIngresado)
    }
  }

  // al hacer click en el boton enviar
  async function clickEnviarHandler() {
    await enviarDato(datoIngresado)
  }

  // al elegir una opcion de la lista de opciones
  async function elegirOpcionHandler(event) {
    await enviarDato(event.detail.opcionElegida)
  }

  async function enviarDato(dato) {
    // mostrar el mensaje del usuario
    mensajes.push({
      esPregunta: false,
      contenido: dato,
    })

    // borrar las opciones de la pregunta anterior
    mensajes[mensajes.length - 2].opciones = []

    if (esPreguntaEspecialidad) {
      let esRespuestaEspValida = especialidades
        .map((especialidad) => especialidad.nombre)
        .includes(dato)

      if (!esRespuestaEspValida) {
        // volver a mostrar pregunta de especialidad
        mensajes.push({
          esPregunta: true,
          contenido: 'Elija una especialidad',
          opciones: especialidades.map((especialidad) => especialidad.nombre),
          opcionElegida: '',
        })
        return
      }

      // establecer datos de especialidad elegida
      especialidadId = especialidades.find(
        (especialidad) => especialidad.nombre === dato
      ).id
      especialidadElegida = dato

      // obtener preguntas
      const response = await axios.get(
        `http://localhost:10002/diagnosticos/preguntas?espId=${especialidadId}&take=30`
      )

      // si se obtuvieron preguntas, guardarlas
      if (response.status === 200 && response.data) {
        preguntasRespuestas = response.data.items.map((pregunta) => {
          return {
            idEspecialidad: especialidadId,
            idPregunta: pregunta.id,
            pregunta: pregunta.contenido,
            opciones: pregunta.opciones.map((opcion) => opcion.valor),
            respuesta: '',
          }
        })

        // establecer cantidad de preguntas
        cantidadPreguntas = preguntasRespuestas.length

        esPreguntaEspecialidad = false
      }
      iter++
      mostrarPregunta()
    } else if (esPreguntaSintoma) {
      let esRespuestaValida = preguntasRespuestas[iter].opciones.includes(dato)
      if (esRespuestaValida) {
        preguntasRespuestas[iter].respuesta = dato

        iter++
        mostrarPregunta()

        // si no hay mas preguntas, generar diagnostico
        if (iter === cantidadPreguntas) {
          noHayMasPreguntas = true
          await generarDiagnostico()
        }
      } else {
        // volver a mostrar la pregunta
        esMensajeInvalido = true
        mostrarPregunta()
      }
    }
    // limpiar el input
    datoIngresado = ''
  }

  function mostrarPregunta() {
    // si hay mas preguntas, mostrar la siguiente pregunta
    if (iter < cantidadPreguntas) {
      mensajes.push({
        esPregunta: true,
        contenido: preguntasRespuestas[iter].pregunta,
        opciones: preguntasRespuestas[iter].opciones,
        opcionElegida: '',
      })
      actualizarMensajes()
    }
  }

  async function generarDiagnostico() {
    const createDiagnostico = {
      paciente_id: 11,
      especialidad_id: especialidadId,
      detallesdiagnostico: preguntasRespuestas.map((preRes) => {
        return {
          pregunta_id: preRes.idPregunta,
          respuesta: preRes.respuesta,
        }
      }),
    }
    console.log(createDiagnostico)
    axios
      .post('http://localhost:10002/diagnosticos', createDiagnostico)
      .then((response) => {
        if (response.status === 200) {
          diagnosticoGenerado = response.data
          console.log(diagnosticoGenerado)
          seGeneroDiagnostico = true
        }
      })
      .catch((e) => console.log(e))
  }

  function verResultados() {
    diagnosticoStore.set({
      id: diagnosticoGenerado.id,
      especialidad: especialidadElegida,
      fecha: diagnosticoGenerado.fecha,
      posiblesEnfermedades: diagnosticoGenerado.posiblesEnfermedades,
    })
    goto('/diagnosticos/resultados')
  }

  function scrollToBottom() {
    setTimeout(() => {
      chatbotMessages.scrollTo({
        top: chatbotMessages.scrollHeight,
        left: 0,
        behavior: 'smooth',
      })
    }, 10)
  }
</script>

<div
  class="chatbot rounded overflow-hidden d-flex flex-column mt-3 border border-primary mx-1">
  <div class="chatbot__header p-3 text-white bg-primary">
    <h2 class="h3 text-white m-0">Chatbot</h2>
  </div>
  <div
    class="chatbot__messages py-2 flex-grow-1 overflow-scroll"
    bind:this={chatbotMessages}>
    <Mensaje mensaje={{ contenido: 'Bienvenido!', esPregunta: true }} />
    {#each mensajes as mensaje}
      {#if esMensajeInvalido}
        <Mensaje
          mensaje={{
            contenido: 'Ingrese o elija un dato válido',
            esPregunta: true,
          }} />
        {(esMensajeInvalido = false)}
      {/if}
      {#if mensaje.opciones && mensaje.opciones.length > 0}
        <Mensaje
          {mensaje}
          on:elegirOpcion={elegirOpcionHandler}
          on:sgtePregunta={mostrarPregunta} />
      {:else}
        <Mensaje {mensaje} />
      {/if}
    {/each}
    {#if noHayMasPreguntas && iter !== 0}
      <Mensaje
        mensaje={{
          contenido: 'Muchas gracias por responder las preguntas!',
          esPregunta: true,
        }} />
    {/if}
    {#if seGeneroDiagnostico}
      <Mensaje
        mensaje={{
          contenido: 'Se han generado los resultados!',
          esPregunta: true,
        }} />
    {/if}
  </div>
  <div
    class="chatbot__footer d-flex flex-row p-2 align-items-center border-top">
    <input
      class="form-control"
      placeholder="Ingrese un dato"
      bind:value={datoIngresado}
      on:keydown={enterTextHandler} />
    <button
      class="chatbot__send btn btn-primary rounded-circle ms-2 d-flex align-items-center"
      on:click={clickEnviarHandler}>
      <img src="/img/send_48px.png" class="w-100" alt="logo de enviar" />
    </button>
  </div>
</div>

{#if noHayMasPreguntas && iter !== 0}
  <button
    type="button"
    class="btn btn-primary w-100 mt-3"
    on:click|preventDefault={verResultados}>
    Ver resultados
  </button>
{/if}

<style>
  .chatbot {
    min-height: calc(100vh - 22rem);
  }
  .chatbot__messages {
    min-height: calc(100vh - 26rem);
    max-height: calc(100vh - 26rem);
  }
  .chatbot__send {
    width: 50px;
    height: 50px;
  }
</style>
