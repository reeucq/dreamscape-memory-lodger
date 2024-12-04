// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Calendar,
  PenSquare,
  Smile,
  Clock,
  ArrowUpRight,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEntries: 0,
    streak: 0,
    lastEntry: null,
    recentEmotions: [],
    averageMood: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [advice, setAdvice] = useState({
    text: "",
    loading: true,
    error: null,
  });

  // Add this after other useEffect hooks
  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const response = await axios.get("/api/advice");
        setAdvice({
          text: response.data.advice,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAdvice({
          text: "",
          loading: false,
          error: error.response?.data?.message || "Failed to load advice",
        });
      }
    };

    fetchAdvice();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Add a small delay to ensure auth token is set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch recent emotion logs
        const logsResponse = await axios.get("/api/emotionlogs?limit=5");
        setRecentLogs(logsResponse.data.logs);

        // Calculate statistics from the logs
        const allLogs = logsResponse.data.logs;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Calculate streak
        let currentStreak = 0;
        const sortedDates = allLogs
          .map((log) => new Date(log.createdAt))
          .sort((a, b) => b - a);

        if (sortedDates.length > 0) {
          let lastDate = new Date(sortedDates[0]);
          currentStreak = 1;

          for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const diffDays = Math.floor(
              (lastDate - currentDate) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
              currentStreak++;
              lastDate = currentDate;
            } else {
              break;
            }
          }
        }

        // Calculate average mood
        let averageMood = 0;
        if (allLogs.length > 0) {
          averageMood =
            allLogs.reduce((sum, log) => sum + log.overallDayRating, 0) /
            allLogs.length;
          averageMood = Math.round(averageMood * 10) / 10;
        }

        // Get recent emotions
        const recentEmotions = allLogs
          .slice(0, 5)
          .map((log) => log.primaryEmotion);

        setStats({
          totalEntries: logsResponse.data.pagination.totalLogs,
          streak: currentStreak,
          lastEntry: sortedDates.length > 0 ? sortedDates[0] : null,
          recentEmotions,
          averageMood,
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
        console.error(err);
      }
    };

    // Check if user is authenticated before fetching
    const user = JSON.parse(
      window.localStorage.getItem("loggedInUser") || "{}"
    );
    if (user.token) {
      fetchDashboardData();
    } else {
      setError("Please login to view dashboard");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-omori-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Dreamscape</h1>
        <p className="text-gray-800">
          Track, understand, and visualize your emotional journey
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<PenSquare className="w-6 h-6" />}
          title="Total Entries"
          value={stats.totalEntries}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Current Streak"
          value={`${stats.streak} days`}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Last Entry"
          value={
            stats.lastEntry
              ? new Date(stats.lastEntry).toLocaleDateString()
              : "No entries yet"
          }
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Average Mood"
          value={`${stats.averageMood}/10`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Logs Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border-2 border-omori-black shadow-omori">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Entries</h2>
              <Link
                to="/log"
                className="flex items-center gap-2 text-omori-blue hover:text-omori-red transition-colors"
              >
                New Entry
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No entries yet. Start by adding your first emotion log!
                </p>
              ) : (
                recentLogs.map((log) => (
                  <RecentLogCard key={log.id} log={log} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Analytics Preview */}
        <div className="space-y-8">
          {/* Daily Advice */}
          <DailyAdvice advice={advice} />

          {/* Emotion Distribution Preview */}
          <div className="bg-white p-6 rounded-lg border-2 border-omori-black shadow-omori">
            <h2 className="text-2xl font-bold mb-6">Recent Emotions</h2>
            <div className="space-y-3">
              {stats.recentEmotions.map((emotion, index) => (
                <div
                  key={`${emotion}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span>{emotion}</span>
                  <span className=" text-gray-500">
                    {recentLogs[index]?.createdAt
                      ? new Date(
                          recentLogs[index].createdAt
                        ).toLocaleDateString()
                      : "Date not available"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg border-2 border-omori-black shadow-omori">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-omori-blue/10 rounded-full text-omori-blue">
        {icon}
      </div>
      <div>
        <h3 className=" text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Replace the existing Quick Actions div with this new component
const DailyAdvice = ({ advice }) => (
  <div className="bg-white p-6 rounded-lg border-2 border-omori-black shadow-omori">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-omori-blue/10 rounded-full">
        <Smile className="w-6 h-6 text-omori-blue" />
      </div>
      <h2 className="text-2xl font-bold">Daily Insight</h2>
    </div>

    <div className="space-y-4">
      {advice.loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-omori-blue"></div>
        </div>
      ) : advice.error ? (
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{advice.error}</p>
          <Link
            to="/log"
            className="inline-flex items-center gap-2 mt-2 text-omori-blue hover:text-omori-red"
          >
            <PenSquare className="w-4 h-4" />
            <span>Create your first log</span>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-800 leading-relaxed">{advice.text}</p>
          <div className="pt-4 border-t border-gray-200">
            <Link
              to="/log"
              className="inline-flex items-center gap-2 text-omori-blue hover:text-omori-red"
            >
              <PenSquare className="w-4 h-4" />
              <span>Log today&apos;s emotions</span>
            </Link>
          </div>
        </>
      )}
    </div>
  </div>
);

const RecentLogCard = ({ log }) => (
  <div className="p-4 border-2 border-omori-black rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-bold text-lg">{log.primaryEmotion}</h3>
        <p className=" text-gray-500">
          {new Date(log.createdAt).toLocaleString()}
        </p>
      </div>
      <span className="px-3 py-1 bg-omori-blue/10 text-omori-blue rounded-full ">
        {log.overallDayRating}/10
      </span>
    </div>
    <p className="text-gray-600 line-clamp-2">
      {log.reflection || "No reflection added"}
    </p>
  </div>
);

export default Dashboard;
