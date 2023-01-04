// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        "meta": [
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        "link": [
            { rel: 'icon', type: 'image/ico', href: '/static/favicon.ico' },
            {rel: 'stylesheet', type: 'text/css', href: '/assets/css/formkit.css'}
        ]
    },
    modules: [
	'@nuxt/ui',
        '@nuxtjs/tailwindcss',
        '@vueuse/nuxt',

    ],
    css: [
        '~/assets/css/base.css',

    ], 
    server: {
        port: 8000,
    },
    tailwindcss: {
	ccsPath: "~/assets/css/base.css",
	configPath: 'tailwind.config.js',
	exposeConfig: false,
	config: {},
	viewer: true,
    },

})
