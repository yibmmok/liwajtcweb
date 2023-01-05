<script setup lang="ts">
	/*********************************************************
	prog name: 部落格文章列表, author: James Lin, date: 2022/09/07
	Todo: 1 增加 VueSocialSharing npm 處理Social Media分享功能
		  2 增加 FontAwesome npm 作為按鈕icon
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch, createFetch, useTitle } from "@vueuse/core"
	import VueSocialSharing from "vue-social-sharing"
	import { IconFacebook, IconLine, IconLink45deg } from "@iconify-prerendered/vue-bi"
	import { copyText } from "vue3-clipboard"

	const mainID = ref('')	
	const fullPath = ref('')
	const stitle = ref('')
	const descp = ref('')
	const liwaData = ref([])
	const route = useRoute()

	const loadData = async () => {
		let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${APIsvr}/Blogs_haveDetail.php?mainID=${mainID.value}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		stitle.value = liwaData.value.title
		useHead({title:liwaData.value.title})
		descp.value = liwaData.value.altName
	}

	const doCopy = () => {
		// 將 path 寫入 clipboard內
		copyText(fullPath.value, undefined, (error, event) => {
			if (error) {
				// 若複製失敗, 顯示錯誤訊息
				console.log('error =', error)
			} 
		})
	}

	onMounted(() => {		
		mainID.value = route.params.id
		fullPath.value = route.fullPath
		loadData()
	})

	definePageMeta({
	  layout: "web",
	})		
</script>

<template>
	<div class="w-full lg:w-[760px] lg:max-w-[760px] mx-auto my-0">
		<h1 class="w-full text-4xl font-bold mt-8">{{ liwaData.title }}</h1>
		<div class="w-full flex flex-row">
			<div class="w-2/3 mt-4 pt-1">{{ liwaData.author }}/{{ liwaData.unit }}</div>
			<div class="w-1/3 mt-4 flex flex-row-reverse justify-start">
				<!-- 連結分享 -->
				<div class="w-8 h-8 ml-2 cursor-pointer" @click="doCopy()">
					<IconLink45deg class="w-8 h-8 text-slate-500" />
				</div>
				<!-- 社交媒體分享 -->
				<div class="w-8 h-8 ml-2 rounded bg-slate-500 pt-[.125rem]">
					<ShareNetwork
						network="line"
						:url="fullPath"
					    :title="stitle"
					    :description="descp"
					>
						<IconLine class="w-7 h-7 text-sm text-white" />
					</ShareNetwork>
				</div>
				<div class="w-8 h-8 ml-2 rounded bg-slate-500 pt-[.125rem] pl-[.125rem]">
					<ShareNetwork
						network="facebook"
						:url="fullPath"
					    :title="stitle"
					    :description="descp"
					>
						<IconFacebook class="w-7 h-7 text-sm text-white" />
					</ShareNetwork>
				</div>
			</div>
		</div>
		<div class="w-full mt-4 text-slate-400">{{ liwaData.pDate }}</div>
		<div class="w-full md:w-[600px] mt-6 mx-auto mt-6">
			<img :src="liwaData.picpath" :alt="liwaData.altName" >
		</div>
		<div class="my-1 lg:pl-4 text-center text-slate-500 text-md whitespace-normal break-normal ">圖為{{ liwaData.altName }}</div>
		<div class="mainbox w-full mt-4 mb-32">
			<div v-html="liwaData.sContent">
			</div>
		</div>
		<div class="w-full py-2 ">
			<div class="w-36 h-12 mx-auto py-2 text-blue-400 text-lg"><a href="/Blogs" >[回到文章列表]</a></div>
		</div>
	</div>
</template>

<style scope>
	.mainbox p
	{
		color:#6d6d6d;
		font-size:1.2rem;
		line-height:1.8rem;
		margin:1rem 0;
		letter-spacing:0.15rem;
	}

	ol
	{
		list-style-type:decimal;
		margin-left: 2rem;
	}

	ol>li
	{
		color:#6d6d6d;
		font-size:1.2rem;
		line-height:1.8rem;
		margin:1rem 0;
		letter-spacing:0.15rem;
	}
</style>