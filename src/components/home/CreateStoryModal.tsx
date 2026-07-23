import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

interface CreateStoryModalProps {
  onClose: () => void;
  onStoryCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onStoryCreated }) => {
  const { currentUser } = useAuth();
  const { showToast } = useSocial();

  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);

  const sampleMediaOptions = [
    { type: 'image', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80', label: 'Aurora Night Sky' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', label: 'Tropical Ocean' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80', label: 'Music Studio' },
    { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', label: 'Mountain Hyperlapse' },
  ];

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const finalUrl = mediaUrl || sampleMediaOptions[0].url;

    setLoading(true);
    try {
      const res = await api.createStory({
        userId: currentUser.id,
        mediaUrl: finalUrl,
        mediaType,
      });
      if (res.success) {
        showToast('Story published! Expires in 24 hours.');
        onStoryCreated();
        onClose();
      }
    } catch (e: any) {
      showToast('Error publishing story.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 w-full max-w-md rounded-3xl p-6 shadow-xl relative text-gray-900">
        <button
          onClick={onClose}
          id="btn-close-create-story"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 text-black rounded-2xl border border-gray-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Add to Your Story</h2>
            <p className="text-xs text-gray-500">Visible for 24 hours to your followers</p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* Custom File Upload Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Upload Photo or Video</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 hover:border-black rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all p-4 text-center">
              <Upload className="w-6 h-6 text-black mb-1" />
              <span className="text-xs font-semibold text-gray-800">Choose file or camera capture</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Supports JPG, PNG, MP4</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Or Choose Sample Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {sampleMediaOptions.map((opt) => (
                <button
                  key={opt.url}
                  type="button"
                  onClick={() => {
                    setMediaUrl(opt.url);
                    setMediaType(opt.type as 'image' | 'video');
                  }}
                  className={`p-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                    mediaUrl === opt.url
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {opt.type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Preview */}
          {mediaUrl && (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            id="btn-publish-story"
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing Story...' : 'Publish to Story'}
          </button>
        </form>
      </div>
    </div>
  );
};

