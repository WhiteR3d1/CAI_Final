// Deterministic shuffling (pure, no Math.random) so renders stay stable and tests can check the result.

/** 32-bit FNV-1a hash of a string */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** small seeded PRNG (mulberry32) returning numbers in [0, 1) */
function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** a permutation of 0..n-1 that depends only on the key (Fisher–Yates with a seeded PRNG) */
export function shuffledOrder(n: number, key: string): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  const rand = prng(hashString(key))
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

/** display order of a quiz question's choices; changes with every attempt of the job */
export const quizOrder = (questionId: string, choices: number, attempt: number) => shuffledOrder(choices, `${questionId}#${attempt}`)
