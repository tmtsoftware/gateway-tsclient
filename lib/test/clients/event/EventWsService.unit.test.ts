import { EventKey, EventName } from '../../../src/clients/event'
import { EventServiceImpl } from '../../../src/clients/event/EventServiceImpl'
import { EventD } from '../../../src/clients/event/models/Event'
import { Subscribe, SubscribeWithPattern } from '../../../src/clients/event/models/WsCommand'
import { Prefix, Subsystem } from '../../../src/models'
import { mockHttpTransport, mockWsTransport } from '../../helpers/MockHelpers'

const prefix = new Prefix('ESW', 'eventComp')
const eventName = new EventName('offline')
const eventKeys = new Set<EventKey>([new EventKey(prefix, eventName)])
const subsystem: Subsystem = 'ESW'

const httpTransport = mockHttpTransport()
const mockSubscribe = jest.fn()
const callback = () => ({})
const eventServiceImpl = new EventServiceImpl(httpTransport, () => mockWsTransport(mockSubscribe))

describe('Event Service', () => {
  test('should subscribe event without default parameters using websocket | ESW-318', () => {
    eventServiceImpl.subscribe(eventKeys, 1)(callback)

    expect(mockSubscribe).toBeCalledWith(new Subscribe([...eventKeys], 1), callback, EventD)
  })

  test('should subscribe event with default parameters using websocket | ESW-318', () => {
    eventServiceImpl.subscribe(eventKeys)(callback)

    expect(mockSubscribe).toBeCalledWith(new Subscribe([...eventKeys], 0), callback, EventD)
  })

  test('should pattern subscribe event using websocket | ESW-318', () => {
    eventServiceImpl.pSubscribe(subsystem, 1, '.*')(callback)

    expect(mockSubscribe).toBeCalledWith(
      new SubscribeWithPattern(subsystem, 1, '.*'),
      callback,
      EventD
    )
  })

  test('should pattern subscribe event with default parameters using websocket | ESW-318', () => {
    eventServiceImpl.pSubscribe(subsystem)(callback)

    expect(mockSubscribe).toBeCalledWith(
      new SubscribeWithPattern(subsystem, 0, '.*'),
      callback,
      EventD
    )
  })
})
afterEach(() => jest.clearAllMocks())
