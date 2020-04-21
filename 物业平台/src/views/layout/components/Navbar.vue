<template>
  <div class="navbar">
    <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container"/>

    <breadcrumb class="breadcrumb-container"/>
    
<div class="tp">
<el-dialog
  title="请先选择小区"
  :visible.sync="dialogVisible"
  width="30%"
  :close-on-press-escape="false"
  :close-on-click-modal	="false"
  
 >
  
      <el-select v-model="community_id" filterable placeholder="请选择"  @change="handelClick">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.community_name"
          :value="item.id"
        ></el-option>
      </el-select>
  
</el-dialog>
</div>

  
    <div class="right-menu">
      <span>选择小区</span>

      <el-select v-model="community_id" filterable placeholder="请选择"  @change="handelClick">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.community_name"
          :value="item.id"
        ></el-option>
      </el-select>
      <router-link :to="'/community/create'">
        <span class="addplot" @click="addquit" >添加小区</span>
      </router-link>

      <router-link v-if="community_id" :to="'/community/edit/'+community_id">
        <span class="lookplot" @click="addquit" >查看小区</span>
      </router-link>
      

      
      
      
      <span>{{name}}</span>
      <span class="outs" style="display:block;" @click="logout"> 退出</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import ThemePicker from '@/components/ThemePicker'
import { getDataBylist } from "@/api/community";
import { getCommunity, setCommunity, removeCommunity } from "@/utils/community";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    LangSelect,
    ThemePicker
  },
   data() {
      return {
        dialogVisible:false,
        options:[],
        community_id: undefined,
      }
    },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar',
      'device'
    ])
  },
  created() {
   this.community_id=parseInt( getCommunity())
   console.log(this.community_id)
   if(isNaN(this.community_id)){
     this.dialogVisible=true;
   }else{
       this.dialogVisible=false;
   }
    this.getCityData();
  },
  methods: {
    handelClick(e){
    setCommunity(e);
      this.$router.go(0);
    },
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    },
    getCityData() {
      var e = 0;
      getDataBylist(e).then(res => {
        this.options = res.data.data;
        // setCommunity(this.list[0].id);
      });
    },
    addquit() {
      console.log("添加小区")
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tp .el-select--medium{
  width: 100%;
}
.tp >>> .el-dialog__body{
  padding-top: 10px !important ;
}
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container{
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    align-items: center;
    display: flex;
    span{
      display:block;
      font-size: 14px;
      margin-right: 10px;
      color: #999999;
      font-weight: 500;
    }
    &:focus{
     outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international{
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
    .outs{
      cursor: pointer;
      color: red;
    }
    .lookplot{
      padding-right: 10px;
    }
    .addplot{
      padding: 0 10px 0 10px;
      cursor: pointer;
    }
    .addplot:hover{
      color: rgb(10, 136, 238);
    }
  }
}
</style>
