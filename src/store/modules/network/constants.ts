import { AvaNetwork } from '@/js/AvaNetwork'

export const MainnetConfig = new AvaNetwork(
    'Mainnet',
    'https://api.metalblockchain.org:443',
    1,
    'https://explorerapi.avax.network',
    'https://explorer-xp.avax.network',
    true
)

export const TestnetConfig = new AvaNetwork(
    'Tahoe',
    'https://tahoe.metalblockchain.org:443',
    5,
    'https://explorerapi.avax-test.network',
    'https://explorer-xp.avax-test.network',
    true
)
