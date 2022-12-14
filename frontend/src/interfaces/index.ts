import type { main } from '../../wailsjs/go/models'

export type RawRecord = Pick<main.Record, 'name' | 'type' | 'exe'>

export type RawLabel = Pick<main.Label, 'recordID' | 'name'>

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T
