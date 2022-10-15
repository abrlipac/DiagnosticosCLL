<script>
  import { userStore, diagnosticoStore } from '../store.js'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'
  import axios from 'axios'

  let diagnostico = get(diagnosticoStore)
  let enfermedades

  onMount(async () => {
    const response = await axios.get(
      'http://localhost:10002/diagnosticos/enfermedades'
    )

    if (response.status === 200 && response.data) {
      enfermedades = [...response.data.items].map((e) => ({
        id: e.id,
        nombre: e.nombre,
      }))
    }

    diagnostico.posiblesEnfermedades = diagnostico.posiblesEnfermedades.map(
      (e) => {
        return {
          porcentaje: Math.round(e.porcentaje * 100) / 100,
          nombre: enfermedades.find((enf) => enf.id === e.enfermedad_Id).nombre,
        }
      }
    )

    console.log(diagnostico)
    console.log(enfermedades)
  })
</script>

<ul class="list-group mb-3">
  {#each diagnostico.posiblesEnfermedades as posibleEnfermedad}
    <li class="list-group-item">
      <b>{posibleEnfermedad.porcentaje} %</b>
      - {posibleEnfermedad.nombre}
    </li>
  {/each}
</ul>

<div class="d-flex flex-column">
<a href="https://clinicalaluz.pe/contacto/" class="btn btn-primary mb-2">
  Reservar una cita
</a>
<a href="/" class="btn btn-outline-primary">Regresar al menú</a>
</div>