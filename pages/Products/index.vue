<script setup lang="ts">
	/*********************************************************
	prog name: 物件列表, author: James Lin, date: 2022/09/01
	Todo: 1. 串資料庫 
		  2. 
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import liwaMsg from "../../components/liwaMsg.vue"
	import liwaPages from "../../components/liwaPages"
	import { IconHeart, IconHeartFill } from '@iconify-prerendered/vue-bi'

	const route = useRoute()
	const error = ref('')
	const paramstr = ref('')
	const siteID = ref('')
	const liwaData = ref([])
	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)

	const loadData = async () => {
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let memberID = window.sessionStorage.getItem('liwaUserID')
		let keydata = {
			'siteID': siteID.value,
			'userID': memberID,
			'param': paramstr.value
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr}/w021_havelist.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
		// console.log('liwaData =', liwaData.value)
	}

	const setMainID = (sID) => {
		window.location.href = '/Products/' + sID
	}

	const setLike = async (idx) => {
		let iIsLike = liwaData.value[idx].isLike
		if (iIsLike == 0) liwaData.value[idx].isLike = 1
		else liwaData.value[idx].isLike = 0
		let memberID = window.sessionStorage.getItem('liwaUserID')
		if (!memberID) {
			// 未登入先設liwaNowLink, 再導到 login頁面
			window.sessionStorage.setItem('liwaNowLink', route.fullPath)
			window.location.href = '/login'
		} else {
			// 已登入可以設定收藏
			let keyData = {
				'siteID':siteID.value,
				'mainID':liwaData.value[idx].prodID,
				'userID':memberID,
				'isLike': liwaData.value[idx].isLike
			}
			let datastr = JSON.stringify(keyData)	
		    const useMyFetch = createFetch({
		      baseUrl: window.sessionStorage.getItem('liwaAPIsvr'),
		      fetchOptions: {
		        mode: 'cors',
		        headers: new Headers({
		          'Content-Type': 'application/json; charset=utf-8'
		        }),
		        body: datastr
		      }
		    })
		    const { data } = await useMyFetch('w041_setD1.php').post().json()
		    let msg = data.value.message
		    if (msg) {
		    	// 顯示錯誤訊息
		    	alert(msg)
		    } 			
		}
	}

	onMounted(() => {	
		useHead({title:'物件列表'})
		let sUrl = route.fullPath
		let objParam = queryString.parseUrl(sUrl)
		let objQuery = objParam.query
		let datastr = JSON.stringify(objQuery)
		if (datastr !== '{}') {
			// 設定過濾參數
			paramstr.value = datastr			
		}
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
		loadData()
	})

	definePageMeta({
	  layout: "web",
	})	
	
</script>

<template>
	<div v-if="error">{{ error }}</div>
	<div v-if="liwaData.length > 0" class="w-full lg:w-[1024px] h-full mx-auto my-0 relative p-4 flex flex-row flex-wrap overflow-y-auto"
	>
		<!-- v-for 寫在這裏 -->
		<div v-for="(item, index) in liwaData" :key="index" class="w-72 h-[30rem] bg-slate-100 flex flex-col ml-2 mb-8 cursor-pointer"
		@click="setMainID(item.prodID)"
		>
			<div class="w-full h-64">
				<img :src="item.picpath" class="h-64 mx-auto" height="256"/>
			</div>	
			<div class="w-full p-2">
				<h6 class="w-full text-sm text-slate-500">物件編號:{{ item.prodID }}</h6>
				<h1 class="w-full text-lg text-blue-700 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">{{ item.prodNM }}</h1>
				<h4 class="w-full text-md text-slate-600 mt-4">期望售價: NTD {{ item.sellPrice }}</h4>
				<div class="w-full text-md text-slate-600 mt-4">已斡旋: {{ item.bargainCount }}</div>
				<div class="w-full flex flex-row mt-8">
					<div class="w-1/4 text-md">{{ item.score }}</div>
					<div v-if="item.status==2" class="w-2/4 text-red-600 font-bold text-center">斡旋中</div>
					<div v-else class="w-2/4 text-red-600 font-bold text-center">{{ item.expDate }}</div>
					<div class="w-1/4 flex flex-row-reverse" @click.stop="setLike(index)">
						<!-- 若未登入, 跳到登入畫面, 若已登入, 設定收藏值 -->
						<IconHeart v-if="item.isLike == 0" class="w-7 h-7 text-red-400 font-bold" />
						<IconHeartFill v-else class="w-7 h-7 text-red-400 font-bold" />
					</div>
				</div>
			</div>		
		</div>	
		<div v-if="liwaData.length > 0" class="w-full bg-white px-4 py-2">
			<!-- 頁碼控制 -->
			<liwaPages
				:page="page"
				:totalPage="totalPage"
				@setActvPage="setActvPage"
			></liwaPages>	
		</div>		
	</div>
	<div v-else class="w-full lg:w-[1024px] h-[calc(100vh_-_7.5rem)] mx-auto my-0 pt-48">
		<div class="w-full text-center text-3xl font-semibold">暫無物件</div>
	</div>
</template>