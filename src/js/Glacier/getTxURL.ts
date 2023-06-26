import { ChainIdType } from '@/constants'

const mainnetBase = 'https://explorer.metalblockchain.org/'
const fujiBase = 'https://tahoe-explorer.metalblockchain.org/'

const avascanMainnet = `https://metalscan.io`
const avascanFuji = `https://tahoe.metalscan.io`
/**
 * Get the URL for the given transaction hash on subnets.avax.network
 * @param txHash
 * @param chain
 * @param isMainnet
 */
export function getTxURL(txHash: string, chain: ChainIdType, isMainnet: boolean) {
    // For C chain use avascan
    //TODO: Switch to glacier when ready
    if (chain === 'C') {
        const base = isMainnet ? avascanMainnet : avascanFuji
        return base + `/blockchain/c/tx/${txHash}`
    }

    const base = isMainnet ? mainnetBase : fujiBase
    return `${base}tx/${txHash}`
    const chainPath = chain.toLowerCase() + '-chain'
    return `${base}${chainPath}/tx/${txHash}`
}
