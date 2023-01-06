<script setup lang="ts">
  /*********************************************************
  prog name: 歡迎及提醒, author: James Lin, date: 2022/11/10

  **********************************************************/
	import { ref, onMounted, computed } from "vue"

	onMounted(() => {
		useHead({title:`歡迎與簡短操作教學`})
	})

	definePageMeta({
		layout:"web",
		colorMode: "light"
	})
</script>

<template>
<div class="lg:h-[calc(100vh_-_7rem)] bg-slate-200 flex justify-center items-start w-full">
	<div class="pt-4">
		<div class="bg-white m-2 rounded-xl w-[calc(100%_-_1rem)] lg:w-[900px] p-3">
			<h2 class="w-full text-4xl text-center">歡迎</h2>
			<p></p>
			<p>歡迎您成為 Jewelrytrade.center 的會員, 請瀏覽以下說明來獲得更好的網站體驗</p>
			<p></p>
			<p class="text-xl font-semibold my-2">1 變更密碼</p>
			<p>您如果現在要變更密碼, 可以直接點擊網頁右上方的頭像進入「我的管理中心」網頁。</p>
			<p>或是使用您所收到簡訊上的密碼在下次登入本站時, 再點擊網頁右上方的頭像進入「我的管理中心」網頁。</p>
			<p>當您進入「我的管理中心」網頁時，點擊「改變密碼」標籤頁</p>
			<p>請在頁面上輸入新的密碼及確認新密碼再點擊「送出」</p>
			<p>您將收到新的密碼簡訊, 再使用新密碼重新登入即可</p>
			<p></p>
			<p class="text-xl font-semibold my-2">2 填寫基本資料</p>
			<p>當您進入「我的管理中心」網頁時, 請點擊「基本資料設定」</p>
			<p>請填寫表格內有*的欄位, 並點擊「送出」</p>
			<p>當您看到螢幕出現「變更完成」訊息, 您的設定變更就完成了。</p>
			<p></p>
			<p class="text-xl font-semibold my-2">3 關於登入</p>
			<p>當您登入本站後才能檢視更多訊息及操作更多功能</p>
			<p>如果您未登入, 網站每一網頁都提供登入按鈕, 您可以按網頁右上方的「登入」按鈕, 即可進入「登入」頁</p>
			<p>在「登入」頁輸入您的手機號碼及密碼，再點擊「登入」按鈕即可。</p>
		</div>
	</div>
</div>	
</template>

<style scope>
	p {
		margin: .75rem 0;
	}
</style>