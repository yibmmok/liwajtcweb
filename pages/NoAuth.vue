<script setup lang="ts">
  /*********************************************************
  prog name: 無權限顯示頁面, author: James Lin, date: 2022/10/03
  **********************************************************/	
  import { ref, onMounted} from "vue"
  import jsonData from "../static/init.json"

  const picpath = ref('')

  onMounted(() => {
    useHead({title:`未授權通知`})
  	let imgSvr = jsonData[0].imgSvr
  	picpath.value = `${imgSvr}/syspics/NoAuth.png`
  })


  definePageMeta({
    colorMode:'light',
    layout:"web",
  })  
</script>

<template>
	<div class="w-full lg:w-[900px] mx-auto px-16">
		<img :src="picpath" alt="">
	</div>
</template>