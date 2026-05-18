import React, { useState } from 'react';
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
  Share
} from 'react-native';

const { width } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  placeholder: string;
}

export default function App() {
  const [step, setStep] = useState<number>(0);
  const [idea, setIdea] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('Track A');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Dynamic generated questions based on the idea
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  
  // Generated Spec
  const [specName, setSpecName] = useState<string>('');
  const [generatedSpec, setGeneratedSpec] = useState<string>('');

  // Handle Track Selection
  const tracks = [
    { name: 'Track A', desc: 'Dot Capture & Enrich' },
    { name: 'Track B', desc: 'Forge Ratchet Ledger' },
    { name: 'Track C', desc: 'Otonomi System Sync' }
  ];

  // Mocking AI Question Generation
  const handleCaptureIdea = () => {
    if (!idea.trim()) return;
    
    setLoading(true);
    setStep(1); // Loading state

    setTimeout(() => {
      // Analyze idea and customize questions
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
            placeholder: 'Yapay zekanın kullanıcı alışkanlıklarına göre dinamik planlama yapması...'
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
      setStep(2); // Go to questions screen
    }, 2000);
  };

  // Mocking AI Spec Generation
  const handleGenerateSpec = () => {
    setLoading(true);
    setStep(3); // Loading Spec State

    setTimeout(() => {
      // Dynamic spec creation
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
      setStep(4); // Final screen
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
        <Text style={styles.headerTitle}>Nokta</Text>
        <Text style={styles.headerSubtitle}>Capture & Enrich ⚡</Text>
      </View>

      {/* STEP 0: IDEA INPUT */}
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
              {tracks.map((t) => (
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

      {/* STEP 1: LOADING QUESTIONS */}
      {step === 1 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.loadingText}>Gemini AI Fikrinizi Analiz Ediyor...</Text>
          <Text style={styles.loadingSubtext}>Eksik gereksinimler tespit edilerek özel sorular oluşturuluyor.</Text>
        </View>
      )}

      {/* STEP 2: QUESTIONS FORM */}
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

      {/* STEP 3: LOADING SPEC */}
      {step === 3 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Ürün Spesifikasyonu Üretiliyor...</Text>
          <Text style={styles.loadingSubtext}>Mimari, teknoloji yığını ve kullanıcı senaryoları detaylandırılıyor.</Text>
        </View>
      )}

      {/* STEP 4: FINAL SPEC SCREEN */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b14',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2f',
    backgroundColor: '#0e0e1a',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a855f7',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#131324',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24243e',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#0f0f1c',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2b2b48',
    textAlignVertical: 'top',
  },
  trackContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 25,
  },
  trackButton: {
    backgroundColor: '#0f0f1c',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#2b2b48',
  },
  trackButtonActive: {
    borderColor: '#a855f7',
    backgroundColor: '#1b122e',
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94a3b8',
  },
  trackButtonTextActive: {
    color: '#e9d5ff',
  },
  trackButtonDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  primaryButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#4c3a6b',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  helperText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 20,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: '#0f0f1c',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2b2b48',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  successBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  specTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 10,
  },
  specPreviewCard: {
    backgroundColor: '#0a0a14',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1e1e2f',
    height: 380,
  },
  specScroll: {
    flex: 1,
  },
  specContentText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'System',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  shareButton: {
    flex: 1.5,
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  }
});
