import type {
  DelegatorPendingRaw,
  ValidatorPendingRaw,
  ValidatorRaw,
} from "@/components/misc/ValidatorList/types";
import type {
  GetValidatorsResponse,
  ValidatorDelegatorPendingDict,
  ValidatorListItem,
} from "@/stores/types/platform";

import { BN } from "@metalblockchain/metaljs";

import { ONEAVAX } from "@metalblockchain/metaljs/dist/utils";
import { pChain } from "@/misc/AVA";

export interface IPlatformStore {
  validators: ValidatorRaw[];
  validatorsPending: ValidatorPendingRaw[];
  delegatorsPending: DelegatorPendingRaw[];
  minStake: BN;
  minStakeDelegation: BN;
  currentSupply: BN;
}

function getDefaultState(): IPlatformStore {
  return {
    validators: [],
    validatorsPending: [],
    delegatorsPending: [],
    minStake: new BN(0),
    minStakeDelegation: new BN(0),
    currentSupply: new BN(1),
  };
}

const MINUTE_MS = 60_000;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

export const usePlatformStore = defineStore("platform", {
  state: () => getDefaultState(),
  actions: {
    async updateCurrentSupply() {
      this.currentSupply = await pChain.getCurrentSupply();
    },

    async updateMinStakeAmount() {
      const res = await pChain.getMinStake(true);
      this.minStake = res.minValidatorStake;
      this.minStakeDelegation = res.minDelegatorStake;
    },

    update() {
      this.updateValidators();
      this.updateCurrentSupply();
    },

    async updateValidators() {
      const res =
        (await pChain.getCurrentValidators()) as GetValidatorsResponse;
      const validators = res.validators;

      this.setValidators(validators);
    },
    setValidators(validators: ValidatorRaw[]) {
      this.validators = validators;
    },
  },
  getters: {
    validatorListEarn(): ValidatorListItem[] {
      // Filter validators we do not need
      const now = Date.now();

      let validators = this.validators;
      validators = validators.filter((v) => {
        const endTime = Number.parseInt(v.endTime) * 1000;
        const dif = endTime - now;

        // If End time is less than 2 weeks + 1 hour, remove from list they are no use
        const threshold = DAY_MS * 14 + 10 * MINUTE_MS;
        if (dif <= threshold) {
          return false;
        }

        return true;
      });

      const delegatorPendingMap: ValidatorDelegatorPendingDict =
        this.nodeDelegatorPendingMap;

      let res: ValidatorListItem[] = [];

      for (const v of validators) {
        if (v) {
          const nodeID = v.nodeID;

          const delegatorsPending: DelegatorPendingRaw[] =
            delegatorPendingMap[nodeID] || [];

          const delegatedAmt = new BN(v.delegatorWeight);
          let delegatedPendingAmt = new BN(0);

          if (delegatorsPending) {
            delegatedPendingAmt = delegatorsPending.reduce(
              (acc: BN, val: DelegatorPendingRaw) => {
                return acc.add(new BN(val.stakeAmount));
              },
              new BN(0),
            );
          }

          const startTime = new Date(Number.parseInt(v.startTime) * 1000);
          const endTime = new Date(Number.parseInt(v.endTime) * 1000);

          const delegatedStake = delegatedAmt.add(delegatedPendingAmt);
          const validatorStake = new BN(v.stakeAmount);
          // Calculate remaining stake
          const absMaxStake = ONEAVAX.mul(new BN(3_000_000));
          const relativeMaxStake = validatorStake.mul(new BN(5));
          const stakeLimit = BN.min(absMaxStake, relativeMaxStake);

          const remainingStake = stakeLimit
            .sub(validatorStake)
            .sub(delegatedStake);

          const listItem: ValidatorListItem = {
            nodeID: v.nodeID,
            validatorStake,
            delegatedStake,
            remainingStake,
            numDelegators:
              Number.parseInt(v.delegatorCount) + delegatorsPending.length,
            startTime,
            endTime,
            uptime: Number.parseFloat(v.uptime),
            fee: Number.parseFloat(v.delegationFee),
          };
          res.push(listItem);
        }
      }

      res = res.filter((v) => {
        if (v.uptime < 80) return false;
        // Remove if remaining space is less than minimum
        const min = this.minStakeDelegation;
        if (v.remainingStake.lt(min)) return false;
        return true;
      });

      return res;
    },

    nodeDelegatorPendingMap(): ValidatorDelegatorPendingDict {
      const res: ValidatorDelegatorPendingDict = {};
      const delegators = this.delegatorsPending;
      for (const delegator of delegators) {
        if (delegator) {
          const nodeID = delegator.nodeID;
          const target = res[nodeID];

          if (target) {
            res[nodeID]?.push(delegator);
          } else {
            res[nodeID] = [delegator];
          }
        }
      }
      return res;
    },

    // Given a validator list item, calculate the max stake of this item
    validatorMaxStake() {
      return (validator: ValidatorListItem) => {
        const stakeAmt = validator.validatorStake;

        // 5 times the validator's stake
        const relativeMaxStake = stakeAmt.mul(new BN(5));

        // absolute max stake
        const mult = new BN(10).pow(new BN(6 + 9));
        const absMaxStake = new BN(3).mul(mult);

        return relativeMaxStake.lt(absMaxStake)
          ? relativeMaxStake
          : absMaxStake;
      };
    },
  },
});
