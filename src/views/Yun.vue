<template>
  <div id="yun">
    
    <vue-particles
      color="#ffffff"
      :particleOpacity="0.7"
      :particlesNumber="100"
      shapeType="circle"
      :particleSize="3"
      linesColor="#E6E6FA"
      :linesWidth="1"
      :lineLinked="false"
      :lineOpacity="0.6"
      :linesDistance="150"
      :moveSpeed="8"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="repulse"
    >
    </vue-particles>
    
    <el-row class="head" :style="flag?'width:80%;':'width:326px;'">
      <el-col :span="14">
        <el-container>
          <el-main class="head-logo">
            袖珍网盘吧
          </el-main>
        </el-container>
      </el-col>
      <el-col :span="10">
        <el-container>
          <el-main class="head-col">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                {{userName}}<i class="el-icon-caret-bottom el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item style="font-size:12px;height:36px;text-align:center;">
                  <el-tooltip :content="'空间大小：' + (totalSizes <= 1024 ? (totalSizes.toFixed(2) + 'MB') : ((totalSizes / 1024).toFixed(2) + 'GB')) + ' / ' + userSpaceSize / (1024 * 1024 * 1024) + 'GB'" placement="left" effect="light">
                    <el-progress :text-inside="true" :stroke-width="15" :percentage="Math.round(totalSizes / (userSpaceSize / (1024 * 1024)) * 100)" style="line-height: 33px;"></el-progress>
                  </el-tooltip>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-setting" @click.native="goSetting()">修改信息</el-dropdown-item>
                <el-dropdown-item icon="el-icon-user" v-if="userName === 'admin'" @click.native="goDelete()">管理用户</el-dropdown-item>
                <el-dropdown-item icon="el-icon-warning-outline" @click.native="loginOut()">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-main>
        </el-container>
      </el-col>
    </el-row>
    
    
    <el-row class="body" :style="flag?'width:80%;':'width:326px;'">
      
      <el-row class="menu">
        
        <el-col :span="1" v-show="flag">
          <span class="el-dropdown-link" style="color:#6C757D;" v-if="nowFolder.filename === '/'">
            <i class="el-icon-back el-icon--left"></i>
          </span>
          <span class="el-dropdown-link" v-else>
            <i class="el-icon-back el-icon--left" @click="goBack(folders[folders.length - 1].path, folders[folders.length - 1].depth)"></i>
          </span>
        </el-col>
        
        <el-col :span="5" v-show="flag" style="overflow:hidden;">
          <span class="el-dropdown-link" style="font-size:14px;">
            <i class="el-icon-folder el-icon--left"></i>{{nowFolder.filename === '/' ? nowFolder.filename : nowFolder.filename.replace('/', '')}}
          </span>
        </el-col>
        
        <el-col :span="width">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              上一级<i class="el-icon-caret-bottom el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-folder-opened" v-for="folder in folders" :key="folder.id" @click.native="getFolderFiles(folder.path, folder.depth + 1)"> {{folder.filename}} </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        
        <el-col :span="9" v-show="flag">
          <el-form>
            <el-input
                style="width: 60%;margin-right: 10px;"
                size="mini"
                v-model="search"
                placeholder="请输入文件名...">
            </el-input>
            <el-button type="Info" size="mini" icon="el-icon-search" @click="searchFiles()">搜索</el-button>
          </el-form>
        </el-col>
        
        <el-col :span="6" style="text-align: right; float: right;">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <i class="el-icon-s-tools el-icon--left"></i>操作<i class="el-icon-caret-bottom el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
<!--               <el-dropdown-item icon="el-icon-plus">上传文件</el-dropdown-item> -->
              <el-dropdown-item icon="el-icon-upload2"  @click.native="uploadFilesVisible=true">上传文件</el-dropdown-item>
              <el-dropdown-item icon="el-icon-link"  @click.native="getHttpFile()">上传链接</el-dropdown-item>
<!--               <el-dropdown-item icon="el-icon-download" @click.native="fileDownLoad()">下载文件</el-dropdown-item> -->
              <el-dropdown-item icon="el-icon-folder-add" @click.native="inputFolderName(nowFolder.path, nowFolder.depth + 1)">新建文件夹</el-dropdown-item>
              <el-dropdown-item icon="el-icon-scissors"  @click.native="moveFiles()">{{moveFilesFlag?'粘贴（'+moveFilesArray.length+'）':'剪切'}}</el-dropdown-item>
              <el-dropdown-item icon="el-icon-delete" @click.native="deleteFiles()">删除</el-dropdown-item>
              <el-dropdown-item icon="el-icon-refresh-right" @click.native="updateFiles(nowFolder.path, nowFolder.depth + 1)">刷新</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        
        <el-dialog
          :modal-append-to-body='false'
          :visible.sync="uploadFilesVisible"
          :before-close="handleClose"
          width="350px">
            
          <span slot="title">
            <i class="el-icon-upload2 el-icon--left"></i>上传文件
          </span>
          
          <el-upload
            class="avatar-uploader"
            ref="upload"
            :action="uploadUrl"
            :http-request="uploadSectionFiles"
            multiple
            :on-change="changeUploadListData"
            :file-list="uploadFilesList"
            :auto-upload="false">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          
          <el-progress :text-inside="true" :stroke-width="26" :percentage="progressPercent" style="margin-top:40px;"></el-progress>
          
           <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="handleClose">取 消</el-button>
            <el-button style="margin-left: 10px;" type="primary"  size="small" @click="uploadFiles()">开始上传</el-button>
           </span>
        </el-dialog>
        
      </el-row>
      
      <el-col :span="24">
        
        <el-table
          class="body-table"
          :header-cell-style="{color: '#000000'}"
          :data="files"
          :cell-class-name="cellClass"
          @selection-change="handleSelectionChange"
          @sort-change='sortchange'>

          <el-table-column
            sortable
            show-overflow-tooltip
            prop="filename"
            label="文件名"
            :width="flag ? '250' : '105'">
            
            <template slot-scope="scope">
              <span v-if="judgeFileType(scope.row.filename) === 1" class="folder" @click="accessFolder(scope.row.path, scope.row.depth + 1)"> {{scope.row.filename}} </span>
              <span v-else @click="downloadFile(scope.row.pathsUUID, scope.row.filename)"> {{scope.row.filename}} </span>
            </template> 
            
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            header-align="center"
            align="center"
            sortable
            v-if="flag"
            prop="addTime"
            label="创建日期">
          </el-table-column>

          <el-table-column
            show-overflow-tooltip
            header-align="center"
            align="center"
            sortable='custom'
            prop="size"
            label="大小"
            :width="flag ? '' : '75'">
          </el-table-column>

          <el-table-column
            header-align="center"
            align="center"
            label="操作"
            :width="flag ? '200' : '90'">
            
            <template slot-scope="scope">
              <el-container v-if="judgeFileType(scope.row.filename) === 1">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                  <el-link type="primary" @click="deleteFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-folder-delete"></i> 删除 </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 2">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="playMusic(scope.row.pathsUUID)"> <i class="el-icon-video-play"></i> 播放 </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 3">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="playVideo(scope.row.pathsUUID)"> <i class="el-icon-video-play"></i> 播放 </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 4">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="showImages(scope.row.pathsUUID)"> <i class="el-icon-picture"></i> 查看 </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                </el-main>
              </el-container>
              <el-container v-else-if="judgeFileType(scope.row.filename) === 5">
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="showText(scope.row.pathsUUID)"> <i class="el-icon-document"></i> 查看 </el-link>
                  <el-link type="primary" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                </el-main>
              </el-container>
              <el-container v-else>
                <el-main :style="flag ? 'text-align:center;' : 'text-align:center;padding:0px;'">
                  <el-link type="primary" :style="flag ? 'margin-right:10px;' : ''" @click="renameFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-edit"></i> 编辑 </el-link>
                  <el-link type="primary"  @click="deleteFile(scope.row.filename, scope.row.pathsUUID)"> <i class="el-icon-document-delete"></i> 删除 </el-link>
                </el-main>
              </el-container>
            </template>
            
          </el-table-column>
          
          <el-table-column
            align="center"
            type="selection"
            :width="flag ? '55' : ''">
            
