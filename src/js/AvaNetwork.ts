import axios from 'axios'

let network_id: number = 0

class AvaNetwork {
    name: string
    id: number
    protocol: string
    port: number
    ip: string
    networkId: number
    // chainId: string;
    url: string
    explorerUrl: string | undefined
    explorerSiteUrl: string | undefined
    readonly: boolean
    withCredentials = false
    // fee: BN

    constructor(
        name: string,
        url: string,
        networkId: number,
        explorerUrl?: string,
        explorerSiteUrl?: string,
        readonly = false
    ) {
        this.id = network_id++
        this.name = name
        this.explorerUrl = explorerUrl
        this.explorerSiteUrl = explorerSiteUrl
        this.protocol = 'http'
        this.port = 9650
        this.ip = 'localhost'
        this.url = url
        this.updateURL(url)
        this.networkId = networkId
        // this.chainId = chainId;
        this.readonly = readonly
        // this.fee = new BN(0);
    }

    async testConnection(credentials = false) {
        const resp = await axios
            .post(
                this.url + '/ext/info',
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'info.getNetworkID',
                },
                {
                    withCredentials: true,
                }
            )
            .catch((err) => {
                return false
            })

        return true
    }

    // Checks if this network endpoint allows credentials
    async updateCredentials() {
        try {
            const res = await axios.post(
                this.url + '/ext/info',
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'info.getNetworkID',
                },
                {
                    withCredentials: true,
                }
            )
            this.withCredentials = true
        } catch (e) {
            this.withCredentials = false
        }
    }

    updateURL(url: string) {
        const split: string[] = url.split('://')

        this.protocol = split[0]

        // port is set
        if (split[1].includes(':')) {
            const urlSplit: string[] = split[1].split(':')
            const ip: string = urlSplit[0]
            const port: string = urlSplit[1]

            this.ip = ip
            this.port = parseInt(port)
        } else {
            this.ip = split[1]
            if (this.protocol === 'http') {
                this.port = 80
            } else {
                this.port = 443
            }
        }
    }
    getFullURL() {
        return `${this.protocol}://${this.ip}:${this.port}`
    }

    getWsUrlC(): string {
        const protocol = this.protocol === 'https' ? 'wss' : 'ws'
        return `${protocol}://${this.ip}:${this.port}/ext/bc/C/ws`
    }
}

export { AvaNetwork }
