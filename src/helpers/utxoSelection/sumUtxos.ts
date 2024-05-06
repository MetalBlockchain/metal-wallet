import { AmountOutput as AmountOutputX, UTXO as UTXOX } from '@metalblockchain/metaljs/dist/apis/avm'
import { AmountOutput as AmountOutputP, UTXO as UTXOP } from '@metalblockchain/metaljs/dist/apis/platformvm'
import { BN } from '@metalblockchain/metaljs'

type UTXO = UTXOX | UTXOP
type AmountOutput = AmountOutputX | AmountOutputP

/**
 * Return the sum of given UTXOs
 * @param utxos
 */
export function sumUtxos(utxos: UTXO[]) {
    // Get final amount
    return utxos.reduce((tot, utxo) => {
        const amt = (utxo.getOutput() as AmountOutput).getAmount()
        return tot.add(amt)
    }, new BN(0))
}
