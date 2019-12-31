<template>
  <div class="user">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input clearable @clear="getUserList" v-model="queryInfo.query" placeholder="请输入内容">
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addDialogVisible=true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table stripe border :data="userList" >
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200px">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑用户" :enterable="false" placement="top">
              <el-button @click="showEditDialog(scope.row)" type="primary" class="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" :enterable="false" placement="top">
              <el-button @click="deleteUser(scope.row)" type="danger" class="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配权限" :enterable="false" placement="top">
              <el-button type="warning" class="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      @close="addDialogClosed"
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      @close="editDialogClosed"
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱地址!'))
    }

    let checkMobile = (rule, value, callback) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号码!'))
    }
  
    return {
      // 获取用户列表参数
      queryInfo: {
        query: '',
        // 当前页码值
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 用户数据列表
      userList: [],
      // 分页总条数
      total: 0,
      // 添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min:3, max: 20, message: '用户名在3-20个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min:6, max: 20, message: '用户名在6-20个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ],
      },
      // 编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑用户表单
      editForm: {

      },
      editFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ],
      }
    }
  },

  created () {
    this.getUserList()
  },

  methods: {
    async getUserList () {
      const {data: res} = await this.$http.get('users', {params: this.queryInfo})

      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
    },

    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    // 监听switch开关的状态改变
    async userStateChange(userInfo) {
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      return this.$message.success('更新用户状态成功!')
    },

    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.status != 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },

    // 编辑用户对话框
    async showEditDialog(userInfo) {
      const {data: res} = await this.$http.get(`users/${userInfo.id}`)      
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 监听编辑用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 编辑用户信息并提交
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {email: this.editForm.email, mobile: this.editForm.mobile})
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success('编辑用户信息成功！')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 删除用户对话框
    deleteUser(userInfo) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const {data: res} = await this.$http.delete(`users/${userInfo.id}`)
        if (res.meta.status !== 200) {
          throw new Error('删除失败')
        }
        this.getUserList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(e => {
        this.$message({
          type: 'info',
          message: e.message || '已取消删除'
        });          
      });
    }
  }
}
</script>

<style lang="stylus" scoped>
  
</style>