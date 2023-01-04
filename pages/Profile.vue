<script setup lang="ts">
	/*********************************************************
	prog name: 關於我, author: James Lin, date: 2022/08/10
	主功能: 變更使用者profile, 重設密碼, 

	**********************************************************/	
	import { ref, reactive, onMounted, computed } from "vue"
	import { useStorage, useFetch, createFetch } from "@vueuse/core"
	import TinyMceEditor from "@tinymce/tinymce-vue"
	import liwaObjList from "../components/liwaObjList.vue"

	const mainID = ref('')
	const step = ref('A02')
	const liwaData = ref({})
	const submitted = ref(false)
	const submitted2 = ref(false)
	const newpass1 = ref('')
	const sUrl = ref('/Products?imode=1')
	const Bopen = ref(true)
	//圖檔處理變數
	const imgInput = ref(null)
	const imgInput2 = ref(null)
	const gender1 = ref('')	
	//個人簡介變數
	const sContent = ref('')
	const liwaEditor = ref(null)
	const isEditor = ref(true)

	const setActive = (sID) => {
		let sGroup = sID.substr(0, 1)
		switch (sGroup) {
			case 'A':
				step.value = sID
				break
			case 'B':
				step.value = sID
				break;	
			case 'C':
				step.value = 'C00'
				break
			case 'D':
				step.value = sID
				break
		}
	
	}

	// 圖檔處理 starts
	const callDialog = () => {
		imgInput.value.click()
	}

	const handleImage = (e) => {
		const selectedImage = e.target.files[0]
		createBase64Image(selectedImage)
	}

	const createBase64Image = (fileObject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			liwaData.value.picpath = e.target.result
		}
		reader.readAsDataURL(fileObject)
	}	

	const iconSrc = computed(() => {
		let AA = ''
		if (liwaData.value.picpath !== undefined) {
			let iconHead = liwaData.value.picpath.substr(0, 5)
			if (iconHead !== 'data:') {
				// 使用者未變更圖檔
				if (iconHead !== '/sysp') {
					// 圖檔先前已變更, 存在imgSvr內
					AA = window.sessionStorage.getItem('liwaImgsvr') + liwaData.value.picpath
				} else {
					// 圖檔為預設
					AA = (liwaData.value.gender == '先生') ? window.sessionStorage.getItem('liwaImgsvr') + '/syspics/man-icon.png': window.sessionStorage.getItem('liwaImgsvr') + '/syspics/woman-icon.png'	
				}
				// liwaData.value.picpath = AA
			} else {
				// 使用者已變更 icon, iconSrc設為已變更的圖檔(data:)
				AA = liwaData.value.picpath
			}
		}
		return AA
	})
	// 圖檔處理 ends

	// liwaEditor starts
	const InitVal = ref({
		height: 400,
		language:"zh_TW",
		menubar: true,
		content_style:"../../assets/css/tinyMCE.css",
	    plugins: [
	    	'emoticons', 'fullscreen', 'lists', 'link', 'image', 'help', 'wordcount'
	    ],
	    fullscreen_native: true,
	    toolbar: 'fullscreen | undo redo | blocks |  forecolor backcolor | indent outdent | emoticons | link image | bold italic | help',
	    file_picker_callback: function(callback, value, meta) {
		  	if (meta.filetype == 'image') {
		  // 		const imgInput = document.createElement('input')
				// imgInput.setAttribute('type', 'file');
				// imgInput.setAttribute('accept', 'image/*');
				imgInput2.value.addEventListener('change', (e) => {
					const file = e.target.files[0]
					const reader = new FileReader()
					reader.onload = (e) => {
						callback(e.target.result, { alt: ''})
					}
					reader.readAsDataURL(file)
				})
				imgInput2.value.click()
			}
		},
	})
	// liwaEditor ends

	const loadData = async () => {
		mainID.value = window.sessionStorage.getItem('liwaUserID')
		let url= window.sessionStorage.getItem('liwaAPIsvr') + "/Prof_web.php?siteID=" + window.sessionStorage.getItem('liwaSiteID') + "&userID=" + mainID.value
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
	
		liwaData.value.action = 'edit'
		liwaData.value.mainID = mainID.value
		liwaData.value.siteID = window.sessionStorage.getItem('liwaSiteID')
		liwaData.value.userID = mainID.value
		liwaData.value.makerName = window.sessionStorage.getItem('liwaUserName')
	}	

	const saveData = async () => {
		//  若 iconSrc.substr(0, 5)=='', liwaData.value.picpath = iconSrc
		let picHead = iconSrc.value.substr(0, 5)
		if (picHead == 'data:') liwaData.value.picpath = iconSrc.value
		if (sContent.value) {
			liwaData.value.userBrief = sContent.value
		}

		let datastr = JSON.stringify(liwaData.value)
	console.log('datastr =', datastr)

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
	    const { data } = await useMyFetch('Prof_webedit.php').post().json()	
	 	console.log('data =', data.value)
	 	
	}	

	const resetPSWD = async () => {
		let passData = { 
			"siteID": window.sessionStorage.getItem('liwaSiteID'),
			"mainID": window.sessionStorage.getItem('liwaUserID'),
			"username": window.sessionStorage.getItem('liwaUserName'),
			"pswd": newpass1.value 
		}
		let datastr = JSON.stringify(passData)
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
	    const { data } = await useMyFetch('sys_webresetPSWD.php').post().json()
	}

	definePageMeta({
	  layout: "web",
	})	

	onMounted(() => {
		useHead({title:`我的管理中心`})
		loadData()
	})
