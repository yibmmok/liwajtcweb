<script setup lang="ts">
	/*********************************************************
	prog name: 部落格文章列表, author: James Lin, date: 2022/09/07
	Todo: 
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import liwaPages from "../../components/liwaPages"

	const proglink = ref('/Blogs')

	const liwaData = ref([])

	const page = ref(1)
	const pageSize = ref(10)
	const totalPage = ref(1)	

	const setMain = (sID) => {
		window.location.href = `${proglink.value}/${sID}`
	}

	const setActvPage = (iPage) => {
		page.value = iPage
		fetchData()
	}	

	const fetchData = async () => {
		// let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let APIsvr = "http://172.18.2.13"
		let siteID = "liwa14"
		let url = `${APIsvr}/Blogs_M.php?siteID=${siteID}&page=${page.value}&limit=10`
	
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL
		totalPage.value = data.data.value.totalPage
		// 每次fetchData 後都要把filters存下來
		// saveFilters()		
	}

	onMounted(() => {
		useHead({title:'部落格文章列表'})
		fetchData()
	})

	definePageMeta({
	  layout: "web",
	})	
</script>

<template>
	<div v-if="liwaData.length" class="w-full pt-12 pb-4 bg-indigo-50">
		<div class="w-full lg:w-[900px] mx-auto my-0 overflow-x-hidden overflow-y-auto">
			<div v-for="(post, index) in liwaData" :key="post.mainID" class="w-full flex flex-col lg:flex-row py-4 border-y-2 border-y-slate-400 border-dashed cursor-pointer" @click="setMain(post.mainID)">
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
		<!-- 頁碼控制 -->
		<liwaPages
			:page="page"
			:totalPage="totalPage"
			@setActvPage="setActvPage"
		></liwaPages>	
	</div>
</template>