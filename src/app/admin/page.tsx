'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface User {
  id: string
  username: string
  instagram?: string
  twitter?: string
  birthday: string
  zodiac?: string
  profile_photo?: string
  created_at: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  created_at: string
  sender?: {
    username: string
  }
  receiver?: {
    username: string
  }
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'messages'>('users')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (username),
          receiver:receiver_id (username)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (messagesError) throw messagesError
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return

    try {
      // First delete user's messages
      await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      
      // Then delete user
      const { error } = await supabase.from('users').delete().eq('id', userId)
      
      if (error) throw error
      
      setUsers(users.filter(user => user.id !== userId))
      alert('Kullanıcı başarıyla silindi')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Kullanıcı silinirken hata oluştu')
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId)
      
      if (error) throw error
      
      setMessages(messages.filter(msg => msg.id !== messageId))
      alert('Mesaj başarıyla silindi')
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Mesaj silinirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">🔧 Admin Paneli</h1>
          <p className="text-slate-600 dark:text-slate-400">Astro Match Yönetim Paneli</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            👥 Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            💬 Mesajlar ({messages.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Kayıtlı Kullanıcılar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Doğum Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Burç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sosyal Medya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3">
                            {user.profile_photo ? (
                              <img 
                                src={user.profile_photo} 
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(user.birthday).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {user.zodiac || 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        <div className="space-y-1">
                          {user.instagram && (
                            <div>📷 {user.instagram}</div>
                          )}
                          {user.twitter && (
                            <div>🐦 {user.twitter}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Son Mesajlar</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {message.sender?.username || 'Bilinmeyen'}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {message.receiver?.username || 'Bilinmeyen'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">{message.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(message.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
