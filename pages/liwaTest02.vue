<script setup lang="ts">
	/*********************************************************
	prog name: 元件測試, author: James Lin, date: 2022/12/27
	Todo: 1. Profile 網頁的物件顯示
	**********************************************************/	
	import { ref, onMounted } from "vue"
	import liwaObjList from "../components/liwaObjList.vue"

	onMounted(() => {
		useHead({title:`測試頁 2`})
	})

	definePageMeta({
	  layout: 'web',
	})
</script>

<template>
	<div class="w-700px h-[calc(100vh_-_8rem)] overflow-x-hidden overflow-y-auto">
		<liwaObjList 
			:sUrl="'/Products?imode=2'"
		/>
	</div>
</template>

<style scoped>

</style>