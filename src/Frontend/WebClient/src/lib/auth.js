import axios from 'axios'
import Cookies from 'js-cookie'

class Auth {
  extractUserFromToken(accessToken) {
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

  iniciarSesion(user, errors, userStore) {
    axios
      .post('http://localhost:10003/identity/auth', user)
      .then((res) => {
        console.log(res)
        if (res.status === 200 && res.data.succeeded) {
          const accessToken = res.data.content.accessToken
          
          userStore.set(this.extractUserFromToken(accessToken))
          Cookies.set('accessToken', accessToken)
        } else {
            errors = res.data.errors
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

export default new Auth()