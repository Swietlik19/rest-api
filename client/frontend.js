import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const app = createApp({
  data() {
    return {
      loading: false,
      form: {
        name: '',
        value: '',
      },
      contacts: [],
    }
  },
  computed: {
    canCreate() {
      return this.form.value.trim() && this.form.name.trim()
    }
  },
  methods: {
    async createContact() {
      const {...contact} = this.form;

      const newContact = await request('/api/contacts', 'POST', contact)
      this.contacts.push(newContact)

      this.form.name = this.form.value =  ''
    },
    async markContact(id) {
      const contact = this.contacts.find(contact => contact.id === id)
      const updated = await request(`/api/contacts/${id}`, 'PUT', {
        ...contact,
        marked: !contact.marked
      })
      contact.marked = updated.marked
    },
    async removeContact(id) {
      await request(`/api/contacts/${id}`, 'DELETE')
      this.contacts = this.contacts.filter(contact => contact.id !== id)
    },
  },
  async mounted() {
    this.loading = true
    this.contacts = await request('/api/contacts')
    this.loading = false
  }
})

app.component('loader', {
  template: `
    <div style="display: flex; justify-content: center; align-items: center;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `
})

app.mount('#app')

async function request(url, method='GET', data = null) {
  try {
    const headers = {}
    let body

    if (data) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data)
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    })
    return await response.json()
  } catch (err) {
    console.error(err)
  }
}
