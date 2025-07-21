import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SecondTab from "./pages/SecondTab";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/second-tab" element={<SecondTab />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;