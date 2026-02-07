import { io, Socket } from 'socket.io-client'
import { store } from '@/store'
import { updatePrices } from '@/store/slices/marketSlice'
import { PriceUpdate } from '@/types'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    if (this.socket?.connected) return

    this.socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect()
    })

    this.socket.on('priceUpdate', (data: PriceUpdate[]) => {
      store.dispatch(updatePrices(data))
    })

    this.socket.on('orderUpdate', (data: unknown) => {
      console.log('Order update:', data)
      // Handle order updates
    })

    this.socket.on('alertTriggered', (data: unknown) => {
      console.log('Alert triggered:', data)
      // Handle alert notifications
    })

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  subscribeToSymbol(symbol: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { symbol })
    }
  }

  unsubscribeFromSymbol(symbol: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { symbol })
    }
  }

  subscribeToOrderBook(symbol: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribeOrderBook', { symbol })
    }
  }

  unsubscribeFromOrderBook(symbol: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribeOrderBook', { symbol })
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const wsService = new WebSocketService()
export default wsService
