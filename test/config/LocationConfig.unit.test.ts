describe('LocationConfig', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() //it clears the cache
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('should give production hostname and port when NODE_ENV is set to production | ESW-475', async () => {
    process.env.NODE_ENV = 'production'
    const { LocationConfig } = await import('../../src/config/LocationConfig')
    const config = await LocationConfig()
    expect(config.hostName).toEqual('production-dns-entry.com')
    expect(config.port).toEqual(8765)
  })

  test('should give local hostname and port when NODE_ENV is not set to production | ESW-475', async () => {
    process.env.NODE_ENV = 'dev'
    const { LocationConfig } = await import('../../src/config/LocationConfig')
    const config = await LocationConfig()
    expect(config.hostName).toEqual('localhost')
    expect(config.port).toEqual(7654)
  })
})
