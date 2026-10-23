// Shared constants of the Windows 11 track (kept out of component files for fast refresh).

/** Windows Update: check → download → install, sped up for class (UpdatePage11 shows the same timeline) */
export const WIN11_UPDATE_MS = 9000

/** the customer's notebook used through the whole Windows 11 track */
export const PLOY_PC = {
  name: 'PLOY-NB',
  cpu: 'Bloom Core 5 1240U @ 2.40GHz (4 cores, 8 logical processors)',
  ram: '8.00 GB',
  disk: 'NVMe BLOOM 256GB',
  usb: 'KingstonDataTraveler 3.0',
} as const

/** text Windows Setup shows when the hardware check fails */
export const NOT_SUPPORTED = "This PC can't run Windows 11"
