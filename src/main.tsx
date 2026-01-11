import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return (
    <>
      <header>
        <h1>Prop Firm Trader Journal</h1>
      </header>
      <main>
        <p>Hello World</p>
      </main>
    </>
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
