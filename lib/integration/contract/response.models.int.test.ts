// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
import * as D from 'io-ts/lib/Decoder'
// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
import { AlarmKeyD, AlarmSeverityD } from '../../src/clients/alarm/models/PostCommand'
import * as C from '../../src/clients/config/models/ConfigModels'
import { EventD } from '../../src/clients/event/models/Event'
import { EventKeyD } from '../../src/clients/event/models/EventKey'
import { ConnectionD, ConnectionTypeD, LocationD, TrackingEventD } from '../../src/clients/location'
import { Level, LogMetadataD } from '../../src/clients/logger'
import { ObsModeD } from '../../src/clients/sequence-manager/models/ObsMode'
import {
  AgentStatusResponseD,
  ConfigureResponseD,
  GetRunningObsModesResponseD,
  ProvisionResponseD,
  RestartSequencerResponseD,
  ShutdownSequencersAndSeqCompResponseD,
  StartSequencerResponseD
} from '../../src/clients/sequence-manager/models/SequenceManagerRes'
import * as Seq from '../../src/clients/sequencer/models/SequencerRes'
import { StepD, StepListD, StepStatusD } from '../../src/clients/sequencer/models/StepList'
import * as M from '../../src/models'
import { ComponentIdD, PrefixD } from '../../src/models'
import { Decoder } from '../../src/utils/Decoder'
import { getOrThrow } from '../../src/utils/Utils'
import { delay } from '../utils/eventually'
import { executeCswContract, executeEswContract } from '../utils/shell'

jest.setTimeout(100000)

const sourceDir = path.resolve(__dirname, '../jsons')
const eswDir = path.resolve(__dirname, '../jsons/esw')
const cswDir = path.resolve(__dirname, '../jsons/csw')
const commandModelsJsonPath = `${cswDir}/command-service/models.json`
const locationModelsJsonPath = `${cswDir}/location-service/models.json`
const gatewayModelsJsonPath = `${eswDir}/gateway-service/models.json`
const configModelsJsonPath = `${cswDir}/config-service/models.json`
const sequencerModelsJsonPath = `${eswDir}/sequencer-service/models.json`
const sequenceManagerModelsJsonPath = `${eswDir}/sequence-manager-service/models.json`

beforeAll(async () => {
  executeCswContract([cswDir])
  executeEswContract([eswDir])
})

afterAll(async () => {
  fs.rmdirSync(sourceDir, { recursive: true })
  return await delay(200)
})

const parseModels = (file: string) => JSON.parse(fs.readFileSync(file, 'utf-8'))

describe('models contract test', () => {
  test('Command Models | ESW-305, ESW-343, ESW-348', () => {
    verifyContract(commandModelsJsonPath, commandDecoders)
  })

  test('Location Models | ESW-308, ESW-343, ESW-348', () => {
    verifyContract(locationModelsJsonPath, locationDecoders)
  })

  test('should test Gateway models | ESW-317', () => {
    verifyContract(gatewayModelsJsonPath, gatewayDecoders)
  })

  test('should test Config models | ESW-319, ESW-320', () => {
    verifyContract(configModelsJsonPath, configDecoders)
  })

  test('should test Sequencer models | ESW-307', () => {
    verifyContract(sequencerModelsJsonPath, sequencerDecoders)
  })

  test('should test Sequencer models | ESW-356', () => {
    verifyContract(sequenceManagerModelsJsonPath, sequenceManagerDecoders)
  })
})

// [ ["ComponentType", ["Container", "HCD"] ], ["ValidateResponse", [...] ] ...]
const verifyContract = (inputJsonFile: string, decoders: Record<string, Decoder<any>>) => {
  const modelSet: Record<string, unknown[]> = parseModels(inputJsonFile)
  Object.entries(modelSet).forEach(([modelName, models]) => {
    models.forEach((modelJson) => testRoundTrip(modelJson, decoders[modelName]))
  })
}

