
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import { useTheme } from "@/components/ThemeProvider";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const { theme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const text = {
    en: {
      title: "Help & Support",
      subtitle: "Find answers to common questions and get support",
      searchPlaceholder: "Search for help...",
      generalQuestions: "General Questions",
      propertyQuestions: "Property Questions",
      accountQuestions: "Account Questions",
      contactSupport: "Contact Support",
      stillNeedHelp: "Still need help?",
      contactDescription: "Our support team is here to help you 24/7",
      faq: [
        {
          category: "General Questions",
          items: [
            {
              question: "How do I search for properties?",
              answer: "Use our advanced search panel on the homepage to filter properties by location, price range, property type, and amenities. You can also use the map view to explore properties in specific areas."
            },
            {
              question: "Is Astra Villa free to use?",
              answer: "Yes, browsing and searching properties is completely free. We only charge commission fees to property owners and agents when transactions are completed through our platform."
            },
            {
              question: "How do I contact a property agent?",
              answer: "Click on any property listing to view details, then use the 'Contact Agent' button to send a message or request a viewing appointment."
            }
          ]
        },
        {
          category: "Property Questions",
          items: [
            {
              question: "How do I list my property?",
              answer: "You need to create an account and verify your identity. Then navigate to 'Post Advertising' in the navigation menu to add your property listing with photos, descriptions, and pricing."
            },
            {
              question: "What are the fees for listing properties?",
              answer: "Basic listings are free for the first 30 days. Premium listings with enhanced visibility and additional features are available for a monthly fee."
            },
            {
              question: "How do I schedule a property viewing?",
              answer: "Contact the property agent through the listing page, or use our integrated booking system to schedule viewings at your preferred time."
            }
          ]
        },
        {
          category: "Account Questions",
          items: [
            {
              question: "How do I create an account?",
              answer: "Click the 'Login / Register' button in the top navigation, then select 'Register' to create your account with email and password."
            },
            {
              question: "I forgot my password, what should I do?",
              answer: "Use the 'Forgot Password' link on the login page. We'll send you a reset link to your registered email address."
            },
            {
              question: "How do I update my profile information?",
              answer: "After logging in, go to your Dashboard and select 'Profile' to update your personal information, contact details, and preferences."
            }
          ]
        }
      ]
    },
    id: {
      title: "Bantuan & Dukungan",
      subtitle: "Temukan jawaban untuk pertanyaan umum dan dapatkan dukungan",
      searchPlaceholder: "Cari bantuan...",
      generalQuestions: "Pertanyaan Umum",
      propertyQuestions: "Pertanyaan Properti",
      accountQuestions: "Pertanyaan Akun",
      contactSupport: "Hubungi Dukungan",
      stillNeedHelp: "Masih butuh bantuan?",
      contactDescription: "Tim dukungan kami siap membantu Anda 24/7",
      faq: [
        {
          category: "Pertanyaan Umum",
          items: [
            {
              question: "Bagaimana cara mencari properti?",
              answer: "Gunakan panel pencarian canggih di beranda untuk menyaring properti berdasarkan lokasi, rentang harga, jenis properti, dan fasilitas. Anda juga dapat menggunakan tampilan peta untuk menjelajahi properti di area tertentu."
            },
            {
              question: "Apakah Astra Villa gratis digunakan?",
              answer: "Ya, menelusuri dan mencari properti sepenuhnya gratis. Kami hanya mengenakan biaya komisi kepada pemilik properti dan agen ketika transaksi diselesaikan melalui platform kami."
            },
            {
              question: "Bagaimana cara menghubungi agen properti?",
              answer: "Klik pada listing properti apa pun untuk melihat detail, lalu gunakan tombol 'Hubungi Agen' untuk mengirim pesan atau meminta janji temu untuk melihat properti."
            }
          ]
        },
        {
          category: "Pertanyaan Properti",
          items: [
            {
              question: "Bagaimana cara mendaftarkan properti saya?",
              answer: "Anda perlu membuat akun dan memverifikasi identitas Anda. Kemudian navigasi ke 'Pasang Iklan' di menu navigasi untuk menambahkan listing properti Anda dengan foto, deskripsi, dan harga."
            },
            {
              question: "Berapa biaya untuk mendaftarkan properti?",
              answer: "Listing dasar gratis untuk 30 hari pertama. Listing premium dengan visibilitas yang ditingkatkan dan fitur tambahan tersedia dengan biaya bulanan."
            },
            {
              question: "Bagaimana cara menjadwalkan viewing properti?",
              answer: "Hubungi agen properti melalui halaman listing, atau gunakan sistem booking terintegrasi kami untuk menjadwalkan viewing pada waktu yang Anda inginkan."
            }
          ]
        },
        {
          category: "Pertanyaan Akun",
          items: [
            {
              question: "Bagaimana cara membuat akun?",
              answer: "Klik tombol 'Masuk / Daftar' di navigasi atas, lalu pilih 'Daftar' untuk membuat akun Anda dengan email dan password."
            },
            {
              question: "Saya lupa password, apa yang harus dilakukan?",
              answer: "Gunakan link 'Lupa Password' di halaman login. Kami akan mengirimkan link reset ke alamat email terdaftar Anda."
            },
            {
              question: "Bagaimana cara memperbarui informasi profil saya?",
              answer: "Setelah login, ke Dashboard Anda dan pilih 'Profil' untuk memperbarui informasi pribadi, detail kontak, dan preferensi Anda."
            }
          ]
        }
      ]
    }
  };

  const currentText = text[language];

  const filteredFAQ = currentText.faq.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
      />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {currentText.subtitle}
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-ios border-border/30"
              />
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8 mb-12">
            {filteredFAQ.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="glass-ios border-border/30">
                <CardHeader>
                  <CardTitle className="text-foreground">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left text-foreground hover:text-primary">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="glass-ios border-border/30">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">{currentText.stillNeedHelp}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {currentText.contactDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <MessageCircle className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">Chat with our support team</p>
                  <Button variant="outline" className="w-full glass-ios">
                    Start Chat
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Mail className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">support@astravilla.com</p>
                  <Button variant="outline" className="w-full glass-ios">
                    Send Email
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Phone className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">+1 (555) 123-4567</p>
                  <Button variant="outline" className="w-full glass-ios">
                    Call Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
