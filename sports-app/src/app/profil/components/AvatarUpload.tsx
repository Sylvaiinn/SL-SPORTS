'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  currentUrl: string | null
  username: string | null
  onUploaded: (url: string) => void
}

export default function AvatarUpload({ userId, currentUrl, username, onUploaded }: AvatarUploadProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const displayUrl = preview || currentUrl
  const initial = username?.[0]?.toUpperCase() || '?'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Canvas crop to 256x256
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')!
      const size = Math.min(bitmap.width, bitmap.height)
      const sx = (bitmap.width - size) / 2
      const sy = (bitmap.height - size) / 2
      ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, 256, 256)

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85)
      )

      const path = `${userId}/avatar.jpg`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl + '?t=' + Date.now()

      await supabase.from('profiles').update({ avatar_url: publicUrl } as never).eq('id', userId)
      setPreview(publicUrl)
      onUploaded(publicUrl)
    } catch (err) {
      console.error('Avatar upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => fileRef.current?.click()}>
      <div className="avatar-upload">
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
            fontSize: '1.75rem', fontWeight: 800, color: 'white',
          }}>
            {initial}
          </div>
        )}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={20} color="white" className="animate-spin" />
          </div>
        )}
      </div>
      {/* Camera badge outside overflow:hidden container */}
      <div style={{
        position: 'absolute', bottom: -2, right: -2, width: '1.5rem', height: '1.5rem',
        borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-primary)',
        zIndex: 2, cursor: 'pointer',
      }}>
        <Camera size={10} color="white" />
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  )
}