</script>

<template>
	<div class="w-full bg-slate-200 px-4 py-2">
		<div class="w-full lg:w-[1024px] mx-auto flex flex-row justify-start">
			<div class="w-full lg:w-[320px] p-2 border-[0.125rem] border-slate-400">
				<div class="actItem">管理面板<div class="btnGT" @click="setActive('A01')">&gt;</div></div>
				<div class="actItem">基本資料設定<div class="btnGT" @click="setActive('A02')">&gt;</div></div>
				<div class="actItem mb-4">變更密碼<div class="btnGT" @click="setActive('A03')">&gt;</div></div>
				<div class="actItem">收藏物件<div class="btnGT" @click="setActive('B01')">&gt;</div></div>				
				<div class="actItem">已上架物件<div class="btnGT" @click="setActive('B02')">&gt;</div></div>
				<div class="actItem">斡旋中物件<div class="btnGT" @click="setActive('B03')">&gt;</div></div>
				<div class="actItem">已同意物件<div class="btnGT" @click="setActive('B04')">&gt;</div></div>				
				<div class="actItem">已成交物件<div class="btnGT" @click="setActive('B05')">&gt;</div></div>
				<div class="actItem mb-4">待付款物件<div class="btnGT" @click="setActive('B06')">&gt;</div></div>
				<div class="actItem">我的斡旋金<div class="btnGT" @click="setActive('C01')">&gt;</div></div>
				<div class="actItem">已轉出斡旋金<div class="btnGT" @click="setActive('C02')">&gt;</div></div>
				<div class="actItem">待付餘額<div class="btnGT" @click="setActive('C03')">&gt;</div></div>
				<div class="actItem mb-4">斡旋金匯入/匯出<div class="btnGT" @click="setActive('C04')">&gt;</div></div>
				<div class="actItem">系統訊息<div class="btnGT" @click="setActive('D01')">&gt;</div></div>
				<div class="actItem">問與答<div class="btnGT" @click="setActive('D02')">&gt;</div></div>
			</div>
			<div class="hidden lg:block w-[calc(100%_-_320px)] ml-4 border-[0.125rem] border-slate-300 bg-white">
				<section v-show="step=='A02'">
					<div class="w-full h-full my-0 lg:w-[700px] bg-white">
						<div class="w-full bg-white mx-auto my-2 rounded-xl pb-1">
							<FormKit 
							form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
							type="form"
							v-model="liwaData"
							:form-class="submitted? 'hidden': 'block'"
							style="margin: 1rem auto;"
							submit-label="存檔"
							@submit="saveData()"
							>
								<fieldset class="border-[1px] border-slate-500 rounded-lg p-2 mb-4">
									<legend>基本設定</legend>
									<div class="w-full h-[200px] mb-8">
										<img 
											class="mx-auto border-2 w-[200px] h-full"
											:src="iconSrc" 
											width="200" 
											:alt="liwaData.nickname" 
											@click="callDialog"
										/>	
										<p class="w-full text-center text-red-600 text-sm">頭像: 請上傳 200 X 200 px照片</p>
									</div>
									<div class="w-full flex flex-col lg:flex-row">
										<div class="w-full lg:w-1/2">
											<FormKit
									          name="memberNM"
									          label="姓名*"
									          type="text"
									          placeholder="請輸入姓名"
									          help="可輸入中英文名字(字數限制100字)"
									          validation="required"
									        />							
										</div>
										<div class="w-full lg:w-1/2 lg:ml-8 mt-2">
									        <FormKit
									          name="gender"
									          label="稱謂"
									          type="radio"
									          :options="['先生', '小姐']"
									          help="請選擇性別"
									        />
										</div>				
									</div>				        
							        <div class="w-full my-4">
							        	<span class="mr-4 font-bold text-sm text-slate-700">聯絡手機</span>
							        	<span class="text-lg">{{ liwaData.mobile }}</span>
							        </div>
							        <FormKit
							          name="birthday"
							          label="生日/公司設定日*"
							          type="date"
							          min="1960-01-01"
							          help="請輸入生日/公司設定日期"
							          validation="required"
							        />
							        <FormKit
							          name="memberMail"
							          label="Email *"
							          type="email"
							          help="請設定聯絡Email"
							          validation="required"
							        />	
						        	<FormKit
							          name="uniqID"
							          label="身份證字號/統一編號*"
							          type="text"
							          help="請設定身份證字號/統一編號"
							          validation="required"
							        />
							        <div class="flex flex-col lg:flex-row justify-start lg:justify-between">
							        	<div class="w-full lg:w-16">
									        <FormKit
									        	name="zip"
									        	label="郵遞區號"
									        	type="text"
									        />		        		
							        	</div>
								        <div class="w-full lg:w-[calc(100%_-_4rem)]">
									        <FormKit
									        	name="addr"
									        	label="地址"
									        	type="text"
									        />				        	
								        </div>       	
							        </div>
							        <div class="w-full text-sm font-bold mt-2">
							        	<span>會員等級:</span>
										<span class="ml-4 text-2xl text-blue-500">{{ liwaData.grade }}</span>
									</div>
							        <div class="w-full text-sm font-bold mt-2">
							        	<span>會員積分:</span>
										<span class="ml-4 text-2xl text-blue-500">{{ liwaData.scores }}</span>
									</div>	
									<div class="mt-4">您還需要 積分可以升到下一級</div>
							        <FormKit
							        	name="bankID"
							        	label="銀行代碼 *"
							        	type="text"
							        	validation="required"
							        />	
							        <FormKit
							        	name="bankname"
							        	label="往來銀行 *"
							        	type="text"
							        	validation="required"
							        />	
							        <FormKit
							        	name="branch"
							        	label="所屬分行 *"
							        	type="text"
							        	validation="required"
							        />	
							        <FormKit
							        	name="acctName"
							        	label="銀行戶名 *"
							        	type="text"
							        	validation="required"
							        /> 
									<FormKit
							        	name="acctNo"
							        	label="銀行帳戶 *"
							        	type="text"
							        	validation="required"
							        />								
								</fieldset>
							</FormKit>
						</div>
					</div>
				</section>
				<section v-show="step=='A03'">
					<div class="w-full h-full bg-slate-200">
						<div class="w-full lg:w-[700px] h-[82vh] mx-auto my-1 bg-white px-4 py-2">
							<FormKit 
						        form-class="px-4 py-2 bg-yellow-200 rounded-2xl w-11/12"
						        type="form"
						        :form-class="submitted2? 'hidden': 'block'"
						        style="margin: 1rem auto;"
						        submit-label="送出"
						        @submit="resetPSWD"
						    >		    
						        <FormKit
						          name="newpass"
						          label="密碼"
						          type="password"
						          help="請輸入密碼, 必須8字元以上, 必須含英文大小寫字元及數字"
						          validation="required|alphanumeric:latin|length:8"
						          :validation-messages="{
						            length: '密碼長度必須8字元以上',
						          }"
						          v-model="newpass1"
						        />
						        <FormKit
						          name="newpass_confirm"
						          label="密碼確認"
						          type="password"
						          help="確認密碼"
						          validation="required|confirm"
						          validation-visibility="live"
						        />
							</FormKit>
						</div>
					</div>						
				</section>
				<section v-show="step=='B01'">
					<liwaObjList 
						:sUrl="'/Products?imode=1'"
					/>							
				</section>
				<section v-show="step=='B02'">
					<liwaObjList 
						:sUrl="'/Products?imode=2'"
					/>							
				</section>
				<section v-show="step=='B03'">
					<liwaObjList 
						:sUrl="'/Products?imode=3'"
					/>							
				</section>	
				<section v-show="step=='B04'">
					<liwaObjList 
						:sUrl="'/Products?imode=4'"
					/>							
				</section>
				<section v-show="step=='B05'">
					<liwaObjList 
						:sUrl="'/Products?imode=5'"
					/>							
				</section>
				<section v-show="step=='B06'">
					<liwaObjList 
						:sUrl="'/Products?imode=6'"
					/>							
				</section>				
				<section v-show="step=='C00'">
					<h1>這是斡旋金視窗</h1>
				</section>
				<section v-show="step=='D01'">
					<h1>這是系統訊息</h1>
				</section>	
				<section v-show="step=='D02'">
					<h1>這是問與答視窗</h1>
				</section>
			</div>
		</div>
	</div>
	<div class="invisible">
		<input 
			ref="imgInput" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
			@change.stop="handleImage"
		/>		
	</div>	
	<div class="invisible">
		<input 
			ref="imgInput2" 
			class="w-11/12 h-8 bg-grey-100 hidden" 
			type="file" 
			accept="image/*" 
		/>		
	</div>		
</template>

<style scope>
	.formkit-option {
		width:50%;
		float:left;
	}

	.actItem {
		max-width:300px;
		line-height:4rem;
		border:1px solid #888;
		padding-left:1rem;
		position:relative;
		background-color: white;
	}

	.btnGT {
		width:3rem;
		height:3rem;
		position:absolute;
		top: 0rem;
		right:0px;
		text-align:center;
		font-size:1.5rem;
		cursor:pointer;
	}
</style>