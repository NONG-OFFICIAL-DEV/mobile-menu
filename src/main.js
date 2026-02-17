import { createApp } from "vue"
import { createPinia } from 'pinia'
import App from "./App.vue"
import router from "./router"
import vuetify from "./plugins/vuetify"
import i18n from "./plugins/i18n"
import "./style.css"

import CustomTitle from "./components/global/CustomTitle.vue";


const app = createApp(App)
const pinia = createPinia()

// disabled double click zoom
let lastTouchEnd = 0
document.addEventListener(
  'touchend',
  event => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  { passive: false }
)

app.use(pinia)
app.use(vuetify)
app.use(router)
app.use(i18n)
app.component("CustomTitle", CustomTitle);

app.mount("#app")