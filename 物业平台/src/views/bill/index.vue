<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.query_time"
        type="month"
        placeholder="选择月"
        format="yyyy年M月"
        class="filter-item"
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
          :label="item.building +item.unit +item.house_number+item.get_owner.owner_name"
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
      <el-table-column label="账单编号" width="250px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bill_no}}</span>
        </template>
      </el-table-column>
      <el-table-column label="房号" min-width="150px" align="center">
        <template slot-scope="scope">
           <router-link :to="'/bill/toview/'+scope.row.bill_no">
          <span>{{ scope.row.get_housing.building }}{{scope.row.get_housing.unit}}{{scope.row.get_housing.house_number}}</span>
     </router-link>
        </template>
      </el-table-column>
      <el-table-column label="业主姓名" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.get_owner.owner_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应缴纳金额" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.getBill_total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已缴金额" min-width="150px" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.getBill_paid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="欠款" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.getBill_total - scope.row.getBill_paid}}</span>
        </template>
      </el-table-column>

      <el-table-column label="账单月份" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.meter_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="账单状态" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.meter_time }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column
        label="操作"
        fixed="right"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          <router-link :to="'/charge/edit/'+scope.row.id">
            <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          </router-link>
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="收费类型">
          <el-select
            v-model="temp.category_id"
            class="filter-item"
            placeholder="选择类型"
            @change="handelCategory"
          >
            <el-option
              v-for="item in categorylist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="收费项名称">
          <el-input v-model="temp.fee_name"/>
        </el-form-item>

        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>收费公式</span>
          </div>
          <el-form-item label="收费公式">
            <el-col :span="11">
              <el-select
                v-model="temp.calculate_id"
                class="filter-item"
                placeholder="选择类型"
                @change="handeCategory"
                @visible-change="handeVisible"
              >
                <el-option
                  v-for="item in calculatelist"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-select v-model="temp.calcula_id" class="filter-item" @change="handeCalcula">
                <el-option
                  v-for="item in calculalist"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-col>
          </el-form-item>
        </el-card>
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
  getByList,
  postDataByAdd,
  getLIChargeByList,
  getLIDataByDelete,
  getChargeByall,
  postLDataByUpdate,
  getBillByItem
} from "@/api/bill";
import waves from "@/directive/waves"; // Waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import { getCommunity, setCommunity, removeCommunity } from "@/utils/community";

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
      const statusMap = {
        1: "费项类型",
        2: "收费公式"
      };
      return statusMap[type];
    }
  },
  data() {
    return {
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
      housing: [],
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
    /**
     * 收费公式
     */
    handeCategory(e) {
      // this.category_type = e;
      for (var i = 0; i < this.category.length; i++) {
        if (this.category[i].id == e) {
          this.temp.calculate_name = this.category[i].name;
        }
        if (this.category[i].pid == e) {
          this.calculalist.push(this.category[i]);
        }
      }
    },
    /**
     * 计算方式
     */
    handeCalcula(e) {
      for (var i = 0; i < this.category.length; i++) {
        if (this.category[i].id == e) {
          this.temp.calcula_name = this.category[i].name;
        }
      }
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
      getBillByItem().then(res => {
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
      postLDataByUpdate(tempData).then(() => {
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
    }
  }
};
</script>

