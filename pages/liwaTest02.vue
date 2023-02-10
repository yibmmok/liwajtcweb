<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetch, createFetch } from "@vueuse/core"
import queryString from "query-string"
import { IconX, IconCaretDownFill, IconCaretUpFill } from '@iconify-prerendered/vue-bi'
import liwaTbl from "../components/liwaTbl.vue"

const route = useRoute()

const liwaData = ref([])
const liwaHead = ref([])
const APIsvr = ref('')

const loadData = async () => {
	// let keydata = {
	// 	'JWT': window.localStorage.getItem('liwaJWT')
	// }
	// let sQuery = queryString.stringify(keydata)
	// let url = `${APIsvr.value}/${dataUrl.value}?${sQuery}`
	// const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()
	// liwaData.value = data.data.value.arrSQL
}


definePageMeta({
  layout: "default",
  colorMode: "light"
})	

onMounted(() => {
	APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')

})

</script>

<template>
	<div class="w-full h-[calc(100vh_-_130px)]">
		<div class="sm:w-full md:w-[768px] h-full mx-auto">
			<liwaTbl
				:tblTitle="'公告類別設定表'"
				:headUrl="'005_D1haveHead.php'"
				:progID="'005_Config'"
				:dataUrl="'005_D1edit.php'"
			/>
		</div>
	</div>
</template>
