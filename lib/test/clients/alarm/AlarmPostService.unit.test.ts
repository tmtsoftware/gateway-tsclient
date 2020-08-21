import { AlarmKey } from '../../../src/clients/alarm'
import { Prefix } from '../../../src/models'
import { AlarmServiceImpl } from '../../../src/clients/alarm/AlarmServiceImpl'
import { mockHttpTransport } from '../../helpers/MockHelpers'
import { SetAlarmSeverity } from '../../../src/clients/alarm/models/PostCommand'
import { Done } from '../../../src/clients/location'

describe('Alarm service', () => {
  test('should set alarm severity for a given prefix | ESW-314', async () => {
    const requestRes: jest.Mock = jest.fn()
    const alarmService = new AlarmServiceImpl(mockHttpTransport(requestRes))
    const alarmKey = new AlarmKey(new Prefix('ESW', 'Comp1'), 'alarm1')
    const severity = 'Okay'
    await alarmService.setSeverity(alarmKey, severity)

    expect(requestRes).toBeCalledWith(new SetAlarmSeverity(alarmKey, severity), Done)
  })
})