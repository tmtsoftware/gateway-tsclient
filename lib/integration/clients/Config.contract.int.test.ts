import 'whatwg-fetch'
import {
  ConfigFileRevision,
  ConfigId,
  ConfigMetadata,
  ConfigService
} from '../../src/clients/config'
import { startServices, stopServices } from '../utils/backend'
import { delay } from '../utils/eventually'
import { Option } from '../../src/utils/Option'

jest.setTimeout(30000)

beforeAll(async () => {
  //todo: fix this console.error for jsdom errors
  console.error = jest.fn()
  await startServices(['Config'])
  await delay(5000) // wait for svn repo to initialise
  configService = await ConfigService(() => token)
})

afterAll(async () => {
  await stopServices()
  jest.clearAllMocks()
})

const token = 'valid'
const path = 'somepath'
let configService:ConfigService;
const config1 = '{key:filecontent1}'
const config2 = '{key:filecontent2}'
const config3 = '{key:filecontent3}'

beforeEach(async () => {
  try {
    // deleting file which was created in test
    await configService.delete(path, 'deleting file')
  } catch (e) {}
})

describe('Config Client', () => {
  test('should create, getById, update, delete config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    // create file
    const configId = await configService.create(
      path,
      new Blob([expectedFileContent]),
      false,
      'creating file'
    )
    const actualFile = await configService.getById(path, configId)
    const actualFileContent = await new Response(actualFile).text()

    expect(actualFileContent).toEqual(expectedFileContent)

    //update file
    const newFileContent = '{key:new-file-content}'

    await configService.update(path, new Blob([newFileContent]), 'updating file')

    const updatedFile = await configService.getLatest(path)
    const updatedFileContent = await new Response(updatedFile).text()
    expect(updatedFileContent).toEqual(newFileContent)
  })

  test('should getActive config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    await configService.create(path, new Blob([expectedFileContent]), false, 'creating file')
    const actualFile = await configService.getActive(path)
    const actualFileContent = await new Response(actualFile).text()
    expect(actualFileContent).toEqual(expectedFileContent)
  })

  test('should getLatest config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    await configService.create(path, new Blob([expectedFileContent]), false, 'creating file')
    const actualFile = await configService.getLatest(path)
    const actualFileContent = await new Response(actualFile).text()
    expect(actualFileContent).toEqual(expectedFileContent)
  })

  test('should getByTime config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    await configService.create(path, new Blob([expectedFileContent]), false, 'creating file')
    const actualFile = await configService.getByTime(path, new Date())
    const actualFileContent = await new Response(actualFile).text()
    expect(actualFileContent).toEqual(expectedFileContent)
  })

  test('should check if exists config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    const configId = await configService.create(
      path,
      new Blob([expectedFileContent]),
      false,
      'creating file'
    )
    const exists = await configService.exists(path, configId)
    expect(exists).toEqual(true)
  })

  test('should list config | ESW-320', async () => {
    const expectedFileContent = '{key:filecontent}'

    const configId = await configService.create(
      path,
      new Blob([expectedFileContent]),
      false,
      'creating file'
    )
    const configFileInfo = (await configService.list('Normal', '.*'))[0]
    expect(configFileInfo.path).toEqual(path)
    expect(configFileInfo.id).toEqual(configId)
    expect(configFileInfo.author).toEqual('test')
    expect(configFileInfo.comment).toEqual('creating file')
  })

  test('should get file revisions of a config between a time period | ESW-320', async () => {
    // create file
    await configService.create(path, new Blob([config1]), false, 'creating file')

    const from = new Date()
    const configId2 = await configService.update(path, new Blob([config2]), 'updating file')
    const configId3 = await configService.update(path, new Blob([config3]), 'updating file')
    const to = new Date()

    const expectedFileRevision: ConfigFileRevision[] = [
      {
        author: 'test',
        comment: 'updating file',
        id: configId3,
        time: ''
      },
      {
        author: 'test',
        comment: 'updating file',
        id: configId2,
        time: ''
      }
    ]

    // verify file contents based on time (i.e before and after setting version)
    const configFileRevisions = await configService.history(path, from, to, 5)
    configFileRevisions.forEach((value, index) => {
      expect(value.id).toEqual(expectedFileRevision[index].id)
      expect(value.comment).toEqual(expectedFileRevision[index].comment)
    })
  })

  test('should get active file revisions of a config between a time period | ESW-320', async () => {
    // create file
    const configId = await configService.create(path, new Blob([config1]), false, 'creating file')

    const from = new Date()
    await configService.setActiveVersion(path, configId, 'set active 1')
    const configId2 = await configService.update(path, new Blob([config2]), 'updating file')
    await configService.setActiveVersion(path, configId2, 'set active 2')
    await configService.update(path, new Blob([config3]), 'updating file')
    const to = new Date()

    const expectedFileRevision: ConfigFileRevision[] = [
      {
        author: 'test',
        comment: 'set active 2',
        id: configId2,
        time: ''
      },
      {
        author: 'test',
        comment: 'set active 1',
        id: configId,
        time: ''
      }
    ]
    // verify file contents based on time (i.e before and after setting version)
    const configFileRevisions = await configService.historyActive(path, from, to, 5)
    configFileRevisions.forEach((value, index) => {
      expect(value.id).toEqual(expectedFileRevision[index].id)
      expect(value.comment).toEqual(expectedFileRevision[index].comment)
    })
  })

  test('should set active version of config | ESW-320', async () => {
    // create file
    const configId = await configService.create(path, new Blob([config1]), false, 'creating file')
    // update file
    const configId2 = await configService.update(path, new Blob([config2]), 'updating file')
    await configService.setActiveVersion(
      path,
      configId2,
      'setting active version to first file content'
    )
    const updateTimeStamp = new Date()

    await configService.setActiveVersion(
      path,
      configId,
      'setting active version to first file content'
    )

    // verify file contents based on time (i.e before and after setting version)
    expect(
      await new Response(await configService.getActiveByTime(path, updateTimeStamp)).text()
    ).toEqual(config2)
    expect(
      await new Response(await configService.getActiveByTime(path, new Date())).text()
    ).toEqual(config1)
  })

  test('should reset active version of config | ESW-320', async () => {
    // create file
    await configService.create(path, new Blob([config1]), false, 'creating file')

    // update file two times
    const configId = await configService.update(path, new Blob([config2]), 'updating file')
    await configService.update(path, new Blob([config3]), 'updating file')

    const updateTimeStamp = new Date()
    await configService.setActiveVersion(path, configId, 'setting active version to second')

    const timeStampBeforeResetting = new Date()
    await configService.resetActiveVersion(path, 'resetting version')

    // verify file contents based on time (i.e before and after resetting version)
    expect(
      await new Response(await configService.getActiveByTime(path, updateTimeStamp)).text()
    ).toEqual(config1)
    expect(
      await new Response(await configService.getActiveByTime(path, timeStampBeforeResetting)).text()
    ).toEqual(config2)
    expect(
      await new Response(await configService.getActiveByTime(path, new Date())).text()
    ).toEqual(config3)
  })

  test('should get active version of file by a given time | ESW-320', async () => {
    const fileContent = '{key:filecontent}'
    await configService.create(path, new Blob([fileContent]), false, 'creating file')

    const file = await configService.getActiveByTime(path, new Date())
    const updatedFileContent = await new Response(file).text()
    expect(updatedFileContent).toEqual(fileContent)
  })

  test('should get active version of file | ESW-320', async () => {
    const expectedConfigId = await configService.create(
      path,
      new Blob(['{key:filecontent}']),
      false,
      'creating file'
    )

    const configId: Option<ConfigId> = await configService.getActiveVersion(path)

    expect(configId).toEqual(expectedConfigId)
  })

  test('should get metadata of config server | ESW-320', async () => {
    const expectedMetadata: ConfigMetadata = {
      annexMinFileSize: '10 MiB',
      annexPath: '/tmp/csw-config-annex-files',
      maxConfigFileSize: '50 MiB',
      repoPath: '/tmp/csw-config-svn'
    }

    const configMetadata: ConfigMetadata = await configService.getMetadata()

    expect(configMetadata).toEqual(expectedMetadata)
  })
})
