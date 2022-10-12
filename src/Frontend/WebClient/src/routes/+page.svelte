<script>
  import { userStore } from '../store.js'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import Cookies from 'js-cookie'

  onMount(() => {
    if (!userStore.isAuth) {
      if (Cookies.get('token')) {
        userStore.isAuth = true
        goto('/dashboard')
      } else {
        goto('/login')
      }
      goto('/login')
    }
  })
</script>

<div class="d-flex align-items-center justify-content-center h-75">
  <div class="text-center">
    Bienvenido, puedes empezar eligiendo una opción del menú
  </div>
</div>
