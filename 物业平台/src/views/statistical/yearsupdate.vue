<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.query_time"
        type="year"
        class="filter-item"
        placeholder="选择年"
        format="yyyy年"
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
    
    <div class="teables">
        <div class="teables-title">
            <div class="title-bar">收费日期</div>
            <div class="title-bar">公摊水费</div>
            <div class="title-bar">生活垃圾费</div>
            <div class="title-bar">步梯物业费</div>
            <div class="title-bar">水费</div>
            <div class="title-bar">公摊电费</div>
            <div class="title-bar">商铺生活垃圾费</div>
            <div class="title-bar">商铺水费</div>
            <div class="title-bar">摩托车停车服务费</div>
            <div class="title-bar">电梯房物业费</div>
            <div class="title-bar">电梯维保费</div>
            <div class="title-bar">电动车停车服务费</div>
            <div class="title-bar">汽车停车服务费</div>
            <div class="title-bar">商铺物业费</div>
            <div class="title-bar">地下车库停车服务费</div>
            <div class="title-bar">公共维修费</div>
            <div class="title-bar">电动车车卡费</div>
            <div class="title-bar">商铺公共维修费</div>
            <div class="title-bar">垃圾清运费</div>
            <div class="title-bar">电瓶车充值</div>
            <div class="title-bar">合计</div>
        </div>
        <div class="teablist">
            <div class="teables-list" v-for="(item,index) in list" :key="index">
                <div class="list-day">
                    <div class="day-name">{{item.收费月份}}</div>
                    <div class="day-name">{{item.实收公摊水费}}</div>
                    <div class="day-name">{{item.实收生活垃圾费}}</div>
                    <div class="day-name">{{item.实收步梯物业费}}</div>
                    <div class="day-name">{{item.实收水费}}</div>
                    <div class="day-name">{{item.实收公摊电费}}</div>
                    <div class="day-name">{{item.实收商铺生活垃圾费}}</div>
                    <div class="day-name">{{item.实收商铺水费}}</div>
                    <div class="day-name">{{item.实收摩托车停车服务费}}</div>
                    <div class="day-name">{{item.实收电梯房物业费}}</div>
                    <div :class="'day-name'+index">{{item.实收电梯维保费}}</div>
                    <div class="day-name">{{item.实收电动车停车服务费}}</div>
                    <div class="day-name">{{item.实收汽车停车服务费}}</div>
                    <div class="day-name">{{item.实收商铺物业费}}</div>
                    <div class="day-name">{{item.实收地下车库停车服务费}}</div>
                    <div class="day-name">{{item.实收公共维修费}}</div>
                    <div class="day-name">{{item.实收电动车车卡费}}</div>
                    <div class="day-name">{{item.实收商铺公共维修费}}</div>
                    <div class="day-name">{{item.实收垃圾清运费}}</div>
                    <div class="day-name">{{item.实收电瓶车充值}}</div>
                    <div class="day-name">{{item.实收小计}}</div>
                </div>
            </div>
            
        </div>
        
        
    </div>
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
      showReviewer:false,
      truesum: 0, //实收金额
      falessum: 0, //应收金额
      zdtotal: 0,
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
        type: "years"
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
    getList() {
      this.listLoading = true;
      getByList(this.listQuery).then(response => {
        this.list = response.data.data.data;
        this.total = 10;
        this.truesum = response.data.data.truesum;
        this.falessum = response.data.data.falessum;
        this.zdtotal = response.data.total;
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
<style lang="scss" scoped>
.teables{
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
    width: 100%;
    border:1px solid #ebeef5;
    display: flex;
    .teables-title{
        width: 170px;
        height: 100%;
        background: #f5f7fa;
        .title-bar{
            width: 100%;
            font-size: 14px;
            padding: 10px;
            color: #909399;
            font-weight: 500;
            border-bottom:1px solid #ebeef5;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
    }
    .teablist{
        width: 100%; 
        display: flex;
        overflow-x: auto;
    }
    .teables-list{
        display: flex;
        .list-day{
            border-right:1px solid #ebeef5;
            text-align: right;
            .day-name{
                color: #606266;
                padding: 0 10px;
                width: 150px;
                height: 37px;
                line-height: 37px;
                box-sizing: border-box;
                border-bottom:1px solid #ebeef5;
                font-size: 14px;
            }
            .day-name::nth-last-child{
                border: 0;
            }
        }
    }
    .taebles-total{
        width: 120px;
        border-right: 1px solid #ebeef5;
        .total-name{
            display: flex;
            color: #606266;
            padding: 0 10px;
            width: 120px;
            height: 37px;
            line-height: 37px;
            box-sizing: border-box;
            border-bottom:1px solid #ebeef5;
            font-size: 14px;
        }
        .total-name::nth-last-child{
            border: 0;
        }
    }

}
</style>

