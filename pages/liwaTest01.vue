<script setup lang="ts">
	/*********************************************************
	prog name: 元件測試, author: James Lin, date: 2022/12/27
	Todo: 1. Profile 網頁的物件顯示
	**********************************************************/	
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import queryString from "query-string"
	import { IconHeart, IconHeartFill } from '@iconify-prerendered/vue-bi'

	const error = ref('')
	const paramstr = ref('')
	const siteID = ref('')
	const liwaData = ref([])
	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)
	const sUrl = ref('/Products?imode=2')

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
		console.log('liwaData =', liwaData.value)
	}

	const setMainID = (sID) => {
		window.location.href = '/Products/' + sID
	}

	onMounted(() => {
		useHead({title:`測試頁 1`})
		let objParam = queryString.parseUrl(sUrl.value)
		let objQuery = objParam.query
		let datastr = JSON.stringify(objQuery)
		// 設定過濾參數
		paramstr.value = (datastr)? datastr : ''
		siteID.value = window.sessionStorage.getItem('liwaSiteID')		
		loadData()
	})

	definePageMeta({
	  layout: 'web',
	})
</script>

<template>
	<div class="w-700px h-[calc(100vh_-_8rem)]">
		<div v-if="liwaData.length > 0" class="w-full h-full mx-auto my-0 relative p-4 flex flex-row flex-wrap overflow-y-auto"
		>
			<div v-for="(item, index) in liwaData" class="w-72 h-[30rem] bg-slate-100 flex flex-col ml-2 mb-8 cursor-pointer"
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
					</div>
				</div>				
			</div>
		</div>		
	</div>

</template>

<style scoped>

</style>