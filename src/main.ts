import { createApp } from "vue"
import { createPinia } from 'pinia'
import App from "./App.vue"
import router from "./router"
import i18n from "./plugins/i18n"
import "./style.css"

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
app.use(router)
app.use(i18n)

app.mount("#app")
