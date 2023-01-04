<script setup lang="ts">
    /*********************************************************
    prog name: 常見Q&A, author: James Lin, date: 2022/11/02
    Todo: 
    **********************************************************/	
    import { ref, onMounted } from "vue"
    import { useFetch, createFetch, useTitle } from "@vueuse/core"
    import { IconChevronDown, IconChevronUp } from '@iconify-prerendered/vue-bi'

    const isShow = ref(false)
    const iValue = ref(-1)
    const liwaData = ref([])

    const toggleShow = (idx) => {
    	iValue.value = idx
    	let iShow = liwaData.value[idx].isShow
        let iNuShow = (iShow == "0")? "1": "0"
        liwaData.value[idx].isShow = iNuShow
    }

    const loadData = async () => {
        let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
        let url = `${sAPIsvr}/WQnA_havelist.php`
        const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
        liwaData.value = data.data.value.arrSQL      
    }

    onMounted(() => {
        useHead({title:`常見Q&A`})
        loadData()
    })

    definePageMeta({
      layout: "web",
    })       	
</script>

<template>
<div class="w-full h-[800px] lg:w-[1024px] lg:mx-auto">
    <div class="w-full h-[80vh]">
        <!-- 網頁內容由此開始 -->
		<div v-if="liwaData.length" class="w-full mt-5 bg-slate-100 relative">
			<div
				v-for="(ques,index) in liwaData"
				:key="index"
				class="flex flex-col"
			>
				<div class="w-full flex flex-row cursor-pointer">
					<div class="w-[calc(100%_-_2rem)] text-2xl font-semibold text-black-500 mt-5 ml-3">{{ ques.question }}
					</div>
					<div class="w-8 pt-2" @click="toggleShow(index)">
                        <IconChevronDown v-if="ques.isShow=='0'" class="w-7 h-7 text-slate-500 font-bold" />
                        <IconChevronUp v-else class="w-7 h-7 text-slate-500 font-bold" />
					</div>	
								
				</div>
				<div 
					v-if="ques.isShow=='1'" 
					class="w-full bg-white pb-8"
				>
					<div 
                        v-html="ques.answer"
                        class="text-md mt-5 ml-3 bg-white"></div>			
				</div>					
			</div>
		</div>
	</div>
</div>
</template>