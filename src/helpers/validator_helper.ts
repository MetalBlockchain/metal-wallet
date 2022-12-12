import { ValidatorMetaData } from '@/store/types'

const axios = require('axios')

export async function getValidatorMetaData(): Promise<ValidatorMetaData> {
    const res = await axios.get('https://api.metalscan.io/v1/validators')
    return res.data
}
