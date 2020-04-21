<template>
  <div class="createPost-container">
    <el-form
      ref="dataForm"
      :model="temp"
      label-position="left"
      label-width="100px"
      style="width: 80%; margin:auto"
    >
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>基本信息</span>
          <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
        </div>
        <el-form-item label="收费类型">
          <el-select v-model="temp.category_id" filterable placeholder="请选择" @change="handelCharge">
            <el-option
              v-for="item in calculatelist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收费项">
          <el-select v-model="temp.charge_id" filterable placeholder="请选择">
            <el-option
              v-for="item in chargelist"
              :key="item.id"
              :label="item.fee_name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

           <el-form-item label="选择所属小区">
          <el-select v-model="temp.community_id" filterable placeholder="请选择">
        
            <el-option
              v-for="item in community"
              :key="item.id"
              :label="item.community_name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-col :span="7">
            <el-input v-model="temp.note"/>
          </el-col>
        </el-form-item>

         <el-form-item label="是否启用默认收费项">
          <el-col :span="7">
        <el-switch
  v-model="temp.state"
  active-text="不启用"
  inactive-text="启用">
  </el-switch>

          </el-col>
        </el-form-item>

      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>计费规则</span>
        </div>
        <el-form-item label="收费方式">
          <el-select v-model="temp.way_id" filterable placeholder="请选择" @change="handelway">
            <el-option v-for="item in waylist" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收费公式">
          <el-select v-model="temp.formula_id" filterable placeholder="请选择">
            <el-option
              v-for="item in formulalist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单价">
          <el-col :span="5">
            <el-input v-model="temp.price"/>
          </el-col>
        </el-form-item>
      </el-card>

       <!-- <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>违约金</span>
        </div>
       
      
        <el-form-item label="超出天数">
          <el-col :span="5">
            <el-input v-model="temp.price" placeholder=""/>
          </el-col>
        </el-form-item>
          <el-form-item label="比例">
          <el-col :span="5">
            <el-input v-model="temp.price" placeholder=""/>
          </el-col>
        </el-form-item>
      </el-card> -->
      <el-form-item class="btn">
        <el-button type="primary" @click="onSubmit">确认</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import Tinymce from "@/components/Tinymce";
import Upload from "@/components/Upload/singleImage3";
import MDinput from "@/components/MDinput";
import Sticky from "@/components/Sticky"; // 粘性header组件
import { validateURL } from "@/utils/validate";
import { fetchArticle } from "@/api/article";
import { userSearch } from "@/api/remoteSearch";
import { getDataBylist } from "@/api/community";


import Warning from "./Warning"; // 粘性header组件
import {
  PostLIDataByData,
  getChargeByList,
  getDataByDelete,
  getChargeByall,
  postLDataByUpdate,
  getLChargeByCategory,
  getChargeByFind
} from "@/api/charge";

const defaultForm = {
  status: "draft",
  title: "", // 文章题目
  content: "", // 文章内容
  content_short: "", // 文章摘要
  source_uri: "", // 文章外链
  image_uri: "", // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  platforms: ["a-platform"],
  comment_disabled: false,
  importance: 0
};

export default {
  name: "ArticleDetail",
  components: { Tinymce, MDinput, Upload, Sticky, Warning },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      calculatelist: [], //收费类型
      chargelist: [], //收费项
      waylist: [], //收费方式
      formulalist: [], //收费公式
      temp: {
        category_id: undefined,
        charge_id: undefined,
        price: undefined,
        way_id: undefined,
        formula_id: undefined
      },
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      tempRoute: {},
      community:[],
    };
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length;
    },
    lang() {
      return this.$store.getters.language;
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id;
      this.fetchData(id);
    } else {
      this.postForm = Object.assign({}, defaultForm);
    }

     getDataBylist().then(res=>{
      this.community=res.data.data
    })
   
    this.getcategory();
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    onSubmit() {
      var postdata = this.temp;
      PostLIDataByData(postdata).then(res => {
        this.loading = true;
        if (res.data.status !== 200) {
          this.$message.error(res.data.msg);
          this.loading = false;

          return false;
        }
        this.$message({
          message: res.data.msg,
          type: "success"
        });
        this.loading = false;
        this.$router.go(-1)
      });
    },
    handelway(pid) {
      var dd = [];
      for (var i = 0; i < this.category.length; i++) {
        if (this.category[i].pid == pid) {
          dd.push(this.category[i]);
        }
      }
      this.formulalist = dd;
    },
    setway(id) {
      getChargeByall().then(res => {
        var data = res.data;
        var formula = [];
        for (var i = 0; i < data.length; i++) {
          if (data[i].pid === id) {
            formula.push(data[i]);
          }
        }
        this.formulalist = formula;
      });
    },
    getcategory() {
      getChargeByall().then(res => {
        var data = res.data;
        this.category = data;
        var wylist = [];
        var elist = [];
        for (var i = 0; i < data.length; i++) {
          if (data[i].category === 1) {
            elist.push(data[i]);
          }
          if (data[i].category === 2 && data[i].child_id == 0) {
            wylist.push(data[i]);
          }
        }
        this.calculatelist = elist;
        this.waylist = wylist;
      });
    },
    handelCharge(e) {
      var post = {
        category_id: e
      };
      getLChargeByCategory(post).then(res => {
        this.chargelist = res.data.data;
      });
    },
    getCategory(category_id) {
      var post = {
        category_id: category_id
      };
      getLChargeByCategory(post).then(res => {
        this.chargelist = res.data.data;
      });
    },
    fetchData(id) {
      getChargeByFind(id)
        .then(response => {
          this.setway(response.data.way_id);
          this.getCategory(response.data.category_id);
          // this.temp = response.data;
          this.temp = response.data;
          if(this.temp.state==0){
            this.temp.state=false
          }else{
              this.temp.state=true
          }
        })
        .catch(err => {});
    },
 
    submitForm() {
      this.postForm.display_time = parseInt(this.display_time / 1000);

      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$notify({
            title: "成功",
            message: "设置成功",
            type: "success",
            duration: 2000
          });
          this.postForm.status = "published";
          this.loading = false;
          this.$router.go(-1)
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    draftForm() {
      if (
        this.postForm.content.length === 0 ||
        this.postForm.title.length === 0
      ) {
        this.$message({
          message: "请填写必要的标题和内容",
          type: "warning"
        });
        return;
      }
      this.$message({
        message: "保存成功",
        type: "success",
        showClose: true,
        duration: 1000
      });
      this.postForm.status = "draft";
    },
    getRemoteUserList(query) {
      userSearch(query).then(response => {
        if (!response.data.items) return;
        this.userListOptions = response.data.items.map(v => v.name);
      });
    }
  }
};
</script>

<style>
.createPost-container {
  padding-top: 50px;
  margin: auto;
}
.btn {
  margin-top: 50px;
}
</style>