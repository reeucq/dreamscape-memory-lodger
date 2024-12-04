import { Calendar, Clock } from "lucide-react";

const EntryCard = ({ entry }) => {
  return (
    <div
      className="text-2xl bg-white border-2 border-omori-black p-4 shadow-omori 
                    hover:translate-y-[-2px] transition-transform"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-3xl">{entry.emoji}</div>
        <div className="text-gray-600 flex flex-col items-end">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{entry.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{entry.time}</span>
          </div>
        </div>
      </div>
      <h4 className="font-bold">{entry.emotion}</h4>
      <p className="text-gray-600 mt-2">{entry.note}</p>
      <div className="flex gap-2 mt-3">
        {entry.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-omori-blue/10 text-omori-blue rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EntryCard;
