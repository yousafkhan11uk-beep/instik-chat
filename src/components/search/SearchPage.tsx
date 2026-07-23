import React, { useState, useEffect } from 'react';
import { Search, X, History, Sparkles } from 'lucide-react';
import { BackButton } from '../common/BackButton.js';
import { User, Post } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useSocial } from '../../context/SocialContext.js';

export const SearchPage: React.FC = () => {
  const { pushScreen } = useSocial();
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['sarah_dev', '#MokSocial', 'alex_art']);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load initial suggested users
    api.searchUsers('').then((res) => {
      if (res.users) setSuggestedUsers(res.users.slice(0, 5));
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [uRes, pRes] = await Promise.all([
          api.searchUsers(query),
          api.getPosts({ hashtag: query.startsWith('#') ? query : `#${query}` }),
        ]);
        if (uRes.users) setUserResults(uRes.users);
        if (pRes.posts) setPostResults(pRes.posts);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (user: User) => {
    if (!recentSearches.includes(user.username)) {
      setRecentSearches([user.username, ...recentSearches.slice(0, 4)]);
    }
    pushScreen({ name: 'user_profile', userId: user.id });
  };

  const removeRecentSearch = (item: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== item));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      {/* Top Header Back Button */}
      <BackButton title="Search" />

      {/* Search Bar Input */}
      <div className="p-4 bg-white border-b border-gray-200 sticky top-14 z-30 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            id="input-search-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, @usernames, #hashtags..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Live Search Results */}
        {query.trim() !== '' && (
          <div className="space-y-6">
            {/* User Results */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Accounts ({userResults.length})</h3>
              {userResults.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No matching accounts found.</p>
              ) : (
                <div className="space-y-2">
                  {userResults.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-600 font-semibold">{u.followersCount} followers</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Results */}
            {postResults.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hashtag Posts ({postResults.length})</h3>
                <div className="grid grid-cols-3 gap-2">
                  {postResults.map((p) => (
                    <div key={p.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative group">
                      <img src={p.mediaUrl} alt={p.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        ❤️ {p.likesCount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default View: Recent Searches & Suggested Users */}
        {query.trim() === '' && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </h3>
                  <button onClick={() => setRecentSearches([])} className="text-xs text-black font-semibold hover:underline">
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 flex items-center gap-2 shadow-xs"
                    >
                      <button onClick={() => setQuery(item.replace('#', ''))} className="hover:text-black">
                        {item}
                      </button>
                      <button onClick={() => removeRecentSearch(item)} className="text-gray-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Users */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-black" /> Suggested Accounts
              </h3>
              <div className="space-y-2">
                {suggestedUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

