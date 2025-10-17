'use client'

import { useState, useEffect } from 'react'

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

// API Functions
const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users')
    if (response.ok) {
      const data = await response.json()
      return data
    }
    return []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

const createUser = async (userData: any) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to create user')
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Invalid credentials')
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

const fetchMessages = async (senderId: string, receiverId: string) => {
  try {
    const response = await fetch(`/api/messages?sender_id=${senderId}&receiver_id=${receiverId}`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, text }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to send message')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

const fetchInboxMessages = async (userId: string) => {
  try {
    const response = await fetch(`/api/messages/inbox?user_id=${userId}`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching inbox messages:', error)
    return []
  }
}

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
  const [messages, setMessages] = useState<{[key: string]: any[]}>({})
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatWith, setChatWith] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(true)
  const [showInbox, setShowInbox] = useState(false)
  const [inboxMessages, setInboxMessages] = useState<any[]>([])

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      const usersData = await fetchUsers()
      setUsers(usersData)
    }
    loadUsers()
  }, [])

  // Check for saved session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    const savedLoginState = localStorage.getItem('isLoggedIn')
    const savedMonth = localStorage.getItem('currentMonth')
    const savedYear = localStorage.getItem('currentYear')
    
    if (savedUser && savedLoginState === 'true') {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
        
        // Restore calendar position
        if (savedMonth && savedYear) {
          setCurrentMonth(parseInt(savedMonth))
          setCurrentYear(parseInt(savedYear))
        } else if (user.birthday) {
          // Go to user's birthday month
          const birthdayDate = new Date(user.birthday)
          setCurrentMonth(birthdayDate.getMonth())
          setCurrentYear(birthdayDate.getFullYear())
          setSelectedDate(user.birthday)
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegisterMode) {
        // Kayıt ol - tüm alanlar gerekli
        if (!formData.username || !formData.password || !formData.birthday) {
          alert('Lütfen tüm gerekli alanları doldurun!')
          return
        }
        
        const zodiac = getZodiacSign(formData.birthday)
        const userData = {
          username: formData.username,
          password: formData.password,
          instagram: formData.instagram,
          twitter: formData.twitter,
          birthday: formData.birthday,
          zodiac: zodiac,
        }
        
        const newUser = await createUser(userData)
        setUsers(prev => [...prev, newUser])
        setCurrentUser(newUser)
        setIsLoggedIn(true)
        setFormData({ username: '', password: '', instagram: '', twitter: '', birthday: '' })
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(newUser))
        localStorage.setItem('isLoggedIn', 'true')
        
        // Kullanıcının doğum günü ayına git
        const birthdayDate = new Date(formData.birthday)
        setCurrentMonth(birthdayDate.getMonth())
        setCurrentYear(birthdayDate.getFullYear())
        setSelectedDate(formData.birthday)
        
        // Save calendar position to localStorage
        localStorage.setItem('currentMonth', birthdayDate.getMonth().toString())
        localStorage.setItem('currentYear', birthdayDate.getFullYear().toString())
      } else {
        // Giriş yap - sadece kullanıcı adı ve şifre gerekli
        if (!formData.username || !formData.password) {
          alert('Lütfen kullanıcı adı ve şifrenizi girin!')
          return
        }
        
        const user = await loginUser(formData.username, formData.password)
        setCurrentUser(user)
        setIsLoggedIn(true)
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user))
        localStorage.setItem('isLoggedIn', 'true')
        
        // Kullanıcının doğum günü ayına git
        const birthdayDate = new Date(user.birthday)
        setCurrentMonth(birthdayDate.getMonth())
        setCurrentYear(birthdayDate.getFullYear())
        setSelectedDate(user.birthday)
        
        // Save calendar position to localStorage
        localStorage.setItem('currentMonth', birthdayDate.getMonth().toString())
        localStorage.setItem('currentYear', birthdayDate.getFullYear().toString())
      }
    } catch (error) {
      alert('Hata: ' + (error as Error).message)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    
    // Clear localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('currentMonth')
    localStorage.removeItem('currentYear')
  }

  const openInbox = async () => {
    if (currentUser) {
      const inboxData = await fetchInboxMessages(currentUser.id)
      setInboxMessages(inboxData)
      setShowInbox(true)
    }
  }

  const closeInbox = () => {
    setShowInbox(false)
  }

  const getUsersByBirthday = (date: string) => {
    return users.filter(user => {
      // Sadece tarih kısmını karşılaştır (YYYY-MM-DD formatında)
      const userBirthday = user.birthday.split('T')[0] // Tarih kısmını al
      return userBirthday === date
    })
  }

  const formatBirthdayWithYear = (birthday: string) => {
    const date = new Date(birthday)
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const sendMessageToUser = async (toUserId: string, message: string) => {
    if (!message.trim() || !currentUser) return
    
    try {
      const newMsg = await sendMessage(currentUser.id, toUserId, message)
      
      // Add message to current chat immediately
      const messageKey = `${currentUser.id}-${toUserId}`
      const newMessageObj = {
        id: newMsg.id,
        text: newMsg.text,
        sender: currentUser.username,
        timestamp: new Date(newMsg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }
      
      setMessages(prev => ({
        ...prev,
        [messageKey]: [...(prev[messageKey] || []), newMessageObj]
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Mesaj gönderilemedi: ' + (error as Error).message)
    }
  }

  const openChat = async (user: User) => {
    setChatWith(user)
    setShowChat(true)
    
    // Load messages for this chat
    if (currentUser) {
      const messageKey = `${currentUser.id}-${user.id}`
      const messagesData = await fetchMessages(currentUser.id, user.id)
      
      setMessages(prev => ({
        ...prev,
        [messageKey]: messagesData.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender_id === currentUser.id ? currentUser.username : user.username,
          timestamp: new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.sender_id === currentUser.id
        }))
      }))
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && chatWith) {
      sendMessageToUser(chatWith.id, newMessage)
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
    let newMonth = currentMonth
    let newYear = currentYear
    
    if (direction === 'prev') {
      if (currentMonth === 0) {
        newMonth = 11
        newYear = currentYear - 1
      } else {
        newMonth = currentMonth - 1
      }
    } else {
      if (currentMonth === 11) {
        newMonth = 0
        newYear = currentYear + 1
      } else {
        newMonth = currentMonth + 1
      }
    }
    
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    
    // Save to localStorage
    localStorage.setItem('currentMonth', newMonth.toString())
    localStorage.setItem('currentYear', newYear.toString())
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
                onClick={openInbox}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center gap-2"
              >
                📨 Gelen Kutusu
              </button>
              <a 
                href="/admin"
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm flex items-center gap-2"
              >
                🔧 Admin
              </a>
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
              <div className="flex mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isRegisterMode 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Kayıt Ol
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !isRegisterMode 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Giriş Yap
                </button>
              </div>
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
                {isRegisterMode && (
                  <>
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
                      required={isRegisterMode}
                    />
                  </>
                )}
                <button type="submit" className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
                  {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
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
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {formatBirthdayWithYear(user.birthday)}
                              </p>
                              {user.zodiac && (
                                <p className="text-sm text-purple-600 dark:text-purple-400">♈ {user.zodiac}</p>
                              )}
                              <div className="flex gap-2 mt-1">
                                {user.instagram && (
                                  <a 
                                    href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-500"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  </a>
                                )}
                                {user.twitter && (
                                  <a 
                                    href={`https://x.com/${user.twitter.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 hover:text-slate-500"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
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
                  Doğum Tarihi: {formatBirthdayWithYear(selectedUser.birthday)}
                </p>
              </div>
              
              <div className="space-y-3">
                {selectedUser.instagram && (
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://instagram.com/${selectedUser.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-slate-600 dark:text-slate-400">{selectedUser.instagram}</span>
                    </a>
                  </div>
                )}
                {selectedUser.twitter && (
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://x.com/${selectedUser.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-500"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-slate-600 dark:text-slate-400">{selectedUser.twitter}</span>
                    </a>
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

        {/* Gelen Kutusu Modal */}
        {showInbox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">📨 Gelen Kutusu</h3>
                <button 
                  onClick={closeInbox}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inboxMessages.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    Henüz mesajınız yok
                  </p>
                ) : (
                  inboxMessages.map((conversation: any) => (
                    <div 
                      key={conversation.sender.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => {
                        const senderUser = users.find(u => u.id === conversation.sender.id)
                        if (senderUser) {
                          setChatWith(senderUser)
                          setShowChat(true)
                          closeInbox()
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          {conversation.sender.profile_photo ? (
                            <img 
                              src={conversation.sender.profile_photo} 
                              alt={conversation.sender.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              {conversation.sender.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {conversation.sender.username}
                            </p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(conversation.lastMessage.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {conversation.lastMessage.text}
                          </p>
                          {conversation.unreadCount > 1 && (
                            <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                              {conversation.unreadCount} mesaj
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
