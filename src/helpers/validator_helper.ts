import type { ValidatorMetaData } from "@/stores/types";
import axios from "axios";

export async function getValidatorMetaData(): Promise<ValidatorMetaData> {
  const res = await axios.get("https://api.metalscan.io/v1/validators");
  return res.data;
}
