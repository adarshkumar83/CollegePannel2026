import axios from 'axios'

// Same backend as Admin_College
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

export default api
