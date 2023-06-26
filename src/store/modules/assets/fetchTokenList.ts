import { TokenList } from '@/store/modules/assets/types'

function mapTokenInfo(token: any) {
    return { ...token, logoURI: token.logoUri }
}

/**
 * Fetch erc20 token information from glacier
 */
export async function fetchTokenList(): Promise<TokenList> {
    const res = await fetch(
        'https://glacier-api-dev.metalblockchain.org/proxy/chain-assets/main/core-wallet/token-list.erc20.json'
    )
    const json = await res.json()

    const tokensMainnet = json[381931].tokens.map(mapTokenInfo)
    const tokensTestnet = json[381932].tokens.map(mapTokenInfo)

    return {
        name: 'Metal (C-Chain)',
        logoURI:
            'https://raw.githubusercontent.com/MetalBlockchain/static-assets/main/images/metal-icon.png',
        keywords: [],
        timestamp: '',
        url: '',
        readonly: true,
        version: {
            major: 1,
            minor: 0,
            patch: 0,
        },
        tokens: [...tokensMainnet, ...tokensTestnet],
    }
}
