import { ComponentId } from 'models/ComponentId'
import { post } from 'utils/Http'
import {
  GenericResponse,
  GoOfflineResponse,
  GoOnlineResponse,
  OkOrUnhandledResponse,
  PauseResponse,
  RemoveBreakpointResponse
} from 'clients/sequencer/models/SequencerRes'
import { GatewaySequencerCommand } from 'clients/gateway/models/Gateway'
import {
  Add,
  AddBreakpoint,
  Delete,
  GetSequence,
  GoOffline,
  GoOnline,
  InsertAfter,
  IsAvailable,
  IsOnline,
  LoadSequence,
  Pause,
  Prepend,
  RemoveBreakpoint,
  Replace,
  Reset,
  Resume,
  StartSequence
} from 'clients/sequencer/models/PostCommand'
import { SequenceCommand } from 'models/params/Command'
import { SubmitResponse } from 'models/params/CommandResponse'
import { StepList } from 'clients/sequencer/models/StepList'

export class SequencerService {
  constructor(readonly host: string, readonly port: number, readonly componentId: ComponentId) {}

  private httpPost<T>(gatewayCommand: GatewaySequencerCommand) {
    return post<GatewaySequencerCommand, T>(this.host, this.port, gatewayCommand)
  }

  loadSequence(...sequence: SequenceCommand[]): Promise<OkOrUnhandledResponse> {
    return this.httpPost<OkOrUnhandledResponse>(
      GatewaySequencerCommand(this.componentId, LoadSequence(sequence))
    )
  }

  startSequence(): Promise<SubmitResponse> {
    return this.httpPost<SubmitResponse>(GatewaySequencerCommand(this.componentId, StartSequence))
  }

  add(commands: SequenceCommand[]): Promise<OkOrUnhandledResponse> {
    return this.httpPost<OkOrUnhandledResponse>(
      GatewaySequencerCommand(this.componentId, Add(commands))
    )
  }

  prepend(commands: SequenceCommand[]): Promise<OkOrUnhandledResponse> {
    return this.httpPost<OkOrUnhandledResponse>(
      GatewaySequencerCommand(this.componentId, Prepend(commands))
    )
  }

  replace(id: string, commands: SequenceCommand[]): Promise<GenericResponse> {
    return this.httpPost<GenericResponse>(
      GatewaySequencerCommand(this.componentId, Replace(id, commands))
    )
  }

  insertAfter(id: string, commands: SequenceCommand[]): Promise<GenericResponse> {
    return this.httpPost<GenericResponse>(
      GatewaySequencerCommand(this.componentId, InsertAfter(id, commands))
    )
  }

  delete(id: string): Promise<GenericResponse> {
    return this.httpPost<GenericResponse>(GatewaySequencerCommand(this.componentId, Delete(id)))
  }

  addBreakpoint(id: string): Promise<GenericResponse> {
    return this.httpPost<GenericResponse>(
      GatewaySequencerCommand(this.componentId, AddBreakpoint(id))
    )
  }

  removeBreakpoint(id: string): Promise<RemoveBreakpointResponse> {
    return this.httpPost<RemoveBreakpointResponse>(
      GatewaySequencerCommand(this.componentId, RemoveBreakpoint(id))
    )
  }

  reset(): Promise<OkOrUnhandledResponse> {
    return this.httpPost<OkOrUnhandledResponse>(GatewaySequencerCommand(this.componentId, Reset))
  }

  resume(): Promise<OkOrUnhandledResponse> {
    return this.httpPost<OkOrUnhandledResponse>(GatewaySequencerCommand(this.componentId, Resume))
  }

  pause(): Promise<PauseResponse> {
    return this.httpPost<PauseResponse>(GatewaySequencerCommand(this.componentId, Pause))
  }

  getSequence(): Promise<StepList[]> {
    return this.httpPost<StepList[]>(GatewaySequencerCommand(this.componentId, GetSequence))
  }

  isAvailable(): Promise<boolean> {
    return this.httpPost<boolean>(GatewaySequencerCommand(this.componentId, IsAvailable))
  }

  isOnline(): Promise<boolean> {
    return this.httpPost<boolean>(GatewaySequencerCommand(this.componentId, IsOnline))
  }

  goOnline(): Promise<GoOnlineResponse> {
    return this.httpPost<GoOnlineResponse>(GatewaySequencerCommand(this.componentId, GoOnline))
  }

  goOffline(): Promise<GoOfflineResponse> {
    return this.httpPost<GoOfflineResponse>(GatewaySequencerCommand(this.componentId, GoOffline))
  }
}
