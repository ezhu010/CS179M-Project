import './App.css';
import ShipGrid from './components/ShipGrid';
import LogForm from './components/LogForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom";

function App() {
  return (
   <div>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShipGrid />}/>
          <Route path="logform" element={<LogForm />} />
      </Routes>
    </BrowserRouter>
      
    </div>
  )
}

export default App;