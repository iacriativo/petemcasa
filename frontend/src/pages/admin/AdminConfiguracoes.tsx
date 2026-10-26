import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<{ condominium_name: string; whatsapp_number: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('condominium_name, whatsapp_number')
        .eq('id', 1)
        .single()

      if (error) throw error
      setSettings(data)
    } catch {
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ condominium_name: settings.condominium_name, whatsapp_number: settings.whatsapp_number })
        .eq('id', 1)

      if (error) throw error
      setMessage('Salvo com sucesso')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Configurações</h2>
        <div className="admin__empty">Carregando configurações...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="admin__section">
        <h2 className="admin__section-title">Configurações</h2>
        <div className="admin__empty">Configurações não encontradas.</div>
      </div>
    )
  }

  return (
    <div className="admin__section">
      <div className="admin__section-head">
        <h2 className="admin__section-title">Configurações</h2>
      </div>
      {message && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: 10, borderRadius: 10, marginBottom: 16, fontSize: 13, border: '1px solid #bbf7d0' }}>
          {message}
        </div>
      )}
      <form onSubmit={saveSettings} className="admin__form">
        <div className="admin__form-group">
          <label className="admin__form-label">Nome do condomínio</label>
          <input
            className="admin__form-input"
            type="text"
            value={settings.condominium_name}
            onChange={(e) => setSettings({ ...settings, condominium_name: e.target.value })}
            required
          />
        </div>
        <div className="admin__form-group">
          <label className="admin__form-label">Número do WhatsApp</label>
          <input
            className="admin__form-input"
            type="text"
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
            placeholder="5511999999999"
            required
          />
        </div>
        <button type="submit" className="admin__btn admin__btn--primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  )
}
