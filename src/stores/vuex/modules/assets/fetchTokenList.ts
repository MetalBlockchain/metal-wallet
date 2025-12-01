import type { TokenList } from "@/stores/vuex/modules/assets/types";

function mapTokenInfo(token: any) {
  return { ...token, logoURI: token.logoUri };
}

/**
 * Fetch erc20 token information from glacier
 */
export async function fetchTokenList(): Promise<TokenList> {
  const res = await fetch(
    "https://glacier-api.metalblockchain.org/proxy/chain-assets/main/core-wallet/token-list.erc20.json",
  );
  const json = await res.json();

  const tokensMainnet = json[381_931].tokens.map((_: any) => mapTokenInfo(_));
  const tokensTestnet = json[381_932].tokens.map((_: any) => mapTokenInfo(_));

  return {
    name: "Metal (C-Chain)",
    logoURI:
      "https://raw.githubusercontent.com/MetalBlockchain/static-assets/main/images/metal-icon.png",
    keywords: [],
    timestamp: "",
    url: "",
    readonly: true,
    version: {
      major: 1,
      minor: 0,
      patch: 0,
    },
    tokens: [...tokensMainnet, ...tokensTestnet],
  };
}
