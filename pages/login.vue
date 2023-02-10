<script setup lang="ts">
  /*********************************************************
  prog name: 使用者登入, author: James Lin, date: 2022/10/06
  Todo: 

  **********************************************************/
	import { ref, onMounted} from "vue"
	import { useFetch, createFetch, useStorage } from "@vueuse/core"
	import queryString from "query-string"
	import liwaMsg from "../../components/liwaMsg.vue"

	const APIsvr = ref('')
	const submitted = ref(false)
	const liwaData = ref({
		'mobile':'',
		'password':'',
		'siteKey': '6LfXLuwjAAAAAFXbAQPm82-X6ArjiMcEIEelQTXZ'
	})
	const res = ref({})
	const msg = ref('')
	// const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()

	const submitlogin = async () => {
		// liwaData 加入jwttoken pair
		let sJWT = window.localStorage.getItem('liwaJWT')
		liwaData.value.JWT = ((sJWT === 'undefined') || (sJWT === ''))? '' : sJWT
		let datastr = JSON.stringify(liwaData.value)
		const useMyFetch = createFetch({
		  baseUrl: APIsvr.value,
		  options: {},
		  fetchOptions: {
		    mode: 'cors',
		    headers: new Headers({
		      'Content-Type': 'application/json; charset=utf-8'
		    }),
		    body: JSON.stringify(liwaData.value)
		  }
		})

		const { data } = await useMyFetch('web_login.php').post().json()
		if (data.value.arrSQL.length > 0) res.value = data.value.arrSQL[0]
		if (res.value.message == "") {
			// Login 成功, 先設定 sessionStorage
			window.localStorage.setItem('liwaJWT', res.value.token)
			window.sessionStorage.setItem('liwaUserIconPath', res.value.picpath)
			window.sessionStorage.setItem('liwaImgsvr', res.value.imgsvr)
			window.sessionStorage.setItem('liwaAPIsvr', res.value.apisvr)
			//取得 liwaNowLink, 若 liwaNowLink !== '/', 跳到 liwaNowLink, 否則 /Profile
			let NowLink = window.sessionStorage.getItem('liwaNowLink')
			window.location.href=(NowLink !== '/') ? NowLink : '/Profile'
		} else {
			msg.value = res.value.message

		}
	}

	const resetPswd = async () => {
		// 重設密碼, 先取得已輸入的手機號碼
		let sMobile = liwaData.value.mobile
		if (sMobile) {
			let passData = {
				// 'JWT': window.localStorage.getItem('liwaJWT'),
				'mobile': sMobile
			}
			let datastr = JSON.stringify(passData)
		    const useMyFetch = createFetch({
		      baseUrl: APIsvr.value,
		      fetchOptions: {
		        mode: 'cors',
		        headers: new Headers({
		          'Content-Type': 'application/json; charset=utf-8'
		        }),
		        body: datastr
		      }
		    })
		    const { data } = await useMyFetch('sys_webresetPSWD.php').post().json()
		    // 回傳2個結果: 1.發送成功, 2.發送失敗, 都顯示在msg
		    let sMsg = data.value.message
		    if (sMsg) msg.value = data.value.message
		    else msg.value = data.value.key
		} else {
			msg.value = '請輸入註冊時的手機號碼'
		}
	}

	onMounted(() => {
		useHead({title:`登入`})
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
	})

	definePageMeta({
		colorMode:'light',
	  layout:"web",
	})  
</script>

<template>
<div class="w-full h-[calc(100vh_-_8rem)] bg-white flex lg:flex-row justify-center lg:justify-end items-start">
	<div class="hidden md:block w-[80vw] h-[88vh] bg-gradient-to-r from-emerald-100 via-cyan-200 to-sky-400" >
		<img src="http://imgsvr.liwasite.com/liwa14/202209/202209081644136078.png" alt="JewelryTrade.Center" class="w-full h-full"/>
	</div>
	<div class="mt-2 pt-4 bg-white">
		<div class="bg-white m-2 rounded-xl max-w-sm pb-1">
			<div class="bg-white px-10 py-5 w-screen max-w-sm">
				<h1 class="text-center text-2xl font-semibold text-gray-600 underline underline-offset-8 decoration-orange-500 tracking-[1.5rem]">會員登入</h1>
			</div>
		</div>
		<FormKit 
		form-class="px-4 py-2 bg-gray-100 rounded-2xl w-11/12"
		v-model="liwaData"
		type="form"
		:form-class="submitted? 'hidden': 'block'"
		style="margin: 1rem auto;"
		submit-label="登入"
		@submit="submitlogin"
		>
	        <FormKit
	          name="mobile"
	          label="請輸入手機號碼"
	          type="text"
	          placeholder="請輸入手機號碼"
	          help="請輸入您的手機號碼, 共10碼, 無空白"
	          validation="required|number|length:10"
	        />
	        <FormKit
	          name="password"
	          label="密碼"
	          type="password"
	          help="請輸入密碼"
	          :validation="required"
	        />
<!-- 	        <div class="w-full h-12 my-2">
	        	<div class="w-32 h-12 bg-emerald-400 text-white py-2 text-center" @click="recaptcha">我不是機器人</div>
	        </div> -->
	        
		</FormKit>
		<div v-if="msg" class="w-full h-8 bg-white pl-4 text-red-400 mb-4">
			{{ msg }}
		</div>
		<div class="w-full flex flex-row justify-start text-red-400">
			<div class="w-1/2 h-8 bg-white text-left pl-4 cursor-pointer" @click="resetPswd">忘記密碼
			</div>
			<div class="w-1/2 h-8 text-indigo-400 text-right pr-4 cursor-pointer">
				<NuxtLink to="/regis">
					<div>註冊</div>
				</NuxtLink>				
			</div>
		</div>
	</div>  
</div>
</template>

<style scope>
  .formkit-outer {
    margin-bottom: 1.25rem;
  }
</style>