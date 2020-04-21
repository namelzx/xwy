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

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-tag type="success">已收金额:{{truesum}}</el-tag>
      <el-tag type="success">未收金额:{{falessum}}</el-tag>
      <!-- <el-tag type="warning">已缴纳笔数:{{zdtotal[0].zd}}</el-tag> -->
      <el-tag type="danger">未缴纳笔数:{{zdtotal.zd}}</el-tag>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      show-summary
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column prop="收费月份" label="日期" width="150"></el-table-column>
      <el-table-column label="应收">
        <el-table-column prop="公摊水费" label="公摊水费" width="120"></el-table-column>
        <el-table-column prop="生活垃圾费" label="生活垃圾费" width="120"></el-table-column>
        <el-table-column prop="步梯物业费" label="步梯物业费" width="120"></el-table-column>
        <el-table-column prop="水费" label="水费" width="120"></el-table-column>
        <el-table-column prop="公摊电费" label="公摊电费" width="120"></el-table-column>

        <el-table-column prop="商铺生活垃圾费" label="商铺生活垃圾费" width="120"></el-table-column>
        <el-table-column prop="商铺水费" label="商铺水费" width="120"></el-table-column>
        <el-table-column prop="摩托车停车服务费" label="摩托车停车服务费" width="150"></el-table-column>
        <el-table-column prop="电梯房物业费" label="电梯房物业费" width="120"></el-table-column>

        <el-table-column prop="电梯维保费" label="电梯维保费" width="120"></el-table-column>
        <el-table-column prop="电动车停车服务费" label="电动车停车服务费" width="150"></el-table-column>

        <el-table-column prop="汽车停车服务费" label="汽车停车服务费" width="150"></el-table-column>
        <el-table-column prop="商铺物业费" label="商铺物业费" width="120"></el-table-column>

        <el-table-column prop="地下车库停车服务费" label="地下车库停车服务费" width="150"></el-table-column>
        <el-table-column prop="公共维修费" label="公共维修费" width="120"></el-table-column>
        <el-table-column prop="电动车车卡费" label="电动车车卡费" width="120"></el-table-column>
         <el-table-column prop="商铺公共维修费" label="商铺公共维修费" width="120"></el-table-column>
         <el-table-column prop="垃圾清运费" label="垃圾清运费" width="120"></el-table-column>
        <el-table-column prop="电瓶车充值" label="电瓶车充值" width="120"></el-table-column>

        
      </el-table-column>

      <el-table-column label="实收">
        <el-table-column prop="实收公摊水费" label="公摊水费" width="120"></el-table-column>
        <el-table-column prop="实收生活垃圾费" label="生活垃圾费" width="120"></el-table-column>
        <el-table-column prop="实收步梯物业费" label="步梯物业费" width="120"></el-table-column>
        <el-table-column prop="实收水费" label="水费" width="120"></el-table-column>
        <el-table-column prop="实收公摊电费" label="公摊电费" width="120"></el-table-column>

        <el-table-column prop="实收商铺生活垃圾费" label="商铺生活垃圾费" width="120"></el-table-column>
        <el-table-column prop="实收商铺水费" label="商铺水费" width="120"></el-table-column>
        <el-table-column prop="实收摩托车停车服务费" label="摩托车停车服务费" width="150"></el-table-column>
        <el-table-column prop="实收电梯房物业费" label="电梯房物业费" width="120"></el-table-column>

        <el-table-column prop="实收电梯维保费" label="电梯维保费" width="120"></el-table-column>
        <el-table-column prop="实收电动车停车服务费" label="电动车停车服务费" width="150"></el-table-column>

        <el-table-column prop="实收汽车停车服务费" label="汽车停车服务费" width="150"></el-table-column>
        <el-table-column prop="实收商铺物业费" label="商铺物业费" width="120"></el-table-column>
        <el-table-column prop="实收地下车库停车服务费" label="地下车库停车服务费" width="150"></el-table-column>
        <el-table-column prop="实收公共维修费" label="公共维修费" width="120"></el-table-column>
       
         <el-table-column prop="实收电动车车卡费" label="实收电动车车卡费" width="120"></el-table-column>
          <el-table-column prop="实收商铺公共维修费" label="实收商铺公共维修费" width="120"></el-table-column>
           <el-table-column prop="实收垃圾清运费" label="实收垃圾清运费" width="120"></el-table-column>
            <el-table-column prop="实收电瓶车充值" label="实收电瓶车充值" width="120"></el-table-column>
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
import { getByList } from "@/api/statistical";
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
      truesum: 0, //实收金额
      falessum: 0, //应收金额
      zdtotal: 0,
      categorylistd: [],
      category_type: 1,
      tableKey: 0,
      list: null,
      total: 0,
      ordercount:0,
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
        type: "month"
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

    getList() {
      this.listLoading = true;
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = 10;
        this.truesum = response.data.data.truesum;
        this.falessum = response.data.data.falessum;
        this.zdtotal = response.data.total;
        this.ordercount=response.data.ordercount
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      (this.categorylistd = []),
        (this.categorylist = []),
        (this.calculatelist = []),
        (this.listQuery.page = 1);
      this.getList();
    }
  }
};
</script>