const testRoundTrip = (scalaJsonModel: unknown, decoder: Decoder<any>) => {
  const decodedModel = getOrThrow(decoder.decode(scalaJsonModel)) // typescript side of decoding
  const tsJsonModel = JSON.parse(JSON.stringify(decodedModel)) // encoding
  expect(scalaJsonModel).toEqual(tsJsonModel)
}

const commandDecoders: Record<string, Decoder<any>> = {
  Units: M.UnitsD,
  Parameter: M.ParameterD,
  CommandName: D.string,
  CurrentState: M.CurrentStateD,
  CommandIssue: M.CommandIssueD,
  SubmitResponse: M.SubmitResponseD,
  OnewayResponse: M.OnewayResponseD,
  ValidateResponse: M.ValidateResponseD,
  ControlCommand: M.ControlCommandD,
  Result: M.ParamSetD,
  KeyType: M.keyTagDecoder
}

const locationDecoders: Record<string, Decoder<any>> = {
  TrackingEvent: TrackingEventD,
  ComponentType: M.ComponentTypeD,
  Connection: ConnectionD,
  Registration: D.id(),
  ComponentId: M.ComponentIdD,
  Prefix: M.PrefixD,
  LocationServiceError: D.id(),
  ConnectionType: ConnectionTypeD,
  Subsystem: M.SubsystemD,
  Location: LocationD
}

const gatewayDecoders: Record<string, Decoder<any>> = {
  Subsystem: M.SubsystemD,
  AlarmSeverity: AlarmSeverityD,
  AlarmKey: AlarmKeyD,
  ComponentId: ComponentIdD,
  EventKey: EventKeyD,
  Event: EventD,
  GatewayException: D.id(),
  Prefix: PrefixD,
  LogMetadata: LogMetadataD,
  Level: Level
}

const configDecoders: Record<string, Decoder<any>> = {
  ConfigId: C.ConfigIdD,
  FileType: C.FileTypeD,
  ConfigMetadata: C.ConfigMetadataD,
  ConfigFileInfo: C.ConfigFileInfoD,
  ConfigFileRevision: C.ConfigFileRevisionD
}

const sequencerDecoders: Record<string, Decoder<any>> = {
  SequenceCommand: M.SequenceCommandD,
  AkkaLocation: D.id(), //Using identity decoder  since the backend api(getSequenceComp) which returns this model is not provided in typescript
  GenericResponse: Seq.GenericResponseD,
  PauseResponse: Seq.PauseResponseD,
  SubmitResponse: M.SubmitResponseD,
  GoOfflineResponse: Seq.GoOfflineResponseD,
  GoOnlineResponse: Seq.GoOnlineResponseD,
  OperationsModeResponse: Seq.OperationsModeResponseD,
  OkOrUnhandledResponse: Seq.OkOrUnhandledResponseD,
  DiagnosticModeResponse: Seq.DiagnosticModeResponseD,
  RemoveBreakpointResponse: Seq.RemoveBreakpointResponseD,
  StepStatus: StepStatusD,
  Step: StepD,
  StepList: StepListD
}

const sequenceManagerDecoders: Record<string, Decoder<any>> = {
  ConfigureResponse: ConfigureResponseD,
  ProvisionResponse: ProvisionResponseD,
  GetRunningObsModesResponse: GetRunningObsModesResponseD,
  StartSequencerResponse: StartSequencerResponseD,
  RestartSequencerResponse: RestartSequencerResponseD,
  ShutdownSequencersResponse: ShutdownSequencersAndSeqCompResponseD,
  ShutdownSequenceComponentResponse: ShutdownSequencersAndSeqCompResponseD,
  AgentStatusResponse: AgentStatusResponseD,
  Prefix: PrefixD,
  ObsMode: ObsModeD,
  Subsystem: M.SubsystemD,
  ProvisionConfig: D.id()
}
