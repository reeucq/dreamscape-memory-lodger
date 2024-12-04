const MoodCard = () => {
  return (
    <div className="text-2xl bg-white border-2 border-omori-black p-6 shadow-omori hover:translate-y-[-2px] transition-transform">
      <h3 className="font-bold mb-4">Today&apos;s Mood</h3>
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl">😔</div>
        <p className="font-medium">Pensive</p>
        <div className="w-full bg-gray-200 h-2">
          <div className="bg-omori-blue h-2 w-3/4"></div>
        </div>
        <p className="text-gray-600">Intensity: 7/10</p>
      </div>
    </div>
  );
};

export default MoodCard;
