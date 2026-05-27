import type {
  NavigationGuardNext,
  NavigationGuardWithThis,
  RouteRecordRaw,
} from "vue-router";
import { useRootStore } from "@/stores/pinia/root";

const ifNotAuthenticated: NavigationGuardWithThis<unknown> = (
  _to,
  _from,
  next: NavigationGuardNext,
) => {
  const rootStore = useRootStore();

  if (!rootStore.isAuth) {
    next();
    return;
  }
  next("/wallet");
};

const ifAuthenticated: NavigationGuardWithThis<unknown> = (
  _to,
  _from,
  next: NavigationGuardNext,
) => {
  const rootStore = useRootStore();

  if (rootStore.isAuth) {
    next();
    return;
  }
  next("/");
};

export const ROUTES: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    beforeEnter: ifNotAuthenticated,
  },
  {
    path: "/access",
    children: [
      {
        path: "",
        name: "access",
        component: () => import("@/views/access/Menu.vue"),
      },
      {
        path: "keystore",
        component: () => import("@/views/access/Keystore.vue"),
      },
      {
        path: "privatekey",
        component: () => import("@/views/access/PrivateKey.vue"),
      },
      {
        path: "mnemonic",
        component: () => import("@/views/access/Mnemonic.vue"),
      },
      {
        path: "account/:index",
        component: () => import("@/views/access/Account.vue"),
        name: "Account",
      },
      {
        path: "xpub",
        component: () => import("@/views/access/Xpub.vue"),
      },
    ],
    component: () => import("@/views/access/Access.vue"),
    beforeEnter: ifNotAuthenticated,
  },
  {
    path: "/legal",
    name: "legal",
    component: () => import("@/views/Legal.vue"),
  },
  {
    path: "/create",
    name: "create",
    component: () => import("@/views/Create.vue"),
    beforeEnter: ifNotAuthenticated,
  },
  {
    path: "/xpub",
    name: "wallet_readonly",
    component: () => import("@/views/WalletReadonly.vue"),
  },
  {
    path: "/wallet",
    children: [
      {
        path: "",
        name: "wallet",
        component: () => import("@/views/wallet/Portfolio.vue"),
      },
      {
        path: "transfer",
        component: () => import("@/views/wallet/Transfer.vue"),
      },
      {
        path: "cross_chain",
        component: () => import("@/views/wallet/CrossChain.vue"),
      },
      {
        path: "keys",
        component: () => import("@/views/wallet/ManageKeys.vue"),
      },
      {
        path: "earn",
        component: () => import("@/views/wallet/Earn.vue"),
      },
      {
        path: "studio",
        component: () => import("@/views/wallet/Studio.vue"),
      },
      {
        path: "advanced",
        component: () => import("@/views/wallet/Advanced.vue"),
      },
      {
        path: "activity",
        component: () => import("@/views/wallet/Activity.vue"),
      },
    ],
    component: () => import("@/views/Wallet.vue"),
    beforeEnter: ifAuthenticated,
  },
];
