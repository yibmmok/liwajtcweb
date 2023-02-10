<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetch, createFetch } from "@vueuse/core"
import queryString from "query-string"
import { useChkauth } from "../composables/use-chkauth"
import liwaSimpleTbl from "../components/liwaSimpleTbl"
import { IconX, IconCaretDownFill, IconCaretUpFill } from '@iconify-prerendered/vue-bi'

const route = useRoute()
const title = ref('待付餘額總金額')
const tblTitle = ref('待付餘額明細')
const totalAmt = ref(0)
const dataUrl = ref('w041_haveD3C.php')
const headUrl = ref('w041_haveHead.php')
const progID = ref('Profile_C03')

const APIsvr = ref('')

const loadTotal = async () => {
	let keydata = {
		'JWT': window.localStorage.getItem('liwaJWT')
	}
	let sQuery = queryString.stringify(keydata)
	let url = `${APIsvr.value}/w041_haveTotalC03.php?${sQuery}`
	const data = await useFetch(url, {method: 'GET'}, {refetch: true}).get().json()	
	totalAmt.value = data.data.value.message
}

definePageMeta({
  layout: "web",
  colorMode: "light"
})	

onMounted(() => {
	APIsvr.value = window.sessionStorage.getItem('liwaAPIsvr')
	loadTotal()
})

</script>

<template>
	<div class="sm:w-full lg:w-[768px] mx-auto">
		<div class="w-full h-12 pt-4">
			{{ title }}:  NT${{ totalAmt }}
		</div>
		<liwaSimpleTbl
			:tblTitle="tblTitle"
			:headUrl="headUrl"
			:progID="progID"
			:dataUrl="dataUrl"
		></liwaSimpleTbl>		
	</div>
</template>