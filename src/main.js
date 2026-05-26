import { createApp } from 'vue'
import App from './App.vue'

const container = document.createElement('div')
container.id = 'cx-skills-app'
document.body.appendChild(container)

createApp(App).mount(container)
