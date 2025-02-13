import { AvaNetwork } from '../js/AvaNetwork'
import { connectSocketC } from '@/providers/socket_c'

export function setSocketNetwork(network: AvaNetwork) {
    // Setup EVM socket connection
    connectSocketC(network)
}

export * from './socket_c'
