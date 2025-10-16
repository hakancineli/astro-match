# Astro Match

Doğum tarihine göre insanları keşfet ve tanış.

## Özellikler

- 👤 **Kullanıcı Kaydı/Girişi**: Kullanıcı adı, şifre, sosyal medya hesapları
- 📅 **Doğum Tarihi Takvimi**: Aylık takvim görünümü ile doğum günlerini görüntüleme
- ♈ **Otomatik Burç Hesaplama**: Doğum tarihine göre burç belirleme
- 💬 **Mesajlaşma Sistemi**: Kullanıcılar arası gerçek zamanlı mesajlaşma
- 📷 **Profil Fotoğrafı**: Kullanıcı profil fotoğrafı yükleme
- 🔗 **Sosyal Medya Entegrasyonu**: Instagram ve X (Twitter) linkleri

## Teknolojiler

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS (CDN)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/hakancineli/astro-match.git
cd astro-match
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase-schema.sql` dosyasını çalıştırın
4. Project Settings > API'den URL ve anon key'i alın

### 4. Environment Variables

`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

## Veritabanı Şeması

### Users Tablosu
- `id`: UUID (Primary Key)
- `username`: VARCHAR(50) (Unique)
- `password`: VARCHAR(255)
- `instagram`: VARCHAR(100)
- `twitter`: VARCHAR(100)
- `birthday`: DATE
- `profile_photo`: TEXT
- `zodiac`: VARCHAR(20)
- `created_at`: TIMESTAMP

### Messages Tablosu
- `id`: UUID (Primary Key)
- `sender_id`: UUID (Foreign Key)
- `receiver_id`: UUID (Foreign Key)
- `text`: TEXT
- `created_at`: TIMESTAMP

## API Endpoints

- `GET /api/users` - Tüm kullanıcıları getir
- `POST /api/users` - Yeni kullanıcı oluştur
- `POST /api/auth` - Kullanıcı girişi
- `GET /api/messages` - Mesajları getir
- `POST /api/messages` - Mesaj gönder

## Deployment

### Vercel ile Deploy

1. GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

### Domain Ayarları

Vercel'de domain ayarlarını yapılandırın:
- Root domain için A record: `216.198.79.1`
- WWW subdomain için CNAME: `a5986d336992f4d1.vercel-dns-017.com.`

## Kullanım

1. **Kayıt Ol**: Kullanıcı adı, şifre, sosyal medya hesapları ve doğum tarihi girin
2. **Takvim**: Doğum günlerini görüntüleyin ve tarih seçin
3. **Kullanıcılar**: Aynı doğum gününe sahip kullanıcıları görün
4. **Mesajlaşma**: Diğer kullanıcılarla sohbet edin
5. **Profil**: Profil fotoğrafı yükleyin ve bilgilerinizi güncelleyin

## Lisans

MIT License