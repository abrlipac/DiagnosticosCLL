<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import axios from 'axios'

  let diagnostico

  let enfermedades
  let especialidades
  let preguntas

  let hayDetallesDiagnostico = false

  onMount(async () => {
    await BuscarDiagnostico()

    await ObtenerEspecialidades()
    await ObtenerPreguntas()
    await ObtenerEnfermedades()

    diagnostico.nombreEspecialidad = especialidades.find(
      (e) => e.id === diagnostico.especialidadId
    ).nombre

    diagnostico.preguntas = diagnostico.preguntas.map((p) => {
      return {
        ...p,
        nombre: preguntas.find((e) => e.id === p.preguntaId).nombre,
      }
    })

    diagnostico.enfermedades = diagnostico.enfermedades.map((e) => {
      return {
        ...e,
        nombre: enfermedades.find((e) => e.id === e.enfermedadId).nombre,
      }
    })
  })

  async function BuscarDiagnostico() {
    const response = await axios.get(
      `http://localhost:10002/diagnosticos/${$page.params.id}`
    )

    if (response.status === 200 && response.data) {
      diagnostico = response.data
    }
  }

  async function ObtenerEspecialidades() {
    let response = await axios.get(
      'http://localhost:10002/diagnosticos/especialidades'
    )

    if (response.status === 200 && response.data) {
      especialidades = [...response.data.items]
    }
  }

  async function ObtenerPreguntas() {
    let response = await axios.get(
      `http://localhost:10002/diagnosticos/preguntas?espId=${diagnostico.espId}&take=30`
    )

    if (response.status === 200 && response.data) {
      preguntas = [...response.data.items]
    }
  }

  async function ObtenerEnfermedades() {
    let response = await axios.get(
      'http://localhost:10002/diagnosticos/enfermedades'
    )

    if (response.status === 200 && response.data) {
      enfermedades = [...response.data.items]
    }
  }
</script>

{#if hayDetallesDiagnostico}
  <table class="table">
    <thead>
      <tr>
        <th>Id</th>
        <th>Fecha</th>
        <th>Enfermedad</th>
        <th>Especialidad</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each diagnostico.detallesDiagnostico as detalle}
        <tr>
          <td>{detalle.id}</td>
          <td>{detalle.fecha}</td>
          <td>{detalle.nombre}</td>
          <td>{detalle.espId}</td>
          <td>
            <a
              href="/diagnosticos/{detalle.id}"
              class="btn btn-outline-primary">
              Ver detalles
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}