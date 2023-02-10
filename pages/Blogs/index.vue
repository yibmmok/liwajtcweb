<script setup lang="ts">
	/*********************************************************
	prog name: 部落格文章列表, author: James Lin, date: 2022/09/07
	Todo: 
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import liwaPages from "../../components/liwaPages"
	import queryString from "query-string"

	const proglink = ref('/Blogs')
	const APIsvr = ref('')
	const liwaData = ref([])
	const liwaFilter = ref([])
	const itemTypeID = ref(['全部文章', '珠寶基礎', '鑽石', '彩寶', '翡翠', '軟玉'])
	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)	

	const setMain = (sID) => {
		window.location.href = `${proglink.value}/${sID}`
	}

	const setActvPage = (iPage) => {
		page.value = iPage
		loadData()
	}	

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'page': page.value,
			'limit': 10
		}
		let sQuery = queryString.stringify(keydata)
		let url = `${APIsvr.value}/Blogs_M.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
		liwaFilter.value = [...liwaData.value]
		totalPage.value = data.data.value.totalPage	
	}

	const setFilter = (idx) => {
		console.log('itemTypeID =', itemTypeID.value[idx])
		let key = itemTypeID.value[idx]
		let sTypeID = ''
		switch (key) {
			case '全部文章':
				sTypeID = ''
				break;
			case '珠寶基礎':
				sTypeID = 'liwa1401'				
				break;
			case '鑽石':
				sTypeID = 'liwa1402'
				break;
			case '彩寶':
				sTypeID = 'liwa1403'
				break;
			case '翡翠':
				sTypeID = 'liwa1404'
				break;
			case '軟玉':
				sTypeID = 'liwa1405'
				break;			
		}
		if (sTypeID) {
			liwaFilter.value = liwaData.value.filter((obj) => obj.itemTypeID == sTypeID)
		} else {
			liwaFilter.value = [...liwaData.value]
		}
		
	}

	onMounted(() => {
		useHead({title:'部落格文章列表'})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadData()
	})

	definePageMeta({
		colorMode:'light',
		layout: "web",
	})	
</script>

<template>
	<div class="w-full lg:min-h-[calc(100vh_-_7.15rem)] py-2 bg-indigo-50">
		<div class="w-full lg:w-[900px] lg:mx-auto py-2 flex flex-row justify-center flex-wrap">
			<div v-for="(item, index) in itemTypeID" :key="index" class="btnItemType w-24 h-12 mr-3 my-1 py-3 rounded bg-yellow-700 text-white text-center cursor-pointer" @click="setFilter(index)" >{{ item }}</div>
		</div>		
		<div class="w-full lg:w-[900px] lg:mx-auto my-0 overflow-x-hidden overflow-y-auto">
			<div v-if="liwaFilter.length > 0" class="w-full">
				<div v-for="(post, index) in liwaFilter" :key="post.mainID" class="w-full flex flex-col lg:flex-row py-4 border-y-2 border-y-slate-400 border-dashed cursor-pointer" @click="setMain(post.mainID)">
					<div class="w-full lg:w-1/3 p-8">
						<img :src="post.picpath" :alt="post.altName">
					</div>			
					<div class="w-full lg:w-2/3 py-8 px-2">
						<h1 class="w-full text-2xl font-bold">{{ post.title }}</h1>
						<p class="w-full whitespace-normal overflow-hidden text-ellipsis text-stone-400 pt-4 pb-20">{{ post.altName }}</p>
						<div class="text-slate-400 text-md">{{ post.pDate }}</div>
					</div>
				</div>					
			</div>		
			<div v-else class="w-full h-[calc(100vh_-_19rem)] mx-auto my-0 pt-48">
				<div class="w-full text-center text-3xl font-semibold">暫無文章</div>
			</div>		
		</div>
		<!-- 頁碼控制 -->
		<liwaPages
			:page="page"
			:totalPage="totalPage"
			@setActvPage="setActvPage"
		></liwaPages>	
	</div>

</template>

<style scope>
	.btnItemType:hover {
/*		text-decoration: underline;*/
		color:#FF9933;
	}
</style>