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
      <el-table-column label="小区" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.get_community.community_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="楼栋" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.building}}</span>
        </template>
      </el-table-column>
      <el-table-column label="单元" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column label="楼层" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.floor}}层</span>
        </template>
      </el-table-column>
      <el-table-column label="门牌号" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.house_number}}</span>
        </template>
      </el-table-column>
      <el-table-column label="业主姓名" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.get_owner.owner_name}}</span>
        </template>
      </el-table-column>
       
           <el-table-column label="关联收费项" min-width="350px" align="center">
        <template slot-scope="scope">
          <span v-for="(ch,cindex) in scope.row.get_charge_housing" :key="cindex">
            {{ch.get_charging.note+ch.get_charging.getcharge.fee_name}}

          </span>
        </template>
      </el-table-column>
       
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">关联费项</el-button>
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
      <el-table
        ref="multipleTable"
        :data="tableData3"
        tooltip-effect="dark"
        style="width: 100%"
      >
        <el-table-column width="55">
          <el-checkbox slot-scope="scope"  v-model="scope.row.che"></el-checkbox>
        </el-table-column>
        <el-table-column label="费项" width="120">
          <template slot-scope="scope">{{scope.row.note}}
            {{scope.row.getcharge.fee_name}}

          </template>
        </el-table-column>
        <el-table-column label="收费方式" width="120">
          <template slot-scope="scope">{{ scope.row.getway.name }}</template>
        </el-table-column>
        <el-table-column label="单价" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column label="收费公式" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.getformula.name }}</template>
        </el-table-column>
      
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  postDataByAdd,
  getByList,
  getDataByDelete,
  getSelectedCharge,
  postSelectedCharge
} from "@/api/housecharge";
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
    },
    houseFileter(type) {
      const statusMap = {
        1: "已入住",
        2: "未交房",
        3: "已装修未入住",
        4: "已交付已装修",
        5: "已交付已装修"
      };
      return statusMap[type];
    }
  },
  data() {
    return {
      tableData3: [],
      multipleSelection: [],
      houseOptions: [
        { label: "已入住", house_type: 1 },
        { label: "未交房", house_type: 2 },
        { label: "已装修未入住", house_type: 3 },
        { label: "已交付已装修", house_type: 4 },
        { label: "已交房未装修", house_type: 5 }
      ],
      unitOptions: [], //获取多少栋
      unitall: [], //获取单元
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
      listQuery: {
        page: 1,
        limit: 20,
        community_id: undefined,
        name: undefined,
        category: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,

      showReviewer: false,
      community_id: undefined,
      temp: {
        community_id: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      housing_id: undefined,
      dialogPvVisible: false,
      downloadLoading: false
    };
  },
  created() {
    this.getList();
    this.temp.community_id = this.$route.params && this.$route.params.id;
    this.listQuery.community_id = getCommunity();
    this.community_id = this.temp.community_id;
  },
  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          console.log(row);
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      var temp = [];
      for (let i = 0; i < this.multipleSelection.length; i++) {
        temp.push({
          charge_id: this.multipleSelection[i].id,
          housing_id: this.housing_id
        });
      }
      this.temp = temp;
    },
    // 选择楼栋后。出现单元
    handleBuilding(e) {
      var floor = 1;
      this.unitall = [];
      for (var i = 0; i < this.unitOptions.length; i++) {
        if (this.unitOptions[i].id === e) {
          floor = this.unitOptions[i].floor;
        }
      }
      for (let i = 0; i < floor; i++) {
        this.unitall.push(i);
      }
    },
    getList() {
      this.listLoading = true;
      this.listQuery.community_id = getCommunity();
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = response.data.data.total;
        this.tableData3 = response.data.msg;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
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
      this.temp = [];
      this.temp.community_id = this.community_id;
      this.temp.building_number = "BH" + new Date().valueOf();
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
        this.getList();
      });
    },
    handleUpdate(row) {
      this.housing_id = row.id;
      getSelectedCharge(row.id).then(res => {
        for(let i=0;i<res.data.length;i++){
          
          if(!res.data[i].che){
            res.data[i].che=false;
          }else{
             res.data[i].che=true;
          }
        }
        this.tableData3 = res.data;
        console.log(this.tableData3)
      });
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    updateData() {
      const tempData = [];
      for (let i = 0; i < this.tableData3.length; i++) {
        if (this.tableData3[i].che) {
          tempData.push({
            charge_id: this.tableData3[i].id,
            housing_id: this.housing_id
          });
        }
      }
      var postdata = {
        data: tempData,
        housing_id: this.housing_id
      };

      postSelectedCharge(postdata).then(() => {
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "更新成功",
          type: "success",
          duration: 2000
        });
        this.getList();
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
