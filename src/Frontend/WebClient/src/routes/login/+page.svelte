<script>
  import axios from 'axios'
  import Cookies from 'js-cookie'
  import { userStore } from '../../store.js'

  let errors = []
  let correctLogin = false

  let user = {
    username: '',
    password: '',
  }

  const handleLogin = () => {
    iniciarSesion()
  }

  const extractUserFromToken = (accessToken) => {
    const token = accessToken.split('.')
    const paddedContent = token[1].padEnd(
      token[1].length + ((token[1].length * 3) % 4),
      '='
    )
    const base64Content = atob(paddedContent)
    const parsedUser = JSON.parse(base64Content)
    console.log(parsedUser)

    return {
      isAuth: true,
      id: parsedUser.nameid,
      name: parsedUser.unique_name,
      role: parsedUser.role,
    }
  }

  const iniciarSesion = () => {
    axios
      .post('http://localhost:10003/identity/auth', user)
      .then((res) => {
        console.log(res)
        if (res.status === 200 && res.data.succeeded) {
          const accessToken = res.data.content.accessToken
          
          Cookies.set('AuthorizationToken', `Bearer ${accessToken}`, {
            expires: 1 / 24,
          })

          userStore.set(extractUserFromToken(accessToken))
        } else {
          errors = res.data.errors
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
</script>

<h1 class="text-center mt-4">Iniciar sesión</h1>
<h4 class="text-center">Ingrese sus datos para ingresar al sistema</h4>
<hr class="col-md-4 mx-auto" />

{#if errors.length > 0}
  <div class="alert alert-danger">
    {#each errors as error}
      <p>{error}</p>
    {/each}
  </div>
{/if}

{#if correctLogin}
  <div class="alert alert-success">
    <p>Ha iniciado sesión correctamente</p>
  </div>
{/if}

<div class="row justify-content-center">
  <div class="col-md-4">
    <form on:submit|preventDefault={handleLogin}>
      <div class="text-danger" />

      <div class="form-floating mb-3">
        <input
          bind:value={user.username}
          class="form-control"
          id="username"
          placeholder="name@example.com" />
        <label for="username" class="form-label">Usuario</label>
        <span class="text-danger" />
      </div>

      <div class="form-floating mb-3">
        <input
          bind:value={user.password}
          id="password"
          class="form-control"
          type="password"
          placeholder="***" />
        <label for="password" class="form-label">Contraseña</label>
        <span class="text-danger" />
      </div>

      <input
        class="btn btn-primary w-100 mb-2"
        type="submit"
        name="submit"
        value="Iniciar sesión" />

      <div class="text-center">
        <a href="/signup" class="btn btn-outline-secondary w-100">
          Registrarse
        </a>
      </div>
    </form>
  </div>
</div>
