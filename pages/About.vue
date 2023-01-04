<script setup lang="ts">
	/*********************************************************
	prog name: 關於我們, author: James Lin, date: 2022/12/31
	To Do: 缺內容
	**********************************************************/
	import { ref, onMounted } from "vue"
	import { useFetch } from "@vueuse/core"

	const liwaData = ref([])

	const loadData = async () => {
		let sAPIsvr = window.sessionStorage.getItem('liwaAPIsvr')
		let url = `${sAPIsvr}/WAbout_edit.php`
		const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
		liwaData.value = data.data.value.arrSQL[0]
		// console.log('liwaData = ', liwaData.value)		
	}

	onMounted(() => {
		useHead({title:'關於珠寶動產交易中心'})
		loadData()
	})

	definePageMeta({
	  layout: "web",
	})		

</script>

<template>
	<div class="w-full lg:w-[900px] mx-auto my-4" v-html="liwaData.sContent"></div>
</template>

<style scope>
	h2 {
		font-size:2rem;
		font-weight: bold;
		margin: 1rem 0;
	}
</style>