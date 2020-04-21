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
      <el-table-column min-width="180px" align="center" label="用途">
        <template slot-scope="scope">
          <span>{{ scope.row.use }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="金额">
        <template slot-scope="scope">
          <span>{{scope.row.price}}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="摘要">
        <template slot-scope="scope">
          <span>{{scope.row.desc}}</span>
        </template>
      </el-table-column>


      <el-table-column width="180px" align="center" label="添加时间">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
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
        <el-form-item label="用途">
          <el-input v-model="temp.use" placeholder/>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="temp.price" placeholder/>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="temp.desc" placeholder/>
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
  postDataedit,
  PostDataAdd,
  DataDelete
} from "@/api/spending";
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
        update: "Edit",
        create: "Create"
      },
      SuppData: [], //当前商家的商品分类信息
      statusOptions: ["admin", "editor"],
      dialogFormVisible: false,
      list: null,
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
      console.log(row.id);
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
      postDataedit(this.temp).then(res => {
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
