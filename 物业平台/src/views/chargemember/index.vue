<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="180px" align="center" label="管理员名称">
        <template slot-scope="scope">
          <span>{{ scope.row.realname }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="管理小区">
        <template slot-scope="scope">
          <span>{{scope.row.get_community.community_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          
          <el-button type="text" size="small" @click="handleUpdate(scope.row)">操作</el-button>
                       <el-button type="text" size="small" @click="OnClickDelete(scope.row)">删除</el-button>
  
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
        <el-form-item label="管理小区">
          <el-select v-model="temp.communit_id" class="filter-item" placeholder="选择管理小区">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.community_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
           <el-form-item label="登陆账号">
          <el-input v-model="temp.phone" placeholder=""/>
        </el-form-item>
            <el-form-item label="密码">
          <el-input v-model="temp.password" placeholder=""/>
        </el-form-item>
           <el-form-item label="管理员姓名">
          <el-input v-model="temp.realname" placeholder=""/>
        </el-form-item>

          <el-form-item label="权限组">
          <el-checkbox v-model="temp.is_price">修改缴费金额</el-checkbox>
          <el-checkbox v-model="temp.is_shorder">订单撤回</el-checkbox>
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
  getUserByList,
  DataStatus,
  GetDataTypeByList,
  postDataedit,
  PostDataAdd,
  DataDelete
} from "@/api/supplier";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import { mapGetters } from "vuex";
// import { GetCommonType } from "@/api/common";

export default {
  name: "ArticleList",
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: "success",
        1: "danger"
      };
      return statusMap[status];
    },
    statusText(status) {
      const statusMap = {
        0: "用户",
        1: "商家"
      };
      return statusMap[status];
    }
  },
  data() {
    return {
      temp: {},
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "添加"
      },
      SuppData: [], //当前商家的商品分类信息
      statusOptions: ["admin", "editor"],
      dialogFormVisible: false,
      list: null,
      options: [],
      total: 0,
      listLoading: true,
      supply_id: undefined,
      listQuery: {
        page: 1,
        limit: 20
      }
    };
  },
  computed: {
    ...mapGetters(["avatar", "project"])
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      getUserByList(this.listQuery).then(response => {
        const data = response.data.data;
        this.list = data.data;
        this.total = data.total;
        this.listLoading = false;
      });
      GetDataTypeByList().then(res => {
        this.options = res.data.data;
        console.log(this.options);
      });
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    OnClickStatus(row) {
      if (row.isshop === 1) {
        row.isshop = 0;
      } else {
        row.isshop = 1;
      }
      DataStatus(row).then(res => {
        this.$message({
          message: res.data.msg,
          type: "更新成功"
        });
      });
    },
    /**
     * 追加分类
     */
    createType() {
      console.log(this.supply_id);
      const data = {
        type_id: undefined,
        supply_id: this.supply_id,
        proportion: undefined
      };
      this.SuppData.push(data);
    },
   
    /** 删除 */
    OnClickDelete(row) {
      console.log(row.id)
      DataDelete(row.id).then(res => {
        if (res.data.status === 200) {
          this.$message({
            message: res.data.msg,
            type: "success"
          });
        }
      });
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
    },
    /** 添加 */
    handleCreate(supply_id) {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    /** 添加提交数据 */
    createData() {
      this.temp.status = 1;
      PostDataAdd(this.temp).then(res => {
        this.getList();
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success",
          duration: 2000
        });
      });
    },
    updateData() {
      let temp = {};
      temp =this.temp
      postDataedit(temp).then(res => {
        this.getList();
        this.dialogFormVisible = false;
        this.$notify({
          title: "成功",
          message: "更新成功",
          type: "success",
          duration: 2000
        });
      });
    },
    /** 修改 */
    handleUpdate(row) {
      this.supply_id = row.id;
      GetDataTypeByList(row.id).then(res => {
        this.SuppData = res.data.data;
      });
      if(row.is_price===0){
        row.is_price=false
      }else{
          row.is_price=true
      }
        if(row.is_shorder===0){
        row.is_shorder=false
      }else{
          row.is_shorder=true
      }
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    }
  }
};
</script>
<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
