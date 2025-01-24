import dayjs from "dayjs";
import { message } from "@/utils/message";
import { getOnlineLogsList } from "@/api/system";
import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import type { PlusColumn } from "plus-pro-components";

export function useRole() {
  const form = reactive({
    username: "",
  });
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
  });
  const columns: TableColumnList = [
    {
      label: "序号",
      prop: "id",
      minWidth: 60,
    },
    {
      label: "用户名",
      prop: "username",
      minWidth: 100,
    },
    {
      label: "登录 IP",
      prop: "ip",
      minWidth: 140,
    },
    {
      label: "登录地点",
      prop: "address",
      minWidth: 140,
    },
    {
      label: "操作系统",
      prop: "system",
      minWidth: 100,
    },
    {
      label: "浏览器类型",
      prop: "browser",
      minWidth: 100,
    },
    {
      label: "登录时间",
      prop: "loginTime",
      minWidth: 180,
      formatter: ({ loginTime }) =>
        dayjs(loginTime).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation",
    },
  ];
  const columnsPS: PlusColumn[] = [
    {
      label: "用户名",
      prop: "username",
      width: 10,
      fieldProps: {
        placeholder: "请输入用户名",
      },
    },
  ];
  const handleChange = (values: any) => {
    console.log(values, "change");
  };
  async function handleSearch() {
    loading.value = true;
    console.log("🎉-----form-----", form);
    const { data } = await getOnlineLogsList(toRaw(form));
    console.log("🍪-----data-----", data);
    dataList.value = data.list;
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
  const handleRest = () => {
    handleSearch();
  };

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val: any) {
    console.log("handleSelectionChange", val);
  }

  function handleOffline(row) {
    message(`${row.username}已被强制下线`, { type: "success" });
    handleSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getOnlineLogsList(toRaw(form));
    console.log("🍪-----data-----", data);
    dataList.value = data.list;
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = (formEl: { resetFields: () => void }) => {
    if (!formEl) return;
    formEl.resetFields();
    handleSearch();
  };

  onMounted(() => {
    handleSearch();
  });

  return {
    form,
    loading,
    columns,
    columnsPS,
    dataList,
    pagination,
    handleSearch,
    resetForm,
    handleOffline,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleChange,
    onSearch,
    handleRest,
  };
}
