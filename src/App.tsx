import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<div className="p-8 text-white">Disease Visualizer — Foundation</div>}
      />
    </Routes>
  )
}
