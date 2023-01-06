<script setup lang="ts">
	/*********************************************************
	prog name: 首頁, author: James Lin, date: 2022/09/01
	Todo: 5個區塊: 1. 最新物件
	**********************************************************/
	import { ref, watch, onMounted } from "vue"
	import { useTitle, useFetch, createFetch } from "@vueuse/core"
	import { Navigation, Pagination, Scrollbar, A11y, Lazy } from 'swiper'
	import { Swiper, SwiperSlide } from 'swiper/vue'
	import { IconHeart, IconHeartFill } from '@iconify-prerendered/vue-bi'
	import { useShowmode } from "../composables/use-showmode"
	import 'swiper/css'
	import 'swiper/css/navigation'
	// import 'swiper/css/pagination'
	import 'swiper/css/scrollbar'

	const siteID = ref('')
	const liwaPics = ref([])
	const liwaA14 = ref([])
	const currentSlide = ref(0)
	const swiperRef = ref(null)
	const slideNum = ref(1)

	watch(currentSlide.value, () => {
	  if(swiperRef.value !== null) {
	    swiperRef.value.slideTo(currentSlide.value)
	  }
	})

	const onSwiper = (swiper) => {
	  swiperRef.value = swiper
	}	

	const loadData = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/wIndex_havePics.php?siteID="+siteID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaPics.value = data.data.value.arrSQL
	}	

	const loadA14 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/wIndex_haveA14.php?siteID="+siteID.value
		const dataA14 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaA14.value = dataA14.data.value.arrSQL[0]
	}

	const setSlide = (idx) => {
		slide.value = idx
		let prodID = liwaPics.value[idx].prodID
		window.location.href='/Products/' + prodID
	}

	const setMainID = (idx) => {
		let prodID = liwaPics.value[idx].prodID
		window.location.href='/Products/' + prodID
	}

	const setLike = async (idx) => {
		let iIsLike = liwaPics.value[idx].isLike 
		if (iIsLike == 0) liwaPics.value[idx].isLike = 1
		else liwaPics.value[idx].isLike = 0	
		let memberID = window.sessionStorage.getItem('liwaUserID')
		if (!memberID) {
			// 未登入先設liwaNowLink, 再導到 login頁面
			window.sessionStorage.setItem('liwaNowLink', route.fullPath)
			window.location.href = '/login'
		} else {
			// 已登入可以設定收藏
			let keyData = {
				'siteID':siteID.value,
				'mainID':liwaPics.value[idx].prodID,
				'userID':memberID,
				'isLike': liwaPics.value[idx].isLike
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
		useHead({title:'首頁'})
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
		loadData()
		loadA14()
		let iMode = useShowmode()
		if (iMode == 1) slideNum.value = 1
		else slideNum.value = 4
	})

	definePageMeta({
	  layout: 'web',
	  colorMode: 'light'
	})
</script>

<template>
	<main>
		<section class="w-full">
			<div v-if="liwaPics.length > 0" class="w-full lg:px-24 lg:pt-20 lg:pb-44 bg-white">
				<div class="w-full h-12 flex flex-row">
					<div class="w-1/2 text-xl pl-4 lg:pl-10 font-semibold text-slate-700">本月新進物件</div>
					<div class="hidden w-1/2 lg:block text-md text-right"><a href="/Products?imode=6">查看全部&rarr;</a></div>
				</div>
				<swiper @swiper="onSwiper" :slides-per-view="slideNum" :space-between="50" :modules="[Navigation, Pagination, Scrollbar, A11y, Lazy]" navigation :pagination="{ clickable: true, dynamicBullets: true }" :scrollbar="{ draggable: true, dragSize: 150 }" grab-cursor :preload-images="false" lazy >
					<swiper-slide v-for="(pic, index) in liwaPics" :key="index" class="w-64 h-[30rem] bg-slate-100 flex flex-col mb-8 cursor-pointer" @click="setMainID(index)">
						<div>
							<img :data-src="pic.img" class="swiper-lazy max-w-full h-64 mx-auto" />
						</div>						
						<div class="w-full p-2">
							<h6 class="w-full text-sm text-slate-500">物件編號:{{ pic.prodID }}</h6>
							<h1 class="w-full text-lg text-blue-700 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">{{ pic.prodNM }}</h1>
							<h4 class="w-full text-md text-slate-600 mt-4">期望售價: NTD {{ pic.sellPrice }}</h4>
							<div class="w-full flex flex-row mt-8">
								<div class="w-1/4 text-md">{{ pic.score }}</div>
								<div v-if="pic.status==2" class="w-2/4 text-red-600 font-bold text-center">斡旋中</div>
								<div v-else class="w-2/4 text-red-600 font-bold text-center">{{ pic.expDate }}</div>
								<div class="w-1/4" @click.stop="setLike(index)">
									<!-- 若未登入, 跳到登入畫面, 若已登入, 設定收藏值 -->
									<IconHeart v-if="pic.isLike==0" class="w-7 h-7 text-red-400 font-bold" />
									<IconHeartFill v-else class="w-7 h-7 text-red-400 font-bold" />
								</div>
							</div>							
						</div>
					</swiper-slide>
				</swiper>				
			</div>
			<div v-else class="w-full px-24 py-40 bg-white">
				<div class="w-full h-[300px] bg-emerald-600 text-center text-white text-2xl pt-36 tracking-widest">-- 尚無新進物件 --</div>
			</div>
			<div class="lg:hidden w-full h-8 mr-4 mt-8 text-center text-md" @click=""><a href="/Products?imode=6">查看全部&rarr;</a></div>
		</section>
		<section class="w-full lg:h-[calc(100vh_-_1rem)] bg-slate-900">
			<div class="w-full flex flex-col lg:flex-row">
				<div class="w-full lg:w-1/2 h-full lg:pt-24">
					<img src="http://imgsvr.liwasite.com/liwa14/202212/202212231100645879.jpg" alt="JT.C:二手珠寶賣家募集"	class="w-full lg:w-4/5 lg:h-[700px] lg:float-right" />
				</div>
				<div class="w-full lg:w-1/2 h-full bg-transparent lg:py-20 lg:px-48">
					<div class="w-24 h-[600px] mx-auto">
						<p class="tate h-[600px] lg:pt-24 text-white font-semibold text-3xl float-left lg:mr-16 tracking-widest ">讓您的珠寶換成現金運用，   <br />
						<span class="mt-12 leading-6">而不是放在銀行付保管費</span></p>
					</div>
				</div>	
			</div>
			<div class="w-full h-12 bg-transparent text-center text-white text-lg py-12 tracking-widest"><a href="">二手珠寶賣家募集中...</a></div>
		</section>
		<section class="w-full h-auto py-8 lg:px-72 lg:py-40 lg:h-[calc(100vh_-_1.5rem)] flex flex-col lg:flex-row">
			<div class="w-full my-2 lg:mx-6 border-2 border-amber-900">
				<div class="w-full py-12 bg-amber-900 text-center text-white text-2xl">科學檢驗</div>
				<p class="w-full px-4 py-4 bg-white mb-20 leading-8">我們與台灣聯台珠寶鑑定所(Tulab)合作， 所有的物件均提供具有公信力的珠寶檢驗證書， 或由鑑定師以儀器檢驗及評分，杜絕<strong>以假亂真，以次充好</strong>的情況。</p>
			</div>
			<div class="w-full my-2 lg:mx-6 border-2 border-amber-900 ">
				<div class="w-full py-12 bg-amber-900 text-center text-white text-2xl">雙重保障</div>
				<p class="w-full px-6 py-4 bg-white mb-20 leading-8">提供珠寶鑑定及評分服務，珠寶鑑定提供科學儀器的檢驗結果以辨別物件的真實性，評分服務提供物件的真實巿場價格，確保買賣雙方的交易權益。</p>
			</div>
			<div class="w-full my-2 lg:mx-6 border-2 border-amber-900 relative">
				<div class="w-full py-12 bg-amber-900 text-center text-white text-2xl">中立客觀</div>
				<p class="w-full px-6 py-4 bg-white mb-20 leading-8">針對上架物件依照國際4C標準進行評分(註)，並建立評分及成交價格的連動關係，即使不具備珠寶專業，也能以評分作為賣價或出價的標準。</p>
				<div class="absolute left-6 bottom-4 text-sm text-red-400 pr-4">* 並非所有物件都適合評分，某些物件(如玻隕石、田黃石等)因特性關係無法適用國際4C標準，會以無評分顯示。</div>
			</div>
			<div class="w-full my-2 lg:mx-6 border-2 border-amber-900">
				<div class="w-full py-12 bg-amber-900 text-center text-white text-2xl">易於成交</div>
				<p class="w-full px-6 py-4 bg-white mb-20 leading-8">首創物件斡旋制度，我們不介入買賣雙方的交易，由買賣方自由訂立賣價及買價，賣家可等待出價最高的買家再出售。買家也可以心中的理想價格向賣家出價，享受撿漏的樂趣。</p>
			</div>
		</section>
		<section class="w-full h-auto bg-slate-200 pt-4">
			<div class="w-full pt-12 flex flex-col lg:flex-row">
				<div class="w-full lg:w-1/2 h-full flex flex-col">
					<div class="w-full flex flex-row">
						<div class="w-full h-8 pl-2 lg:pl-10 text-xl font-semibold text-gray-600">最新文章</div>
						<div class="w-1/3 mr-4 text-md text-right text-gray-600"><a href="/Blogs" ><a href="/Blogs">查看全部&rarr;</a></a></div>
					</div>
					<div class="w-full lg:h-[600px] mb-4">	
						<img :src="liwaA14.picpath" :alt="liwaA14.altName" height="600">
					</div>
					<div class="w-full h-8 mb-8 text-center text-2xl">{{ liwaA14.title }}</div>
				</div>
				<div class="w-full lg:w-1/2">
					<div class="w-full text-xl pl-2 lg:pl-10 font-semibold text-gray-600">最新影片</div>
					<div class="w-full h-full">
						<iframe class="w-full min-h-[300px] lg:w-[calc(100%_-_2rem)] lg:h-[560px]" src="https://www.youtube.com/embed/4b0ckRGxp6s?start=18" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>						
					</div>
				</div>
			</div>	
					
		</section>
		<section class="w-full">
			
		</section>				
	</main>
</template>

<style>
	/*
	@font-face {
		font-family: "RunningScript";
		src: local("RunningScript"), url(./assets/css/Running_Script.ttf) format("truetype");
	}*/

	.swiper-horizontal>.swiper-scrollbar, .swiper-scrollbar.swiper-scrollbar-horizontal {
		left:10%;
		width:80%;
	}

	.tate {
		font-family: "RunningScript";
		writing-mode: vertical-rl
	}
</style>