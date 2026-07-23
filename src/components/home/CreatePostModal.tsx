import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, MapPin, Tag, Upload, Save, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const { showToast, refreshData } = useSocial();

  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('#MokSocial #Trending');
  const [location, setLocation] = useState('');
  const [audioName, setAudioName] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePresets = [
    { label: 'Urban Skyline', type: 'image', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Neon Cyberpunk', type: 'image', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Cinematic Mountain', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setMediaUrl(reader.result as string);
          setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (isDraft = false) => {
    if (!currentUser) return;
    const finalMedia = mediaUrl || samplePresets[0].url;

    const tagsArr = hashtagsStr
      .split(' ')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    setLoading(true);

    try {
      const res = await api.createPost({
        userId: currentUser.id,
        mediaUrl: finalMedia,
        mediaType,
        caption,
        hashtags: tagsArr,
        location: location || undefined,
        audioName: audioName || (mediaType === 'video' ? 'Original Audio' : undefined),
        audioAuthor: audioName ? currentUser.fullName : undefined,
        isDraft,
      });

      if (res.success) {
        showToast(isDraft ? 'Saved to drafts!' : 'Post published successfully!');
        await refreshData();
        onPostCreated();
        onClose();
      }
    } catch (e) {
      showToast('Error publishing post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl p-6 shadow-xl relative text-gray-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          id="btn-close-create-post"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Create New Post</h2>

        <div className="space-y-4">
          {/* File Upload / Camera */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Upload Photo or Video</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 hover:border-black rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all p-4 text-center">
              <Upload className="w-6 h-6 text-black mb-1" />
              <span className="text-xs font-semibold text-gray-800">Choose file or camera capture</span>
              <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, MP4</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Preset options */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Or Choose Sample Preset</label>
            <div className="flex gap-2 flex-wrap">
              {samplePresets.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => {
                    setMediaUrl(p.url);
                    setMediaType(p.type as 'image' | 'video');
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                    mediaUrl === p.url
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black h-20 resize-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hashtags</label>
            <input
              type="text"
              value={hashtagsStr}
              onChange={(e) => setHashtagsStr(e.target.value)}
              placeholder="#MokSocial #Vibes"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-black placeholder-gray-400"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Song / Audio Name</label>
              <input
                type="text"
                value={audioName}
                onChange={(e) => setAudioName(e.target.value)}
                placeholder="e.g. Summer Breeze"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black placeholder-gray-400"
              />
            </div>
          </div>

          {/* Action Buttons: Save Draft / Publish */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handlePublish(true)}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-200"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={loading}
              id="btn-publish-post"
              className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" /> {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

