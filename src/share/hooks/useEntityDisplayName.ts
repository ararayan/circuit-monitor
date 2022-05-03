import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useUserStore } from "../user";

const useEntityDisplayName = (entityName: string) => {
  const userStore = useUserStore();
  const { menus } = storeToRefs(userStore);
  const title = computed(() => {
    return menus.value.find(item => item.id === entityName)?.name || '';
  });
  return { title };
};


export { useEntityDisplayName };