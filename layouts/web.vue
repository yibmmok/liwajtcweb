<template>
    <div>
        <TheHeader />
    </div>
    <div class="w-full min-h-[calc(100vh_-_11rem)] md:min-h-[calc(100vh_-_7rem)]">
        <slot></slot>
    </div>
    <!-- <div class="testBox"></div> -->
    <TheFooter />
</template>

<script setup>
const route = useRoute()

//useMeta({
//  title: computed(() => `珠寶交易中心 - ${route.meta.title}`)
//})

useHead({
    titleTemplate: '珠寶動產交易中心 - %s',
    //title: '測試網頁'
    // meta: [
    //   {
    //     charset: () => 'utf-8',
    //   },
    //   {
    //     name: 'description',
    //     content: ref('description'),
    //     hid: 'test',
    //     vmid: 'test',
    //   },
    // ],
})
	
</script>

<script>
import TheFooter from "~/components/TheFooter_web.vue"
import TheHeader from "~/components/TheHeader_web.vue"

export default {
    components: { TheHeader, TheFooter }
}
</script>
