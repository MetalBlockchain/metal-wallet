import type {
  Notification,
  NotificationInput,
} from "@/stores/types/notifications";

export interface INotificationsStore {
  items: Notification[];
}

function getDefaultState(): INotificationsStore {
  return {
    items: [],
  };
}

const COLOR_SUCCESS = "#6BC688";
const COLOR_WARNING = "#c39043";
const COLOR_ERROR = "#E84970";
let notification_id = 0;

export const useNotificationsStore = defineStore("notifications", {
  state: () => getDefaultState(),
  actions: {
    add(data: NotificationInput) {
      const id = notification_id++;

      const type = data.type || "success";
      const duration = data.duration || 5000;
      let color = COLOR_SUCCESS;

      switch (type) {
        case "success": {
          color = COLOR_SUCCESS;
          break;
        }
        case "error": {
          color = COLOR_ERROR;
          break;
        }
        case "warning": {
          color = COLOR_WARNING;
          break;
        }
      }

      const item: Notification = {
        id,
        title: data.title,
        message: data.message,
        color,
        duration: 5000,
      };

      setTimeout(() => {
        this.remove(id);
      }, duration);

      this.items.push(item);
    },
    remove(id: number) {
      const idx = this.items.findIndex((_) => _.id === id);
      if (idx !== -1) {
        this.items.splice(idx, 1);
      }
    },
  },
  getters: {},
});
