<template>
  <div class="app-container"   

>
    <div class="filter-container">
      <el-select
        filterable
        clearable
        v-model="listQuery.housing_id"
        placeholder="选择类型"
        class="filter-item"
        style="width: 130px"
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
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="dialogImport = true"
      >导入抄表记录</el-button>

      <!-- <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleDownload"
      >模版下载</el-button>-->
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出账单</el-button>
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
      <el-table-column label="房号" width="150px" align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.get_housing"
          >{{ scope.row.get_housing.building }}{{scope.row.get_housing.unit}}{{scope.row.get_housing.house_number}}</span>
          <span v-else>未绑定业主</span>
        </template>
      </el-table-column>
      <el-table-column label="上次度数" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.last_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本次读数" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.this_number }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用量" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.this_number- scope.row.last_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抄表日期" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.meter_time}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button> -->
          <!-- <router-link :to="'/charge/edit/'+scope.row.id"> -->
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <!-- </router-link> -->
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogImport">
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload"/>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="上次读数">
          <el-input v-model="temp.last_number"/>
        </el-form-item>
        <el-form-item label="本次读数">
          <el-input v-model="temp.this_number"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  postDataByAdd,
  getByList,
  getLIDataByDelete,
  postDataByUpdate,
  getHousingitem,
  getLastmonthMeter
} from "@/api/meter";
import UploadExcelComponent from "@/components/UploadExcel/index.vue";
import { getCommunity, setCommunity, removeCommunity } from "@/utils/community";

import waves from "@/directive/waves"; // Waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
const calendarTypeOptions = [
  { id: "1", name: "一级配置项" },
  { id: "2", name: "二级配置项" }
];

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.id] = cur.name;
  return acc;
}, {});
export default {
  name: "ComplexTable",
  components: { Pagination, UploadExcelComponent },
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
      const statusMap = {
        1: "费项类型",
        2: "收费公式"
      };
      return statusMap[type];
    }
  },
  data() {
    return {
      dialogImport: false,
      housing: [],
      categorylistd: [],
      category_type: 1,
      tableKey: 0,
      list: null,
      total: 0,
      category: [], //总分类
      categorylist: [],
      calculatelist: [], //一级收费公式
      calculalist: [],
      listLoading: true,
      loading:false,
      listQuery: {
        page: 1,
        limit: 20,
        community_id: getCommunity(),
        name: undefined,
        category: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,

      showReviewer: false,
      temp: {
        fee_name: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogPvVisible: false,
      downloadLoading: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    dataUrl() {
      window.location.href =
        "https://wuyejiaofei.oss-cn-beijing.aliyuncs.com/%E5%89%AF%E6%9C%AC%E6%89%B9%E9%87%8F%E6%8A%84%E8%A1%A8.xlsx";
    },
    /**
     * 清空已有选择方式
     */
    handeVisible(e) {
      if (e) {
        this.calculalist = [];
      }
    },
    /**
     * 收费类型
     */
    handelCategory(e) {
      for (var i = 0; i < this.category.length; i++) {
        if (this.category[i].id == e) {
          this.temp.category_name = this.category[i].name;
        }
      }
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning"
      });
      return false;
    },
    handleSuccess({ results, header }) {
      var arr = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].表名称 === "水表") {
          arr.push({
            community_id: getCommunity(),
            last_number: results[i].上次读数,
            this_number: results[i].本次读数,
            meter_time: results[i].抄表日期,
            wheredata: {
              building: results[i].楼栋,
              unit: results[i].单元,
              house_number: results[i].房号,
              community_id: getCommunity()
            }
          });
        }
      }
      postDataByAdd(arr).then(res => {
        if (res.data.status === 201) {
          this.$notify({
            title: "警告",
            message: res.data.msg,
            type: "warning",
            duration: 2000
          });
          this.dialogImport = false;
          return false;
        }
        this.dialogImport = false;
        this.$notify({
          title: "成功",
          message: res.data.msg,
          type: "success",
          duration: 2000
        });
        this.getList();
      });
    },
    getList() {
      this.listLoading = true;
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = response.data.data.total;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });

      getHousingitem().then(res => {
        console.log(res);
        this.housing = res.data.data;
      });
    },
    handleFilter() {
      (this.categorylistd = []),
        (this.categorylist = []),
        (this.calculatelist = []),
        (this.listQuery.page = 1);
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
    handleCreate() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.temp.numeral = "BH" + Date.parse(new Date());
      postDataByAdd(this.temp).then(() => {
        this.list.unshift(this.temp);
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success",
          duration: 2000
        });
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj

      for (var i = 0; i < this.category.length; i++) {
        if (this.category[i].pid == row.calculate_id) {
          this.calculalist.push(this.category[i]);
        }
      }
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    updateData() {
      const tempData = Object.assign({}, this.temp);
      postDataByUpdate(tempData).then(() => {
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
    },
    handleDelete(row) {
      getLIDataByDelete(row.id).then(res => {});
      this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000
      });
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
    },
    handleDownload() {
        this.downloadLoading = true;

      getLastmonthMeter(getCommunity()).then(res => {
        var list = res.data;
        
        import("@/vendor/Export2Excel").then(excel => {
          const tHeader = [
            "序号",
            "房屋编号",
            "区域",
            "楼栋",
            "单元",
            "房号",
            "表类型",
            "表名称",
            "上次读数",
            "本次读数",
            "抄表日期"

            // "支付方式",
            // "交易状态"
          ];
          const filterVal = [
            "id",
            "building_number",
            "",
            "building",
            "unit",
            "house_number",
            "meter_type",
            "type",
            "this_number",
            "",
            ""
          ];
          var date = new Date();
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          const data = this.formatJson(filterVal, list);
          if(month===1){
            month=13
          }
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: month - 1 + "月账单"
          });
          this.downloadLoading = false;
        });
      });
      return false;
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
    }
  }
};
</script>

