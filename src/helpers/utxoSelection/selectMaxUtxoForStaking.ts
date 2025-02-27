import { UTXO, UTXOSet } from '@metalblockchain/metaljs/dist/apis/platformvm/utxos'
import { bintools, pChain } from '@/AVA'
import { BN } from '@metalblockchain/metaljs'
import { getCredentialBytes } from '@/helpers/utxoSelection/getCredentialBytes'
import { getTxSize } from '@/helpers/utxoSelection/getTxSize'
import { sumUtxos } from '@/helpers/utxoSelection/sumUtxos'
import { DUMMY_NODE_ID, MAX_TX_SIZE_P } from './constants'
import { PrimaryNetworkID } from '@metalblockchain/metaljs/dist/utils'
import { PlatformVMConstants, ProofOfPossession, Signer } from '@metalblockchain/metaljs/dist/apis/platformvm'

/**
 * Selects the max number of utxos that will fit in a staking transaction.
 * @param utxoSet
 * @param stakeAmount
 * @param fromAddresses
 * @param rewardAddress
 * @param stakeReturnAddr
 * @param changeAddress
 * @param isAddValidator
 */
export async function selectMaxUtxoForStaking(
    utxoSet: UTXOSet,
    stakeAmount: BN,
    fromAddresses: string[],
    rewardAddress: string,
    stakeReturnAddr: string,
    changeAddress: string,
    isAddValidator = true
) {
    const stakeAmoutClone = stakeAmount.clone()
    const start = new Date(new Date().getTime() + 30 * 10000)
    const end = new Date(start.getTime() + 1200 * 60 * 1000)
    // Convert dates to unix time
    const startTime = new BN(Math.round(start.getTime() / 1000))
    const endTime = new BN(Math.round(end.getTime() / 1000))

    const utxos = utxoSet.getAllUTXOs()

    const tempSet = new UTXOSet()
    tempSet.addArray(utxos)

    try {
        // Generate the dummy tx
        const unsignedTx = isAddValidator
            ? await pChain.buildAddPermissionlessValidatorTx(
                  tempSet,
                  [stakeReturnAddr],
                  fromAddresses, // from
                  [changeAddress], // change
                  DUMMY_NODE_ID,
                  startTime,
                  endTime,
                  stakeAmoutClone,
                  [rewardAddress],
                  1,
                  PrimaryNetworkID,
                  new Signer()
              )
            : await pChain.buildAddPermissionlessDelegatorTx(
                  tempSet,
                  [stakeReturnAddr],
                  fromAddresses, // from
                  [changeAddress], // change
                  DUMMY_NODE_ID,
                  startTime,
                  endTime,
                  stakeAmoutClone,
                  [rewardAddress],
                  PrimaryNetworkID,
              )

        // What is to total size of the transaction
        const totSize = getTxSize(unsignedTx)

        // How many UTXOs do we need to get rid of
        const diff = Math.max(totSize - MAX_TX_SIZE_P, 0)
        const diffUtxoNum = Math.ceil(diff / 161) // 161 is the size of 1 utxo + cred
        const trimmedArray = utxos.slice(0, utxos.length - diffUtxoNum)

        const result = new UTXOSet()
        result.addArray(trimmedArray)

        // Get final amount
        const totAmount = sumUtxos(trimmedArray)

        return {
            amount: totAmount,
            utxos: result,
        }
    } catch (e) {
        return {
            amount: stakeAmount,
            utxos: utxoSet,
        }
    }
}
