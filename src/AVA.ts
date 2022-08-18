import { KeyChain as AVMKeyChain, AVMAPI } from '@metalblockchain/metaljs/dist/apis/avm'
import { InfoAPI } from '@metalblockchain/metaljs/dist/apis/info'
import Metal from '@metalblockchain/metaljs'
//@ts-ignore
import BinTools from '@metalblockchain/metaljs/dist/utils/bintools'
import { EVMAPI } from '@metalblockchain/metaljs/dist/apis/evm'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
const ip: string = 'bootstrap.ava.network'
const port: number = 21000
const protocol: string = 'https'
const network_id: number = 2
const chain_id: string = 'X'
const bintools: BinTools = BinTools.getInstance()
const ava: Metal = new Metal(ip, port, protocol, network_id, chain_id)

const avm: AVMAPI = ava.XChain()
const cChain: EVMAPI = ava.CChain()
const pChain = ava.PChain()
const infoApi: InfoAPI = ava.Info()
const keyChain: AVMKeyChain = avm.keyChain()

function isValidAddress(addr: string) {
    try {
        const res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { ava, avm, pChain, cChain, infoApi, bintools, isValidAddress, keyChain }
