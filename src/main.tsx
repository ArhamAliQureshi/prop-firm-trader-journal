import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return (
    <div>
      <h1>Prop Firm Trader Journal</h1>
      <p>Hello World</p>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error("Failed to find 'root' element. React cannot mount App - check index.html for <div id='root'>")
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
