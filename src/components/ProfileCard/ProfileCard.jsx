import { useState } from 'react'
import profile from '../../data/profile'

export default function ProfileCard() {
  const [avatarEnlarged, setAvatarEnlarged] = useState(false)

  return (
    <>
      <aside className="profile-card text-center select-none">
        {/* Avatar */}
        <button
          onClick={() => setAvatarEnlarged(true)}
          className="block mx-auto mb-3 group cursor-zoom-in"
          aria-label="放大头像"
        >
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-rule group-hover:border-amber/50 transition-all duration-300 group-hover:shadow-md">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </button>

        {/* Name — directly below avatar */}
        <p className="font-serif text-lg font-semibold text-ink mb-1.5">
          {profile.name}
        </p>

        {/* Signature */}
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          {profile.signature}
        </p>

        {/* Email */}
        {profile.email && (
          <p className="text-sm text-ink-muted tracking-wide mb-3 truncate">
            {profile.email}
          </p>
        )}

        {/* Since */}
        {profile.since && (
          <p className="text-sm text-ink-muted/60 tracking-wide mb-4">
            Since {profile.since}
          </p>
        )}

        {/* Divider */}
        <div className="w-6 h-px bg-rule mx-auto" />
      </aside>

      {/* Avatar lightbox */}
      {avatarEnlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setAvatarEnlarged(false)}
        >
          <button
            onClick={() => setAvatarEnlarged(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center justify-center text-xl"
            aria-label="关闭"
          >
            &#10005;
          </button>
          <img
            src={profile.avatar}
            alt={profile.name}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
