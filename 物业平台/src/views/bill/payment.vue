<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        filterable
        v-model="listQuery.category_id"
        placeholder="选择收费项目"
        class="filter-item"
        style="min-width: 130px"
        @change="handleFilter"
      >
        <el-option v-for="item in category" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-date-picker
        v-model="listQuery.start_time"
        type="date"
        class="filter-item"
        placeholder="选择日期"
      ></el-date-picker>至
      <el-date-picker
        v-model="listQuery.end_time"
        type="date"
        class="filter-item"
        placeholder="选择日期"
      ></el-date-picker>
      <el-select
        filterable
        v-model="listQuery.housing_id"
        placeholder="业主姓名/房号"
        class="filter-item"
        style="min-width: 130px"
      >
        <el-option
          v-for="item in housing"
          :key="item.id"
          :label="item.building +item.unit +item.house_number"
          :value="item.id"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <!-- <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >{{ $t('table.export') }}</el-button> -->
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="小区名字" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.villagename}}</span>
        </template>
      </el-table-column>
      <el-table-column label="房号" min-width="130px" align="center">
        <template slot-scope="scope">
          <router-link :to="'/bill/toview/'+scope.row.bill_no">
            <span>{{ scope.row.room }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="业主姓名" min-width="130px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.get_housing.get_owner.owner_name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="收费类型" min-width="130px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.get_category.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="已缴费金额" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.paid }}</span>
        </template>
      </el-table-column>

      <el-table-column label="支付方式" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.pay_type|typePay }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易状态" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.paid_status|typeStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易日期" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.pay_time">{{ scope.row.pay_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>尚未缴费</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle
} from "@/api/article";
import { getBillByItem, getBillBysearch, getCategory } from "@/api/bill";
import waves from "@/directive/waves"; // Waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import { getCommunity, setCommunity, removeCommunity } from "@/utils/community";

const calendarTypeOptions = [
  { key: "CN", display_name: "China" },
  { key: "US", display_name: "USA" },
  { key: "JP", display_name: "Japan" },
  { key: "EU", display_name: "Eurozone" }
];

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "ComplexTable",
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger"
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
    typePay(type) {
      const statusMap = {
        1: "现金",
        2: "微信",
        3: "未缴纳"
      };
      return statusMap[type];
    },
    typeStatus(type) {
      const statusMap = {
        1: "已缴纳",
        2: "未缴纳"
      };
      return statusMap[type];
    }
  },
  data() {
    return {
      housing: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      category: [],
      listQuery: {
        page: 1,
        limit: 20,
        community_id: getCommunity(),
        name: undefined,
        category: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" }
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published"
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" }
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change"
          }
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" }
        ]
      },
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      getBillBysearch(this.listQuery).then(response => {
        var arr = [];
        for (let index = 0; index < response.data.data.data.length; index++) {
          arr[index] = response.data.data.data[index];
          arr[index].villagename =
            response.data.data.data[
              index
            ].get_housing.get_community.community_name;
             arr[index].room =
            response.data.data.data[index].get_housing.building +
            response.data.data.data[index].get_housing.unit +
            response.data.data.data[index].get_housing.house_number;
          if (arr[index].paid_status === 1) {
            arr[index].pay_status == "已缴纳";
          } else {
            arr[index].pay_status == "未缴纳";
          }
          console.log(arr[index])
        }
        this.list = arr;
        console.log(arr);

        this.total = response.data.data.total;
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      }),
        getBillByItem().then(res => {
          this.housing = res.data.data;
        });
      getCategory().then(res => {
        this.category = res.data;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success"
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: ""
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row) {
      this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000
      });
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = [
          "小区名称",
          "房号",
          "业主姓名",
          "收费类型",
          "已缴纳金额",
          "支付方式",
          "交易状态"
        ];
        const filterVal = [
          "id",
          "get_category.name",
          "category_id",
          "dosage",
          "is_type"
        ];
        const data = this.formatJson(filterVal, this.list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "table-list"
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
  }
};
</script>
