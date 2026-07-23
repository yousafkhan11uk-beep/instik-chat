import React from 'react';
import { Plus } from 'lucide-react';
import { Story } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

interface StoriesBarProps {
  stories: Story[];
  onOpenCreateStory: () => void;
  onOpenViewStory: (story: Story) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onOpenCreateStory, onOpenViewStory }) => {
  const { currentUser } = useAuth();

  // Group stories by userId
  const storyUsersMap: Record<string, Story[]> = {};
  stories.forEach((s) => {
    if (!storyUsersMap[s.userId]) storyUsersMap[s.userId] = [];
    storyUsersMap[s.userId].push(s);
  });

  const uniqueUserStoryList = Object.values(storyUsersMap).map((userStories) => userStories[0]);

  return (
    <div className="py-4 px-6 border-b border-gray-200 bg-white overflow-x-auto no-scrollbar flex items-center gap-6">
      {/* 1. Your Story (+) */}
      <button
        id="btn-your-story"
        onClick={onOpenCreateStory}
        className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-transform"
      >
        <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-gray-200 group-hover:border-black transition-colors">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
            alt="Your Story"
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-white text-white shadow-sm">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
        <span className="text-xs font-medium text-gray-800 tracking-tight">Your Story</span>
      </button>

      {/* 2. Friends' Stories */}
      {uniqueUserStoryList.map((story) => {
        const isViewed = currentUser ? story.views.some((v) => v.userId === currentUser.id) : false;

        return (
          <button
            key={story.id}
            id={`btn-story-user-${story.username}`}
            onClick={() => onOpenViewStory(story)}
            className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-transform"
          >
            <div
              className={`w-16 h-16 rounded-full p-[2.5px] transition-all ${
                isViewed
                  ? 'border-2 border-gray-200'
                  : 'story-gradient p-[2.5px]'
              }`}
            >
              <div className="w-full h-full bg-white rounded-full p-0.5">
                <img src={story.userAvatar} alt={story.username} className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 tracking-tight max-w-[64px] truncate">
              {story.username}
            </span>
          </button>
        );
      })}
    </div>
  );
};