<!--             <template slot-scope="scope">
              <span v-show="scope.row.name=='../'" type="primary" @click="log(scope)"> -- </span>
              <label class="el-checkbox" v-else>
                <span class="el-checkbox__input">
                  <span class="el-checkbox__inner"></span>
                  <input type="checkbox" aria-hidden="false" class="el-checkbox__original" value="">
                </span>
              </label>
            </template> -->
            
          </el-table-column>

        </el-table>
        
      </el-col>
    </el-row>
    
    <viewer :images="images" @inited="inited">
        <img v-for="item in images" :src="item.src" :key="item.index" height="100" v-show="false">
    </viewer>

<!--     <el-dialog
      style="padding:0px;"
      :modal-append-to-body='false'
      :visible.sync="musicPlayVisible"
      :width="flag?'50%':'350px'">
      
      <span slot="title">
        <i class="el-icon-video-play el-icon--left"></i>音乐播放
      </span>
      
      <aplayer :audio="audio" :lrcType="0" />
    
    </el-dialog> -->

    <aplayer ref="aplayer" :audio="audio" :lrcType="0" fixed :mini="false" :listFolded="true" :autoplay="true" v-if="musicFlag"/>

    <div class="video-container" v-show="videoFlag">
      <d-player ref="dplayer" :options="options" class="video" :style="{width:videoWidth - 40 + 'px', height:videoHeight - 88 + 'px'}"></d-player>
      <div class="video-bottombar">
        <ul id="pv-buttons">
          <li id="pv-bar-close" class="bar-right bar-button" @click="closeVideo()"><img src="../assets/preview-close.svg" class="img"></li>
          <li id="pv-bar-raw" class="bar-right bar-button" @click="downloadFile(nowVideo.pathsUUID, nowVideo.filename)"><img src="../assets/preview-raw.svg" class="img"></li>
          <li id="pv-bar-next" class="bar-right bar-button"  @click="nextVideo(nowVideoIndex)"><img src="../assets/preview-next.svg" class="img"></li>
          <li id="pv-bar-idx" class="bar-right bar-label">{{nowVideoIndex + 1}}/{{videoArray.length}}</li>
          <li id="pv-bar-prev" class="bar-right bar-button" @click="previousVideo(nowVideoIndex)"><img src="../assets/preview-prev.svg" class="img"></li>
          <li class="bar-left bar-label">{{nowVideo.filename}}</li>
        </ul>
      </div>
    </div>

    <div class="video-container" v-show="editorShow">
      
      <editor
         class="video"
         :style="{width:videoWidth - 40 + 'px', height:videoHeight - 88 + 'px'}"
         ref="editor" 
         :content="textContent" 
         v-model="textContent"
         :options="flag?editorOption1:editorOption2"
         :lang="textLang"
         :theme="editorTheme"
         @init="editorInit">
     </editor>
      
      <div class="video-bottombar">
        <ul id="pv-buttons">
          <li id="pv-bar-close" class="bar-right bar-button" @click="closeText()"><img src="../assets/preview-close.svg" class="img"></li>
          <li id="pv-bar-raw" class="bar-right bar-button" @click="saveText()"><img src="../assets/icon_save_24px_522050_easyicon.net.png" class="img"></li>
          <li class="bar-left bar-label">{{nowText.filename}}</li>
        </ul>
      </div>
      
    </div>
    
  </div>
</template>

<script>
import fileDownload from 'js-file-download';

