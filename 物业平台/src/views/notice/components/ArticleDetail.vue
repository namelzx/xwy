<template>
  <div class="createPost-container">

    <el-form ref="ruleForm"  label-width="100px" class="demo-ruleForm">
      <el-form-item label="标题">
         <el-col :span="8">
        <el-input v-model="ruleForm.news_name"/>
         </el-col>
      </el-form-item>

       <el-form-item label="描述">
         <el-col :span="8">
            <el-input type="textarea" v-model="ruleForm.desc"></el-input>
         </el-col>
      </el-form-item>
      <el-form-item label="新闻图片">
        <Update :imageUrl="ruleForm.images_url" @showParentComp="handelbanner"/>
      </el-form-item>
      <el-form-item label="新闻类型">
        <el-select v-model="ruleForm.type" placeholder="请选择产品类型">
          <el-option v-for="item in options"  :key="item.value"
      :label="item.label"
      :value="item.value"/>
        </el-select>
      </el-form-item>
      <div class="editor-container">
                  <Tinymce ref="editor" :height="400" v-model="ruleForm.content" />

      </div>
      <el-form-item>
        <el-button type="primary" @click="isEdit===true? handelUpdate('ruleForm'): handelcreate('ruleForm')">{{ isEdit===true?'立即修改':'立即添加' }}</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>

</template>

<script>
import { GetDataBydetailed, PostDataByAdd, PostDataByUpdate } from '@/api/notice'

import Update from '@/components/Upload/Image'
import Tinymce from '@/components/Tinymce'

export default {
    components: { Tinymce , Update},

  // components: {  Update },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      banner: [],
      dd: '测试传值',
      introduce: '输入详细内容',
      config: {
        initialFrameWidth: null,
        initialFrameHeight: 350
      },
          options: [{
          value: '1',
          label: '轮播图'
        },
        {
          value: '2',
          label: '通知'
        },
          {
          value: '3',
          label: '新闻公告'
        }],
      ruleForm: {
        type_id: undefined,
        shopImg:"",
        status: 1
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
   
    // console.log(postForm.images_url);
  },
  methods: {
    handelbanner(data) {
      this.ruleForm.images_url = data
    },
  
    fetchData(id) {
      GetDataBydetailed(id).then(response => {
        console.log()
        const data = response.data
        this.ruleForm = data.data
        this.banner = data.data.banneritems
       
      })
    },
    handelcreate(formName) {
    
          const temp = {}
          temp.ruleForm = this.ruleForm
          PostDataByAdd(temp).then(res => {
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
    
    },
    handelUpdate(formName) {
          const temp = {}
          temp.ruleForm = this.ruleForm
          PostDataByUpdate(temp).then(res => {
            this.$notify({
              title: '成功',
              message: '修改',
              type: 'success',
              duration: 2000
            })
          })
     
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
.createPost-container {
  position: relative;
  padding: 30px;
  .createPost-main-container {
    padding: 40px 45px 20px 50px;
    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
    .editor-container {
      min-height: 500px;
      margin: 0 0 30px;
      .editor-upload-btn-container {
        text-align: right;
        margin-right: 10px;
        .editor-upload-btn {
          display: inline-block;
        }
      }
    }
  }
  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
}
</style>
