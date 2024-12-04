import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickAddCard = () => {
  const navigate = useNavigate();

  return (
    <div className="text-2xl bg-white border-2 border-omori-black p-6 shadow-omori hover:translate-y-[-2px] transition-transform">
      <h3 className="font-bold mb-4">Quick Add Entry</h3>
      <button
        onClick={() => navigate("/log")}
        className="w-full bg-omori-blue hover:bg-omori-red text-white px-6 py-4 
                 border-2 border-omori-black shadow-omori transition-colors
                 flex items-center justify-center gap-2"
      >
        <Plus size={24} />
        <span>New Entry</span>
      </button>
    </div>
  );
};

export default QuickAddCard;