export default {
  name: 'yun',
  data() {
    return {
      baseHost: '',
      userSpaceSize: 1 * 1024 * 1024 *1024,
      userName: '',
      flag: true,
      width: 3,
      search: '',
      uploadUrl: '',
      progressPercent: 0,
      uploadFilesCount: 0,
      uploadFilesList: [],
      uploadFilesVisible: false,
      moveFilesArray: [],
      repeatFlag:false,
      moveFilesFlag: false,
      oldFolderPathsUUID: '',
      nowFolder: {filename:'/', depth:0},
      nowFolder_backup: {},
      filesSelection: [],
      folders: [],
      tempFiles: [],
      saveFiles: [],
      files: [],
      test: '',
      pictureFlag: false,
      images: [],
      musicFlag: false,
      audio: [],
      options: {
        video: {
          url: ''
        }
      },
      videoWidth: document.documentElement.clientWidth,     // 屏幕宽
      videoHeight: document.documentElement.clientHeight,  // 屏幕高
      videoArray: [],
      nowVideo: {},
      nowVideoIndex: 0,
      videoFlag: false,
      totalSizes: 0,
      textContent: 'print("Hello world!");',
      editorTheme: 'monokai',
      editorShow: false,
      editorOption1: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize:4,
        fontSize: 16,
        showPrintMargin:false,   //去除编辑器里的竖线
      },
      editorOption2: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize:4,
        fontSize: 12,
        showPrintMargin:false,   //去除编辑器里的竖线
      },
      nowText: {},
      textLang: 'python'
    }
  },
  mounted() {
    
    
    window.addEventListener("resize", () => {
      this.videoWidth = document.documentElement.clientWidth;
      this.videoHeight = document.documentElement.clientHeight;
    });
    
    window.addEventListener("offline", () => {
      this.$message({
        message: '网络错误！请检查网络连接！',
        type: 'error'
      });
    });
    
    this.userName = this.$store.state.userName;
    
    if(this.userName == '') {
      this.$message({
        message: '用户未登录！即将返回登录页面',
        type: 'error'
      });
      
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
          this.$router.push({path: '/login'});
      },1500);
    }else{
      this.baseHost = this.$store.state.baseHost;
      this.userSpaceSize = this.userName == 'admin' ? this.$store.state.adminSpaceSize : this.$store.state.userSpaceSize;

//       console.log(this.userSpaceSize);

      this.uploadUrl = 'http://' + this.baseHost + '/pocketyun/pathsController/uploads';
      
      this.filesListInit();
    }
    
    if(this.isMobile()) {
      this.flag = false;
      this.width = 6;
    }
  },
  watch: {
    search(val){//普通的watch监听
//       console.log("search: "+ val);
      if(val == '') {
        this.getFolderFiles(this.nowFolder.path, this.nowFolder.depth + 1);
      }
    }
  },
  methods: {
    isMobile: function() {
       let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
       return flag;
    },
    changeData: function() {
      this.userName = this.$store.state.userName;
    },
    cellClass: function({row, rowIndex, columnIndex}) {
      if(rowIndex === 0 && columnIndex === 4 && row.name === '../') {
//         console.log(this.$refs.multipleTable);
//         return 'cell-display';
//           row.splice(0, 4);
      }
    },
    log: function(scope) {
      console.log(scope)
      console.log("-------------------------------")
    },
    filterTag: function(value, row, column) {
      console.log(value);
      console.log(row);
      console.log(column);
    },
    searchFiles: function() {
      if(this.search == "") {
        this.files = this.saveFiles;
        this.$message.warning("查询条件不能为空！");
        return;
      }
      
//       this.saveFiles = this.files;
//       console.log(this.saveFiles[1]);
      this.tempFiles = [];
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].filename.indexOf(this.search) >= 0) {
//           console.log(this.search + "------------" + this.saveFiles[i].filename);
          this.tempFiles.push(this.saveFiles[i]);
        }
      }
      this.files = this.tempFiles;
    },
    loginOut: function() {
      this.$message({
        message: '退出登录成功！即将返回登录页面',
        type: 'warning'
      });
      
      this.$store.commit('saveUserName', '');
      this.$store.commit('saveUserUUID', '');
      
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
          this.$router.push({path: '/login'});
      },1500);
    },
    goSetting: function() {
      this.$router.push({path: '/setting'});
    },
    goDelete: function() {
      this.$router.push({path: '/delete'});
    },
    filesListInit: function() {
//       this.$refs.aplayer.pause();
      
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        path: '/',
        depth: 1
      })).then((response) => {
        
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
        
        this.nowFolder = {pathsUUID: response.data.rootPathUUID, filename: '/', path: '/', depth: '0'};
        this.folders.push(this.nowFolder);
        
//         console.log(response.data.rootPathUUID);
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '获取文件列表失败！服务器内部错误！'
        });
      });
    },
    getFolderFiles: function(path, depth) {
      
//       this.$refs.aplayer.pause();
      this.musicFlag = false;
      this.audio = [];
      
      this.search = '';
      var temp_folders = []
      for(let i = 0; i < this.folders.length; i++) {
        if(this.folders[i].path == path && this.folders[i].depth == depth - 1) {
          if(this.folders[i].filename == "/") {
            temp_folders.push(this.folders[i]);
          }
          this.nowFolder = this.folders[i];
          break;
        }
        temp_folders.push(this.folders[i]);
      }
      this.folders = temp_folders;
      
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        path: path,
        depth: depth
      })).then((response) => {
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '获取文件列表失败！服务器内部错误！'
        });
      });
    },
    inputFolderName: function(path, depth) {
//       console.log(path, depth);
      this.$prompt('', '新建文件夹', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入新文件夹的名称......'
        }).then(({ value }) => {
        
          var illegalFolderSign = ['"', "'", '/', '\\', '*', '|', '<', '>', '&', '$', ':', '?'];
          var illegalFlag = false;
        
          for(let i = 0; i < illegalFolderSign.length; i++) {
            if(value.indexOf(illegalFolderSign[i]) != -1) {
              illegalFlag = true;
              break;
            }
          }
          
          if(value[0] == '.' || value[value.length - 1] == '.') {
            illegalFlag = true;
          }
        
          if(!illegalFlag) {
//             console.log(value[0] + " " + path + " " + depth + " " + illegalFlag);
            this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/mkdir', this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: path,
              depth: depth,
              folder: value
            })).then((response) => {
  //             console.log(response.data);
              if(response.data.message == "") {
                this.$message({
                  type: 'success',
                  message: '新文件夹创建成功！新文件夹名称为: ' + value
                });
              }else{
                this.$message({
                  type: 'error',
                  message: '新文件夹创建失败！ ' + response.data.message
                });
              }

              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
            }).catch((error) => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '新文件夹创建失败！服务器内部错误！'
              });
            });
          }else{
            this.$confirm('提示：文件夹名中不应含有：引号 / \\ * | < > & $ : ? 且不能以“.”开头或结尾。', '新建文件夹', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            }).then(() => {
              this.test = 1;
            }).catch(() => {
              this.test = 2;
            });
          }
        
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          });       
        });
    },
    judgeFileType: function(filename) {
      if(filename.indexOf('/') != -1) {
        return 1;
      }else if(filename.toLowerCase().indexOf('.mp3') != -1) {
        return 2;
      }else if(filename.toLowerCase().toLowerCase().indexOf('.wav') != -1) {
        return 2;
      }else if(filename.toLowerCase().indexOf('.flac') != -1) {
        return 2;
      }else if(filename.toLowerCase().indexOf('.mp4') != -1) {
        return 3;
      }else if(filename.toLowerCase().indexOf('.webm') != -1) {
        return 3;
      }else if(filename.toLowerCase().indexOf('.mkv') != -1) {
        return 3;
      }else if(filename.toLowerCase().indexOf('.jpg') != -1) {
        return 4;
      }else if(filename.toLowerCase().indexOf('.png') != -1) {
        return 4;
      }else if(filename.toLowerCase().indexOf('.jpeg') != -1) {
        return 4;
      }
      
      var text = [
        '.c',
        '.cpp',
        '.css',
        '.html',
        '.java',
        '.js',
        '.json',
        '.jsp',
        '.md',
        '.txt',
        '.py',
        '.pyc',
        '.sh',
        '.sql'
      ]
      
      for(let i = 0; i < text.length; i++) {
        if(filename.toLowerCase().indexOf(text[i]) != -1) {
          return 5;
        }
      }
      
      return 6
    },
    accessFolder: function(path, depth) {
      
//       this.$refs.aplayer.pause();
      this.musicFlag = false;
      this.audio = [];
//       console.log(path + '  ' + depth + '    -------------------');
      for(let i = 0; i < this.files.length; i++) {
        if(this.files[i].path == path && this.files[i].depth == depth - 1) {
          if(depth >= 3) {
            this.folders.push(this.nowFolder);
          }
          this.nowFolder = this.files[i];
          break;
        }
      }
      
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        path: path,
        depth: depth
      })).then((response) => {
//         console.log(response.data);
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '获取文件列表失败！服务器内部错误！'
        });
      });
    },
    goBack: function(path, depth) {
      
//       this.$refs.aplayer.pause();
      this.musicFlag = false;
      this.audio = [];
      
//       console.log(filename + '  ' + depth);
      this.nowFolder = this.folders[this.folders.length - 1];
      if(this.folders.length > 1) {
        this.folders.pop();
      }
      
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        path: path,
        depth: depth + 1
      })).then((response) => {
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '获取文件列表失败！服务器内部错误！'
        });
      });
    },
    renameFile: function(filename, pathsUUID) {
      var moveFilesFlag = false;
      for(let i = 0; i < this.moveFilesArray.length; i++) {
        if(pathsUUID == this.moveFilesArray[i].pathsUUID) {
          moveFilesFlag = true;
          this.$confirm('提示：重命名文件失败！编辑的文件是剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '编辑文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }).then(() => {
            this.test = 1;
          }).catch(() => {
            this.test = 2;
          });
          break;
        }
      }
      
      if(!moveFilesFlag) {
        
        var tips = filename.indexOf("/") == -1 ? '文件' : '文件夹';
        this.$prompt('请输入' + tips + '的新名称：', '编辑', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入' + tips + '的新名称......',
          inputValue: filename.replace('/', '')
        }).then(({ value }) => {
          var illegalFolderSign = ['"', "'", '/', '\\', '*', '|', '<', '>', '&', '$', ':', '?'];
          var illegalFlag = false;
          
          for(let i = 0; i < illegalFolderSign.length; i++) {
            if(value.indexOf(illegalFolderSign[i]) != -1) {
              illegalFlag = true;
              break;
            }
          }
          
          if(value[0] == '.' || value[value.length - 1] == '.') {
            illegalFlag = true;
          }
          
          if(!illegalFlag) {
            this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/renameFile', this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              lastPathsUUID: this.nowFolder.pathsUUID,
              pathsUUID: pathsUUID,
              newFilename: value
            })).then((response) => {
    //           console.log(response.data);
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
            }).catch((error) => {
              console.log(error);
              this.$message({
                type: 'error',
                message: tips + '编辑失败！服务器内部错误！'
              });
            });

            this.$message({
              type: 'success',
              message: tips + '编辑成功！' + tips + '新名称为: ' + value
            });
          }else{
            this.$confirm('提示：' + tips + '的名称中不应含有：引号 / \\ * | < > & $ : ? 且不能以“.”开头或结尾。', '编辑文件', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            }).then(() => {
              this.test = 1;
            }).catch(() => {
              this.test = 2;
            });
          }

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          });       
        });

      }
      
    },
    deleteFile: function(filename, pathsUUID) {
      var moveFilesFlag = false;
      for(let i = 0; i < this.moveFilesArray.length; i++) {
        if(pathsUUID == this.moveFilesArray[i].pathsUUID) {
          moveFilesFlag = true;
          break;
        }
      }
      
      if(!moveFilesFlag) {
        
        var tips = filename.indexOf("/") == -1 ? '文件' : '文件夹';
        this.$confirm('此操作将永久删除' + tips + ' [' + filename.replace('/', '') + '], 是否继续?', '删除' + tips, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/delFile', this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            lastPathsUUID: this.nowFolder.pathsUUID,
            pathsUUID: pathsUUID
          })).then((response) => {
  //           console.log(response.data);
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.totalSizes = response.data.totalSizes;
          }).catch((error) => {
            console.log(error);
            this.$message({
              type: 'error',
              message: tips + '删除失败！服务器内部错误！'
            });
          });

          this.$message({
            type: 'success',
            message: '删除成功!'
          });

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });

      }else{
        this.$confirm('提示：删除文件失败！删除的文件是剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.test = 1;
        }).catch(() => {
          this.test = 2;
        });
      }
      
      
    },
    handleSelectionChange: function(val) {
      this.filesSelection = val;
//       console.log(JSON.stringify(this.filesSelection));
//       this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/test', this.$qs.stringify({
//         json:JSON.stringify(this.filesSelection)
//       })).then((response) => {
//           console.log(response.data);
//       }).catch((error) => {
//         console.log(error);
//       });
    },
    deleteFiles: function() {
      
      var moveFilesFlag = false;
      for(let i = 0; i < this.filesSelection.length; i++) {
        for(let j = 0; j < this.moveFilesArray.length; j++) {
          if(this.filesSelection[i].pathsUUID == this.moveFilesArray[j].pathsUUID) {
            moveFilesFlag = true;
            break;
          }
        }
      }
      
      if(!moveFilesFlag) {
        
        if(this.filesSelection.length != 0) {
          this.$confirm('提示：确定要彻底删除这' + this.filesSelection.length + '项么？该操作不可恢复！', '删除文件', {
            confirmButtonText: '全部删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {

            this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/delFiles', this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              lastPathsUUID: this.nowFolder.pathsUUID,
              filesJsonArray: JSON.stringify(this.filesSelection)
            })).then((response) => {
  //             console.log(response.data);
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              this.totalSizes = response.data.totalSizes;
            }).catch((error) => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '文件删除失败！服务器内部错误！'
              });
            });

            this.$message({
              type: 'success',
              message: '文件删除成功!'
            });

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });  
          });
        }else{
          this.$confirm('提示：您还未选择任何文件，请先选中一些文件后再执行本操作！', '删除文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.test = 1;
          }).catch(() => {
            this.test = 2;
          });
        }
            
      }else{
        this.$confirm('提示：删除文件失败！删除的文件中包含剪切板中要移动的文件！请先清空剪切板后再来执行本操作！', '删除文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.test = 1;
        }).catch(() => {
          this.test = 2;
        });
      }
      
    },
    moveFiles: function() {
      
      if(this.moveFilesFlag){
        
        this.$confirm('提示：确定将这' + this.moveFilesArray.length + '项移动到当前位置么？', '移动文件', {
          confirmButtonText: '全部移动',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var flag = false;
          
          for(let i = 0; i < this.moveFilesArray.length; i++) {
            
            if(this.moveFilesArray[i].filename.indexOf('/') != -1) {
              if(this.nowFolder.path.length >= this.moveFilesArray[i].path.length) {
                if(this.nowFolder.path.indexOf(this.moveFilesArray[i].path) != -1) {
                  flag = true;
                  
                  this.$message({
                    type: 'error',
                    message: '文件移动失败!无法将自身移动到子目录中！'
                  });
                  
                  break;
                }
              }
            }
            
            for(let j = 0; j < this.saveFiles.length; j++) {
              if(this.moveFilesArray[i].filename == this.saveFiles[j].filename) {
                this.repeatFlag = true;
                
                this.$message({
                  type: 'error',
                  message: '文件移动失败!当前目录下有重复的文件名！'
                });
                
                break;
              }
            }
          }
          
          if(!flag && !this.repeatFlag) {
            this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/moveFiles', this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              oldPathsUUID: this.oldFolderPathsUUID,
              newPathsUUID: this.nowFolder.pathsUUID,
              filesJsonArray: JSON.stringify(this.moveFilesArray)
            })).then((response) => {
//               console.log(response.data);
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
            }).catch((error) => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '文件移动失败！服务器内部错误！'
              });
            });

            this.$message({
              type: 'success',
              message: '文件移动成功!'
            });
          }
          
          this.repeatFlag = false;
          this.moveFilesFlag = false;
          this.oldFolderPathsUUID = '';
          this.moveFilesArray = [];
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消移动'
          });
          
          this.moveFilesFlag = false;
          this.oldFolderPathsUUID = '';
          this.moveFilesArray = [];
        });

      }else{
        if(this.filesSelection.length != 0) {
          this.moveFilesFlag = true;
          this.oldFolderPathsUUID = this.nowFolder.pathsUUID;
          this.moveFilesArray = this.filesSelection;
        }else{
          this.$confirm('提示：您还未选择任何文件，请先选中一些文件后再执行本操作！', '移动文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.test = 1;
          }).catch(() => {
            this.test = 2;
          });
        }
      }
    },
    uploadFiles: function() {
      this.$refs.upload.submit();
//       this.uploadFilesVisible = false;
//       this.$refs.upload.clearFiles();
    },
    uploadSectionFiles: function(param) {
      
      
      var fileObj = param.file;
      
      var fileNameFlag = false;
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].filename == fileObj.name) {
          fileNameFlag = true;
          break;
        }
      }
      
      if(!fileNameFlag) {
        
        var spaceSize = (this.userSpaceSize / (1024 * 1024) - this.totalSizes) * 1024 * 1024;
        
//         console.log(this.userSpaceSize / (1024 * 1024));
//         console.log(spaceSize);
      
        if(fileObj.size <= spaceSize) {
          var form = new FormData();
          // 文件对象
          form.append("userUUID", this.$store.state.userUUID);
          form.append("pathsUUID", this.nowFolder.pathsUUID);
          form.append("files", fileObj);
          this.$axios({
            method: 'post',
            url: 'http://' + this.baseHost + '/pocketyun/pathsController/uploads',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            data:form,
            onUploadProgress: progressEvent => {
              // progressEvent.loaded:已上传文件大小
              // progressEvent.total:被上传文件的总大小
              this.progressPercent = Number((progressEvent.loaded / progressEvent.total * 100).toFixed(2))
            }
          }).then((response) => {

            for(let i = 0; i < this.uploadFilesList.length; i++) {
              if(this.uploadFilesList[i].uid == fileObj.uid) {
                this.uploadFilesList[i].status = 'success';
                break;
              }
            }
    //         console.log(response)
            this.$message({
              type: 'success',
              message: '文件 [' + fileObj.name + '] 上传成功'
            });

    //         console.log(fileObj);

            this.uploadFilesCount++;
            
            this.totalSizes = response.data.totalSizes;
            if(this.uploadFilesCount == this.uploadFilesList.length) {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;

              clearTimeout(this.timer);  //清除延迟执行 
              this.timer = setTimeout(()=>{   //设置延迟执行
                this.uploadFilesVisible = false;
                this.$refs.upload.clearFiles();
                this.progressPercent = 0;
                this.uploadFilesCount = 0;
        //         console.log(this.progressPercent);
              },1500);
            }
          }).catch((error) => {
            console.log(error)
            this.$message({
              type: 'error',
              message: '文件上传失败！服务器内部错误！'
            });
            this.uploadFilesVisible = false;
            this.$refs.upload.clearFiles();
            this.progressPercent = 0;
          });
        }else{

          for(let i = 0; i < this.uploadFilesList.length; i++) {
            if(this.uploadFilesList[i].uid == fileObj.uid) {
              this.uploadFilesList[i].status = 'fail';
              break;
            }
          }

          this.$message({
            type: 'error',
            message: '文件 [' + fileObj.name + '] 上传失败！空间不足'
          });

          this.uploadFilesCount++;

          if(this.uploadFilesCount == this.uploadFilesList.length) {

            this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
              userUUID: this.$store.state.userUUID,
              path: this.nowFolder.path,
              depth: this.nowFolder.depth + 1
            })).then((response) => {
              this.saveFiles = response.data.pathsDtosList;
              this.files = this.saveFiles;
              this.totalSizes = response.data.totalSizes;
            }).catch((error) => {
              console.log(error);
              this.$message({
                type: 'error',
                message: '获取文件列表失败！服务器内部错误！'
              });
            });

            clearTimeout(this.timer);  //清除延迟执行 
            this.timer = setTimeout(()=>{   //设置延迟执行
              this.uploadFilesVisible = false;
              this.$refs.upload.clearFiles();
              this.progressPercent = 0;
              this.uploadFilesCount = 0;
      //         console.log(this.progressPercent);
            },1500);
          }
        }
      }else{
        this.$message({
          type: 'error',
          message: '文件 [' + fileObj.name + '] 上传失败！文件已存在！'
        });
        
        this.uploadFilesCount++;

        if(this.uploadFilesCount == this.uploadFilesList.length) {
          this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            path: this.nowFolder.path,
            depth: this.nowFolder.depth + 1
          })).then((response) => {
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.totalSizes = response.data.totalSizes;
          }).catch((error) => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });

          clearTimeout(this.timer);  //清除延迟执行 
          this.timer = setTimeout(()=>{   //设置延迟执行
            this.uploadFilesVisible = false;
            this.$refs.upload.clearFiles();
            this.progressPercent = 0;
            this.uploadFilesCount = 0;
    //         console.log(this.progressPercent);
          },1500);
        }
      }
      
    },
    handleClose: function() {
      this.uploadFilesVisible = false;
      this.$refs.upload.clearFiles();
    },
    changeUploadListData: function(file, fileList) {
      this.test = file.uid;
//       console.log(fileList);
//       console.log(this.uploadFilesList);
      this.uploadFilesList = fileList;
    },
    fileDownLoad: function() {
      if(this.filesSelection.length != 0) {
        if(this.filesSelection.length == 1) {
          
          if(this.filesSelection[0].filename.indexOf("/") == -1) {
            this.$confirm('提示：您确认要下载文件：[' + this.filesSelection[0].filename + ']么？', '下载文件', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              
              this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/download', this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                pathsUUID: this.filesSelection[0].pathsUUID
              }),{
                responseType: 'arraybuffer'
              }).then((response) => {
                
                fileDownload(response.data, this.filesSelection[0].filename);
                
              }).catch((error) => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '文件下载失败！服务器内部错误！'
                });
              });
              
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '取消下载！'
              });
            });
          }else{
            this.$confirm('提示：您选择了一个目录，请先选中一个文件后再执行本操作！', '下载文件', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'error'
            }).then(() => {
              this.test = 1;
            }).catch(() => {
              this.test = 2;
            });
          }
          
        }else{
          this.$confirm('提示：您选择了多个文件，请先选中一个文件后再执行本操作！', '下载文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.test = 1;
          }).catch(() => {
            this.test = 2;
          });
        }
      }else{
        this.$confirm('提示：您还未选择任何文件，请先选中一个文件后再执行本操作！', '下载文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.test = 1;
        }).catch(() => {
          this.test = 2;
        });
      }
    },
    downloadFile: function(pathsUUID, filename) {
      var url = 'http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + pathsUUID;
      this.$confirm('提示：您确认要下载文件：[' + filename + ']么？<br /><a href="' + url + '">复制文件下载链接</a><br />', '下载文件', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

//         this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/download', this.$qs.stringify({
//           userUUID: this.$store.state.userUUID,
//           pathsUUID: pathsUUID
//         }),{
//           responseType: 'arraybuffer'
//         }).then((response) => {

//           fileDownload(response.data, filename);

//         }).catch((error) => {
//           console.log(error);
//           this.$message({
//             type: 'error',
//             message: '文件下载失败！服务器内部错误！'
//           });
//         });
        let ele = document.createElement('a');
        ele.download = filename;
        ele.href = 'http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + pathsUUID;
        ele.style.display = 'none';
        document.body.appendChild(ele);
        ele.click();
        document.body.removeChild(ele);
        
//         let elemIF = document.createElement("iframe");
//         elemIF.src = 'http://' + this.baseHost + '/pocketyun/pathsController/download?userUUID=' + this.$store.state.userUUID + '&pathsUUID=' + pathsUUID;
//         elemIF.style.display = "none";
//         document.body.appendChild(elemIF);

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消下载！'
        });
      });
    },
    inited: function(viewer) {
      this.$viewer = viewer;
    },
    showImages: function(pathsUUID) {
      
      var pictures = [];
      
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].pathsUUID == pathsUUID) {
          var imgs = 1;
          
          var url = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[i].path);
          url = url.replace(/%3A/g, ':');
          url = url.replace(/%2F/g, '/');
          pictures.push({src:url, index:i});
          
          for(let j = i + 1; j < this.saveFiles.length; j++) {
            if(this.saveFiles[j].filename.toLowerCase().indexOf('.jpg') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.jpeg') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.png') != -1) {
              var _url = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[j].path);
              _url = _url.replace(/%3A/g, ':');
              _url = _url.replace(/%2F/g, '/');
              pictures.push({src:_url, index:j});
              
              imgs++;
              if(imgs == 10) {
                break;
              }
            }
          }
          
          if(imgs < 10) {
            for(let j = 0; j < i; j++) {
              if(this.saveFiles[j].filename.toLowerCase().indexOf('.jpg') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.jpeg') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.png') != -1) {
                var n_url = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[j].path);
                n_url = n_url.replace(/%3A/g, ':');
                n_url = n_url.replace(/%2F/g, '/');
                pictures.push({src:n_url, index:j});

                imgs++;
                if(imgs == 10) {
                  break;
                }
              }
            }
          }
          
