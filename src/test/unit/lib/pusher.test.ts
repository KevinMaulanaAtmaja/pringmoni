import { describe, it, expect, vi, afterEach } from 'vitest'

const { triggerMock, ctorMock } = vi.hoisted(() => ({
  triggerMock: vi.fn(),
  ctorMock: vi.fn(),
}))

vi.mock('pusher', () => ({
  default: class PusherMock {
    trigger = triggerMock
    constructor(options: unknown) {
      ctorMock(options)
    }
  },
}))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  vi.clearAllMocks()
})

describe('pusher', () => {
  it('mengekspos nama channel dan event yang stabil', async () => {
    const mod = await import('@/lib/pusher')
    expect(mod.ORDERS_CHANNEL).toBe('orders')
    expect(mod.PESANAN_EVENTS).toEqual({
      newOrder: 'new_order',
      orderUpdated: 'order_updated',
      orderPaid: 'order_paid',
    })
  })

  it('tidak melakukan apa pun saat kredensial tidak lengkap', async () => {
    vi.stubEnv('NEXT_PUBLIC_PUSHER_KEY', '')
    vi.stubEnv('PUSHER_SECRET', '')

    const mod = await import('@/lib/pusher')
    await mod.triggerPusher('orders', 'new_order', { id: 1 })

    expect(ctorMock).not.toHaveBeenCalled()
    expect(triggerMock).not.toHaveBeenCalled()
  })

  it('membuat client dan mengirim event saat kredensial lengkap', async () => {
    vi.stubEnv('NEXT_PUBLIC_PUSHER_KEY', 'key')
    vi.stubEnv('PUSHER_SECRET', 'secret')
    vi.stubEnv('PUSHER_APP_ID', 'app')
    vi.stubEnv('NEXT_PUBLIC_PUSHER_CLUSTER', 'ap1')
    triggerMock.mockResolvedValue(undefined)

    const mod = await import('@/lib/pusher')
    await mod.triggerPusher('orders', 'order_paid', { id: 9 })

    expect(ctorMock).toHaveBeenCalledWith({
      appId: 'app',
      key: 'key',
      secret: 'secret',
      cluster: 'ap1',
      useTLS: true,
    })
    expect(triggerMock).toHaveBeenCalledWith('orders', 'order_paid', { id: 9 })
  })

  it('menelan error trigger agar tidak memutus alur utama', async () => {
    vi.stubEnv('NEXT_PUBLIC_PUSHER_KEY', 'key')
    vi.stubEnv('PUSHER_SECRET', 'secret')
    triggerMock.mockRejectedValue(new Error('pusher down'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mod = await import('@/lib/pusher')
    await expect(mod.triggerPusher('orders', 'new_order', {})).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
