<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-container">
        <el-input v-model="listQuery.name" style="width: 200px;" class="filter-item" placeholder="商品名" @keyup.enter.native="handleFilter"/>
        <!-- <el-select v-model="listQuery.type_id" clearable class="filter-item" style="width: 130px" placeholder="商品分类">
          <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select> -->
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="id" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="标题" >
        <template slot-scope="scope">
          <!-- <span>{{scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}')}}</span> -->
          <span>{{ scope.row.news_name }}</span>
        </template>
      </el-table-column>

       

       <el-table-column width="150px" align="center" label="文章类型" >
        <template slot-scope="scope">
          <!-- <span>{{scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}')}}</span> -->
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
   
       
      <el-table-column align="center" fixed="right" label="操作" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <router-link :to="'/notice/edit/'+scope.row.id">
            <el-button type="text" size="small" >编辑</el-button>
          </router-link>
          <el-button type="text" size="small" @click="handleDelete(scope.row,scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  </div>
</template>
<script>
import { GetDataByList, GetDataByDelete, GetDataByStatus, PostDataByAdd } from '@/api/notice'
// import { GetCommonType } from '@/api/category'

export default {

  name: 'Package',
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    },
    statusText(status) {
      const statusMap = {
        0: '审核',
        1: '上架',
        2: '下架',
        3: '首页推荐'
      }
      return statusMap[status]
    },
     bannerText(status) {
      const statusMap = {
        1: '设为轮播图',
        2: '未设置',
      }
      console.log(status)
      return statusMap[status]
    }

  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      options: [],
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        type_id: undefined
      },
      temp: {
        id: undefined,
        labor_name: '',
        sales: 0,
        present_price: 0,
        original_price: 0,
        images: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        labor_name: [{ required: true, message: '商品需要填写', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        present_price: [{ required: true, message: '价格需要填写', trigger: 'blur' }],
        original_price: [{ required: true, message: '价格需要填写', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handelstatus(row) {
      console.log()
      if (row.banner === 1) {
        row.banner = 2
      } else {
        row.banner = 1
      }
        GetDataByStatus(row).then(res => {
        if (res.data.status === 200) {
          this.$message({
            message: res.data.msg,
            type: "success"
          });
        }
      })
    },
    getList() {
      // GetCommonType().then(res => {
      //   const data = res.data
      //   this.options = data.data
      //   console.log(this.options)
      // })
      this.listLoading = true
      GetDataByList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },

    handleDelete(row, id) {
      GetDataByDelete(id).then(response => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      })
    }

  }
}
</script>