//           this.$viewer.view(i);
          
          break;
        }
      }
      
      this.images = pictures;
      this.$viewer.show();
//       this.pictureFlag = true;
//       console.log(this.images);
    },
    playMusic: function(pathsUUID) {
      
      var musicArray = [];
      var cover = 'http://m.yongkj.cn/audio_default.png'
      
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].pathsUUID == pathsUUID) {
          
          var musicUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[i].path);
          musicUrl = musicUrl.replace(/%3A/g, ':');
          musicUrl = musicUrl.replace(/%2F/g, '/');
          
//           var musicUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.saveFiles[i].pathsUUID);
          
          if(this.saveFiles[i].filename.indexOf('-') != -1) {
            var names = this.saveFiles[i].filename.split('-');
            var artist = names[0];
            var musicNames = names[1].split('.');
            var musicName=musicNames[0];
            musicArray.push({name:musicName, artist:artist, url:musicUrl, cover:cover, lrc:''});
          }else{
            musicNames = this.saveFiles[i].filename.split('.');
            musicName = musicNames[0];
            artist = '群星';
            musicArray.push({name:musicName, artist:artist, url:musicUrl, cover:cover, lrc:''});
          }
          
          for(let j = i + 1; j < this.saveFiles.length; j++) {
            if(this.saveFiles[j].filename.toLowerCase().indexOf('.mp3') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.wav') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.flac') != -1) {
              
              var _musicUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[j].path);
              _musicUrl = _musicUrl.replace(/%3A/g, ':');
              _musicUrl = _musicUrl.replace(/%2F/g, '/');
