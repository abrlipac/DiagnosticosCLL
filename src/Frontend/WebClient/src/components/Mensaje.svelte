<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let mensaje = {
    esPregunta: false,
    contenido: '',
    opciones: [],
    opcionElegida: '',
  }

  function elegirOpcion(opcion) {
    mensaje.opcionElegida = opcion

    dispatch('elegirOpcion', {
      opcionElegida: opcion,
    })
  }

  onMount(async () => {
    if (mensaje.esPregunta && mensaje.contenido === 'Bienvenido!') {
      dispatch('pasarSgtePregunta')
    }
  })
</script>

<div
  class="container mb-3 d-flex flex-row {!mensaje.esPregunta
    ? 'justify-content-end'
    : ''}">
  {#if mensaje.esPregunta}
    <div class="chatbot__boticon rounded-circle pr-2 align-self-start">
      <img src="/img/bot.svg" class="w-100 h-100" alt="logo bot" />
    </div>
  {/if}
  <div>
    <div
      class="chatbot__message btn btn-outline-primary text-wrap text-start {!mensaje.esPregunta
        ? 'fw-bold'
        : ''}">
      {mensaje.contenido}
    </div>
    {#if mensaje.opciones != null}
      <div class="chatbot__options d-flex pt-1">
        {#each mensaje.opciones as opcion}
          <button
            class="btn btn-outline-secondary"
            on:click|preventDefault={() => elegirOpcion(opcion)}>
            {opcion}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .chatbot__boticon {
    min-width: 50px;
    max-width: 50px;
  }
  .chatbot__options {
    gap: 0.2rem;
    flex-wrap: wrap;
  }
</style>
