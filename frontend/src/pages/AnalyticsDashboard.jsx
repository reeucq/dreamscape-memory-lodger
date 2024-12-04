import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Scatter,
  ScatterChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
import { format } from "date-fns";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9EA1D4",
  "#A8E6CE",
];

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-omori-blue"></div>
    <p className="mt-4 text-lg font-semibold text-omori-black">
      Loading analytics...
    </p>
  </div>
);

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [analyticsData, setAnalyticsData] = useState({
    distribution: {},
    triggers: {},
    patterns: {},
    wellness: {},
    activities: {},
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const token = window.localStorage.getItem("loggedInUser")
          ? JSON.parse(window.localStorage.getItem("loggedInUser")).token
          : null;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [distribution, triggers, patterns, wellness, activities] =
          await Promise.all([
            fetch("/api/analytics/distribution", { headers }).then((r) =>
              r.json()
            ),
            fetch("/api/analytics/triggers", { headers }).then((r) => r.json()),
            fetch("/api/analytics/patterns", { headers }).then((r) => r.json()),
            fetch("/api/analytics/wellness", { headers }).then((r) => r.json()),
            fetch("/api/analytics/activities", { headers }).then((r) =>
              r.json()
            ),
          ]);

        setAnalyticsData({
          distribution,
          triggers,
          patterns,
          wellness,
          activities,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // 1. Emotion Overview Dashboard
  const EmotionDistributionChart = () => (
    <div className="chart-container p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Monthly Emotion Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={Object.entries(
              analyticsData.distribution?.distribution || {}
            ).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {Object.entries(analyticsData.distribution?.distribution || {}).map(
              (entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              )
            )}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const EmotionIntensityTimeline = () => (
    <div className="chart-container p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Emotion Intensity Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={analyticsData.distribution?.timeline || []}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), "MM/dd")}
          />
          <YAxis domain={[1, 7]} />
          <Tooltip
            labelFormatter={(date) => format(new Date(date), "MM/dd/yyyy")}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#8884d8"
            name="Emotion Intensity"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // 2. Trigger Analysis
  const TriggerAnalysis = () => {
    const triggerData = Object.entries(
      analyticsData.triggers?.commonTriggers || {}
    )
      .map(([name, value]) => ({
        name,
        count: value,
        intensity: analyticsData.triggers?.triggerEmotionCorrelation?.[name]
          ? Object.values(
              analyticsData.triggers.triggerEmotionCorrelation[name]
            ).reduce((a, b) => a + b, 0)
          : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Trigger Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="category" dataKey="name" name="Trigger" />
            <YAxis type="number" dataKey="count" name="Frequency" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Triggers" data={triggerData} fill="#8884d8">
              {triggerData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // 3. Daily Patterns
  const DailyPatternsChart = () => {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const chartData = daysOfWeek.map((day) => ({
      day,
      moodRating: analyticsData.patterns?.dailyPatterns?.[day] || 0,
      activityCount: analyticsData.activities
        ? Object.values(analyticsData.activities).filter(
            (a) => a.dayOfWeek === day
          ).length
        : 0,
      intensity:
        analyticsData.distribution?.timeline
          ?.filter(
            (t) =>
              new Date(t.date).toLocaleDateString("en-US", {
                weekday: "long",
              }) === day
          )
          .reduce((acc, curr) => acc + curr.intensity, 0) /
          analyticsData.distribution?.timeline?.filter(
            (t) =>
              new Date(t.date).toLocaleDateString("en-US", {
                weekday: "long",
              }) === day
          ).length || 0,
    }));

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Weekly Patterns Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="day" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar
              name="Mood Rating"
              dataKey="moodRating"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Activity Level"
              dataKey="activityCount"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Radar
              name="Emotional Intensity"
              dataKey="intensity"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const ActivityImpactChart = () => (
    <div className="chart-container p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Activity Impact on Mood</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={Object.entries(analyticsData.patterns?.activityImpact || {})
            .map(([activity, rating]) => ({ activity, rating }))
            .sort((a, b) => b.rating - a.rating)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="activity" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Bar dataKey="rating" fill="#ffc658" name="Average Mood Rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // 4. Wellness Insights
  const PhysicalSensationsChart = () => {
    const { frequency } = analyticsData.wellness?.physicalSensations || {};

    if (!frequency || Object.keys(frequency).length === 0) {
      return (
        <div className="chart-container p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Physical Sensations Frequency
          </h3>
          <p className="text-gray-500">No data available.</p>
        </div>
      );
    }

    const chartData = Object.entries(frequency).map(([sensation, value]) => ({
      sensation,
      frequency: value,
    }));

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Physical Sensations Frequency
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="sensation" />
            <PolarRadiusAxis />
            <Radar
              name="Frequency"
              dataKey="frequency"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const LocationImpactChart = () => {
    const locationData = analyticsData.wellness?.locationImpact || {};

    // Transform data for heatmap
    const emotions = [
      ...new Set(Object.values(locationData).flatMap((e) => Object.keys(e))),
    ];
    const locations = Object.keys(locationData);

    const heatmapData = locations.flatMap((location) =>
      emotions.map((emotion) => ({
        location,
        emotion,
        value: locationData[location]?.[emotion] || 0,
      }))
    );

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow hidden md:block">
        <h3 className="text-lg font-semibold mb-4">Location-Emotion Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            layout="vertical"
            data={heatmapData}
            margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
          >
            <XAxis type="category" dataKey="emotion" />
            <YAxis type="category" dataKey="location" />
            <Tooltip />
            <Legend />
            <CartesianGrid stroke="#f5f5f5" />
            <Scatter
              dataKey="value"
              fill="#8884d8"
              shape={(props) => {
                const { cx, cy, value } = props;
                const size = Math.sqrt(value) * 10;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill={`rgba(136, 132, 216, ${value / 10})`}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const TriggerEmotionCorrelationChart = () => {
    const { triggerEmotionCorrelation } = analyticsData.triggers || {};

    if (
      !triggerEmotionCorrelation ||
      Object.keys(triggerEmotionCorrelation).length === 0
    ) {
      return (
        <div className="chart-container p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Trigger-Emotion Correlation
          </h3>
          <p className="text-gray-500">No correlation data available.</p>
        </div>
      );
    }

    // Get unique emotions and triggers
    const emotions = Array.from(
      new Set(
        Object.values(triggerEmotionCorrelation).flatMap((emotions) =>
          Object.keys(emotions)
        )
      )
    );
    const triggers = Object.keys(triggerEmotionCorrelation);

    // Transform data for heatmap
    const heatmapData = triggers.flatMap((trigger) =>
      emotions.map((emotion) => ({
        trigger,
        emotion,
        value: triggerEmotionCorrelation[trigger]?.[emotion] || 0,
      }))
    );

    // Calculate max value for color scaling
    const maxValue = Math.max(...heatmapData.map((item) => item.value));

    // Custom color scale function
    const getColor = (value) => {
      const intensity = value / maxValue;
      return `rgba(136, 132, 216, ${intensity})`; // Using the theme color with varying opacity
    };

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow hidden md:block">
        <h3 className="text-lg font-semibold mb-4">
          Trigger-Emotion Correlation
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            layout="vertical"
            margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
            data={heatmapData}
          >
            <XAxis
              type="category"
              dataKey="emotion"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis type="category" dataKey="trigger" width={100} />
            <Tooltip
              formatter={(value, name, props) => [
                `Frequency: ${value}`,
                `${props.payload.trigger} → ${props.payload.emotion}`,
              ]}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Scatter
              dataKey="value"
              shape={(props) => {
                const { cx, cy, value } = props;
                const size = Math.max(Math.sqrt(value) * 5, 10); // Minimum size of 10
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={size}
                      fill={getColor(value)}
                      stroke="#8884d8"
                      strokeWidth={1}
                    />
                    {value > 0 && (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="12"
                      >
                        {value}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p>Circle size and color intensity indicate correlation strength</p>
        </div>
      </div>
    );
  };

  const ActivityMoodImpactChart = () => {
    const activityData = analyticsData.activities || {};

    if (!activityData) return null;

    const chartData = Object.entries(activityData).map(([activity, data]) => ({
      activity,
      averageMoodRating: data.averageMoodRating,
    }));

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Average Mood Rating by Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData.sort(
              (a, b) => b.averageMoodRating - a.averageMoodRating
            )}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="activity" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar
              dataKey="averageMoodRating"
              fill="#8884d8"
              name="Average Mood Rating"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const ActivityEmotionDistributionTable = () => {
    const activityData = analyticsData.activities || {};

    if (!activityData) return null;

    const activities = Object.keys(activityData);
    const emotions = Array.from(
      new Set(
        Object.values(activityData).flatMap((data) =>
          Object.keys(data.emotionDistribution)
        )
      )
    );

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow col-span-2">
        <h3 className="text-lg font-semibold mb-4">
          Emotion Distribution by Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Activity</th>
                {emotions.map((emotion) => (
                  <th key={emotion} className="px-4 py-2">
                    {emotion}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity}>
                  <td className="border px-4 py-2">{activity}</td>
                  {emotions.map((emotion) => (
                    <td className="border px-4 py-2" key={emotion}>
                      {activityData[activity].emotionDistribution[emotion] || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ActivityIntensityChart = () => {
    const activityData = analyticsData.activities || {};

    if (!activityData) return null;

    const chartData = Object.entries(activityData).map(([activity, data]) => ({
      activity,
      averageIntensity: data.averageIntensity,
    }));

    return (
      <div className="chart-container p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Average Emotion Intensity by Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData.sort(
              (a, b) => b.averageIntensity - a.averageIntensity
            )}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="activity" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="averageIntensity"
              fill="#82ca9d"
              name="Average Intensity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="analytics-dashboard p-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">
            Emotion Analytics Dashboard
          </h2>

          {/* Section 1: Emotion Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Emotion Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmotionDistributionChart />
              <EmotionIntensityTimeline />
            </div>
          </div>

          {/* Section 2: Trigger Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Trigger Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TriggerAnalysis />
              <TriggerEmotionCorrelationChart />
            </div>
          </div>

          {/* Section 3: Daily Patterns */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Daily Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailyPatternsChart />
              <ActivityImpactChart />
            </div>
          </div>

          {/* Section 4: Wellness Insights */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Wellness Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhysicalSensationsChart />
              <LocationImpactChart />
            </div>
          </div>

          {/* Section 5: Activity Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Activity Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActivityMoodImpactChart />
              <ActivityIntensityChart />
              {/* Remove ActivityEmotionDistributionChart from here */}
            </div>
            {/* Add the table as a full-width component */}
            <div className="grid grid-cols-1 mt-6">
              <ActivityEmotionDistributionTable />
            </div>
          </div>
          <div className="text-center text-gray-500 p-4 md:hidden">
            <p>For more charts, visit on a larger screen</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