//               var _musicUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.saveFiles[j].pathsUUID);
          
              if(this.saveFiles[j].filename.indexOf('-') != -1) {
                var _names = this.saveFiles[j].filename.split('-');
                var _artist = _names[0];
                var _musicNames = _names[1].split('.');
                var _musicName=_musicNames[0];
                musicArray.push({name:_musicName, artist:_artist, url:_musicUrl, cover:cover, lrc:''});
              }else{
                _musicNames = this.saveFiles[j].filename.split('.');
                _musicName = _musicNames[0];
                _artist = '群星';
                musicArray.push({name:_musicName, artist:_artist, url:_musicUrl, cover:cover, lrc:''});
              }
              
            }
          }
          
          for(let j = 0; j < i; j++) {
            if(this.saveFiles[j].filename.toLowerCase().indexOf('.mp3') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.wav') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.flac') != -1) {
              
              var n_musicUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.saveFiles[j].path);
              n_musicUrl = n_musicUrl.replace(/%3A/g, ':');
              n_musicUrl = n_musicUrl.replace(/%2F/g, '/');
//               var n_musicUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.saveFiles[j].pathsUUID);
          
              if(this.saveFiles[j].filename.indexOf('-') != -1) {
                var n_names = this.saveFiles[j].filename.split('-');
                var n_artist = n_names[0];
                var n_musicNames = n_names[1].split('.');
                var n_musicName=n_musicNames[0];
                musicArray.push({name:n_musicName, artist:n_artist, url:n_musicUrl, cover:cover, lrc:''});
              }else{
                n_musicNames = this.saveFiles[j].filename.split('.');
                n_musicName = n_musicNames[0];
                n_artist = '群星';
                musicArray.push({name:n_musicName, artist:n_artist, url:n_musicUrl, cover:cover, lrc:''});
              }
              
            }
          }
          
          break;
        }
      }
      
      this.audio = musicArray;
      this.musicFlag = true;
      
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
        this.$refs.aplayer.play();
      },1000);
      
    },
    updateFiles: function(path, depth) {
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        path: path,
        depth: depth
      })).then((response) => {
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '获取文件列表失败！服务器内部错误！'
        });
      });
    },
    playVideo: function(pathsUUID) {
      var videos = [];
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].pathsUUID == pathsUUID) {
          videos.push(this.saveFiles[i]);
          
          for(let j = i + 1; j < this.saveFiles.length; j++) {
            if(this.saveFiles[j].filename.toLowerCase().indexOf('.mp4') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.webm') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.mkv') != -1) {
              videos.push(this.saveFiles[j]);
            }
          }
          
          for(let j = 0; j < i; j++) {
            if(this.saveFiles[j].filename.toLowerCase().indexOf('.mp4') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.webm') != -1 || this.saveFiles[j].filename.toLowerCase().indexOf('.mkv') != -1) {
              videos.push(this.saveFiles[j]);
            }
          }
          
          break;
        }
      }
      
      this.videoArray = videos;
      this.nowVideo = this.videoArray[0];
      this.nowVideoIndex = 0;
      
      var videoUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.nowVideo.path);
      videoUrl = videoUrl.replace(/%3A/g, ':');
      videoUrl = videoUrl.replace(/%2F/g, '/');
      
