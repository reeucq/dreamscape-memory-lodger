// pages/Profile.jsx
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import axios from "axios";

const AVATAR_STYLES = [
  "pixel-art",
  "adventurer",
  "bottts",
  "big-ears",
  "croodles",
  "lorelei",
  "notionists",
  "thumbs",
];

const Profile = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("pixel-art");
  const [avatarSeed, setAvatarSeed] = useState("1");

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const loggedUserJSON = window.localStorage.getItem("loggedInUser");
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON);

        try {
          const response = await axios.get(`/api/users/${user.id}`);
          const userData = response.data;
          setFormData({
            username: userData.username,
            name: userData.name,
            bio: userData.bio || "",
            profilePicture: userData.profilePicture,
          });

          // Extract avatar style and seed from existing profilePicture if it exists
          if (userData.profilePicture) {
            const urlParts = userData.profilePicture.split("/");
            const styleIndex = urlParts.findIndex((part) =>
              AVATAR_STYLES.includes(part)
            );
            if (styleIndex !== -1) {
              setSelectedStyle(urlParts[styleIndex]);
              setAvatarSeed(urlParts[urlParts.length - 1].split(".")[0]);
            }
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    };

    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the avatar URL construction
  const getAvatarUrl = (style, seed) => {
    return encodeURI(`https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`);
  };

  const generateNewAvatar = () => {
    const newSeed = Math.random().toString(36).substring(2, 8); // Generate a random seed
    setAvatarSeed(newSeed);
    const newAvatarUrl = getAvatarUrl(selectedStyle, newSeed);
    setFormData((prev) => ({
      ...prev,
      profilePicture: newAvatarUrl,
    }));
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    const newAvatarUrl = getAvatarUrl(selectedStyle, avatarSeed);
    setFormData((prev) => ({
      ...prev,
      profilePicture: newAvatarUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedUserJSON = window.localStorage.getItem("loggedInUser");
      const user = JSON.parse(loggedUserJSON);

      await axios.put(`/api/users/${user.id}`, formData);

      // Update localStorage with new user data
      const updatedUserData = { ...user, ...formData };
      window.localStorage.setItem(
        "loggedInUser",
        JSON.stringify(updatedUserData)
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white border-2 border-omori-black p-6 shadow-omori">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="space-y-4 text-center">
            <img
              src={
                formData.profilePicture ||
                getAvatarUrl(selectedStyle, avatarSeed)
              }
              alt="Avatar"
              className="w-32 h-32 mx-auto border-2 border-omori-black shadow-omori"
              onError={(e) => {
                console.error("Image failed to load:", e);
                e.target.src = getAvatarUrl(selectedStyle, avatarSeed);
              }}
            />

            {/* Avatar Style Selection */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleChange(style)}
                  className={`px-3 py-1  border-2 border-omori-black rounded
                    ${
                      selectedStyle === style
                        ? "bg-omori-blue text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {style.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Generate New Avatar Button */}
            <button
              type="button"
              onClick={generateNewAvatar}
              className="px-4 py-2 bg-omori-red text-white border-2 border-omori-black 
                       shadow-omori hover:bg-omori-red/90 transition-colors"
            >
              Generate New Avatar
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-4">Profile Settings</h1>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block  font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              title="Username must contain only letters and numbers"
              required
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="block  font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z\s'-]+"
              title="Name must contain only letters, spaces, hyphens, and apostrophes"
              required
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block  font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              maxLength={200}
              className="w-full p-2 border-2 border-omori-black shadow-omori resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-omori-blue hover:bg-omori-red text-white px-6 py-3 
                     border-2 border-omori-black shadow-omori transition-colors
                     flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
