import { useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Users,
  Activity,
  BookOpen,
  Smile,
  X,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Constants for form options
const EMOTION_OPTIONS = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Excited",
  "Fearful",
  "Disgusted",
  "Surprised",
  "Neutral",
  "Frustrated",
  "Lonely",
  "Content",
  "Confused",
];

const PHYSICAL_SENSATIONS = [
  "Headache",
  "Tight Chest",
  "Fatigue",
  "Sweating",
  "Racing Heart",
  "None",
  "Other",
];

const DAILY_ACTIVITIES = [
  "Work / Study",
  "Exercise",
  "Socializing",
  "Leisure / Hobbies",
  "Household Chores",
  "Sleep",
  "Other",
];

const LOCATIONS = ["Home", "Work", "School / University", "Outside", "Other"];

// Add a utility function for error handling
const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return "An unexpected error occurred";
};

// Reusable components
const FormStep = ({ title, icon, children }) => (
  <div className="space-y-6 text-2xl">
    <div className="flex items-center gap-2 border-b-2 border-omori-black pb-4">
      {icon}
      <h2 className="text-3xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const TagInput = ({
  value,
  onChange,
  placeholder,
  maxLength = 50,
  pattern,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const validateInput = (text) => {
    if (pattern && !pattern.test(text)) {
      return "Invalid characters in input";
    }
    if (text.length > maxLength) {
      return `Input must be less than ${maxLength} characters`;
    }
    return "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedInput = input.trim();

      if (!trimmedInput || trimmedInput.length === 0) {
        return;
      }

      const validationError = validateInput(trimmedInput);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (value.includes(trimmedInput)) {
        setError("This item has already been added");
        return;
      }

      onChange([...value, trimmedInput]);
      setInput("");
      setError("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-3 py-1 bg-omori-blue/10 text-omori-blue rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="hover:text-omori-red"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-2 border-2 border-omori-black shadow-omori ${
            error ? "border-red-500" : ""
          }`}
        />
        {error && <p className="text-red-500  mt-1">{error}</p>}
      </div>
    </div>
  );
};

const EmotionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    primaryEmotion: "",
    secondaryEmotion: "",
    emotionIntensity: 4,
    emotionDuration: 1,
    triggers: [],
    physicalSensations: [],
    dailyActivities: [],
    location: "",
    peopleInvolved: [],
    overallDayRating: 5,
    reflection: "",
    gratitude: "",
  });

  // Add scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors([]);
    // if that same value is already present in the field, remove it
    if (formData[name] === value) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const goToNextStep = () => {
    setErrors([]); // Clear errors when moving to next step
    setCurrentStep((prev) => prev + 1);
    scrollToTop();
  };

  const goToPreviousStep = () => {
    setErrors([]); // Clear errors when moving to previous step
    setCurrentStep((prev) => prev - 1);
    scrollToTop();
  };

  const handleArrayInput = (name, value) => {
    setErrors([]);
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((item) => item !== value)
        : [...prev[name], value],
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Check required fields
    if (!formData.primaryEmotion) errors.push("Primary emotion is required");
    if (
      formData.emotionIntensity === null ||
      formData.emotionIntensity === undefined
    )
      errors.push("Emotion intensity is required");
    if (!formData.emotionDuration) errors.push("Emotion duration is required");
    if (!formData.location) errors.push("Location is required");
    if (!formData.triggers || formData.triggers.length === 0)
      errors.push("At least one trigger is required");
    if (!formData.overallDayRating)
      errors.push("Overall day rating is required");

    // Validate ranges
    if (formData.emotionIntensity < 1 || formData.emotionIntensity > 7) {
      errors.push("Emotion intensity must be between 1 and 7");
    }
    if (formData.emotionDuration < 1 || formData.emotionDuration > 24) {
      errors.push("Emotion duration must be between 1 and 24 hours");
    }
    if (formData.overallDayRating < 1 || formData.overallDayRating > 10) {
      errors.push("Overall day rating must be between 1 and 10");
    }

    return [errors.length === 0, errors];
  };

  // Modify submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const [isValid, validationErrors] = validateForm();
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      const token = window.localStorage.getItem("loggedInUser")
        ? JSON.parse(window.localStorage.getItem("loggedInUser")).token
        : null;

      if (!token) {
        toast.error("You must be logged in to submit an emotion log");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const submitData = {
        ...formData,
        triggers: formData.triggers.filter((t) => t.trim()),
        physicalSensations: formData.physicalSensations.filter((s) => s.trim()),
        dailyActivities: formData.dailyActivities.filter((a) => a.trim()),
        peopleInvolved: formData.peopleInvolved.filter((p) => p.trim()),
        emotionIntensity: Number(formData.emotionIntensity),
        emotionDuration: Number(formData.emotionDuration),
        overallDayRating: Number(formData.overallDayRating),
        reflection: formData.reflection.trim(),
        gratitude: formData.gratitude.trim(),
      };

      await toast.promise(axios.post("/api/emotionlogs", submitData, config), {
        loading: "Saving your emotion log...",
        success: "Emotion log saved successfully!",
        error: "Failed to save emotion log",
      });

      // Reset form after successful submission
      setFormData({
        primaryEmotion: "",
        secondaryEmotion: "",
        emotionIntensity: 4,
        emotionDuration: 1,
        triggers: [],
        physicalSensations: [],
        dailyActivities: [],
        location: "",
        peopleInvolved: [],
        overallDayRating: 5,
        reflection: "",
        gratitude: "",
      });

      setErrors([]);
      setCurrentStep(0);
      scrollToTop();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 1: Primary & Secondary Emotions
    <FormStep
      key="step1"
      title="How are you feeling?"
      icon={<Smile className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-4 font-medium">Primary Emotion*</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EMOTION_OPTIONS.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "primaryEmotion", value: emotion },
                  })
                }
                className={`p-4 border-2 border-omori-black shadow-omori transition-colors
                  ${
                    formData.primaryEmotion === emotion
                      ? "bg-omori-red text-white"
                      : "bg-white hover:bg-omori-red/20 active:bg-omori-red/20 focus:bg-omori-red/20"
                  }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-4 font-medium">
            Secondary Emotion (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EMOTION_OPTIONS.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "secondaryEmotion", value: emotion },
                  })
                }
                className={`p-4 border-2 border-omori-black shadow-omori transition-colors
                  ${
                    formData.secondaryEmotion === emotion
                      ? "bg-omori-red text-white"
                      : "bg-white hover:bg-omori-red/20 active:bg-omori-red/20 focus:bg-omori-red/20"
                  }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FormStep>,

    // Step 2: Intensity & Duration
    <FormStep
      key="step2"
      title="Intensity & Duration"
      icon={<Heart className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 font-medium">
            Emotion Intensity (1-7)
          </label>
          <input
            type="range"
            min="1"
            max="7"
            name="emotionIntensity"
            value={formData.emotionIntensity}
            onChange={handleChange}
            className="w-full"
            aria-label="Emotion Intensity"
            aria-valuemin="1"
            aria-valuemax="7"
            aria-valuenow={formData.emotionIntensity}
          />
          <div className="flex justify-between mt-2">
            <span>Mild</span>
            <span>Selected: {formData.emotionIntensity}</span>
            <span>Intense</span>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Duration (hours)</label>
          <input
            type="number"
            min="1"
            max="24"
            name="emotionDuration"
            value={formData.emotionDuration}
            onChange={handleChange}
            className="w-full p-2 border-2 border-omori-black shadow-omori"
          />
        </div>
      </div>
    </FormStep>,

    // Step 3: Triggers & Physical Sensations (continued)
    <FormStep
      key="step3"
      title="Triggers & Sensations*"
      icon={<Activity className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 font-medium">
            What triggered this emotion? (Exercise, Traffic, Weather, Family
            Event, Project Deadline etc.)
          </label>
          <TagInput
            value={formData.triggers}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, triggers: value }))
            }
            placeholder="Type a trigger and press Enter"
            pattern={/^[a-zA-Z0-9\s,.'-]+$/}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block mb-4 font-medium">Physical Sensations</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHYSICAL_SENSATIONS.map((sensation) => (
              <button
                key={sensation}
                type="button"
                onClick={() =>
                  handleArrayInput("physicalSensations", sensation)
                }
                className={`p-3 border-2 border-omori-black shadow-omori transition-colors
                  ${
                    formData.physicalSensations.includes(sensation)
                      ? "bg-omori-red text-white"
                      : "bg-white hover:bg-omori-red/20 active:bg-omori-red/20 focus:bg-omori-red/20"
                  }`}
              >
                {sensation}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FormStep>,

    // Step 4: Activities & Location
    <FormStep
      key="step4"
      title="Activities & Location*"
      icon={<MapPin className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-4 font-medium">Daily Activities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DAILY_ACTIVITIES.map((activity) => (
              <button
                key={activity}
                type="button"
                onClick={() => handleArrayInput("dailyActivities", activity)}
                className={`p-3 border-2 border-omori-black shadow-omori transition-colors
                  ${
                    formData.dailyActivities.includes(activity)
                      ? "bg-omori-red text-white"
                      : "bg-white hover:bg-omori-red/20 active:bg-omori-red/20 focus:bg-omori-red/20"
                  }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-4 font-medium">Location</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "location", value: loc } })
                }
                className={`p-3 border-2 border-omori-black shadow-omori transition-colors
                  ${
                    formData.location === loc
                      ? "bg-omori-red text-white"
                      : "bg-white hover:bg-omori-red/20 active:bg-omori-red/20 focus:bg-omori-red/20"
                  }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FormStep>,

    // Step 5: People & Overall Rating
    <FormStep
      key="step5"
      title="People & Rating"
      icon={<Users className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 font-medium">People Involved</label>
          <TagInput
            value={formData.peopleInvolved}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, peopleInvolved: value }))
            }
            placeholder="Type a name and press Enter"
            pattern={/^[a-zA-Z\s,.'-]+$/}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Overall Day Rating (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            name="overallDayRating"
            value={formData.overallDayRating}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between  mt-2">
            <span>Poor</span>
            <span className="font-medium">
              Rating: {formData.overallDayRating}
            </span>
            <span>Excellent</span>
          </div>
        </div>
      </div>
    </FormStep>,

    // Step 6: Reflection & Gratitude
    <FormStep
      key="step6"
      title="Reflection & Gratitude"
      icon={<BookOpen className="w-6 h-6" />}
    >
      <div className="space-y-8">
        <div>
          <label className="block mb-2 font-medium">
            Reflection (Optional)
          </label>
          <textarea
            name="reflection"
            value={formData.reflection}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent form submission on Enter
              }
            }}
            placeholder="What thoughts or insights would you like to capture about this experience?"
            className="w-full h-32 p-3 border-2 border-omori-black shadow-omori resize-none"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Gratitude (Optional)</label>
          <textarea
            name="gratitude"
            value={formData.gratitude}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent form submission on Enter
              }
            }}
            placeholder="What are you grateful for today?"
            className="w-full h-32 p-3 border-2 border-omori-black shadow-omori resize-none"
          />
        </div>
      </div>
    </FormStep>,
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Toaster position="top-center" />
      {errors.length > 0 && (
        <div className="p-4 mb-4 border border-red-500 bg-red-100 text-red-700">
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Step Indicator */}
        <div className="text-center mb-4">
          <p className="text-lg font-medium">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-omori-blue rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Form Content */}
        <div className="bg-white border-2 border-omori-black p-6 shadow-omori">
          {steps[currentStep]}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-omori-black shadow-omori
                        ${
                          currentStep === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-omori-red/20"
                        }`}
            >
              <ChevronLeft size={20} />
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 bg-omori-blue text-white border-2 border-omori-black 
                shadow-omori transition-colors ${
                  isSubmitting ? "opacity-50" : "hover:bg-omori-red"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Entry"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-4 py-2 border-2 border-omori-black shadow-omori 
             hover:bg-omori-red/20"
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmotionForm;
