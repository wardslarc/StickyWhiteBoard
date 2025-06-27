import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/homepage/home";
import routes from "tempo-routes";
import WhiteBoard from "./components/home"
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drawing" element={<ProtectedRoute><WhiteBoard/></ProtectedRoute>}/>
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
