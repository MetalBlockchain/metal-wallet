import { UTXO } from '@metalblockchain/metaljs/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
