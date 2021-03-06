import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},
  {path: '/login', component: Login},
  {path: '/home', component: Home, redirect: '/welcome', children: [
    {path: '/welcome', component: Welcome},
    {path: '/users', component: Users}
  ]},
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 为路由对象添加beforeEach导航守卫
/**
 * to 将要访问的路径
 * from 代表从哪个路径跳转而来
 * next 是一个函数 表示放行
 * next() 放行 next('/login') 强制跳转
 */
router.beforeEach((to, from, next) => {
  // 如果用户访问的登录页面，直接放行
  if (to.path === '/login') {
    return next()
  }
  // 从sessionStorage中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页面
  if (!tokenStr) {
    return next('/login')
  }
  next()
})


export default router
