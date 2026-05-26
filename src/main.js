import { createApp } from 'vue'
import App from './App.vue'

if (window.top === window.self && !document.getElementById('cx-skills-app')) {
  const container = document.createElement('div')
  container.id = 'cx-skills-app'
  document.body.appendChild(container)

  createApp(App).mount(container)
}
