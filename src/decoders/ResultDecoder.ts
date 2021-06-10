import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Result } from '../models'
import type { Decoder } from './Decoder'
import { ParameterD } from './ParameterDecoder'

export const ResultD: Decoder<Result> = pipe(
  D.struct({
    paramSet: D.array(ParameterD)
  }),
  D.parse((r) => D.success(new Result(r.paramSet)))
)
