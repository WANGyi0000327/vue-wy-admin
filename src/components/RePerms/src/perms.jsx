import { hasPerms } from "@/utils/auth";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Perms",
  props: {
    value: {
      type: undefined,
      default: []
    }
  },
  setup(props, { slots }) {
    return () => {
      if (!slots) return null;
      return hasPerms(props.value)
? (
        <Fragment>{slots.default?.()}</Fragment>
      )
: null;
    };
  }
});