//       console.log(videoUrl);
//       var videoUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
      this.$refs.dplayer.dp.switchVideo({url:videoUrl});
      
      this.videoFlag = true;
      clearTimeout(this.timer);  //清除延迟执行 
      this.timer = setTimeout(()=>{   //设置延迟执行
        this.$refs.dplayer.dp.play();
      },300);
    },
    previousVideo: function(index) {
      
       if(this.videoArray.length > 1) {
        
        if(index == 0) {
          this.nowVideoIndex = this.videoArray.length - 1;
        }else{
          this.nowVideoIndex--;
        }

        this.nowVideo = this.videoArray[this.nowVideoIndex];

        var videoUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.nowVideo.path);
        videoUrl = videoUrl.replace(/%3A/g, ':');
        videoUrl = videoUrl.replace(/%2F/g, '/');
//          var videoUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
        this.$refs.dplayer.dp.switchVideo({url:videoUrl});

        this.$refs.dplayer.dp.pause();
        clearTimeout(this.timer);  //清除延迟执行 
        this.timer = setTimeout(()=>{   //设置延迟执行
          this.$refs.dplayer.dp.play();
        },300);
        
      }
      
      
      
    },
    nextVideo: function(index) {
      
     if(this.videoArray.length > 1) {
        
        if(index == this.videoArray.length - 1) {
          this.nowVideoIndex = 0;
        }else{
          this.nowVideoIndex++;
        }
       
        this.nowVideo = this.videoArray[this.nowVideoIndex];

        var videoUrl = encodeURIComponent('http://' + this.baseHost + '/pocketyun/fileSystem/' + this.userName + this.nowVideo.path);
        videoUrl = videoUrl.replace(/%3A/g, ':');
        videoUrl = videoUrl.replace(/%2F/g, '/');
//        var videoUrl = encodeURI('http://' + this.baseHost + '/pocketyun/pathsController/download?pathsUUID=' + this.nowVideo.pathsUUID);
        this.$refs.dplayer.dp.switchVideo({url:videoUrl});

        this.$refs.dplayer.dp.pause();
        clearTimeout(this.timer);  //清除延迟执行 
        this.timer = setTimeout(()=>{   //设置延迟执行
          this.$refs.dplayer.dp.play();
        },300);
      }
      
    },
    closeVideo: function() {
      this.$refs.dplayer.dp.pause();
      this.videoFlag = false;
    },
    editorInit: function() {
      require("brace/ext/language_tools");
      
      require("brace/mode/c_cpp");   
      require("brace/snippets/c_cpp");
      
      require("brace/mode/css");   
      require("brace/snippets/css");
      
      require("brace/mode/html");   
      require("brace/snippets/html");
      
      require("brace/mode/java");   
      require("brace/snippets/java");
      
      require("brace/mode/javascript");   
      require("brace/snippets/javascript");
      
      require("brace/mode/json");   
      require("brace/snippets/json");
      
      require("brace/mode/jsp");   
      require("brace/snippets/jsp");
      
      require("brace/mode/markdown");   
      require("brace/snippets/markdown");
      
      require("brace/mode/php");   
      require("brace/snippets/php");
      
      require("brace/mode/plain_text");   
      require("brace/snippets/plain_text");
      
      require("brace/mode/python");   
      require("brace/snippets/python");
      
      require("brace/mode/sh");   
      require("brace/snippets/sh");
      
      require("brace/mode/sql");   
      require("brace/snippets/sql");
      
      require("brace/theme/monokai");
    },
    showText: function(pathsUUID) {
      var text = [
        '.cpp',
        '.css',
        '.c',
        '.html',
        '.java',
        '.json',
        '.jsp',
        '.js',
        '.md',
        '.txt',
        '.pyc',
        '.py',
        '.sh',
        '.sql'
      ]
      
      var lang = [
        'c_cpp',
        'css',
        'c_cpp',
        'html',
        'java',
        'json',
        'jsp',
        'javascript',
        'markdown',
        'plain_text',
        'python',
        'python',
        'sh',
        'sql'
      ]
      
      var flag = false;
      for(let i = 0; i < this.saveFiles.length; i++) {
        if(this.saveFiles[i].pathsUUID == pathsUUID){
          for(let j = 0; j < text.length; j++) {
            if(this.saveFiles[i].filename.toLowerCase().indexOf(text[j]) != -1) {

              this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getText', this.$qs.stringify({
                userUUID: this.$store.state.userUUID,
                pathsUUID: pathsUUID
              })).then((response) => {

                this.textContent = response.data.textContent;

                this.nowText = this.saveFiles[i];
                this.textLang = lang[j];

                this.editorShow = true;

              }).catch((error) => {
                console.log(error);
                this.$message({
                  type: 'error',
                  message: '获取文件内容失败！服务器内部错误！'
                });
              });

              flag = true;
              break;
            }
          }
        }
        if(flag) {
          break;
        }
      }
    },
    saveText: function() {
      this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/saveText', this.$qs.stringify({
        userUUID: this.$store.state.userUUID,
        folderPathsUUID: this.nowFolder.pathsUUID,
        pathsUUID: this.nowText.pathsUUID,
        textContent: this.textContent
      })).then((response) => {
        this.saveFiles = response.data.pathsDtosList;
        this.files = this.saveFiles;
        this.totalSizes = response.data.totalSizes;
          
        this.$message({
          type: 'success',
          message: '保存文件内容成功！'
        });
      }).catch((error) => {
        console.log(error);
        this.$message({
          type: 'error',
          message: '保存文件内容失败！服务器内部错误！'
        });
      });
    },
    closeText: function() {
      this.$confirm('提示：是否保存文件？', '保存文件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/saveText', this.$qs.stringify({
          userUUID: this.$store.state.userUUID,
          pathsUUID: this.nowText.pathsUUID,
          textContent: this.textContent
        })).then((response) => {
          this.saveFiles = response.data.pathsDtosList;
          this.files = this.saveFiles;
          this.totalSizes = response.data.totalSizes;
          
          this.$message({
            type: 'success',
            message: '保存文件内容成功！'
          });
        }).catch((error) => {
          console.log(error);
          this.$message({
            type: 'error',
            message: '保存文件内容失败！服务器内部错误！'
          });
        });
        
        this.editorShow = false;
      }).catch(() => {
        this.test = 2;
        
        this.editorShow = false;
      });
      
    },
    sortchange: function(column) {
      if(column.prop == 'size') {
        var sizes = [];
        for(let i = 0; i < this.saveFiles.length; i++) {
          if(this.saveFiles[i].size.toLowerCase().indexOf('mb') != -1) {
            var sizeStr = this.saveFiles[i].size.replace('MB', '');
            sizes.push(parseFloat(sizeStr));
          }else if(this.saveFiles[i].size.toLowerCase().indexOf('kb') != -1) {
            var _sizeStr = this.saveFiles[i].size.replace('KB', '');
            sizes.push(parseFloat(_sizeStr) * 0.001);
          }
        }
        
        if(column.order) {
          if(column.order == 'ascending') {
            var tempFiles = this.saveFiles;
            for(let i = 0; i < sizes.length; i++) {
              for(let j = i + 1; j < sizes.length; j++) {
                if(sizes[i] > sizes[j]) {
                  var sizeTemp = sizes[i];
                  sizes[i] = sizes[j];
                  sizes[j] = sizeTemp;

                  var fileTemp = tempFiles[i];
                  tempFiles[i] = tempFiles[j];
                  tempFiles[j] = fileTemp;
                }
              }
            }
            this.files = tempFiles;
          }else if(column.order == 'descending'){
            var _tempFiles = this.saveFiles;
            for(let i = 0; i < sizes.length; i++) {
              for(let j = i + 1; j < sizes.length; j++) {
                if(sizes[i] < sizes[j]) {
                  var _sizeTemp = sizes[i];
                  sizes[i] = sizes[j];
                  sizes[j] = _sizeTemp;

                  var _fileTemp = _tempFiles[i];
                  _tempFiles[i] = _tempFiles[j];
                  _tempFiles[j] = _fileTemp;
                }
              }
            }
            this.files = _tempFiles;
          }
        }else{
          this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getFiles', this.$qs.stringify({
            userUUID: this.$store.state.userUUID,
            path: this.nowFolder.path,
            depth: this.nowFolder.depth + 1
          })).then((response) => {
            this.saveFiles = response.data.pathsDtosList;
            this.files = this.saveFiles;
            this.totalSizes = response.data.totalSizes;
          }).catch((error) => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '获取文件列表失败！服务器内部错误！'
            });
          });
        }
        
      }
    },
    getHttpFile: function() {
      this.$prompt('', '上传链接', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入文件下载链接......'
      }).then(({ value }) => {
        value = value.replace(/\(/g, '%28');
        value = value.replace(/\)/g, '%29');
        
        var url = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/;
        if(url.test(value)) {
          
          this.nowFolder_backup = this.nowFolder;
          this.$message({
            type: 'info',
            message: '服务器正在下载文件！请耐心等待！'
          });
          
          this.$axios.post('http://' + this.baseHost + '/pocketyun/pathsController/getHttpFile', this.$qs.stringify({
            pathsUUID: this.nowFolder.pathsUUID,
            fileUrl: value
          })).then((response) => {
  //           console.log(response.data);
            if(response.data.message == '') {
              
              if(this.nowFolder_backup.pathsUUID == this.nowFolder.pathsUUID) {
                this.saveFiles = response.data.pathsDtosList;
                this.files = this.saveFiles;
              }
              this.totalSizes = response.data.totalSizes;
              
              this.$message({
                type: 'success',
                message: '文件 [' + response.data.fileName + '] 下载成功！'
              });
            }else{
              this.$message({
                type: 'error',
                message: '服务器下载文件失败！' + response.data.message
              });
            }
          }).catch((error) => {
            console.log(error);
            this.$message({
              type: 'error',
              message: '服务器下载文件失败！服务器内部错误！'
            });
          });
        }else{
          this.$message({
            type: 'error',
            message: '请输入正确的url链接'
          });
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消上传链接！'
        });       
      });
    }
  }
}
</script>

