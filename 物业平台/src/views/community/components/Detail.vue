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
          
        </div>
        <div class="itme-he">
          <div class="he-left">
            <el-form-item label="小区名称">
              <el-col :span="7">
                <el-input v-model="temp.community_name"/>
              </el-col>
            </el-form-item>

            <el-form-item label="所在省市区">
              <el-col :span="10">
                <el-cascader :options="cityData" v-model="selectedOptions" @change="handleChange"></el-cascader>
              </el-col>
            </el-form-item>

            <el-form-item label="详细地址">
              <el-col :span="8">
                <el-input v-model="temp.detailed"/>
              </el-col>
            </el-form-item>

            <el-form-item class="btn">
              <el-button type="primary" @click="onSubmit">确认</el-button>
              <el-button>取消</el-button>
            </el-form-item>
          </div>
          <template v-if="isEdit">
            <router-link :to="'/housing/index/'+components_id">
              <!-- <el-button style="float: right; padding: 3px 0" type="text">房屋</el-button> -->
              <div class="house">
                <div class="house-icon"><img src="../../../assets/house.png" /></div>
                <div class="house-name">房屋</div>
              </div>
            </router-link>
            <router-link :to="'/housing/owner/index/'+components_id">
              <div class="house">
                <div class="house-icon"><img src="../../../assets/personnel.png" /></div>
                <div class="house-name">业主</div>
              </div>
            </router-link>
          </template>
        </div>
          
        

        
      </el-card>

      
    </el-form>
  </div>
</template>
<script>
import mock from "@/mock/city";

import Tinymce from "@/components/Tinymce";
import Upload from "@/components/Upload/singleImage3";
import MDinput from "@/components/MDinput";
import Sticky from "@/components/Sticky"; // 粘性header组件
import { validateURL } from "@/utils/validate";
import { postDataByData, getByFind } from "@/api/community";
import { userSearch } from "@/api/remoteSearch";

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
  components: { Tinymce, MDinput, Upload, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cityData: mock,
      selectedOptions: [],
      calculatelist: [], //收费类型
      chargelist: [], //收费项
      waylist: [], //收费方式
      formulalist: [], //收费公式
      components_id: undefined,
      temp: {
        provinces_code: 0,
        city_code: 0,
        area_code: 0
      },
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      tempRoute: {}
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
      this.components_id = this.$route.params && this.$route.params.id;
      const id = this.$route.params && this.$route.params.id;
      this.fetchData(id);
      console.log("编辑");
    } else {
      this.postForm = Object.assign({}, defaultForm);
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    fetchData(id) {
      getByFind(id)
        .then(response => {
          this.temp = response.data.data;
          this.selectedOptions.push(this.temp.provinces_code);
          this.selectedOptions.push(this.temp.city_code);
          this.selectedOptions.push(this.temp.area_code);
        })
        .catch(err => {});
    },
    handleChange(e) {
      this.temp.provinces_code = e[0];
      this.temp.city_code = e[1];
      this.temp.area_code = e[2];
    },
    onSubmit() {
      var postdata = this.temp;
      postDataByData(postdata).then(res => {
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

    handelCharge(e) {
      var post = {
        category_id: e
      };
      getLChargeByCategory(post).then(res => {
        this.chargelist = res.data.data;
      });
    },

    submitForm() {
      this.postForm.display_time = parseInt(this.display_time / 1000);

      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$notify({
            title: "成功",
            message: "发布文章成功",
            type: "success",
            duration: 2000
          });
          this.postForm.status = "published";
          this.loading = false;
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
.itme-he{
  display: flex;
}
.itme-he .he-left{
    width: 65%;
}
.btn {
  margin-top: 50px;
}
.el-cascader {
  width: 100%;
}
.el-col-10 {
  width: 80%;
}
.house{
  margin-top: 60px;
  width: 110px;
  height: 70px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #46a0fc;
  margin-right: 10px;
}
.house .house-icon{
  width: 25px;
  height: 25px;
  margin: 10px auto;
  /* background: orange; */
}
.house-icon img{
  width: 100%;
  height: 100%;
}
.house .house-name{
  text-align: center;
  font-size: 14px;
  color: #46a0fc;
}
</style>