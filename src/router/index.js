import Vue from 'vue'
import Router from 'vue-router'

// import Login from '@/components/Login.vue'
// import Register from '@/components/Register.vue'
import Login from '../views/Login.vue'
import Yun from '../views/Yun.vue'
import Register from '../views/Register.vue'
import Setting from '../views/Setting.vue'
import Delete from '../views/Delete.vue'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
          path: '/',
          redirect: {
           name: 'login'
          }
        },
        {
          path: '/login',
          name: 'login',
          component: Login,
          meta: {
            title: '用户登录'
          }
        },
        {
          path: '/register',
          name: 'register',
          component: Register,
          meta: {
            title: '用户注册'
          }
        },
        {
          path: '/yun',
          name: 'yun',
          component: Yun,
          meta: {
            title: '袖珍网盘吧'
          }
        },
        {
          path: '/setting',
          name: 'setting',
          component: Setting,
          meta: {
            title: '用户设置'
          }
        },
        {
          path: '/delete',
          name: 'delete',
          component: Delete,
          meta: {
            title: '用户管理'
          }
        }
    ]
})