import { describe, it, expect } from 'vitest'

describe('Plugin entry', () => {
    it('should export BgCoverPlugin class', async () => {
        const mod = await import('../src/index')
        expect(mod.default).toBeDefined()
        expect(mod.svelteDialog).toBeDefined()
    })
})
