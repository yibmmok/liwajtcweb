<script setup lang="ts">
	/*********************************************************
	prog name: 單欄列表元件, author: James Lin, date: 2022/12/06
	Descp: 單欄列表元素處理
	Note: 所有傳入 liwaData的資料, 最後都要加上slink 欄位, 
		  若該儲存格要設超連結, 在slink 欄位設定 route path
	**********************************************************/	
	import { ref, reactive, onMounted } from "vue"
	import { useFetch, createFetch } from "@vueuse/core"
	import queryString from "query-string"
	import { IconCaretDownFill, IconCaretUpFill, IconTrash, IconPlusLg, IconX  } from '@iconify-prerendered/vue-bi'

	const props = defineProps({
		tblTitle: {
			type: String,
			required: true,
			default:''
		},
		progID: {
			type: String,
			required: true,
			default: ''
		},	
		dataUrl: {
			type: String,
			required: true,
			default: ''
		},
		canEdit: {
			type: Boolean,
			default: true
		},		
	})

	const emits = defineEmits(["setList"])
	const route = useRoute()
	const liwaData = ref([])
	const liwaHead = ref([])
	const sortIndex = ref(0)	
	const APIsvr = ref('')
	const isEdit = ref(false)
	const boxCSS = ref('')
	const action = ref('view')
	const liwaObject = ref({})

	const state = reactive({
		'tblTitle': props.tblTitle,
		'progID':props.progID,
		'dataUrl': props.dataUrl,
		'canEdit':props.canEdit
	})

	const loadData = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'action':'view'
		}
		let datastr = JSON.stringify(keydata)
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
	    const { data } = await useMyFetch(state.dataUrl).post().json()
		liwaData.value = data.value.arrSQL
	}

	const loadHead = async () => {
		let keydata = {
			'JWT': window.localStorage.getItem('liwaJWT'),
			'progID':state.progID
		}
		let sQuery = queryString.stringify(keydata)
		// let url = `${APIsvr.value}/${state.headUrl}?${sQuery}`
		let url = `${APIsvr.value}/sys_haveHead.php?${sQuery}`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
		liwaHead.value = data.data.value.arrSQL
		liwaHead.value.forEach((m) => m.sort = 0)	
	}

	const setOrder = (idx) => {
		// 用來對liwaData的資料排序
		// 若 sortIndex == idx, 直接排序, 若否, 先將所有欄位 sort設為0
		if (idx !== sortIndex.value) {
			liwaHead.value.forEach((m) => m.sort = 0)
		}
		let iSort = liwaHead.value[idx].sort
		if (iSort < 2) {
			liwaData.value.sort((a, b) => { 
				if (Object.values(b)[idx] < Object.values(a)[idx]) return -1
			})	
			iSort = 2
		} else {
			liwaData.value.sort((a, b) => { 
				if (Object.values(a)[idx] < Object.values(b)[idx]) return -1
			})		
			iSort --
		}
		liwaHead.value[idx].sort = iSort
		sortIndex.value = idx
	}

	const resetObject = () => {
		// 先產生 liwaObject的內容
		let iLength = Object.keys(liwaData.value[0]).length
		// 為liwaData 增加一個JSON物件
		let str = ''
		for (let i=0; i<iLength; i++) {
			str += (i == iLength -1)? '"'+ Object.keys(liwaData.value[0])[i] + '":""': '"'+ Object.keys(liwaData.value[0])[i] + '":"",'
		}
		str = '{' + str + '}'
		liwaObject.value = JSON.parse(str)
		if(state.canEdit) liwaObject.value.isShow = '0'
	}

	const setMainID = (idx) => {
		//將 liwaData.value[idx] 的值設給 liwaObject
		let iLength = Object.keys(liwaData.value[idx]).length
		let str = ''
		for (let i=0; i<iLength; i++) {
			str += (i == iLength -1)? '"'+ Object.keys(liwaData.value[idx])[i] + '":"'+ Object.values(liwaData.value[idx])[i] +'"': '"'+ Object.keys(liwaData.value[idx])[i] + '":"'+Object.values(liwaData.value[idx])[i]+'",'
		}
		str = '{' + str + '}'
		liwaObject.value = JSON.parse(str)
		boxCSS.value = 'top-[3.5rem] z-50'
		action.value = 'edit'
		isEdit.value = true
		if(state.canEdit) liwaData.value[idx].isShow = '1'
	}

	const saveData = async (idx) => {
		if(state.canEdit) liwaData.value[idx].isShow = '0'
		liwaObject.value.action = action.value
		liwaObject.value.JWT = window.localStorage.getItem('liwaJWT')
		let datastr = JSON.stringify(liwaObject.value)
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
	    const { data } = await useMyFetch('005_D1edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	isEdit.value = false
	    	action.value = 'view'
	    	loadData()
	    	emits('setList', liwaData.value)
	    } else {

	    }
	}

	const addData = async () => {
		// 將 liwaObject 加入 liwaData.value
		resetObject()
		liwaData.value.push(liwaObject.value)
		let iFinalIdx = liwaData.value.length - 1
		boxCSS.value = 'top-0'
		action.value = 'add'
		isEdit.value = true
		if(state.canEdit) liwaData.value[iFinalIdx].isShow = '1'		
	}

	const itemDelete = async (idx) => {
		action.value = 'delete'
		let mainID = liwaData.value[idx].mainID
		let keydata = {
			'JWT':window.localStorage.getItem('liwaJWT'),
			'mainID': mainID,
			'action': action.value
		}
		let datastr = JSON.stringify(keydata)
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
	    const { data } = await useMyFetch('005_D1edit.php').post().json()
	    let msg = data.value.message
	    if (!msg) {
	    	// 從 liwaData 刪除
	    	liwaData.value.splice(idx, 1)
	    	action.value = 'view'
	    	emits('setList', liwaData.value)
	    } else {

	    }
	}

	onMounted(() => {
		APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
		loadHead()
		loadData()
	})		

