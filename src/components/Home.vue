<template>
  <el-container class="home-container">
    <!-- 导航 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isMenuCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :default-active="activePath"
          :router="true"
          :collapse="isMenuCollapse"
          :collapse-transition="false"
          unique-opened 
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff">
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item @click="saveNavState('/' + subItem.path)" v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
              
            </el-menu-item>
            
          </el-submenu>
        </el-menu>


      </el-aside>
      <!-- 右侧主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单列表
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao',
      },
      // 菜单按钮是否折叠
      isMenuCollapse: false,
      // 被激活的链接地址
      activePath: '',
    }
  },

  created() {
    this.activePath = window.sessionStorage.getItem('activePath')
    this.getMenuList()
  },

  methods: {
    // 退出功能
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // 获取所有菜单
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg)
      }

      this.menuList = res.data
    },

    // 切换菜单按钮的显示与隐藏
    toggleCollapse() {
      this.isMenuCollapse = !this.isMenuCollapse
    },

    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="stylus" scoped>
.home-container
  height 100%
  .el-header
    background-color #373d41
    display: flex
    justify-content: space-between;
    padding-left 0
    align-items center
    color #ffffff
    font-size 1.5em
    div
      display flex
      align-items center
      span
        margin-left 15px

.el-aside
  background-color #333744
  .el-menu
    border-right none
.el-main
  background-color #eaedf1


.iconfont
  margin-right 10px

.toggle-button
  background-color #4a5064
  font-size 10px
  line-height 24px
  color #ffffff
  text-align center
  letter-spacing 0.2em
  cursor pointer
</style>