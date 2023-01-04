<script setup lang="ts">
	import { ref, onMounted, computed } from 'vue'
  import { useFetch, useStorage, useSessionStorage } from "@vueuse/core"
  import jwtDecode from "jwt-decode"
  import jsonData from "../static/init.json"
  import { IconList, IconSearch, IconPersonFill, IconHeartFill, IconInfoCircleFill } from '@iconify-prerendered/vue-bi'
  import { IconLogout } from '@iconify-prerendered/vue-iwwa'

	// const { $rmallSessionStorage } = useNuxtApp()

  const isMenu = ref(false)
	const bLogin = ref(false)
	const bIcon = ref(false) // 若已登入, 顯示使用者頭像
	const objLogo = ref('')

  const siteID = ref('')
  const userIcon = ref('')
  const APIsvr = ref('')
  const imgSvr = ref('')
  const fullPath = ref('')
  const searchString = ref('')

	const route = useRoute() // Nuxt 3 native function

	const jumpPage = () => {
		
	}

  const goIndex = () => {
    window.location.href='/'
  }

	const goLogin = () => {
    // 跳到登入畫面, 先記錄目前的網址
    // const location = useBrowserLocation()
    // fullPath.value = location.value.href
    fullPath.value = route.fullPath
    window.sessionStorage.setItem('liwaNowLink', fullPath.value)
    window.location.href = "/login"
	}

  const toggleMenu = () => {
    isMenu.value = !isMenu.value
  }

  const goSearch = () => {
    console.log('searchString =', searchString.value)
    if (searchString.value) {
      // 搜尋檔非空, 1. 將搜尋字串存入sessionStorage 內, 2.跳到搜尋頁面
      window.sessionStorage.setItem('liwaSearchString', searchString.value)
      window.location.href = '/Search?imode=2'
    }
  }

  const goLogout = () => {
    let NowLink = route.fullPath
    // 若從 Profile 登出, 跳到首頁
    if (NowLink == '/Profile') NowLink = '/'
    window.sessionStorage.setItem('liwaNowLink', NowLink)
    window.sessionStorage.setItem('liwaUserID', '')
    window.sessionStorage.setItem('liwaUserName', '')
    window.sessionStorage.setItem('liwaIconPath', '')
    window.sessionStorage.setItem('liwaUserGrade', '')
    window.localStorage.setItem('liwaJWT', '')

    bLogin.value = false
    window.location.href = NowLink
  }

  const getUserIcon = computed(() => {
    let AA = window.sessionStorage.getItem('liwaUserIconPath')
    if ((AA == undefined) || (AA == "")) AA = "../static/man-icon.png"
    return AA
  })  
	
	onMounted(() => {
    useHead({
      titleTemplate: '珠寶動產交易中心 - %s',
    })
    // 先檢查 APIsvr是否存在? 若不存在, 從init.json取得
    let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
    if ((sAPIsvr == undefined) || (sAPIsvr == "") || (sAPIsvr == null)) {
      APIsvr.value = jsonData[0].APIsvr
      imgSvr.value = jsonData[0].imgSvr
      siteID.value = jsonData[0].siteID
      window.sessionStorage.setItem('liwaAPIsvr', APIsvr.value)
      window.sessionStorage.setItem('liwaImgsvr', imgSvr.value)
      window.sessionStorage.setItem('liwaSiteID', siteID.value)
      window.sessionStorage.setItem('liwaNowLink', '/')
    }
    // 檢查是否已登入?(sessionStorage(liwa_JWT)) 
    let sJWT = window.localStorage.getItem('liwaJWT')
    if ((sJWT == undefined) || (sJWT == "") || (sJWT == null) ) {

    } else {
      // 若曾登入, 判斷liwaUserID存在, 若不存在從liwaJWT解開
      bLogin.value = true
      let sUserID = window.sessionStorage.getItem('liwaUserID')
      if (sUserID == null) {
        // 若 sessionStorage.userID 為空, 解liwaJWT
        var arrJWT = jwtDecode(sJWT)
        useStorage('liwaUserID', arrJWT.sub, sessionStorage)
        useStorage('liwaUserName', arrJWT.username, sessionStorage)
        useStorage('liwaIconPath', arrJWT.picpath, sessionStorage)
        useStorage('liwaUserGrade', arrJWT.grade, sessionStorage)
        useStorage('liwaAPIsvr', arrJWT.APIsvr, sessionStorage)
        useStorage('liwaImgsvr', arrJWT.imgsvr, sessionStorage)
        userIcon.value = arrJWT.picpath
      } else {
        userIcon.value = window.sessionStorage.getItem('liwaImgsvr') + window.sessionStorage.getItem('liwaIconPath')
      }      
    }
	})
</script>

