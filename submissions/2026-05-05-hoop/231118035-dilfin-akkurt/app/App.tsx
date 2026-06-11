import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Share,
  Platform,
  Linking,
  Modal
} from 'react-native';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import { AVATAR_HTML } from './avatarHTML';

const { width, height } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

interface ForgeCycle {
  cycle: number;
  reportName: string;
  hypothesis: string;
  result: 'Success' | 'Rollback' | 'STUCK' | 'Pending';
  changedFiles: string;
  test: string;
  commitHash: string;
  weight: string;
  touchPoints: number;
}

export default function App() {
  // Navigation Tabs: 'capture' | 'avatar' | 'forge'
  const [activeTab, setActiveTab] = useState<'capture' | 'avatar' | 'forge'>('avatar');

  // STEP 0: Capture & Enrich state (original code preserved/extended)
  const [step, setStep] = useState<number>(0);
  const [idea, setIdea] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('Track A');
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [specName, setSpecName] = useState<string>('');
  const [generatedSpec, setGeneratedSpec] = useState<string>('');

  // 3D Avatar & Mic variables
  const [modelUri, setModelUri] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  // Dictated Audit reports state
  const [dictatedReports, setDictatedReports] = useState<Array<{
    id: string;
    title: string;
    content: string;
    status: 'Pending' | 'Forged';
  }>>([
    {
      id: 'report-1',
      title: 'Home UI Button Alignment (Dikte Edildi)',
      content: '### Audit Raporu: Home Buton Çakışması\n- **Tip:** UI/UX Hatası\n- **Açıklama:** Ana sayfadaki devam et ve sıfırla butonları dar ekranlarda üst üste biniyor.\n- **Çözüm Önerisi:** Buton konteynerine flex-wrap eklenmeli ve padding değeri 16px seviyesine çıkarılmalı.',
      status: 'Forged'
    },
    {
      id: 'report-2',
      title: 'Profile Loader Performance (Dikte Edildi)',
      content: '### Audit Raporu: Profil Yükleyici Gecikmesi\n- **Tip:** Performans Hatası\n- **Açıklama:** Profil bilgileri yüklenirken spinner rengi gri kalıyor ve donuyor.\n- **Çözüm Önerisi:** ActivityIndicator rengini neon mor (#a855f7) olarak güncelle ve asenkron yüklemeyi optimize et.',
      status: 'Forged'
    }
  ]);

  const [dictationText, setDictationText] = useState<string>('');
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [selectedDictationTemplate, setSelectedDictationTemplate] = useState<number | null>(null);

  const dictationTemplates = [
    {
      title: 'Rapor 3: Ayarlar Kontrastı',
      text: 'Ayarlar sayfasındaki koyu mod renk kontrastı çok düşük. Tüm başlık metinlerini beyaza çevir ve arka planı daha koyu gri yaparak okunabilirliği artır.',
      md: '### Audit Raporu: Ayarlar Koyu Mod Kontrastı\n- **Tip:** UI/UX Zenginleştirme\n- **Açıklama:** Ayarlar sayfasındaki gri metinler koyu arka plan üzerinde okunmuyor.\n- **Çözüm Önerisi:** Metin renklerini #ffffff ve arka planı #0a0a14 olarak güncelle.'
    },
    {
      id: 'stuck-trigger',
      title: 'Rapor 4: Grafikler Render Hatası (Stuck Tetikleyici)',
      text: 'Analiz sayfasındaki SVG grafik kütüphanesi NPM paket çakışması yüzünden çökmekte. Grafik paketini zorla güncelle ve hata durumunda yedek statik bar göster.',
      md: '### Audit Raporu: Grafik Kütüphanesi Çökmesi\n- **Tip:** Paket Çakışması (CRITICAL)\n- **Açıklama:** Grafik render edilirken react-native-svg ve react-native-canvas paketleri çakışıyor ve app çöküyor.\n- **Çözüm Önerisi:** Bağımlılık ağacını temizle veya grafiği saf HTML canvas ile çiz.'
    }
  ];

  // Forge Loop State
  const [forgeCycles, setForgeCycles] = useState<ForgeCycle[]>([
    { cycle: 1, reportName: 'report-1-home.md', hypothesis: 'Ana sayfadaki butonların paddingini artır ve wrap ekle', result: 'Success', changedFiles: 'app/App.tsx', test: 'PASS', commitHash: 'f0a1b2c', weight: '2kg', touchPoints: 0 },
    { cycle: 2, reportName: 'report-2-profile.md', hypothesis: 'Profil loading spinner rengini mor yap ve optimize et', result: 'Success', changedFiles: 'app/App.tsx', test: 'PASS', commitHash: 'c3b4a5d', weight: '1kg', touchPoints: 0 },
    { cycle: 3, reportName: 'report-3-settings.md', hypothesis: 'Ayarlar arka planını siyaha çekerek kontrastı yükselt', result: 'Rollback', changedFiles: 'app/_layout.tsx', test: 'FAIL', commitHash: 'e6f7g8h', weight: '5kg', touchPoints: 0 },
    { cycle: 4, reportName: 'report-3-settings.md', hypothesis: 'Sadece settings ekranındaki metinleri #ffffff yap', result: 'Success', changedFiles: 'app/App.tsx', test: 'PASS', commitHash: 'h9i0j1k', weight: '1kg', touchPoints: 0 }
  ]);
  const [forgeLoading, setForgeLoading] = useState<boolean>(false);
  const [forgeConsole, setForgeConsole] = useState<string[]>([]);
  const [isStuck, setIsStuck] = useState<boolean>(false);
  
  // WebRTC Expert Bridge State
  const [expertCallActive, setExpertCallActive] = useState<boolean>(false);
  const [expertCallTimer, setExpertCallTimer] = useState<number>(0);
  const [jitsiVisible, setJitsiVisible] = useState<boolean>(false);

  // Load avatar .glb asset
  useEffect(() => {
    async function getModelAsset() {
      try {
        const asset = Asset.fromModule(require('./assets/model.glb'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        setModelUri(uri);
      } catch (err) {
        console.warn('Could not load local GLB asset, using public fallback:', err);
        setModelUri('https://models.readyplayer.me/648a58f44ff53e5e4d29f9e3.glb'); // ready player me fallback mesh
      }
    }
    getModelAsset();
  }, []);

  // Send model URL to WebView once loaded
  const sendModelPath = () => {
    if (modelUri) {
      const msg = JSON.stringify({ type: 'loadModel', url: modelUri });
      if (Platform.OS === 'web') {
        if (iframeRef.current) {
          iframeRef.current.postMessage(msg, '*');
        }
      } else {
        if (webViewRef.current) {
          webViewRef.current.postMessage(msg);
        }
      }
    }
  };

  useEffect(() => {
    if (modelUri) {
      setTimeout(sendModelPath, 1500);
    }
  }, [modelUri, activeTab]);

  // Start Mic Recording via expo-av
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Mikrofon izni verilmedi. 3D Lipsync için mikrofona erişim gereklidir.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      // Prepare recording settings
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      });

      newRecording.setProgressUpdateInterval(50); // Fast metering updates for low latency (<200ms)
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          const db = status.metering;
          let volume = 0;
          if (db > -160) {
            // Map dB from -50 (silent) to 0 (loudest) to linear 0 to 1
            const minDb = -55;
            volume = Math.max(0, (db - minDb) / -minDb);
            // Saturation for higher lipsync sensitivity
            volume = Math.min(1.0, volume * 1.6);
          }
          
          // Send volume to WebView/iframe
          const msg = JSON.stringify({ type: 'volume', value: volume });
          if (Platform.OS === 'web') {
            if (iframeRef.current) iframeRef.current.postMessage(msg, '*');
          } else {
            if (webViewRef.current) webViewRef.current.postMessage(msg);
          }
          setLocalVolume(volume);
        }
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop Mic Recording
  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setLocalVolume(0);
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Simulate Speech-to-Text Dictation
  const handleDictateTemplate = (index: number) => {
    if (isDictating) return;
    
    setSelectedDictationTemplate(index);
    setIsDictating(true);
    setDictationText('');
    
    const templateText = dictationTemplates[index].text;
    const words = templateText.split(' ');
    let wordIndex = 0;
    
    // Start microphone to let the avatar mouth move in sync
    startRecording();

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        // Send simulated voice volume peaks to make the lipsync match typing
        const mockVolume = 0.3 + Math.random() * 0.7;
        const msg = JSON.stringify({ type: 'volume', value: mockVolume });
        if (Platform.OS === 'web') {
          if (iframeRef.current) iframeRef.current.postMessage(msg, '*');
        } else {
          if (webViewRef.current) webViewRef.current.postMessage(msg);
        }

        setDictationText((prev) => prev + (wordIndex === 0 ? '' : ' ') + words[wordIndex]);
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsDictating(false);
        stopRecording();
        
        // Add new report to list
        const newReport = {
          id: `report-${Date.now()}`,
          title: dictationTemplates[index].title + ' (Ses Kaydı)',
          content: dictationTemplates[index].md,
          status: 'Pending' as const
        };
        setDictatedReports((prev) => [...prev, newReport]);
      }
    }, 120); // Dictation typing speed
  };

  // Simulate Coding Agent Forge Cycles
  const runForgeCycle = () => {
    if (forgeLoading) return;

    setForgeLoading(true);
    setForgeConsole([]);

    const pending = dictatedReports.filter(r => r.status === 'Pending');
    const logs: string[] = [];
    
    const writeLog = (text: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          logs.push(text);
          setForgeConsole([...logs]);
          resolve();
        }, delay);
      });
    };

    const executeCycle = async () => {
      await writeLog('⚙️ FORGE CYCLE BAŞLATILDI...', 200);
      await writeLog('🔎 Sıradaki bekleyen audit raporu aranıyor...', 600);

      if (pending.length === 0) {
        await writeLog('✅ Bekleyen yeni rapor bulunamadı. Sistem kararlı.', 800);
        setForgeLoading(false);
        return;
      }

      const activeReport = pending[0];
      await writeLog(`📂 Dosya okundu: ${activeReport.title}`, 600);
      await writeLog('🤖 [READ] Kod ağacı analiz ediliyor...', 800);
      await writeLog('📍 [LOCATE] İlgili bileşen tespit edildi: App.tsx', 800);
      
      if (activeReport.title.includes('Grafikler')) {
        // STUCK TRIGGER SCENARIO
        await writeLog('⚠️ [HYPOTHESIZE] Çakışan NPM grafik kütüphanesi force-install ediliyor...', 1000);
        await writeLog('🔨 [REPAIR] app.json ve package.json güncellendi.', 1000);
        await writeLog('🧪 [TEST] Metro bundler başlatılıyor ve test suite koşuluyor...', 1200);
        await writeLog('❌ [FAIL] Metro derleme hatası: Duplicate declaration of Canvas!', 1200);
        await writeLog('⏪ [ROLLBACK] Değişiklikler geri alınıyor (git restore)...', 800);
        await writeLog('🤖 [HYPOTHESIZE - 2. Döngü] SVG paketi manuel shimleniyor...', 1000);
        await writeLog('🔨 [REPAIR - 2. Döngü] tsconfig.json ve App.tsx güncellendi.', 1000);
        await writeLog('🧪 [TEST - 2. Döngü] Test suite tekrar koşuluyor...', 1200);
        await writeLog('❌ [FAIL - 2. Döngü] Metro derleme hatası: Duplicate declaration of Canvas!', 1200);
        await writeLog('💥 [ROLLBACK - 2. Döngü] Değişiklikler geri alındı.', 800);
        await writeLog('🚨 STUCK HATA: Kod onarılamadı. 2 cycle üst üste FAIL aldık!', 800);
        await writeLog('🛑 Uzman köprüsüne (WebRTC) çağrı açılması gerekiyor!', 600);
        
        // Add STUCK cycle to ledger
        const newCycle: ForgeCycle = {
          cycle: forgeCycles.length + 1,
          reportName: 'report-4-graphics.md',
          hypothesis: 'Zorla NPM paketi yüklemesi ve SVG shimi yapıldı',
          result: 'STUCK',
          changedFiles: 'package.json, App.tsx',
          test: 'FAIL',
          commitHash: 'ROLLBACK',
          weight: '12kg',
          touchPoints: 1
        };

        // Update dictated report status
        setDictatedReports(prev => 
          prev.map(r => r.id === activeReport.id ? { ...r, status: 'Pending' } : r)
        );

        setForgeCycles(prev => [...prev, newCycle]);
        setIsStuck(true);
        setForgeLoading(false);
      } else {
        // SUCCESS SCENARIO
        await writeLog('💡 [HYPOTHESIZE] Ayarlar sayfasındaki metin rengi #ffffff yapıldı.', 1000);
        await writeLog('🔨 [REPAIR] App.tsx içerisindeki helperText stili güncellendi.', 1000);
        await writeLog('🧪 [TEST] Metro bundler başarıyla çalıştı. Test suite PASS!', 1200);
        await writeLog('💾 [COMMIT] Değişiklikler local branch\'e commitlendi.', 800);
        
        const commitHash = Math.random().toString(36).substring(2, 9);
        const newCycle: ForgeCycle = {
          cycle: forgeCycles.length + 1,
          reportName: 'report-3-settings.md',
          hypothesis: 'Ayarlar sayfası metin kontrastı artırıldı (#ffffff)',
          result: 'Success',
          changedFiles: 'app/App.tsx',
          test: 'PASS',
          commitHash: commitHash,
          weight: '1kg',
          touchPoints: 0
        };

        // Mark report as forged
        setDictatedReports(prev => 
          prev.map(r => r.id === activeReport.id ? { ...r, status: 'Forged' } : r)
        );

        setForgeCycles(prev => [...prev, newCycle]);
        setForgeLoading(false);
      }
    };

    executeCycle();
  };

  // Launch WebRTC Expert Bridge
  const handleConnectToExpert = () => {
    const jitsiUrl = 'https://meet.jit.si/nokta-expert-bridge-dilfin-231118035';
    
    // Set active call states
    setExpertCallActive(true);
    setExpertCallTimer(0);
    
    // Open in native browser which fully supports WebRTC screen sharing, camera and mic!
    Linking.openURL(jitsiUrl).catch(err => {
      console.error('Failed to open Jitsi Meet URL', err);
      alert('Tarayıcı açılamadı, lütfen manuel olarak adresi ziyaret edin: ' + jitsiUrl);
    });

    // We can also toggle the modal in-app Jitsi placeholder just for UI visuality
    setJitsiVisible(true);
  };

  // Expert call timer simulation
  useEffect(() => {
    let interval: any;
    if (expertCallActive) {
      interval = setInterval(() => {
        setExpertCallTimer((prev) => {
          if (prev >= 60) {
            // After 60 seconds of expert bridge conversation, the STUCK problem is resolved!
            setIsStuck(false);
            setExpertCallActive(false);
            setJitsiVisible(false);
            clearInterval(interval);
            
            // Log the resolved cycle
            const resolvedReport = dictatedReports.find(r => r.status === 'Pending' && r.title.includes('Grafikler'));
            if (resolvedReport) {
              setDictatedReports(prev => 
                prev.map(r => r.id === resolvedReport.id ? { ...r, status: 'Forged' } : r)
              );
              
              setForgeCycles(prev => [
                ...prev,
                {
                  cycle: prev.length + 1,
                  reportName: 'report-4-graphics.md',
                  hypothesis: 'Uzman desteği (WebRTC) ile grafik render hatası saf Canvas kullanımı ile çözüldü',
                  result: 'Success',
                  changedFiles: 'app/App.tsx',
                  test: 'PASS',
                  commitHash: 'e9a8b7c',
                  weight: '4kg',
                  touchPoints: 1
                }
              ]);
            }
            alert('Uzman görüşmesi tamamlandı ve STUCK engeli çözüldü! FORGE döngüsü başarıyla tamamlandı.');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expertCallActive, dictatedReports]);

  // STEP 0: Mocking Question generation (Preserving previous week's logic)
  const handleCaptureIdea = () => {
    if (!idea.trim()) return;
    setLoading(true);
    setStep(1);

    setTimeout(() => {
      let derivedQuestions: Question[] = [];
      const lowerIdea = idea.toLowerCase();

      if (lowerIdea.includes('mascot') || lowerIdea.includes('sağlık') || lowerIdea.includes('health') || lowerIdea.includes('dost')) {
        derivedQuestions = [
          {
            id: 1,
            question: 'Maskotun kişiliği ve tonu nasıl olmalı? (örn. Neşeli, Ciddi, Motive edici)',
            placeholder: 'Motive edici ve cana yakın bir ses tonu...'
          },
          {
            id: 2,
            question: 'Hangi sağlık verilerini takip etmek istersiniz? (örn. Su, Adım, Uyku, Kalori)',
            placeholder: 'Günlük su tüketimi ve adım sayısı...'
          },
          {
            id: 3,
            question: 'Kritik durumlarda (örn. hedeflere ulaşamama) kullanıcıya nasıl bir destek sunulmalı?',
            placeholder: 'AI destekli öneriler ve akıllı hatırlatıcı bildirimler...'
          }
        ];
      } else {
        derivedQuestions = [
          {
            id: 1,
            question: 'Bu uygulamanın hedef kitlesi kimlerdir? (örn. Öğrenciler, Yazılımcılar, Sporcular)',
            placeholder: 'Zamanını verimli yönetmek isteyen öğrenciler ve profesyoneller...'
          },
          {
            id: 2,
            question: 'Sizce bu projedeki en yenilikçi ve fark yaratan 1 ana özellik nedir?',
            placeholder: 'Yyapay zekanın kullanıcı alışkanlıklarına göre dinamik planlama yapması...'
          },
          {
            id: 3,
            question: 'Kullanılacak temel teknolojik altyapı tercihleriniz nelerdir? (örn. Expo, Firebase, Node.js)',
            placeholder: 'React Native, Expo, Google Gemini API ve Supabase...'
          }
        ];
      }

      setQuestions(derivedQuestions);
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const handleGenerateSpec = () => {
    setLoading(true);
    setStep(3);

    setTimeout(() => {
      const cleanName = idea.split(' ')[0].toUpperCase() + ' POINT';
      setSpecName(cleanName);

      const specMarkdown = `# 🎯 PROJE SPESİFİKASYONU: ${cleanName}

## 📝 Özet ve Ana Fikir
Kullanıcı tarafından sunulan raw fikir zenginleştirilerek profesyonel bir ürün spesifikasyonuna dönüştürülmüştür.
- **Ham Fikir:** "${idea}"
- **Seçilen Track:** ${selectedTrack}

---

## ⚡ Temel Özellikler (Product Features)
1. **Dinamik Fikir Yakalama (Dot Capture):** Kullanıcının fikirlerini anlık ses/metin olarak alan yapay zeka entegreli modül.
2. **Gemini Pro ile Otomatik Zenginleştirme:** Gelişmiş ürün spesifikasyon kartları ve mimari şema taslağı.
3. **Akıllı Soru-Cevap Motoru:** Eksik kalan iş gereksinimlerini tespit ederek interaktif şekilde tamamlayan akıllı form yapısı.

---

## 🛠️ Yanıtlanan Kritik Sorular
${questions.map(q => `* **Soru:** ${q.question}\n  * **Cevap:** ${answers[q.id] || 'Belirtilmedi'}`).join('\n\n')}

---

## 🏗️ Önerilen Teknoloji Yığını (Tech Stack)
* **Frontend:** React Native (Expo) & TypeScript (Cross-platform mobil uyumluluk)
* **AI Servisi:** Google Gemini Pro API (Dynamic Prompting & JSON output)
* **Veritabanı & Auth:** Supabase / PostgreSQL (Hızlı prototipleme)
* **State Management:** Zustand (Minimalist ve hafif durum yönetimi)

---

## 🚀 Sonraki Adımlar (Next Steps)
1. Fikir doğrulama aşamasını (Track A) tamamlayıp \`EVAL.md\` raporunu oluşturun.
2. Expo üzerinden APK çıktısını alarak beta testlerine başlayın.
3. Ratchet ledger entegrasyonu (Track B) için altyapıyı hazırlayın.`;

      setGeneratedSpec(specMarkdown);
      setLoading(false);
      setStep(4);
    }, 2500);
  };

  const handleShareSpec = async () => {
    try {
      await Share.share({
        message: generatedSpec,
        title: `${specName} - Project Spec`
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = () => {
    setIdea('');
    setAnswers({});
    setStep(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b14" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Nokta</Text>
          <Text style={styles.headerSubtitle}>Avatar & Forge Loop ⚡</Text>
        </View>
        <View style={styles.studentBadge}>
          <Text style={styles.studentText}>Dilfin Akkurt (231118035)</Text>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.mainContent}>

        {/* TAB 1: CAPTURE IDEA (PREVIOUS WEEKS FLOW) */}
        {activeTab === 'capture' && (
          <View style={{ flex: 1 }}>
            {step === 0 && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                  <Text style={styles.label}>Harika Fikrinizi Girin 💡</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Fikrinizi buraya yazın... Yapay zeka bu fikri yakalayacak, analiz edecek ve mükemmel bir ürün spesifikasyonuna dönüştürecektir."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={6}
                    value={idea}
                    onChangeText={setIdea}
                  />

                  <Text style={[styles.label, { marginTop: 20 }]}>Track Seçimi 🎯</Text>
                  <View style={styles.trackContainer}>
                    {[
                      { name: 'Track A', desc: 'Dot Capture & Enrich' },
                      { name: 'Track B', desc: 'Forge Ratchet Ledger' },
                      { name: 'Track C', desc: 'Otonomi System Sync' }
                    ].map((t) => (
                      <TouchableOpacity
                        key={t.name}
                        style={[
                          styles.trackButton,
                          selectedTrack === t.name && styles.trackButtonActive
                        ]}
                        onPress={() => setSelectedTrack(t.name)}
                      >
                        <Text
                          style={[
                            styles.trackButtonText,
                            selectedTrack === t.name && styles.trackButtonTextActive
                          ]}
                        >
                          {t.name}
                        </Text>
                        <Text style={styles.trackButtonDesc}>{t.desc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, !idea.trim() && styles.primaryButtonDisabled]}
                    onPress={handleCaptureIdea}
                    disabled={!idea.trim()}
                  >
                    <Text style={styles.primaryButtonText}>Fikri Yakala & Analiz Et</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {step === 1 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={styles.loadingText}>Gemini AI Fikrinizi Analiz Ediyor...</Text>
                <Text style={styles.loadingSubtext}>Eksik gereksinimler tespit edilerek özel sorular oluşturuluyor.</Text>
              </View>
            )}

            {step === 2 && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                  <Text style={styles.label}>AI Zenginleştirme Soruları 🤖</Text>
                  <Text style={styles.helperText}>
                    Fikrinizi profesyonel bir spesifikasyona dönüştürebilmek için lütfen aşağıdaki soruları yanıtlayın:
                  </Text>

                  {questions.map((q) => (
                    <View key={q.id} style={styles.questionBlock}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={q.placeholder}
                        placeholderTextColor="#64748b"
                        value={answers[q.id] || ''}
                        onChangeText={(text) => setAnswers({ ...answers, [q.id]: text })}
                      />
                    </View>
                  ))}

                  <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateSpec}>
                    <Text style={styles.primaryButtonText}>Ürün Spesifikasyonunu Üret</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(0)}>
                    <Text style={styles.secondaryButtonText}>Geri Dön</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {step === 3 && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Ürün Spesifikasyonu Üretiliyor...</Text>
                <Text style={styles.loadingSubtext}>Mimari, teknoloji yığını ve kullanıcı senaryoları detaylandırılıyor.</Text>
              </View>
            )}

            {step === 4 && (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                  <View style={styles.successHeader}>
                    <Text style={styles.successBadge}>✓ BAŞARILI</Text>
                    <Text style={styles.specTitle}>{specName} SPESİFİKASYONU</Text>
                  </View>

                  <View style={styles.specPreviewCard}>
                    <ScrollView nestedScrollEnabled style={styles.specScroll}>
                      <Text style={styles.specContentText}>{generatedSpec}</Text>
                    </ScrollView>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShareSpec}>
                      <Text style={styles.shareButtonText}>📤 Paylaş / Dışa Aktar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                      <Text style={styles.resetButtonText}>🔄 Yeni Fikir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* TAB 2: 3D AVATAR & VOICE VISUALIZER & AUDIT DICTATION */}
        {activeTab === 'avatar' && (
          <View style={{ flex: 1 }}>
            {/* Split Screen: Top 60% Avatar Scene, Bottom 40% Dictation Panel */}
            <View style={styles.avatarWebGLContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  srcDoc={AVATAR_HTML}
                  style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                  ref={(f) => {
                    if (f && f.contentWindow) {
                      iframeRef.current = f.contentWindow;
                    }
                  }}
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: AVATAR_HTML }}
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                  allowFileAccess={true}
                  allowFileAccessFromFileURLs={true}
                  allowUniversalAccessFromFileURLs={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  mediaPlaybackRequiresUserAction={false}
                  onLoadEnd={sendModelPath}
                />
              )}
              
              {/* Mic recording indicator */}
              {isRecording && (
                <View style={styles.pulseContainer}>
                  <View style={[styles.pulseRing, { transform: [{ scale: 1 + localVolume * 0.5 }] }]} />
                  <Text style={styles.pulseText}>🎙️ SES ALGILANIYOR</Text>
                </View>
              )}
            </View>

            {/* Bottom Panel: Dictate Audit Widget */}
            <View style={styles.dictationPanel}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
                <Text style={styles.panelTitle}>🎙️ Audit Raporu Dikte Paneli</Text>
                <Text style={styles.panelSubtitle}>
                  Konuşarak hata bildirin (STT simülasyonu tetiklenir ve 3D dudak senkronu çalışır).
                </Text>

                {/* Dictation templates */}
                <View style={styles.dictationRow}>
                  {dictationTemplates.map((temp, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dictationOptionCard,
                        selectedDictationTemplate === index && styles.dictationOptionCardActive
                      ]}
                      onPress={() => handleDictateTemplate(index)}
                      disabled={isDictating}
                    >
                      <Text style={styles.dictationOptionTitle}>{temp.title}</Text>
                      <Text numberOfLines={2} style={styles.dictationOptionDesc}>{temp.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Microphone Toggle (Physical/Simulator) */}
                <TouchableOpacity
                  style={[styles.micTriggerButton, isRecording && styles.micTriggerButtonActive]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isDictating}
                >
                  <Text style={styles.micTriggerText}>
                    {isRecording ? '⏹️ Kaydı Durdur (Mouth Open: ' + Math.round(localVolume * 100) + '%)' : '🎙️ Cihaz Mikrofona Konuş (Manuel)'}
                  </Text>
                </TouchableOpacity>

                {/* Transcription output */}
                {(isDictating || dictationText.length > 0) && (
                  <View style={styles.transcriptionCard}>
                    <Text style={styles.transcriptionLabel}>💬 Dictated (Voice → STT):</Text>
                    <Text style={styles.transcriptionText}>
                      {dictationText}
                      {isDictating && <Text style={{ color: '#a855f7' }}> |</Text>}
                    </Text>
                  </View>
                )}

                {/* AuditWidget Section (Generated Reports list) */}
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetTitle}>📋 &lt;AuditWidget /&gt; Raporları</Text>
                  <Text style={styles.widgetCount}>{dictatedReports.length} Rapor</Text>
                </View>

                {dictatedReports.map((rep) => (
                  <View key={rep.id} style={styles.reportCard}>
                    <View style={styles.reportCardHeader}>
                      <Text style={styles.reportCardTitle}>{rep.title}</Text>
                      <Text
                        style={[
                          styles.reportStatusBadge,
                          rep.status === 'Forged' ? styles.statusForged : styles.statusPending
                        ]}
                      >
                        {rep.status === 'Forged' ? '✓ TAMİR EDİLDİ' : '⏳ BEKLEYEN'}
                      </Text>
                    </View>
                    <Text style={styles.reportContent}>{rep.content}</Text>
                    <View style={styles.screenshotPlaceholder}>
                      <Text style={styles.screenshotText}>🖼️ [Screenshot Burn-in: {rep.id}.png]</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* TAB 3: FORGE LOOP & WEBRTC EXPERT BRIDGE */}
        {activeTab === 'forge' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* CRITICAL AGENT STUCK PANEL (EXPERT BRIDGE TRIGGER) */}
            {isStuck && (
              <View style={styles.stuckCard}>
                <Text style={styles.stuckHeader}>⚡ AGENT DÖNGÜDE SIKIŞTI (STUCK) ⚡</Text>
                <Text style={styles.stuckText}>
                  "Rapor 4: Grafik Kütüphanesi Çökmesi" üst üste 2 Forge döngüsünde **FAIL / ROLLBACK** hatası verdi. 
                  Kod tabanı kilitlendi! Çözüm için hemen uzman görüntülü köprüsünü (WebRTC) başlatmalısınız.
                </Text>
                
                <TouchableOpacity
                  style={styles.expertBridgeButton}
                  onPress={handleConnectToExpert}
                >
                  <Text style={styles.expertBridgeButtonText}>📞 Uzmana Bağlan (WebRTC Köprüsü)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* EXPERT CALL TIMER */}
            {expertCallActive && (
              <View style={styles.callActiveCard}>
                <Text style={styles.callActiveTitle}>📞 Uzman Görüntülü Görüşme Yapılıyor</Text>
                <Text style={styles.callActiveTimer}>Süre: {expertCallTimer} / 60 Saniye</Text>
                <Text style={styles.callActiveHelp}>
                  Ekran Paylaşımı + Ses + Görüntü kanalları devrede. Uzman kodu inceliyor ve düzeltiyor...
                </Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${(expertCallTimer / 60) * 100}%` }]} />
                </View>
              </View>
            )}

            {/* FORGE CONTROLLER CARD */}
            <View style={styles.card}>
              <Text style={styles.label}>🛠️ Forge Döngüsü Yöneticisi</Text>
              <Text style={styles.helperText}>
                Dikte ettiğiniz raporları otonom agent kod üzerinde tamir eder (Success/Rollback döngüsü).
              </Text>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  dictatedReports.filter(r => r.status === 'Pending').length === 0 && styles.primaryButtonDisabled,
                  forgeLoading && styles.primaryButtonDisabled
                ]}
                onPress={runForgeCycle}
                disabled={dictatedReports.filter(r => r.status === 'Pending').length === 0 || forgeLoading || isStuck}
              >
                {forgeLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {dictatedReports.filter(r => r.status === 'Pending').length > 0
                      ? '🚀 Forge Döngüsünü Çalıştır'
                      : '✅ Tamir Edilecek Bekleyen Rapor Yok'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Console Output */}
              {forgeConsole.length > 0 && (
                <View style={styles.consoleCard}>
                  <Text style={styles.consoleTitle}>🤖 Agent Konsol Çıktısı:</Text>
                  {forgeConsole.map((log, index) => (
                    <Text key={index} style={styles.consoleText}>{log}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* FORGE LEDGER TABLE */}
            <View style={[styles.card, { marginTop: 20 }]}>
              <Text style={styles.label}>📊 FORGE.md Ledger Tablosu (Ratchet)</Text>
              
              <ScrollView horizontal style={{ marginTop: 10 }}>
                <View style={styles.table}>
                  <View style={styles.tableRowHeader}>
                    <Text style={[styles.tableCol, { width: 50 }]}>Cycle</Text>
                    <Text style={[styles.tableCol, { width: 140 }]}>Rapor Adı</Text>
                    <Text style={[styles.tableCol, { width: 160 }]}>Hipotez</Text>
                    <Text style={[styles.tableCol, { width: 80 }]}>Sonuç</Text>
                    <Text style={[styles.tableCol, { width: 110 }]}>Değişen</Text>
                    <Text style={[styles.tableCol, { width: 75 }]}>Commit</Text>
                    <Text style={[styles.tableCol, { width: 60 }]}>Ağırlık</Text>
                  </View>
                  
                  {forgeCycles.map((c) => (
                    <View key={c.cycle} style={styles.tableRow}>
                      <Text style={[styles.tableText, { width: 50 }]}>{c.cycle}</Text>
                      <Text style={[styles.tableText, { width: 140 }]} numberOfLines={1}>{c.reportName}</Text>
                      <Text style={[styles.tableText, { width: 160 }]} numberOfLines={1}>{c.hypothesis}</Text>
                      <Text
                        style={[
                          styles.tableText,
                          { width: 80, fontWeight: '800' },
                          c.result === 'Success' ? { color: '#10b981' } : c.result === 'Rollback' ? { color: '#f59e0b' } : { color: '#ef4444' }
                        ]}
                      >
                        {c.result}
                      </Text>
                      <Text style={[styles.tableText, { width: 110 }]} numberOfLines={1}>{c.changedFiles}</Text>
                      <Text style={[styles.tableText, { width: 75, fontFamily: 'monospace' }]}>{c.commitHash}</Text>
                      <Text style={[styles.tableText, { width: 60 }]}>{c.weight}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        )}

      </View>

      {/* JITSI MODAL FALLBACK */}
      <Modal
        visible={jitsiVisible}
        animationType="slide"
        onRequestClose={() => setJitsiVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#090514' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Uzman Köprüsü Görüşmesi (60sn)</Text>
            <TouchableOpacity onPress={() => setJitsiVisible(false)}>
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: 'https://meet.jit.si/nokta-expert-bridge-dilfin-231118035' }}
              style={{ flex: 1 }}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* FOOTER TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'capture' && styles.tabItemActive]}
          onPress={() => setActiveTab('capture')}
        >
          <Text style={[styles.tabText, activeTab === 'capture' && styles.tabTextActive]}>💡 Analiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'avatar' && styles.tabItemActive]}
          onPress={() => setActiveTab('avatar')}
        >
          <Text style={[styles.tabText, activeTab === 'avatar' && styles.tabTextActive]}>👤 Avatar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'forge' && styles.tabItemActive]}
          onPress={() => setActiveTab('forge')}
        >
          {dictatedReports.filter(r => r.status === 'Pending').length > 0 && (
            <View style={styles.redDot} />
          )}
          <Text style={[styles.tabText, activeTab === 'forge' && styles.tabTextActive]}>🛠️ Forge</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b14',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2f',
    backgroundColor: '#0e0e1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'column'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '600',
    marginTop: 2,
  },
  studentBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  studentText: {
    color: '#e9d5ff',
    fontSize: 11,
    fontWeight: '700'
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#131324',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#24243e',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#0f0f1c',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2b2b48',
    textAlignVertical: 'top',
  },
  trackContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  trackButton: {
    backgroundColor: '#0f0f1c',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2b2b48',
  },
  trackButtonActive: {
    borderColor: '#a855f7',
    backgroundColor: '#1b122e',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  trackButtonTextActive: {
    color: '#e9d5ff',
  },
  trackButtonDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#382f4d',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 15,
  },
  questionBlock: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0f0f1c',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2b2b48',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  successBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    overflow: 'hidden',
  },
  specTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
  },
  specPreviewCard: {
    backgroundColor: '#0a0a14',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    height: 300,
  },
  specScroll: {
    flex: 1,
  },
  specContentText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  shareButton: {
    flex: 1.5,
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // 3D AVATAR SCREEN STYLES
  avatarWebGLContainer: {
    height: height * 0.45,
    backgroundColor: '#090514',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#24243e'
  },
  pulseContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 40
  },
  pulseRing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6
  },
  pulseText: {
    color: '#fca5a5',
    fontSize: 10,
    fontWeight: '800'
  },
  dictationPanel: {
    flex: 1,
    backgroundColor: '#0d0d18'
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  panelSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  dictationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dictationOptionCard: {
    flex: 1,
    backgroundColor: '#131324',
    borderWidth: 1,
    borderColor: '#24243e',
    borderRadius: 10,
    padding: 10,
  },
  dictationOptionCardActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.08)'
  },
  dictationOptionTitle: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700'
  },
  dictationOptionDesc: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 13
  },
  micTriggerButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micTriggerButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  micTriggerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  transcriptionCard: {
    backgroundColor: '#0a0a14',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 10,
    padding: 12,
    marginTop: 12
  },
  transcriptionLabel: {
    color: '#a855f7',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  transcriptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 16
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#24243e'
  },
  widgetTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  widgetCount: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  reportCard: {
    backgroundColor: '#131324',
    borderWidth: 1,
    borderColor: '#24243e',
    borderRadius: 12,
    padding: 12,
    marginTop: 10
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  reportCardTitle: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700'
  },
  reportStatusBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden'
  },
  statusForged: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981'
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b'
  },
  reportContent: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15
  },
  screenshotPlaceholder: {
    backgroundColor: '#090514',
    borderWidth: 1,
    borderColor: '#1e1e2f',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginTop: 8
  },
  screenshotText: {
    color: '#a855f7',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace'
  },

  // FORGE TIMELINE STYLES
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#24243e',
    borderRadius: 10,
    backgroundColor: '#0f0f1c',
    overflow: 'hidden'
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#1c1c34',
    borderBottomWidth: 1,
    borderBottomColor: '#24243e',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2f',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  tableCol: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  tableText: {
    color: '#e2e8f0',
    fontSize: 11
  },
  consoleCard: {
    backgroundColor: '#070710',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
    marginTop: 15
  },
  consoleTitle: {
    color: '#a855f7',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6
  },
  consoleText: {
    color: '#34d399',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
    marginBottom: 2
  },

  // STUCK AND EXPERT CALL STYLES
  stuckCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15
  },
  stuckHeader: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  stuckText: {
    color: '#fca5a5',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'center'
  },
  expertBridgeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  expertBridgeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  callActiveCard: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15
  },
  callActiveTitle: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  },
  callActiveTimer: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 6
  },
  callActiveHelp: {
    color: '#a5b4fc',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center'
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#312e81',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a855f7'
  },

  // MODAL STYLES
  modalHeader: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#0e0e1a'
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },

  // FOOTER TAB BAR STYLES
  tabBar: {
    height: 55,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2f',
    backgroundColor: '#0e0e1a',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#a855f7',
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#a855f7',
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    position: 'absolute',
    top: 12,
    right: '35%'
  }
});
