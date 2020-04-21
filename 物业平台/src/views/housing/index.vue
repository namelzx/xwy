<template>
  <div class="app-container">
    <div class="filter-container">

  <el-select v-model="listQuery.id" filterable style="width: 140px" class="filter-item">
            <el-option
              v-for="item in houseOptionss"
              :key="item.id"
              :label="item.building+item.unit+item.house_number+'房间'"
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
      <router-link :to="'/housing/units/index'">
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-edit"
          @click="handleCreate"
        >房屋单元</el-button>
      </router-link>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-download"
        @click="DataUrl"
      >导入模版下载</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreateall"
      >批量导入</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >新建房屋</el-button>
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
      <el-table-column label="房屋编号" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.building_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="房屋使用状态" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.house_type |houseFileter}}</span>
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
      <el-table-column label="建筑面积" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.construction_area}}</span>
        </template>
      </el-table-column>
      <el-table-column label="朝向" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.toward}}</span>
        </template>
      </el-table-column>
      <el-table-column label="业主姓名" min-width="150px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.get_owner===null">未绑定业主</span>
          <span v-else>{{scope.row.get_owner.owner_name}}</span>
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
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
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
<el-dialog title="批量导入"  :visible.sync="housingVisible">
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload"/>
   <div slot="footer" class="dialog-footer">
        <el-button @click="housingVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('table.confirm') }}</el-button>
      </div>
  </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="房屋使用状态">
          
          <el-select v-model="temp.house_type" style="width: 140px" class="filter-item">
            <el-option
              v-for="item in houseOptions"
              :key="item.house_type"
              :label="item.label"
              :value="item.house_type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属楼栋">
          <el-input v-model="temp.building"/>
        </el-form-item>
        <el-form-item label="单元">
          <el-input v-model="temp.unit" />
        </el-form-item>

        <el-form-item label="所处楼层">
          <el-input v-model="temp.floor" />
        </el-form-item>
        <el-form-item label="门牌号">
          <el-input v-model="temp.house_number"/>
        </el-form-item>
        <el-form-item label="建筑面积">
          <el-input v-model="temp.construction_area" type="number"/>
        </el-form-item>
        <el-form-item label="朝向">
          <el-input v-model="temp.toward"/>
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
import UploadExcelComponent from "@/components/UploadExcel/index.vue";

import {
  postDataByAdd,
  getByList,
  getDataByDelete,
  getUnitByAll,
  postLDataByUpdate
} from "@/api/housing";
import {
  
  getHousingByAll,
 
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
        house_type: undefined,
        community_id: undefined
      },
      houseOptionss:[],
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogPvVisible: false,
      housingVisible: false,

      downloadLoading: false
    };
  },
  created() {
    this.getList();
    this.temp.community_id = this.$route.params && this.$route.params.id;
    this.listQuery.community_id = this.temp.community_id;
    this.community_id = this.temp.community_id;

      getHousingByAll( this.community_id ).then(res => {
        this.houseOptionss = res.data.data;
      });
  },
  methods: {
    DataUrl(){
      window.location.href='https://wuyejiaofei.oss-cn-beijing.aliyuncs.com/%E7%89%A9%E4%B8%9A%E4%B8%8A%E4%BC%A0%E6%88%BF%E5%B1%8B%E5%B0%8F%E5%8C%BA.xlsx'
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
      this.tableData = results;
      var hous = [];
      for (let i = 0; i < results.length; i++) {
        hous.push({
          house_type: ifhoush(results[i].房屋使用状态),
          community_id:this.community_id,
          building: results[i].所属楼栋,
          unit: results[i].所属单元,
          floor: results[i].所属楼层,
          house_number: results[i].门牌号,
          construction_area: results[i].建筑面积,
          building_number: "BH" + new Date().valueOf(),
          owner: {
              community_id:this.community_id,
            owner_name: results[i].业主姓名,
            mobile: results[i].手机号,
            IDcard: results[i].证件号码
          }
        });
      }
       postDataByAdd(hous).then(res => {
        if (res.data.status == 204) {
          this.$notify.error({
            title: "错误提示",
            message: res.data.msg
          });
          return false;
        }
      
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success",
          duration: 2000
        });
          this.dialogFormVisible = false;
          this.housingVisible=false
        this.getList();
      });
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
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = response.data.data.total;
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
      getUnitByAll().then(res => {
        this.unitOptions = res.data;
        console.log(this.unitOptions);
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
    handleCreateall(){
      // 
      this.housingVisible=true;
      console.log('11')
    },
    createData() {
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
        console.log(this.temp);
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
      this.temp = [];
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

function ifhoush(name) {
  if (name === "已入住") {
    return 1;
  }
  if (name === "未交房") {
    return 2;
  }
  if (name === "已装修未入住") {
    return 3;
  }
  if (name === "已交付已装修") {
    return 4;
  }
  if (name === "已交房未装修") {
    return 5;
  }
}
</script>
