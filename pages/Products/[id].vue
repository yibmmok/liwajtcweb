<script setup lang="ts">
	/*********************************************************
	prog name: 物件明細, author: James Lin, date: 2022/09/01
	Todo: 1. 串資料庫
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useWindowSize, useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import VueSocialSharing from "vue-social-sharing"
	import { copyText } from "vue3-clipboard"
	import { useShowmode } from "../../composables/use-showmode"
	import Carousel from '../../components/Carousel.vue'
	import Thumbnail from '../../components/Thumbnail.vue'	
	import liwaMsg from "../../components/liwaMsg.vue"
	import { IconPersonPlusFill, IconHeart, IconHeartFill, IconX, IconFacebook, IconLine, IconLink45deg } from '@iconify-prerendered/vue-bi'

	import 'swiper/css'
	import 'swiper/css/navigation'

	const route = useRoute()
	const mainID = ref('')
	const siteID = ref('')
	const APIsvr = ref('')
	const imgsvr = ref('')
	const liwaData = ref([])
	const liwaD1 = ref([])
	const liwaPDF = ref([])
	const full_Path = ref('')
	const stitle = ref('')
	const descp = ref('')	

	const liwaPics = ref([])
	const Slide_imgWidth = ref('w-96')
	const slide = ref(0)
	const thumbs = ref(null)
	const liwaDirection = ref('vertical')
	const liwaClass = ref('h-[500px]')		
	const isLike = ref(false)

	const iPicWidth = ref(650)
	const isDone = ref(false)
	const isSeller = ref(false)
	const isCerti = ref(false)
	const certiPath = ref('')
	const isBargain = ref(false)
	const isMsg = ref('')
	const msgBargain = ref('')
	const lastBid = ref(0)
	const bidPrice = ref(0)
	const showBidPrice = ref(true)
	const isOff = ref(false)
	const status = ref(0)

	const loadData = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_haveDetail.php?siteID="+siteID.value+"&mainID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		status.value = liwaData.value.status
		stitle.value = liwaData.value.prodNM + ' | JT.C'
		descp.value = liwaData.value.descp
		useHead({title:stitle.value})
		afterLoadData()	
	}

	const loadD3 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_haveD3.php?siteID="+siteID.value+"&mainID=" + mainID.value
		const dataD3 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaPics.value = dataD3.data.value.arrSQL
	}

	const loadD4 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_haveD4.php?siteID="+siteID.value+"&mainID=" + mainID.value	
		const dataD4 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaPDF.value = dataD4.data.value.arrSQL
	}

	const loadLike = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_haveLike.php?siteID="+siteID.value+"&mainID=" + mainID.value + "&userID="	+ window.sessionStorage.getItem('liwaUserID')
		const dataLike = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		if (dataLike.data.value.arrSQL.length > 0) isLike.value = dataLike.data.value.arrSQL[0].isLike
	}

	const load021D1 = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_have021D1.php?siteID="+siteID.value+"&mainID=" + mainID.value + "&userID=" + window.sessionStorage.getItem('liwaUserID')
		const dataD1 = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaD1.value = dataD1.data.value.arrSQL
	}

	const loadLastBid = async () => {
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/w021_haveBid.php?siteID="+siteID.value+"&mainID=" + mainID.value + "&userID=" + window.sessionStorage.getItem('liwaUserID')
		const dataBid = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		lastBid.value = dataBid.data.value.arrSQL[0].bidPrice
		switch (lastBid.value) {
			case 0:
				showBidPrice.value = false
				msgBargain.value = `賣家尚未回覆您的出價, 請稍候`
				break;
			case 1:
				showBidPrice.value = false
				msgBargain.value = `恭喜您, 您的出價已成交, 請留意您的信箱通知`
				break;
			case -1:
					msgBargain.value = '您上次的出價, 因賣家逾期回覆, 系統自動拒絕, 您可以繼續出價。';
					break;
			case -2:
					showBidPrice.value = false
					msgBargain.value = '您上次的出價, 因賣家逾期回覆, 系統自動拒絕並結束本次斡旋, 您可於斡旋冷卻期過後, 再次進行斡旋。'
					isBargain.value = false
					liwaData.value.tmpBiderID = ''
					liwaData.value.remainBargain = 3
					liwaData.value.status = "1"
					status.value = "1"
					console.log('liwaData =', liwaData.value)
					break;
			default:
				msgBargain.value = '您上次的出價 ' + lastBid.value + ' 已被拒絕, 您可以提高出價金額繼續'
		}
	}

	const afterLoadData = () => {
		let userID = window.sessionStorage.getItem('liwaUserID')
		if (userID) {
			loadLike()
			if (userID == liwaData.value.sellerID) {
				// 若為賣家的處理
				isSeller.value = true
				// 載入該物件所有出價記錄
				load021D1()
			} else {
				if (userID == liwaData.value.tmpBiderID) {
					// 若為出價買家
					isBargain.value = true
					if (liwaData.value.remainBargain < 3) {
						// 本物件已至少出價一次, 顯示出價失敗訊息, 先取得上次出價
						loadLastBid()
					} else {
						msgBargain.value = '您已取得本物件的斡旋權利, 可針對本物件出價3次'
					}						
				}
			}
		}		
	}

	const doCopy = () => {
		// 將 path 寫入 clipboard內
		copyText(full_Path.value, undefined, (error, event) => {
			if (error) {
				// 若複製失敗, 顯示錯誤訊息
				console.log('error =', error)
			} 
		})
	}	

	const toggleLike = async () => {
		isLike.value = !isLike.value
		let memberID = window.sessionStorage.getItem('liwaUserID')
		if (!memberID) {
			// 未登入先設liwaNowLink, 再導到 login頁面
			window.sessionStorage.setItem('liwaNowLink', route.fullPath)
			window.location.href = '/login'
		} else {
			// 已登入可以設定收藏
			let keyData = {
				'siteID':siteID.value,
				'mainID':mainID.value,
				'userID':memberID,
				'isLike': isLike.value
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

	const toggleCerti = () => {
		isCerti.value = !isCerti.value
	}

	const closeCerti = () => {
		isCerti.value = false
	}

	const openBargain = async () => {
		// 先檢查是否登入, 若未登入, 跳login界面, 若已登入, 檢查物件是否斡旋或待成交, 再檢查買家的出價資格
		let userID = window.sessionStorage.getItem('liwaUserID')
		if (!userID) {
			window.sessionStorage.setItem('liwaNowLink', route.fullPath)
			window.location.href = '/login'			
		} else {
			// 先檢查物件的 status > 1(是否斡旋或待成交)
			if ((status.value == 2) || (status.value == 3)) {
				showMsg('系統訊息', '本物件斡旋中, 請於斡旋失敗再出價', 1)
			} else {
				// 檢查user 是否被停權
				let keydata = {
					'siteID': siteID.value,
					'userID':window.sessionStorage.getItem('liwaUserID'),
					'prodID':mainID.value
				}
				let sQuery = queryString.stringify(keydata)
				let APIsvr = window.sessionStorage.getItem('liwaAPIsvr')
				let url = `${APIsvr}/w021_chkOffuser.php?${sQuery
				}`
			console.log('url in chkUser =', url)
				const datachk = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
			console.log('datachk =', datachk)
				let msgOff = datachk.data.value.isOff

				if (msgOff) {
					msgBargain.value = msgOff
				} else {
					// 檢查該物件status及會員的斡旋金帳戶, 若有足夠餘額, 進入斡旋, 否則顯示斡旋金餘額不足訊息
					let url = window.sessionStorage.getItem('liwaAPIsvr') + "/w021_openBargain.php?siteID="+siteID.value+"&userID=" + window.sessionStorage.getItem('liwaUserID')+"&mainID=" + mainID.value
					const dataBargain = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
					let msg = dataBargain.data.value.message
					if (msg) {
						// showMsg('斡旋訊息', msg, 1)
						msgBargain.value = msg
					} else {
						isBargain.value = true
						msgBargain.value = '您已取得本物件的斡旋權利, 可針對本物件出價3次'
					}				
				}
			}
		}		
	}

	const submitPrice = async () => {
		let bStopFlag = false	
		// 出價必須大於0 且大於上次出價
		if (liwaData.value.remainBargain == 3) {
			if (bidPrice.value < 1 ) {
				bStopFlag = true
				msgBargain.value = '您的出價必須大於0'
			}
		} else {
			if (bidPrice.value < lastBid.value) {
				bStopFlag = true
				msgBargain.value = '您的出價必須大於或等於上次出價'
			}
		}
		
		if (bStopFlag == false) {
			let keyData = {
				"siteID": window.sessionStorage.getItem('liwaSiteID'),
				"prodID": mainID.value,
				"sellerID": liwaData.value.sellerID,
				"biderID": window.sessionStorage.getItem('liwaUserID'),
				"bidPrice": bidPrice.value
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
		    const { data } = await useMyFetch('w021_setBidPrice.php').post().json()
		    if (!data.value.message) {
		    	msgBargain.value = '您的出價已送出'
		    	showBidPrice.value = false
		    }
		}
	}

	const setPriceBack = async (idx, iRes) => {
		showMsg('系統訊息', '系統處理中, 請稍候...', 2)
		let keyData = {
			"siteID": window.sessionStorage.getItem('liwaSiteID'),
			"prodID": mainID.value,
			"sellerID": window.sessionStorage.getItem('liwaUserID'),
			"bidDateTime": liwaD1.value[idx].bidDateTime,
			"bidResult": iRes			
		}
		let datastr = JSON.stringify(keyData)
		// console.log('datastr in setPriceBack =', datastr)
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
	    const { data } = await useMyFetch('w021_setPriceBack.php').post().json()
	   console.log('dataRB =', data)
	    if (data.value.message == '') {
	    	hideMsg()
	    	// alert('您的回覆已送出')
	    	liwaD1.value[idx].bidResult =1
	    }		
	}

	const setSlide = (idx) => {
		slide.value = idx
	}

	// 訊息對話盒相關 starts
	const objMsg = ref({
		title: '',
		body: '',
		modalType: ''
	})
	
	const showMsg = (sTitle, sBody, iType = 1) => {
  		objMsg.value.title = sTitle
  		objMsg.value.body = sBody
  		objMsg.value.modalType = iType
  		isMsg.value = true
	}

	const hideMsg = () => {
		isMsg.value = false
	}

	const confirmOK = () => {
		alert("Press the Confirm button")
		isMsg.value = false
	}
	// 設定對話盒相關 ends	

	onMounted(() => {
		const { width, height } = useWindowSize()
		// 若小於預設螢幕寬度, 則設為預設螢幕寬度
		if (width.value < iPicWidth.value) {
			iPicWidth.value = width.value - 20
		}

		// 取得 mainID, 由mainID取得
		mainID.value = route.params.id
		full_Path.value = route.fullPath
		siteID.value = window.sessionStorage.getItem('liwaSiteID')
		loadD3()
		loadD4()			
		loadData()	
	})

	definePageMeta({
	  layout: "web",
	  colorMode: "light"
	})		

</script>

<template>
	<div class="barPanel w-full h-12 -mt-1 bg-stone-200 flex flex-row justify-between">
		<div class="w-24 h-12 text-center ">
			<a href="/Products">返回上頁</a>
		</div>
		<div class="w-28 -mt-1 mr-2">
			<div class="w-auto h-8 flex flex-row-reverse justify-start">
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
	</div>
	<div class="mainBox relative w-full flex flex-col lg:flex-row bg-stone-100 py-4 lg:py-8">
		<div class="w-full lg:w-2/5">
			<div class="w-full min-h-[380px] lg:h-[500px] mx-auto my-0 relative flex flex-row">
				<div class="hidden lg:block lg:w-2/5 min-h-[380px] lg:h-[500px] ml-12 mt-12 bg-transparent">
					<Thumbnail  
						:currentSlide="slide" 
						:liwaData="liwaPics" 
						:liwaClass="liwaClass"
						:liwaDirection="liwaDirection"
						:slideCSS="'h-[100px]'"
						@thumbs="thumbs"
						@setSlide="setSlide"
					/>
				</div>
				<div class="w-full lg:w-3/5 h-auto ml-0 lg:ml-[80px] pt-[50px] bg-transparent">
					<Carousel 
						:currentSlide="slide" 
						:thumbs="thumbs" 
						:liwaData="liwaPics" 
						:imgWidth="Slide_imgWidth"
						:slideSpace="30"
					/>
				</div>
			</div>
		</div>
		<div class="w-full lg:w-3/5 px-4 lg:px-16 pt-4 relative">
			<h1 class="w-full text-4xl text-slate-700 font-bold mt-2 mb-6 pb-6 border-b-2 border-b-slate-200 word-wrap">{{ liwaData.prodNM }}</h1>
<!--			<div class="w-28 absolute top-[72px] lg:top-8 right-2 lg:right-[60px]">
				<div class="w-auto h-8 flex flex-row-reverse justify-start">
					// 連結分享 
					<div class="w-8 h-8 ml-2 cursor-pointer" @click="doCopy()">
						<IconLink45deg class="w-8 h-8 text-slate-500" />
					</div>
					// 社交媒體分享 
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
			</div>  -->
			<div class="w-full flex flex-row my-12">
				<div class="w-1/2">
					<p class="text-sm font-bold text-slate-400 mb-2">期望售價</p>
					<p class="text-lg pl-3 text-slate-600">NTD {{ liwaData.sellPrice }}</p>
				</div>
				<div class="w-1/2 border-l-2 border-l-slate-100" v-if="isDone == true">
					<p class="text-sm font-bold text-slate-400 mb-4">成交價</p>
					<p class="text-lg pl-3 text-slate-600">NTD {{ liwaData.donePrice }}</p>			
				</div>
			</div>
			<div class="w-full flex flex-row my-12">
				<div class="w-1/2">
					<p class="text-sm font-bold text-slate-400 mb-2">賣家</p>
					<p class="text-lg pl-3 text-slate-600"><a href="#">{{ liwaData.sellerID }}</a></p>
				</div>
				<!-- 追蹤物件賣家按鈕 -->
				<div class="w-1/2 cursor-pointer pt-4" v-if="isSeller == false" @click="">
					<IconPersonPlusFill class="w-7 h-7 text-black font-bold" />
					<span class="text-sm text-slate-600 ml-2">追蹤</span>
				</div>
			</div>
			<div class="w-full my-12">
				<p class="text-sm font-bold text-slate-400 mb-2">上架截止日</p>
				<p class="text-lg pl-3 text-slate-600">{{ liwaData.expDate }}</p>
			</div>
			<!-- 收藏該物件按鈕 -->
			<div class="w-28 h-12 pl-4 pt-3 absolute right-4 bottom-0 bg-emerald-500 rounded-2xl flex flex-row" v-if="isSeller == false" @click="toggleLike">
				<IconHeart v-if="isLike==false" class="w-7 h-7 text-red-400 font-bold" />
				<IconHeartFill v-else class="w-7 h-7 text-red-400 font-bold" />
				<span class="w-12 text-white ml-2 ">收藏</span>
			</div>
		</div>
	</div>
	<div class="w-full bg-white">
		<div class="w-full lg:w-[900px] mx-auto py-4 flex flex-col lg:flex-row">
			<div class="w-full pl-4 py-4 text-md flex flex-row" v-if="useShowmode()==1">
				<span class="text-slate-400">評分:</span>
				<span class="ml-2 text-blue-500 font-semibold">{{ liwaData.score }}</span>
			</div>
			<div class="w-72" v-else>
				<p class="text-sm font-bold text-slate-400 mb-2">評分</p>
				<p class="text-5xl pl-3 text-blue-500 font-bold">{{ liwaData.score }}</p>
			</div>
			<div class="w-full flex flex-col lg:w-[calc(100%_-_18rem) lg:px-4">
				<div class="w-full p-4">
					<p class="text-sm font-bold text-slate-400 mb-2">說明</p>
					<div class="descp w-full " v-html="liwaData.descp">
					</div>
				</div>
				<div class="w-full p-4">
					<p class="text-sm font-bold text-slate-400 mb-2">鑑定證書</p>
					<div class="descp w-full ">
						<span v-for="(item, index) in liwaPDF">
							[<a :href="item">證書{{ index+1 }}</a>]
						</span>
					</div>
				</div>				
				<div class="w-full p-4 border-b-2 border-b-slate-300">
					<div class="w-full flex flex-row">
						<div class="text-sm font-bold text-slate-400 mb-2 mr-2">鑑定師意見</div>
					</div>
					<div class="descp w-full" v-text="liwaData.certiMemo">
					</div>
				</div>
				<div class="w-full flex flex-row pt-8">
					<div class="w-24 pl-3 border-r-2 border-r-slate-400"><a href="#">斡旋須知</a></div>
					<div class="w-64 pl-8"><a href="/QnA">常見Q & A</a></div>
				</div>
			</div>
		</div>
	</div>
	<div class="w-full bg-stone-200 py-12" v-if="isDone == false">
		<div v-if="isSeller == false" class="w-full lg:w-[800px] mx-auto py-4" >
			<div class="w-full flex flex-row">
				<span>斡旋次數:</span>
				<span class="ml-4 mr-4">{{ liwaData.bargainCount }}</span>
			</div>
			<div v-if="isBargain == false" class="w-full pt-6 pb-12 ">
				<p v-if="msgBargain" class="py-1 text-red-500">{{ msgBargain }}</p>
				<div class="w-24 h-8 rounded-lg bg-emerald-500 text-white text-center pt-1 mx-auto cursor-pointer" @click="openBargain()">我要出價</div>
			</div>
			<div v-else class="w-full py-4">
				<p class="py-4">可出價次數: {{ liwaData.remainBargain }}</p>
				<p class="py-4 text-red-500">{{ msgBargain }}</p>
				<div v-show="showBidPrice" class="w-full h-12">
					<div class="w-full lg:w-[60%] flex flex-row lg:mx-auto">
						<div class="w-8 h-full">NT$</div>
						<input type="text" class="text-right border-0 border-b-2 border-b-slate-700 pr-4" placeholder="請輸入出價" v-model="bidPrice">
						<div class="w-24 h-8 rounded-lg bg-red-400 text-white text-center pt-1 ml-2 cursor-pointer" @click="submitPrice()">送出</div>
					</div>
				</div>
			</div>
		</div>		
		<div v-else class="w-full lg:w-[900px] mx-auto py-2" style="min-height:8rem;">
			<div class="w-full h-10 font-bold bg-white pl-4 pt-2">斡旋記錄</div>
			<div class="w-full min-h-[350px] border-2 border-slate-600 bg-white">
				<div class="pb-2 align-middle inline-block min-w-full">
					<div class="shadow border-b border-gray-500 bg-white">
						<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
							<thead class="bg-gray-50">
								<tr class="bg-slate-300">
									<th class="w-1/3 text-center">日期</th>
									<th class="w-1/3 text-center">買方</th>
									<th class="w-1/3 text-center">出價</th>
								</tr>
							</thead>
							<tbody v-if="liwaD1.length > 0" class="w-full bg-white ring-1 ring-gray-50">
								<tr v-for="(record, index) in liwaD1" class="odd:bg-white even:bg-slate-200">
									<td scope="col" class="tdPanel w-1/3">{{ record.bidDateTime }}</td>
									<td scope="col" class="tdPanel w-1/3">{{ record.biderID }}</td>
									<td scope="col" class="tdPanel w-1/3">
										<span class="float-left">NTD {{ record.bidPrice }}</span>
										<div v-if="record.bidResult==0" class="w-24 flex flex-row ml-4">
											<div class="w-12 h-6 ml-2 rounded-lg bg-emerald-400 text-white text-center cursor-pointer"
											@click="setPriceBack(index, 1)"
											>
												同意
											</div>
											<div class="w-12 h-6 ml-2 rounded-lg bg-red-400 text-white text-center cursor-pointer"
											@click="setPriceBack(index, -1)"
											>
												拒絕
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>						
					</div>
				</div>
			</div>
		</div>		
	</div>
	<teleport to="body">
		<div class="w-full h-[70vh] absolute top-[70px] bg-slate-100" v-if="isCerti == true">
			<div class="w-full lg:w-[800px] h-full mx-auto my-0 relative">
				<h1 class="w-full h-12 text-2xl">鑑定證書</h1>
				<div class="w-full h-full border-2 border-emerald-400 overflow-x-hidden overflow-y-auto">
					<iframe :src="certiPath" frameborder="0" class="w-full h-full"></iframe>
				</div>
				<div class="w-12 h-12 absolute top-0 right-0 cursor-pointer" @click.stop="closeCerti">
					<IconX class="w-7 h-7 text-white font-bold" />
				</div>				
			</div>
		</div>
	</teleport>
	<Teleport to="body">
		<div
			v-if="isMsg" 
			class="w-full h-[150vh] absolute top-[200px] left-0 bg-slate-100 z-[500]"
		>
			<liwaMsg 
			  	:msgTitle="objMsg.title"
			  	:msgBody="objMsg.body"
			  	:modalType="objMsg.modalType"
			  	@hideMsg="hideMsg"
			  	@confirmOK="confirmOK"
			/> 			
		</div>		
	</Teleport>	
</template>

<style scoped>
	body {
		position:relative;
	}

	.swiper {
		min-height:380px;
	}

	.swiper-android .swiper-slide, .swiper-wrapper  {
		min-height:350px;
		transform: translate3d(0px, 0px, 0px);
	}

	.descp p
	{
		margin: 1rem 1rem;
		line-height: 25px;
	}

	.descp span
	{
		margin-left:0.5rem;
	}
</style>