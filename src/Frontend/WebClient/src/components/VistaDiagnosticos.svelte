<script>
  import { diagnosticoStore, userStore } from '../store.js'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import axios from 'axios'

  let enfermedadesDiagnosticadas
  let especialidades
  let hayEnfermedadesDiagnosticadas = false

  onMount(async () => {
    let response = await axios.get(
      'http://localhost:10002/diagnosticos/enfermedadesDiagnosticadas/'
    )

    if (response.status === 200 && response.data) {
      enfermedadesDiagnosticadas = [...response.data.items].map((e) => ({
        id: e.id,
        espId: e.especialidad_Id,
        espNombre: '',
        fecha: e.fecha,
        nombre: e.enfermedad_Nombre,
      }))
      response = await axios.get(
        'http://localhost:10002/diagnosticos/especialidades'
      )
      if (response.status === 200 && response.data) {
        especialidades = [...response.data.items]

        console.log(especialidades)

        enfermedadesDiagnosticadas = enfermedadesDiagnosticadas.map((e) => {
          const fecha = new Date(e.fecha)
          return {
            id: e.id,
            espNombre: especialidades.find((esp) => esp.id === e.espId).nombre,
            fecha: `${fecha.getDate()}/${
              fecha.getMonth() + 1
            }/${fecha.getFullYear()}`,
            nombre: e.nombre,
          }
        })
      }
      hayEnfermedadesDiagnosticadas = true
    }
    console.log(enfermedadesDiagnosticadas)
  })
</script>

{#if hayEnfermedadesDiagnosticadas}
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
      {#each enfermedadesDiagnosticadas as enfermedad}
        <tr>
          <td>{enfermedad.id}</td>
          <td>{enfermedad.fecha}</td>
          <td>{enfermedad.nombre}</td>
          <td>{enfermedad.espId}</td>
          <td>
            <a
              href="/diagnosticos/{enfermedad.id}"
              class="btn btn-outline-primary">
              Ver detalles
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