<template>
    <div class="w-full mb-2 bg-white border-b-2 border-b-slate-300 shadow-sm shadow-slate-400 md:shadow-lg">
        <div class="w-full flex flex-row justify-between items-start">
            <!-- Logo 欄 -->
            <div class="w-48 h-24 rounded-full -mt-2 -ml-4 text-3xl text-center cursor-pointer" @click="goIndex()">
                <img src="../static/Logo_web.png" alt="" class="max-w-none mx-6 my-6" width="150" />
            </div>
            <div class="w-[calc(100%_-_12rem)] lg:w-[calc(100%_-_4rem)] flex flex-row-reverse justify-start">
                <!-- 登入,頭像, menu button -->
                <!-- menu button -->
                <div class="w-6 h-6 mt-4 cursor-pointer lg:hidden" @click="toggleMenu()">
                  <IconList class="w-6 h-6 text-slate-400 font-bold" />
                </div>  
                <div v-if="bLogin==false" class="w-48 p-3 flex flex-row justify-center lg:justify-end">
                  <div class="w-3/4 lg:w-1/2 h-12 pt-2 rounded bg-black text-white text-center cursor-pointer" @click="goLogin">登入
                  </div>
                </div>
                <div v-else class="w-48 mx-1 mt-2 flex flex-row justify-end">
                  <!-- 已登入顯示頭像icon -->
                  <div class="px-2 py-2 flex flex-row-reverse justify-between">
                    <IconLogout class="hidden lg:block w-8 h-8 text-slate-400 font-bold ml-6 mt-1" @click="goLogout()"/>
                    <a href="/News"><IconInfoCircleFill class="hidden lg:block w-8 h-8 text-blue-500 font-bold ml-6 mt-1" /></a>
                    <a href="/Products?imode=1"><IconHeartFill class="hidden lg:block w-8 h-8 text-red-400 font-bold ml-6 mt-1" /></a>
                    <a href="/Profile"><IconPersonFill class="w-8 h-8 mt-1 text-slate-400 font-bold"/></a>
                  </div>
                </div> 
                <div class="hidden md:block w-[calc(100%_-_12rem)]">
                  <!-- Search bar -->
                  <div class="w-96 h-12 mx-auto my-2 bg-white rounded-md border-2 border-slate-500 flex flex-row">
                    <div class="w-[calc(100%_-_3rem)] h-12">
                      <input type="text" v-model="searchString" placeholder="站內搜尋欄" class="w-full ml-2 pt-2 float-left bg-white border-transparent focus:ring-0" @keyup.enter="goSearch">
                    </div>
                    <div class="w-7 h-6 ml-1 mt-2 float-left cursor-pointer">
                      <IconSearch class="w-7 h-7 text-slate-400 font-bold" 
                      @click="" />
                    </div>                    
                  </div>
                </div>
            </div>  
        </div>
        <div class="w-full md:hidden">
          <!-- Search bar -->
          <div class="w-[22rem] h-12 mx-auto my-2 bg-white rounded-md border-2 border-slate-500 flex flex-row">
            <div class="w-[calc(100%_-_3rem)] h-12">
              <input type="text" v-model="searchString" placeholder="站內搜尋欄" class="w-full ml-2 pt-3 text-xl bg-white border-transparent focus:ring-0" @keyup.enter="goSearch">
            </div>
            <div class="w-7 h-6 ml-1 mt-2 float-left cursor-pointer">
              <IconSearch class="w-7 h-7 text-slate-400 font-bold" 
              @click="" />
            </div>
          </div>
        </div>
    </div>
    <!-- 下拉選單之用 -->
    <div 
      class="w-full h-48 bg-slate-50 border-2 border-slate-200 absolute top-16 right-0 lg:hidden"
      v-if="isMenu==true"
    >
        <ul class="list-none bg-white">
            <div v-if="bLogin" class="w-full py-4">
              <li class="w-full h-12 ml-1 text-2xl"><a href="/Products?imode=1">我的收藏</a></li>
              <li class="w-full h-12 ml-1 text-2xl"><a href="/Sellers?imode=1">我的追蹤</a></li>
              <li class="w-full h-12 ml-1 text-2xl"><a href="/InfoCenter">資訊中心</a></li>
              <hr />              
            </div>
            <li class="w-full h-12 ml-1 text-2xl"><a href="/Statics">行情統計</a></li>
            <li class="w-full h-12 ml-1 text-2xl"><a href="/Services">客服中心</a></li>
            <li class="w-full h-12 ml-1 text-2xl"><a href="/QnA">常見Q&A</a></li>
            <li class="w-full h-12 ml-1 text-2xl"><a href="/Blogs">部落格</a></li>
        </ul>
    </div>    
</template>

<style scoped>
  .sysIcon {
    height:40px;
    /*margin:0px 4px 4px 10px;*/
    float:right;
    text-align:center;
    font-weight:bold;
    padding-top:0.35rem;
    box-sizing: border-box;
    cursor:pointer;   
  }

  .sysIcon.regis {
    background-color: #555;
    color:#DDD;
    border: 1px solid #555;
    border-radius: 10%;
  } 
</style>