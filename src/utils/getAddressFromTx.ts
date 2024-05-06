import { BaseTx as AVMBaseTx, TransferableOutput } from '@metalblockchain/metaljs/dist/apis/avm'
import { BaseTx as PlatformBaseTx } from '@metalblockchain/metaljs/dist/apis/platformvm'
import { EVMBaseTx } from '@metalblockchain/metaljs/dist/apis/evm'
import { AddDelegatorTx, AddValidatorTx, AddPermissionlessValidatorTx, AddPermissionlessDelegatorTx } from '@metalblockchain/metaljs/dist/apis/platformvm/validationtx'
import { bintools, ava as avalanche } from '@/AVA'

import { UnsignedTx as AVMUnsignedTx } from '@metalblockchain/metaljs/dist/apis/avm/tx'
import { UnsignedTx as PlatformUnsignedTx } from '@metalblockchain/metaljs/dist/apis/platformvm/tx'
import { UnsignedTx as EVMUnsignedTx } from '@metalblockchain/metaljs/dist/apis/evm/tx'

/**
 * Returns an array of unique addresses that are found on stake outputs of a tx.
 * @param tx
 */
export function getStakeOutAddresses(tx: AVMBaseTx | PlatformBaseTx | EVMBaseTx): string[] {
    if (tx instanceof AddValidatorTx || tx instanceof AddDelegatorTx || tx instanceof AddPermissionlessValidatorTx || tx instanceof AddPermissionlessDelegatorTx) {
        const allAddrs = tx
            .getStakeOuts()
            .map((out) =>
                out
                    .getOutput()
                    .getAddresses()
                    .map((addr) => {
                        return bintools.addressToString(avalanche.getHRP(), 'P', addr)
                    })
            )
            .flat()
        // Remove duplicates
        return [...new Set(allAddrs)]
    }

    return []
}

export function getOutputAddresses(tx: AVMBaseTx | PlatformBaseTx) {
    const chainID = tx instanceof AVMBaseTx ? 'X' : 'P'
    const outAddrs = tx
        .getOuts()
        //@ts-ignore
        .map((out: TransferableOutput) =>
            out
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(avalanche.getHRP(), chainID, addr)
                })
        )
        .flat()
    return [...new Set(outAddrs)] as string[]
}

/**
 * Returns every output address for the given transaction.
 * @param unsignedTx
 */
export function getTxOutputAddresses<
    UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx
>(unsignedTx: UnsignedTx): string[] {
    if (unsignedTx instanceof EVMUnsignedTx) {
        return []
    }

    const tx = unsignedTx.getTransaction()
    if (tx instanceof AVMBaseTx) {
        const outAddrs = getOutputAddresses(tx)
        return outAddrs
    } else if (tx instanceof PlatformBaseTx) {
        const stakeAddrs = getStakeOutAddresses(tx)
        const outAddrs = getOutputAddresses(tx)

        return [...new Set([...stakeAddrs, ...outAddrs])]
    }

    return []
}
