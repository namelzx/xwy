<template>
  <div class="app-container">
    <div class="filter-container">
        <el-input
        placeholder="用户名"
        v-model="listQuery.owner_name"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
        <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="业主编号" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业主名称" min-width="150px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.owner_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="150px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.mobile}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="身份证号" min-width="150px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.IDcard}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="业主姓名">
          <el-input v-model="temp.owner_name"/>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="temp.mobile"/>
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="temp.IDcard"/>
        </el-form-item>
        <el-form-item label="所属房产">
          <el-select v-model="temp.housing_id" filterable style="width: 140px" class="filter-item">
            <el-option
              v-for="item in houseOptions"
              :key="item.id"
              :label="item.building+item.unit+item.house_number+'房间'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
          <el-form-item label="摩托车数量">
          <el-input v-model="temp.motorbike"/>
        </el-form-item>
          <el-form-item label="汽车数量">
          <el-input v-model="temp.automobile"/>
        </el-form-item>
           <el-form-item label="电动车数量">
          <el-input v-model="temp.battery"/>
        </el-form-item>
           <el-form-item label="三轮车数量">
          <el-input v-model="temp.tricycle"/>
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
  getDataByDelete,
  getHousingByAll,
  postLDataByUpdate
} from "@/api/Owner";
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
      houseOptions: [],
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
      community_id: undefined,
      listQuery: {
        page: 1,
        limit: 20,
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
    this.community_id = this.$route.params && this.$route.params.id;
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      this.listQuery.community_id=this.community_id
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = response.data.data.total;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
      /**
       * 获取房产
       */
      getHousingByAll(this.community_id).then(res => {
        this.houseOptions = res.data.data;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },

    handleCreate() {
     
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.temp.community_id=this.community_id
      postDataByAdd(this.temp).then(res => {
           if (res.data.status == 204) {
          this.$notify.error({
            title: "错误提示",
            message: res.data.msg
          });
          return false;
        }
        this.temp.id = res.data.data;
        this.list.unshift(this.temp);
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success",
          duration: 2000
        });
         this.temp=[];
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
      
      postDataByAdd(this.temp).then(res => {
           if (res.data.status == 204) {
          this.$notify.error({
            title: "错误提示",
            message: res.data.msg
          });
          return false;
        }
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
      getDataByDelete(row.id).then(res => {});
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

