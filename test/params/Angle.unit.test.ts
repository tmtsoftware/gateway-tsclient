import { Angle } from '../../src/models/params/Angle'

describe('Basic parsing of radec as strings', () => {
  it('should allow basic parsing using Angle', () => {
    expect([Angle.parseRaFromString('20 54 05.689'), Angle.parseDeFromString('+37 01 17.38')]).toEqual(
      Angle.parseRaDe('20 54 05.689 +37 01 17.38')
    )

    expect([Angle.parseRaFromString('10:12:45.3'), Angle.parseDeFromString('-45:17:50')]).toEqual(
      Angle.parseRaDe('10:12:45.3-45:17:50')
    )

    expect([Angle.parseRaFromString('15h17m'), Angle.parseDeFromString('-11d10m')]).toEqual(
      Angle.parseRaDe('15h17m-11d10m')
    )

    expect([Angle.parseRaFromString('275d11m15.6954s'), Angle.parseDeFromString('+17d59m59.876s')]).toEqual(
      Angle.parseRaDe('275d11m15.6954s+17d59m59.876s')
    )
  })

  it('should allow using implicits', () => {
    expect([Angle.fromArcHour(12.34567), Angle.fromDegree(-17.87654)]).toEqual(Angle.parseRaDe('12.34567h-17.87654d'))

    expect([Angle.fromDegree(350.123456), Angle.fromDegree(-17.33333)]).toEqual(
      Angle.parseRaDe('350.123456d-17.33333d')
    )

    expect([Angle.fromDegree(350.123456), Angle.fromDegree(-17.33333)]).toEqual(Angle.parseRaDe('350.123456 -17.33333'))
  })
})

describe('Test parsing', () => {
  it('should allow testing of parser to microarcsecs -1', () => {
    expect(Angle.parseRa('1', '2', '3').uas).toEqual(
      1 * 15 * 60 * 60 * 1000 * 1000 + 2 * 15 * 60 * 1000 * 1000 + 3 * 15 * 1000 * 1000
    )
    expect(Angle.parseDe('+', '1', '2', '3').uas).toEqual(
      1 * 60 * 60 * 1000 * 1000 + 2 * 60 * 1000 * 1000 + 3 * 1000 * 1000
    )
  })

  it('should allow parsing to microsarcsecs -2', () => {
    expect(Angle.parseRaFromString('1h2m3s').uas).toEqual(
      1 * 15 * 60 * 60 * 1000 * 1000 + 2 * 15 * 60 * 1000 * 1000 + 3 * 15 * 1000 * 1000
    )
    expect(Angle.parseRaFromString('02 51.2').uas).toEqual(2 * 15 * 60 * 60 * 1000 * 1000 + 512 * 15 * 60 * 1000 * 100)
    expect(Angle.parseDeFromString('+1d2\'3"').uas).toEqual(
      1 * 60 * 60 * 1000 * 1000 + 2 * 60 * 1000 * 1000 + 3 * 1000 * 1000
    )
    expect(Angle.parseDeFromString('-1d2\'3"').uas).toEqual(
      -(1 * 60 * 60 * 1000 * 1000 + 2 * 60 * 1000 * 1000 + 3 * 1000 * 1000)
    )
    expect(Angle.parseDeFromString('+13 12').uas).toEqual(13 * 60 * 60 * 1000 * 1000 + 12 * 60 * 1000 * 1000)
  })
})

describe('conversion tests', () => {
  it('should allow conversions', () => {
    expect(Angle.H2D * 1).toEqual(15.0)
    expect(Angle.D2H * 1).toEqual(1.0 / 15.0)
    expect(Angle.D2M).toEqual(60)
    expect(Angle.M2D).toEqual(1.0 / 60.0)
    expect(Angle.D2S).toEqual(3600)
    expect(Angle.S2D).toEqual(1.0 / 3600.0)
    expect(Angle.Mas2R).toEqual(Angle.D2R / 3600000.0)
    expect(Angle.R2Mas).toEqual(1.0 / Angle.Mas2R)
  })
})

describe('Should allow distance calculation', () => {
  it('Should do distance', () => {
    expect(Angle.distance(Angle.D2R * 1, 0, Angle.D2R * 2, 0)).toEqual(Angle.D2R * 1)
    expect(Angle.distance(0, Angle.D2R * 90, Angle.D2R * 180, -(Angle.D2R * 90))).toEqual(Angle.D2R * 180)
  })
})

describe('Positions to String', () => {
  it('should convert RA to string', () => {
    expect('11h').toEqual(Angle.raToString(Angle.H2R * 11))
    expect('11h 12m').toEqual(Angle.raToString(Angle.H2R * 11 + (Angle.H2R * 12) / 60.0))
    expect('11h 12m 13s').toEqual(
      Angle.raToString(Angle.H2R * 11 + (Angle.H2R * 12) / 60.0 + (Angle.H2R * 13) / 3600.0)
    )
    expect('11h 12m 13.3s').toEqual(
      Angle.raToString(Angle.H2R * 11 + (Angle.H2R * 12) / 60.0 + (Angle.H2R * 13.3) / 3600.0)
    )
  })

  it('should convert Dec to string', () => {
    expect('11' + Angle.DEGREE_SIGN).toEqual(Angle.deToString(Angle.D2R * 11))
    expect('11' + Angle.DEGREE_SIGN + "12'").toEqual(Angle.deToString(Angle.D2R * 11 + Angle.M2R * 12))
    expect('11' + Angle.DEGREE_SIGN + '12\'13"').toEqual(
      Angle.deToString(Angle.D2R * 11 + Angle.M2R * 12 + Angle.S2R * 13)
    )
    expect('11' + Angle.DEGREE_SIGN + '12\'13.3"').toEqual(
      Angle.deToString(Angle.D2R * 11 + Angle.M2R * 12 + Angle.S2R * 13.3)
    )
    expect('-11' + Angle.DEGREE_SIGN + "12'").toEqual(Angle.deToString(-(Angle.D2R * 11 + Angle.M2R * 12)))
  })
})

describe('Angle Operators', () => {
  const angle1 = new Angle(12)
  const angle2 = new Angle(2)

  it('12 Add 2 gives 14', () => {
    expect(angle1.add(angle2).uas).toEqual(14)
  })

  it('12 Sub 2  gives 10', () => {
    expect(angle1.sub(angle2).uas).toEqual(10)
  })

  it('12 Div 2 gives 6', () => {
    expect(angle1.div(angle2).uas).toEqual(6)
  })

  it('12 div2 2 gives 6', () => {
    expect(angle1.div2(angle2.uas).uas).toEqual(6)
  })

  it('12 mul 2 gives 24', () => {
    expect(angle1.mul(angle2).uas).toEqual(24)
  })

  it('12 mul2 2 gives 24', () => {
    expect(angle1.mul2(angle2.uas).uas).toEqual(24)
  })
})

describe('Angle', () => {
  const angle = new Angle(12)

  it('toRadian', () => {
    expect(angle.toRadian()).toEqual(5.817764173314432e-11)
  })

  it('toDegree', () => {
    expect(angle.toDegree()).toEqual(3.3333333333333334e-9)
  })

  it('toMas', () => {
    expect(angle.toMas()).toEqual(0.012)
  })

  it('toArcSec', () => {
    expect(angle.toArcSec()).toEqual(0.000012)
  })
})
