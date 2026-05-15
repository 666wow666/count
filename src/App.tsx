import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StarBackground from "@/components/common/StarBackground";
import InputPage from "@/pages/InputPage";
import ResultPage from "@/pages/ResultPage";
import AnalysisPage from "@/pages/AnalysisPage";
import HistoryPage from "@/pages/HistoryPage";
import HistoryDetailPage from "@/pages/HistoryDetailPage";
import ApiConfigPage from "@/pages/ApiConfigPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f3a] to-[#0f0a1f] text-white">
      <StarBackground />
      <Router>
        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history-detail" element={<HistoryDetailPage />} />
          <Route path="/config" element={<ApiConfigPage />} />
        </Routes>
      </Router>
    </div>
  );
}
