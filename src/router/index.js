import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import User from '@/components/User'
import Kefu from '@/components/Kefu'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Hello',
      component: Hello
    }, {
    	path: '/user',
    	name: '访客端',
    	component: User
    }, {
    	path: '/kefu',
    	name: '客服端',
    	component: Kefu
    }]
})
