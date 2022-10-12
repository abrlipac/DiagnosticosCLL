import { writable } from 'svelte/store'

export const userStore = writable({
  isAuth: true,
  id: 11,
  name: 'Abraham Paciente 11',
  profile: '/img/user.png',
  role: 'Paciente',
})