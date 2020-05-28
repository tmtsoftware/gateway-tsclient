import { Done } from 'clients/location'
import { HttpTransport } from 'utils/HttpTransport'
import { resolveGateway } from 'clients/gateway/resolveGateway'
import { AlarmKey, AlarmSeverity, SetAlarmSeverity } from 'clients/alarm/models/PostCommand'

interface AlarmApi {
  setSeverity(alarmKey: AlarmKey, severity: AlarmSeverity): Promise<Done>
}

export class AlarmService implements AlarmApi {
  private readonly httpTransport: HttpTransport<SetAlarmSeverity>
  constructor() {
    this.httpTransport = new HttpTransport<SetAlarmSeverity>(resolveGateway)
  }

  setSeverity(alarmKey: AlarmKey, severity: AlarmSeverity): Promise<Done> {
    return this.httpTransport.requestRes(new SetAlarmSeverity(alarmKey, severity))
  }
}