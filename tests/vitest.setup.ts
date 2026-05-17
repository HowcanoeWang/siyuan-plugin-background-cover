import '@testing-library/jest-dom/vitest'

;(window as any).siyuan = {
    config: {
        system: { id: 'test-device', workspaceDir: '/tmp/test-workspace' },
    },
    storage: {} as Record<string, any>,
    languages: { cancel: 'Cancel', confirm: 'Confirm' },
}
if (!(window as any).fetchPost) {
    ;(window as any).fetchPost = () => {}
}
