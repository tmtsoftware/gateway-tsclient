import { HttpConnection } from '../../src/clients/location'
import { Prefix } from '../../src/models'
import { post } from '../../src/utils/Post'
import { extractHostPort } from '../../src/utils/Utils'
import { resolve } from '../../src/utils/Resolve'

export const authConnection = new HttpConnection(new Prefix('CSW', 'AAS'), 'Service')

const getKeycloakTokenUri = async (realm: string) => {
  const authLocation = await resolve(authConnection)
  const { host, port } = extractHostPort(authLocation.uri)
  const tokenPath = `auth/realms/${realm}/protocol/openid-connect/token`
  return { host, port, tokenPath }
}

export const getToken = async (client: string, user: string, password: string, realm: string) => {
  const payload = {
    client_id: client,
    grant_type: 'password',
    username: user,
    password: password
  }

  const { host, port, tokenPath } = await getKeycloakTokenUri(realm)
  const headers = new Headers([['Content-Type', 'application/x-www-form-urlencoded']])

  const { access_token } = await post(host, port, payload, tokenPath, headers)
  return access_token
}
