import { AvaNetwork } from '@/js/AvaNetwork'

export const MainnetConfig = new AvaNetwork(
    'Mainnet',
    'http://localhost:9650',
    1,
    'https://explorerapi.avax.network',
    'https://explorer-xp.avax.network',
    true
)

export const TestnetConfig = new AvaNetwork(
    'Fuji',
    'https://api.avax-test.network:443',
    5,
    'https://explorerapi.avax-test.network',
    'https://explorer-xp.avax-test.network',
    true
)
