<template>
    <div class="app-container">

<el-row :gutter="12">

  <el-col :span="8" v-for="item in list" :key="item.id">
    <el-card shadow="hover">
    <span> {{item.community_name}}</span>
    <router-link :to="'/community/edit/'+item.id">
    <el-button style="float: right; padding: 3px 0" type="text">查看</el-button>
    </router-link>
    </el-card>
  </el-col>
 <router-link :to="'/community/create'">
   <el-col :span="8">
    <el-card shadow="hover">
     <i class="el-icon-plus"></i>
     <label>添加小区</label>
    </el-card>
  </el-col>
 </router-link>
</el-row>

  </div>
</template>

<script>
import axios from 'axios';
import mock from '@/mock/city';
import { getDataBylist } from "@/api/community";
import { getCommunity, setCommunity, removeCommunity } from '@/utils/community'
import { getToken, setToken, removeToken } from '@/utils/auth'


export default {
  data(){
    return{
      Community_id:getCommunity(),
      list:undefined,
      selectedOptions:["140000", "140200", "140203"],
      cityData:mock,
    }
  },
  created(){
    console.log(this.Community_id)
    this.getCityData();
  },
  methods:{
    getCityData(){
      var e=0;
      getDataBylist(e).then(res=>{
        this.list=res.data.data
      })
     
    }
  }
}
</script>

<style>

.el-col-8{
  padding-bottom: 30px;
}
</style>
