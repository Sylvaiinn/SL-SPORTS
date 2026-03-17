'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Palette, ImageIcon, Loader2 } from 'lucide-react'

const PRESET_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#6366f1']

interface BannerEditorProps {
  userId: string
  currentColor: string | null
  currentUrl: string | null
  onUpdated: (color: string | null, url: string | null) => void
}

export default function BannerEditor({ userId, currentColor, onUpdated }: BannerEditorProps) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  async function setColor(color: string) {
    await supabase.from('profiles').update({ banner_color: color, banner_url: null } as never).eq('id', userId)
    onUpdated(color, null)
    setShowPicker(false)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${userId}/banner.jpg`
      const { error: upErr } = await supabase.storage.from('banners').upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(path)
      const publicUrl = urlData.publicUrl + '?t=' + Date.now()
      await supabase.from('profiles').update({ banner_url: publicUrl, banner_color: null } as never).eq('id', userId)
      onUpdated(null, publicUrl)
    } catch (err) {
      console.error('Banner upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setShowPicker(!showPicker)} className="btn btn-ghost btn-sm">
          <Palette size={14} /> Couleur
        </button>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-ghost btn-sm">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          Image
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      {showPicker && (
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: '2rem', height: '2rem', borderRadius: '0.5rem', border: `2px solid ${currentColor === c ? 'white' : 'transparent'}`,
              background: c, cursor: 'pointer', transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
