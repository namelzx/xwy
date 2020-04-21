<template>
  <div class="app-container">
    <div class="filter-container">
    
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
      <el-table-column label="栋楼" width="150px" align="center">
        <template slot-scope="scope">
        
          <span>{{ scope.row.building }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单元类型" min-width="150px" align="center">
        <template slot-scope="scope">
        
          <el-tag>{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
         <el-table-column label="单元数" min-width="150px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.unitnumber}}</el-tag>
        </template>
      </el-table-column>
           <el-table-column label="楼层数" min-width="150px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.floor}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
  <!-- <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button> -->
 
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
      
        <el-form-item label="楼栋">
          <el-input v-model="temp.building"/>
        </el-form-item>
      
        <el-form-item label="单元类型">
          <el-input v-model="temp.type"/>
        </el-form-item>
      
        <el-form-item label="单元数">
          <el-input v-model="temp.unitnumber"/>
        </el-form-item>
      
        <el-form-item label="楼层数">
          <el-input v-model="temp.floor"/>
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
  
  postLDataByUpdate
} from "@/api/unit";
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
      categorylistd:[],
      category_type: 1,
      tableKey: 0,
      list: null,
      total: 0,
      category:[],//总分类
      categorylist: [],
      calculatelist:[],//一级收费公式
      calculalist:[],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        category: undefined,
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,

      showReviewer: false,
      temp: {
        fee_name: undefined,
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
      postDataByAdd(this.temp).then(res => {
          this.temp.id=res.data.data
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

        for(var i=0;i<this.category.length;i++){
        if(this.category[i].pid==row.calculate_id){
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
      getDataByDelete(row.id).then(res => {
            });
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
}
</script>

