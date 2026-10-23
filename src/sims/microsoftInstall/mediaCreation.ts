export const MICROSOFT_WIN10_URL = 'https://www.microsoft.com/th-th/software-download/windows10'
export interface MediaOptions { task: string; language: string; architecture: string; media: string; drive: string }

export function mediaIssue(options: MediaOptions): string | null {
  if (options.task !== 'create') return 'mct-task'
  if (options.language !== 'Thai' || options.architecture !== '64') return 'mct-options'
  if (options.media !== 'usb') return 'mct-media'
  if (options.drive !== 'F') return 'mct-drive'
  return null
}
