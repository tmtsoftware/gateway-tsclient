import 'whatwg-fetch'
import { ObsMode } from '../../src/clients/sequence-manager/models/ObsMode'
import {
  AgentProvisionConfig,
  ProvisionConfig
} from '../../src/clients/sequence-manager/models/ProvisionConfig'
import { SequenceManagerService } from '../../src/clients/sequence-manager/SequenceManagerService'
import { ComponentId, Prefix } from '../../src/models'
import { getToken } from '../utils/auth'
import { startServices, stopServices } from '../utils/backend'

jest.setTimeout(80000)
let sequenceManagerServiceWithValidToken: SequenceManagerService
let sequenceManagerServiceWithInValidToken: SequenceManagerService
let sequenceManagerServiceWithoutToken: SequenceManagerService
beforeAll(async () => {
  //todo: fix this console.error for jsdom errors
  console.error = jest.fn()
  await startServices(['AAS', 'SequenceManager'])

  // Authorized user for Sequence Manager APIs
  const token = await getToken('tmt-frontend-app', 'sm-user1', 'sm-user1', 'TMT')

  // this user is authenticated but not authorized for sequence Manager APIs
  const invalidToken = await getToken(
    'tmt-frontend-app',
    'location-admin1',
    'location-admin1',
    'TMT'
  )

  sequenceManagerServiceWithValidToken = await SequenceManagerService(() => token)
  sequenceManagerServiceWithInValidToken = await SequenceManagerService(() => invalidToken)
  sequenceManagerServiceWithoutToken = await SequenceManagerService(() => undefined)
})

const sequencerComponentId = new ComponentId(new Prefix('ESW', 'darknight'), 'Sequencer')
afterAll(async () => {
  await stopServices()
  jest.clearAllMocks()
})

describe('Sequence Manager Client ', () => {
  test('configure sequence components | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.configure(new ObsMode('darknight'))

    expect(response).toEqual({
      _type: 'Success',
      masterSequencerComponentId: sequencerComponentId
    })
  })

  test('provision sequence components | ESW-365', async () => {
    const eswAgentPrefix = new Prefix('ESW', 'agent1')
    const agentProvisionConfig = new AgentProvisionConfig(eswAgentPrefix, 2)
    const provisionConfig = new ProvisionConfig([agentProvisionConfig])

    const response = await sequenceManagerServiceWithValidToken.provision(provisionConfig)

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('getRunningObsModes | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.getRunningObsModes()

    expect(response).toEqual({
      _type: 'Success',
      runningObsModes: [new ObsMode('darknight')]
    })
  })

  test('startSequencer | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.startSequencer(
      'ESW',
      new ObsMode('darknight')
    )

    expect(response).toEqual({
      _type: 'Started',
      componentId: new ComponentId(new Prefix('ESW', 'darknight'), 'Sequencer')
    })
  })

  test('restartSequencer | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.restartSequencer(
      'ESW',
      new ObsMode('darknight')
    )

    expect(response).toEqual({
      _type: 'Success',
      componentId: new ComponentId(new Prefix('ESW', 'darknight'), 'Sequencer')
    })
  })

  test('shutdownSequencer | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownSequencer(
      'ESW',
      new ObsMode('darknight')
    )

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('shutdownSubsystemSequencers | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownSubsystemSequencers('ESW')

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('shutdownObsModeSequencers | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownObsModeSequencers(
      new ObsMode('darknight')
    )

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('shutdownAllSequencers | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownAllSequencers()

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('shutdownSequenceComponent | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownSequenceComponent(
      new Prefix('ESW', 'primary')
    )

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('shutdownAllSequenceComponents | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.shutdownAllSequenceComponents()

    expect(response).toEqual({
      _type: 'Success'
    })
  })

  test('getAgentStatus | ESW-365', async () => {
    const response = await sequenceManagerServiceWithValidToken.getAgentStatus()

    expect(response).toEqual({
      _type: 'Success',
      agentStatus: [
        {
          agentId: new ComponentId(new Prefix('IRIS', 'Agent'), 'Machine'),
          seqCompsStatus: [
            {
              seqCompId: new ComponentId(new Prefix('IRIS', 'IRIS_123'), 'SequenceComponent'),
              sequencerLocation: []
            }
          ]
        }
      ],
      seqCompsWithoutAgent: [
        {
          seqCompId: new ComponentId(new Prefix('ESW', 'ESW_45'), 'SequenceComponent'),
          sequencerLocation: []
        }
      ]
    })
  })

  test('should get unauthorized error when token is not provided | ESW-365', async () => {
    expect.assertions(3)
    await sequenceManagerServiceWithoutToken.configure(new ObsMode('darknight')).catch((e) => {
      expect(e.status).toBe(401)
      expect(e.message).toBe('Unauthorized')
      expect(e.reason).toBe(
        'The resource requires authentication, which was not supplied with the request'
      )
    })
  })

  test('should get forbidden error when token provided does not have correct access| ESW-365', async () => {
    expect.assertions(3)
    await sequenceManagerServiceWithInValidToken.configure(new ObsMode('darknight')).catch((e) => {
      expect(e.status).toBe(403)
      expect(e.message).toBe('Forbidden')
      expect(e.reason).toBe('The supplied authentication is not authorized to access this resource')
    })
  })
})