</script>

<template>
<div class="w-full h-full mt-2 border-2 border-gray-200">
	<div class="w-full h-12 pt-3 text-white text-center bg-violet-800 relative">{{ tblTitle }}
		<div class="top-icon absolute top-2 left-2 pl-[.125rem] pt-[.125rem]" @click="addData()">
			<IconPlusLg class="w-7 h-7 text-white font-bold" />
		</div>
	</div>
	<table class="min-w-full divide-x divide-y divide-gray-200 bg-white">
		<thead class="w-full bg-white ring-1 ring-gray-200">
			<tr class="bg-gray-50 h-12">
				<th v-for="(item, index) in liwaHead" class="thPanel relative" :class="item.headCSS">
					<div class="w-[calc(100%_-_2rem)]" @click="setOrder(index)">
						{{ item.colNM }}
					</div>
					<div v-if="item.sort > 0" class="w-8 ml-12">
		        		<div v-if="item.sort==1">
		        			<!-- 昇冪排列 -->
		        			<IconCaretUpFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
		        		</div>
		        		<div v-if="item.sort==2">
		        			<!-- 降冪排列 -->
		        			<IconCaretDownFill class="w-7 h-7 absolute right-1 top-3 text-amber-300 font-bold" />
		        		</div>
					</div>						
				</th>
			</tr>
		</thead>
		<tbody class="w-full bg-white ring-1 ring-gray-200 overflow-x-hidden overflow-y-auto">
			<tr 
				class="odd:bg-white even:bg-slate-200 relative"
				v-for="(object, index) in liwaData"
				:key="index"
			>
				<td scope="col" class="border-b text-sm font-medium text-gray-500 uppercase tracking-wider" :class="liwaHead[index1-1].headCSS" v-for="index1 in liwaHead.length">
					<div v-if="index1==liwaHead.length" class="w-full py-4 relative border-r-2 odd:border-r-gray-300 even:border-r-slate-800 " :class="liwaHead[index1-1].bodyCSS" @click.stop="setMainID(index)">
						{{ Object.values(object)[index1-1] }}
						<div class="w-8 h-8 absolute top-2 right-2 cursor-pointer" @click.stop="itemDelete(index)">
							<IconTrash class="w-7 h-7 text-orange-400 font-bold" />
						</div>
					</div>
					<div v-else class="w-full py-4 border-r-2 odd:border-r-gray-300 even:border-r-slate-800 " :class="liwaHead[index1-1].bodyCSS" @click.stop="setMainID(index)">{{ Object.values(object)[index1-1] }}</div>						
				</td>					

				<div v-if="object.isShow == '1'" class="w-full py-4 absolute left-0 bg-yellow-200 flex flex-col" :class="boxCSS">
					<div v-if="isEdit" class="w-full relative">
						<FormKit 
						form-class="px-4 py-2 bg-yellow-200 rounded-2xl "
						type="form"
						v-model="liwaObject"
						:form-class="submitted? 'hidden': 'block'"
						style="margin: 1rem auto;"
						submit-label="存檔"
						@submit="saveData(index)"
						>
							<div class="w-full px-0 py-2 flex flex-row">
								<div v-for="index1 in liwaHead.length" :class="liwaHead[index1-1].headCSS">
									<div v-if="liwaHead[index1-1].type == 'select'" class="w-full text-left px-2" >
										<FormKit 
											:name="liwaHead[index1-1].colField"
											:label="liwaHead[index1-1].colNM"
											:type="liwaHead[index1-1].type"
										/>								
									</div>
									<div v-else class="w-full text-left px-2">
										<FormKit 
											:name="liwaHead[index1-1].colField"
											:label="liwaHead[index1-1].colNM"
											:type="liwaHead[index1-1].type"
										/>								
									</div>
								</div>						
							</div>						
						</FormKit>
						<div class="w-10 h-10 mx-2 my-2 absolute left-[8rem] bottom-[2.6rem]">
							<IconX class="w-10 h-10 text-red-500 font-bold" @click.stop="object.isShow='0'"/>
						</div>					
					</div>
				</div>	
			</tr>
		</tbody>
	</table>
</div>
</template>