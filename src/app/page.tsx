'use client'

import { useState } from 'react'

interface User {
  id: string
  username: string
  instagram: string
  twitter: string
  birthday: string
  createdAt: string
  profilePhoto?: string
  zodiac?: string
}

interface Message {
  id: string
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
}

// Burç hesaplama fonksiyonu
const getZodiacSign = (birthday: string): string => {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Koç'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Boğa'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'İkizler'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Yengeç'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Aslan'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Başak'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Terazi'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Akrep'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Yay'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Oğlak'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Kova'
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Balık'
  
  return 'Bilinmiyor'
}

// Ay isimleri
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

// Gün isimleri
const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export default function Page() {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    instagram: '',
    twitter: '',
    birthday: ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [messages, setMessages] = useState<{[key: string]: Message[]}>({})
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatWith, setChatWith] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      // Kayıt ol
      const zodiac = getZodiacSign(formData.birthday)
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        instagram: formData.instagram,
        twitter: formData.twitter,
        birthday: formData.birthday,
        zodiac: zodiac,
        createdAt: new Date().toISOString()
      }
      setUsers(prev => [...prev, newUser])
      setCurrentUser(newUser)
      setIsLoggedIn(true)
      setFormData({ username: '', password: '', instagram: '', twitter: '', birthday: '' })
      
      // Kullanıcının doğum günü ayına git
      const birthdayDate = new Date(formData.birthday)
      setCurrentMonth(birthdayDate.getMonth())
      setCurrentYear(birthdayDate.getFullYear())
      setSelectedDate(formData.birthday)
    } else {
      // Giriş yap
      const user = users.find(u => u.username === formData.username)
      if (user) {
        setCurrentUser(user)
        setIsLoggedIn(true)
        
        // Kullanıcının doğum günü ayına git
        const birthdayDate = new Date(user.birthday)
        setCurrentMonth(birthdayDate.getMonth())
        setCurrentYear(birthdayDate.getFullYear())
        setSelectedDate(user.birthday)
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  const getUsersByBirthday = (date: string) => {
    return users.filter(user => {
      // Sadece tarih kısmını karşılaştır (YYYY-MM-DD formatında)
      const userBirthday = user.birthday.split('T')[0] // Tarih kısmını al
      return userBirthday === date
    })
  }

  const sendMessage = (toUserId: string, message: string) => {
    if (!message.trim()) return
    
    const messageKey = `${currentUser?.id}-${toUserId}`
    const reverseKey = `${toUserId}-${currentUser?.id}`
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    
    setMessages(prev => ({
      ...prev,
      [messageKey]: [...(prev[messageKey] || []), {
        id: Date.now().toString(),
        text: message,
        sender: currentUser?.username || '',
        timestamp: timestamp,
        isOwn: true
      }],
      [reverseKey]: [...(prev[reverseKey] || []), {
        id: Date.now().toString(),
        text: message,
        sender: currentUser?.username || '',
        timestamp: timestamp,
        isOwn: false
      }]
    }))
  }

  const openChat = (user: User) => {
    setChatWith(user)
    setShowChat(true)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && chatWith) {
      sendMessage(chatWith.id, newMessage)
      setNewMessage('')
    }
  }

  // Takvim fonksiyonları
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const formatDateForBirthday = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0')
    const dayStr = day.toString().padStart(2, '0')
    return `${currentYear}-${month}-${dayStr}`
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && currentUser) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        setCurrentUser(prev => prev ? {...prev, profilePhoto: photoUrl} : null)
        setUsers(prev => prev.map(user => 
          user.id === currentUser.id ? {...user, profilePhoto: photoUrl} : user
        ))
      }
      reader.readAsDataURL(file)
    }
  }

  const openUserProfile = (user: User) => {
    setSelectedUser(user)
    setShowProfile(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#0b0f25] dark:to-[#070915] text-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-semibold">Astro Match</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Doğum tarihine göre insanları keşfet.</p>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <span className="text-sm">Hoş geldin, {currentUser?.username}!</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm"
              >
                Çıkış
              </button>
            </div>
          )}
        </header>

        {!isLoggedIn ? (
          <section className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur p-6">
              <h2 className="font-medium mb-4 text-center">Kayıt Ol / Giriş Yap</h2>
            <div className="grid grid-cols-1 gap-3">
                <input 
                  className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-indigo-400" 
                  placeholder="Kullanıcı Adı" 
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                  required
                />
                <input 
                  type="password"
                  className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-indigo-400" 
                  placeholder="Şifre" 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  required
                />
                <input 
                  className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-indigo-400" 
                  placeholder="Instagram (@kullaniciadi)" 
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({...prev, instagram: e.target.value}))}
                />
                <input 
                  className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-indigo-400" 
                  placeholder="X (Twitter) (@kullaniciadi)" 
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({...prev, twitter: e.target.value}))}
                />
                <input 
                  type="date" 
                  className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded px-3 py-2 outline-none focus:ring-2 ring-indigo-400" 
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({...prev, birthday: e.target.value}))}
                  required
                />
                <button type="submit" className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
                  Kayıt Ol / Giriş Yap
                </button>
            </div>
          </form>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gelişmiş Takvim */}
            <div className="rounded-xl border border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur p-4">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded"
                >
                  ←
                </button>
                <h2 className="font-medium text-lg">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded"
                >
                  →
                </button>
              </div>
              
              {/* Gün isimleri */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Takvim günleri */}
            <div className="grid grid-cols-7 gap-2 text-sm">
                {(() => {
                  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
                  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
                  const days = []
                  
                  // Boş günler
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
                  }
                  
                  // Ayın günleri
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = formatDateForBirthday(day)
                    const birthdayUsers = getUsersByBirthday(dateStr)
                    const isSelected = selectedDate === dateStr
                    
                    days.push(
                      <div 
                        key={day} 
                        className={`aspect-square rounded-lg border border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 relative ${
                          birthdayUsers.length > 0 ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-white/60 dark:bg-white/5'
                        } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        {day}
                        {birthdayUsers.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    )
                  }
                  
                  return days
                })()}
              </div>
            </div>

            {/* Seçilen tarihteki kullanıcılar */}
            <div className="rounded-xl border border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur p-4">
              <h2 className="font-medium mb-3">
                {selectedDate ? `${selectedDate} Tarihinde Doğanlar` : 'Tarih Seçin'}
              </h2>
              {selectedDate && (
                <div className="space-y-3">
                  {getUsersByBirthday(selectedDate).map(user => (
                    <div key={user.id} className="p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                      <div className="flex items-start gap-3">
                        {/* Profil fotoğrafı */}
                        <div className="w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center overflow-hidden">
                          {user.profilePhoto ? (
                            <img 
                              src={user.profilePhoto} 
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{user.username}</h3>
                              {user.zodiac && (
                                <p className="text-sm text-purple-600 dark:text-purple-400">♈ {user.zodiac}</p>
                              )}
                              {user.instagram && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">📷 {user.instagram}</p>
                              )}
                              {user.twitter && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">🐦 {user.twitter}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openUserProfile(user)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
                              >
                                Profil
                              </button>
                              {user.id !== currentUser?.id ? (
                                <button 
                                  onClick={() => openChat(user)}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded"
                                >
                                  💬 Chat
                                </button>
                              ) : (
                                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                                  Sen
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getUsersByBirthday(selectedDate).length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400">Bu tarihte doğan kimse yok.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Profil Modal */}
        {showProfile && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedUser.username} Profili</h3>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center overflow-hidden mx-auto mb-4">
                  {selectedUser.profilePhoto ? (
                    <img 
                      src={selectedUser.profilePhoto} 
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-600 dark:text-indigo-300 font-medium text-2xl">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <h4 className="text-lg font-medium">{selectedUser.username}</h4>
                {selectedUser.zodiac && (
                  <p className="text-purple-600 dark:text-purple-400">♈ {selectedUser.zodiac}</p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Doğum Tarihi: {new Date(selectedUser.birthday).toLocaleDateString('tr-TR')}
                </p>
              </div>
              
              <div className="space-y-3">
                {selectedUser.instagram && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📷</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedUser.instagram}</span>
                  </div>
                )}
                {selectedUser.twitter && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐦</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedUser.twitter}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    setShowProfile(false)
                    openChat(selectedUser)
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded"
                >
                  💬 Chat Başlat
                </button>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 px-4 rounded"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Chat Arayüzü */}
        {showChat && chatWith && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md h-[600px] flex flex-col shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center overflow-hidden">
                    {chatWith.profilePhoto ? (
                      <img 
                        src={chatWith.profilePhoto} 
                        alt={chatWith.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                        {chatWith.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{chatWith.username}</h3>
                    {chatWith.zodiac && (
                      <p className="text-xs text-purple-600 dark:text-purple-400">♈ {chatWith.zodiac}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2"
                >
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(() => {
                  const messageKey = `${currentUser?.id}-${chatWith.id}`
                  const chatMessages = messages[messageKey] || []
                  
                  return chatMessages.map((message: any) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isOwn 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-indigo-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fotoğraf Yükleme Modal */}
        {isLoggedIn && currentUser && (
          <div className="fixed bottom-4 right-4">
            <label className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full cursor-pointer shadow-lg">
              📷
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </main>
  )
}
