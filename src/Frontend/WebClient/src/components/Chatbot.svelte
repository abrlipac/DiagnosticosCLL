<script>
  import Mensaje from './Mensaje.svelte'
  import { onMount } from 'svelte'
  import axios from 'axios'

  let iter = -1
  let preguntasCount = 1
  let noHayMasPreguntas = false
  let datoIngresado = ''

  const mensajes = []
  let preguntasRespuestas
  let especialidades
  let especialidadId

  let chatbotMessagesCont
  let chatbotMessagesContHeight

  let diagnosticoId = 10
  let seGeneroDiagnostico = false

  onMount(async () => {
    axios
      .get('http://localhost:10002/diagnosticos/especialidades')
      .then(function (response) {
        if (response.status === 200 && response.data) {
          especialidades = [...response.data.items]
          mensajes.push({
            esPregunta: true,
            contenido: 'Elija una especialidad',
            opciones: especialidades.map((especialidad) => especialidad.nombre),
            opcionElegida: '',
          })
          mensajes = mensajes
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  })

  function enterSubmit(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      enviarDato(datoIngresado)
    }
  }

  function clickSubmit() {
    enviarDato(datoIngresado)
  }

  async function enviarDato(dato) {
    mensajes.push({
      esPregunta: false,
      contenido: dato,
    })

    mensajes[mensajes.length - 2].opciones = []

    const esPreguntaEspecialidad = iter === 0
    if (esPreguntaEspecialidad) {
      especialidadId = especialidades.find(
        (especialidad) => especialidad.nombre === dato
      ).id

      const response = await axios.get(
        `http://localhost:10002/diagnosticos/preguntas?espId=${especialidadId}&take=30`
      )

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
        preguntasCount = preguntasRespuestas.length
      }
    } else if (iter >= 0 && iter < preguntasCount + 1) {
      preguntasRespuestas[iter - 1].respuesta = dato
    } else {
      console.log('No hay más preguntas')
      await generarDiagnostico()
    }

    datoIngresado = ''
  }

  async function elegirOpcionHandler(event) {
    iter++
    await enviarDato(event.detail.opcionElegida)
    sgtePreguntaHandler()
  }

  function sgtePreguntaHandler() {
    if (iter < preguntasCount) {
      mensajes.push({
        esPregunta: true,
        contenido: preguntasRespuestas[iter].pregunta,
        opciones: preguntasRespuestas[iter].opciones,
        opcionElegida: '',
      })

      mensajes = mensajes

      setTimeout(() => {
        chatbotMessagesCont.scrollTo({
          top: chatbotMessagesContHeight,
          left: 0,
          behavior: 'smooth',
        })
      }, 10)
    } else {
      noHayMasPreguntas = true
      iter = -1
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
    const response = await axios.post(
      'http://localhost:10002/diagnosticos',
      createDiagnostico
    )
    if (response.status === 200) {
      seGeneroDiagnostico = true
      console.log('ok')
    } else {
      console.log('error')
    }
  }

  function updateScroll() {
    chatbotMessagesContHeight = chatbotMessagesCont.scrollHeight
  }
</script>

<div
  class="chatbot rounded overflow-hidden d-flex flex-column mt-3 border border-primary mx-1">
  <div class="chatbot__header p-3 text-white bg-primary">
    <h2 class="h3 text-white m-0">Chatbot</h2>
  </div>
  <div
    class="chatbot__messages py-2 flex-grow-1 overflow-scroll"
    bind:this={chatbotMessagesCont}
    on:scroll={updateScroll}>
    <Mensaje mensaje={{ contenido: 'Bienvenido!', esPregunta: true }} />
    {#each mensajes as mensaje}
      {#if mensaje.opciones && mensaje.opciones.length > 0}
        <Mensaje
          {mensaje}
          on:elegirOpcion={elegirOpcionHandler}
          on:sgtePregunta={sgtePreguntaHandler} />
      {:else}
        <Mensaje {mensaje} />
      {/if}
    {/each}
    {#if noHayMasPreguntas}
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
      on:keydown={enterSubmit} />
    <button
      class="chatbot__send btn btn-primary rounded-circle ms-2 d-flex align-items-center"
      on:click={clickSubmit}>
      <img src="/img/send_48px.png" class="w-100" alt="logo de enviar" />
    </button>
  </div>
</div>

{#if noHayMasPreguntas}
  <a
    type="button"
    class="btn btn-primary w-100 mt-3"
    href="/diagnosticos/resultados/{diagnosticoId}">
    Ver resultados
  </a>
{/if}

<style>
  .chatbot {
    min-height: calc(100vh - 22rem);
  }
  .chatbot__messages {
    max-height: calc(100vh - 26rem);
  }
  .chatbot__send {
    width: 50px;
    height: 50px;
  }
</style>