<style scoped>
  @import '../assets/css/style.css';
  
  #yun {
    background:url("../assets/Emilia.jpg") no-repeat top;
    background-size:cover;
    background-attachment: fixed;
    position: fixed;
    height: 100%;
    width: 100%;
    overflow:scroll;
    z-index: -1;
  }
  #particles-js {
    position: fixed;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50% 50%;
    z-index: 1;
  }
  .head {
    margin: 0 auto;
    margin-top: 0;
    border-bottom: 1px solid white;
    position: relative;
    z-index: 3;
  }
  .head-logo {
    font-size: 22px;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 5px;
/*     color: #9370DB; */
/*     color: #20B2AA; */
    color: #42A3B3;
    user-select: none;
    text-align: left;
  }
  .head-col {
    padding-top: 20px;
    padding-bottom: 10px;
    padding-right: 10px;
/*     color: #337AB7; */
    cursor: pointer;
    color: #409EFF;
    text-align: right;
  }
  .body {
    margin: 0 auto;
    margin-top: 20px;
    margin-bottom: 20px;
    box-shadow: 0 0 25px rgba(155,89,182,.5);
    position: relative;
    z-index: 3;
  }
  .body-table {
    color: black;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  
  .menu {
    width: 100%;
    background: white;
    border-bottom: 1px solid #EBEEF5;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    padding: 12px;
    position: relative;
    z-index: 3;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .search {
    width:50%;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .folder {
    color:#409EFF;
  }
  .folder:hover {
    color:#409EFF;
    border-bottom:1px solid #409EFF;
  }
  .video-container {
    width: 100%;
    height: 100%;
    bottom: 0;
    position: fixed;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
  }
  .video {
    left: 20px;
    top: 20px;
  }
  .video-bottombar {
    box-shadow: 0 1px 10px 0 rgba(0,0,0,0.5);
    position: fixed;
    z-index: 5;
    left: 0;
    right: 0;
    bottom: 0;
    background: #1b1b1b;
    height: 48px;
    font-size: 13px;
  }
  #pv-buttons {
    list-style: none;
    list-style-image: none;
    margin: 0;
    padding: 0;
  }
  .bar-right {
    float: right;
  }
  .bar-left {
    float: left;
  }
  .bar-button {
    transition: all .2s ease-in-out;
    display: block;
    line-height: 48px;
    opacity: .7;
    cursor: pointer;
  }
  .bar-label {
    transition: all .2s ease-in-out;
    display: block;
    color: #fff;
    height: 48px;
    line-height: 48px;
    padding: 0 12px;
    opacity: .7;
  }
  .img {
    padding: 12px;
  }
  .img:hover {
    padding: 12px;
    background: #323232;
    color: white;
  }
 .fullscreen {
    background: #212121;
  }
</style>