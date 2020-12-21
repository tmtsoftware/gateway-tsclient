import type {TokenFactory} from '../../../src'
import {ConfigService} from '../../../src/clients/config-service'
import {ConfigServiceImpl} from '../../../src/clients/config-service/ConfigServiceImpl'
import * as Connection from '../../../src/config/Connections'
import sinon from 'sinon'
import {expect} from '@esm-bundle/chai'
import {setAppConfigPath} from '../../../src/config'

const tokenFactory: TokenFactory = () => 'validToken'

let host = 'http://some-host';
let port = 1234;
const configServiceImpl = new ConfigServiceImpl(host, port, tokenFactory)

describe('Config Service Factory', () => {
  it.skip('create config service | ESW-320', async () => {
    var connectionMock = sinon.mock(Connection)
    console.log('********** ', connectionMock)
    connectionMock.expects('resolveConnection').withArgs(Connection.configConnection).returns({host: host, port: port})
    const configService = await ConfigService(tokenFactory)
    connectionMock.verify()
    expect(configService).to.equal(configServiceImpl)
  })

  it('create config service | ESW-320', async () => {
    setAppConfigPath('/_dist2_/assets/appconfig/AppConfig.js')
    const configService = await ConfigService(tokenFactory)
  })
})