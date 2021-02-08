<template>
  
  <el-row id="register">
      
      <vue-particles
        color="#ffffff"
        :particleOpacity="0.7"
        :particlesNumber="50"
        shapeType="circle"
        :particleSize="3"
        linesColor="#E6E6FA"
        :linesWidth="1"
        :lineLinked="true"
        :lineOpacity="0.6"
        :linesDistance="150"
        :moveSpeed="6"
        :hoverEffect="true"
        hoverMode="grab"
        :clickEffect="true"
        clickMode="push"
      >
      </vue-particles>
      
      <el-form class="login-container" label-position="left" label-width="0px">
        <h3 class="login_title">新增用户</h3>
        <el-form-item style="user-select: none;">
          <el-input type="text" v-model="userName" placeholder="您的用户名"></el-input>
        </el-form-item>

        <el-form-item style="user-select: none;">
          <el-input type="password" v-model="password" placeholder="输入密码"></el-input>
        </el-form-item>
        
        <el-form-item style="user-select: none;">
          <el-input type="password" v-model="matchPassword" placeholder="再次输入密码"></el-input>
        </el-form-item>
        
        <el-form-item style="user-select: none;">
          <el-select v-model="regSex" placeholder="选择性别" style="width: 100%;">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item style="user-select: none;">
          <el-input type="number" v-model="regAge" placeholder="输入年龄"></el-input>
        </el-form-item>
        
        <el-form-item style="user-select: none;">
          <el-input type="email" v-model="regEmail" placeholder="输入邮箱地址"></el-input>
        </el-form-item>

        <el-form-item style="width: 100%">
          <el-button type="primary" style="width: 100%;background: #4169E1;border: none" @click="userRegister()">注册</el-button>
        </el-form-item>
        
        <el-form-item style="width: 100%">
          <el-button type="primary" class="button-border" @click="goLogin()">已经有账号？</el-button>
        </el-form-item>
      </el-form>
      
    </el-row>

</template>

<script>
export default {
  name: 'register',
  data() {
    return {
      baseHost: '',
      userName: '',
      password: '',
      matchPassword: '',
      regSex: '',
      regAge: '',
      regEmail: '',
      cmText: 'nothing'
    }
  },
  mounted() {
    this.baseHost = this.$store.state.baseHost;
  },
  methods: {
    btnClick:function(){
      console.log(this.cmText);
      this.$axios.post('http://' + this.baseHost + '/postbar/myCommentController/getCommentByCmUUID', this.$qs.stringify({
        cmUUID: '4b650f87f19346ceb52969153c286719'
      }))
      .then((response) => {
        this.cmText = response.data.cmText;
        console.log(response);
        console.log(response.data.cmText);
      })
      .catch(function (error) {
        console.log(error);
      });
     },
    goLogin: function() {
      this.$router.push({path: '/login'});
    },
    userRegister: function() {
      if(this.userName != '' && this.password != '' && this.matchPassword != '' && this.regSex != '' && this.regAge != '' && this.regEmail != '') {
        var email = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        
        if(this.password != this.matchPassword) {
           this.$message({
              message: '两次输入密码不一致！',
              type: 'error'
            });
        }else if(!email.test(this.regEmail)) {
           this.$message({
              message: '请输入正确的email地址',
              type: 'error'
            });
        }else{
          this.$axios.post('http://' + this.baseHost + '/pocketyun/userController/register', this.$qs.stringify({
            userName: this.userName,
            password: this.password,
            regSex: this.regSex,
            regAge: this.regAge,
            regEmail: this.regEmail
          })).then((response) => {
            if(response.data.message == "") {
              this.$message({
                message: '注册成功！即将跳转到登录页面！',
                type: 'success'
              });
              
              clearTimeout(this.timer);  //清除延迟执行 
              this.timer = setTimeout(()=>{   //设置延迟执行
                  this.$router.push({path: '/login'});
              },1500);
            }else{
              this.$message({
                message: '注册失败！' + response.data.message,
                type: 'error'
              });
            }
          }).catch(function (error) {
            console.log(error);
          });
        }
      }else{
        this.$message.warning("请输入注册信息！");
      }
    }
  }
}
</script>

<style scoped>
#register {
  background:url("../assets/866089.png") no-repeat top;
  background-size:cover;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  position: fixed;
  overflow:scroll;
  z-index: -1;
}
.login-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 5% auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px rgba(155,89,182,.5);
  position: relative;
  z-index: 3;
}
.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #f3f9f1;
  user-select: none;
}
#particles-js{
  position: fixed;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  z-index: 1;
}
.button-border {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
/*   border: none; */
  border: 1px solid #40E0D0;
/*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
/*   box-shadow: 0 0 25px rgba(64,224,208,.5); */
}
.button-border:hover {
  width: 100%;
  background: rgba(45, 45, 45, 0.33);
/*   border: none; */
  border: 1px solid #40E0D0;
/*   box-shadow: 0 0 25px rgba(155,89,182,.5); */
  box-shadow: 0 0 25px rgba(64,224,208,.5);
}
</style>