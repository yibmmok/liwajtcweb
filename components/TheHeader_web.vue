<script setup lang="ts">
	import { ref, onMounted, computed } from 'vue'
  import { useFetch, useStorage, useSessionStorage } from "@vueuse/core"
  import jwtDecode from "jwt-decode"
  import jsonData from "../static/init.json"
  import { useChkauth } from "../composables/use-chkauth"
  import { IconList, IconSearch, IconPersonFill, IconHeartFill, IconInfoCircleFill } from '@iconify-prerendered/vue-bi'
  import { IconLogout } from '@iconify-prerendered/vue-iwwa'

	// const { $rmallSessionStorage } = useNuxtApp()

  const isMenu = ref(false)
	const bLogin = ref(false)
	const bIcon = ref(false) // 若已登入, 顯示使用者頭像
	const objLogo = ref('')

  const userIcon = ref('')
  const APIsvr = ref('')
  const imgSvr = ref('')
  const fullPath = ref('')
  const searchString = ref('')
  const siteIcon = ref('')
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

  const getSiteInfo = async () => {
    let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
    let url = `${sAPIsvr}/sys_haveSiteInfo.php`
    const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
    siteIcon.value = data.data.value.message
  }  

  const goLogout = () => {
    let NowLink = route.fullPath
    // 若從 Profile 登出, 跳到首頁
    if (NowLink == '/Profile') NowLink = '/'
    window.sessionStorage.setItem('liwaNowLink', NowLink)
    window.localStorage.setItem('liwaJWT', '')
    bLogin.value = false
    window.location.href = NowLink
  }

	onMounted(() => {
    // 若無 APIsvr & Imgsvr, 從 init.json取得
    let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
    if ((sAPIsvr == undefined) || (sAPIsvr == "") || (sAPIsvr == null)) {
        window.sessionStorage.setItem('liwaAPIsvr', jsonData[0].APIsvr)
        window.sessionStorage.setItem('liwaImgsvr', jsonData[0].imgSvr)
    }
    // 取得 siteIcon
    getSiteInfo()
    // 檢查是否已登入?(sessionStorage(liwa_JWT)) 
    let sJWT = window.localStorage.getItem('liwaJWT')
    if (sJWT) {
      bLogin.value = true
      let arrJWT = jwtDecode(sJWT)
      // 取得 liwaIconPath (使用者圖檔)
      userIcon.value = arrJWT.iconPath
    } 
	})
</script>

<template>
    <div class="w-full mb-2 bg-white border-b-2 border-b-slate-300 shadow-sm shadow-slate-400 md:shadow-lg">
        <div class="w-full flex flex-row justify-between items-start">
            <!-- Logo 欄 -->
            <div class="w-48 h-24 rounded-full -mt-2 -ml-4 text-3xl text-center cursor-pointer" @click="goIndex()">
                <img src="../static/Logo_web.jpg" alt="" class="max-w-none mx-6 my-6" width="150" />
            </div>
            <div class="w-[calc(100%_-_12rem)] lg:w-[calc(100%_-_4rem)] flex flex-row-reverse justify-start">
                <!-- 登入,頭像, menu button -->
                <!-- menu button -->
                <div class="mt-4 cursor-pointer lg:hidden" @click="toggleMenu()">
                  <IconList class="w-12 h-12 p-0 text-slate-800 font-bold" />
                </div>  
                <div v-if="bLogin==false" class="mt-4 mr-4 flex flex-row justify-center lg:justify-end">
                  <div class="px-8 py-2 rounded bg-black text-white text-center cursor-pointer leading-8" @click="goLogin">登入
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
                  <div class="w-96 h-12 mx-auto mt-4 bg-white rounded-md border-2 border-slate-500 flex flex-row">
                    <div class="w-[calc(100%_-_3rem)] h-12">
                      <input type="text" v-model="searchString" placeholder="站內搜尋欄" class="w-full ml-2 pt-2 float-left bg-white border-transparent focus:ring-0" @keyup.enter="goSearch">
                    </div>
                    <div class="ml-1 py-2 float-left cursor-pointer">
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
      class="w-full bg-slate-50 border-2 border-slate-200 absolute top-16 right-0 lg:hidden z-40"
      v-if="isMenu==true"
    >
        <ul class="list-none bg-white">
            <div v-if="bLogin" class="w-full px-2 pt-4">
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/Products?imode=1">我的收藏</a></li>
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/Products?imode=2">已上架物件</a></li>
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/InfoCenter">資訊中心</a></li>
              <hr />              
            </div>
            <div class="w-full px-2 pb-4">
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/QnA">常見Q&A</a></li>
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/Statics">行情統計</a></li>
              <li class="w-full p-1 text-lg border-b-2 border-b-gray-200"><a href="/Services">客服中心</a></li>
              <li class="w-full p-1 text-lg"><a href="/Blogs">部落格</a></li>              
            </div>
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