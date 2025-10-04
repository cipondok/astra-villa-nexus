import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Globe, DollarSign, Shield, FileText, Home } from "lucide-react";

export const ForeignInvestmentFAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      category: "Legal & Regulations",
      icon: Shield,
      color: "text-blue-600",
      faqs: [
        {
          question: "Can foreigners own freehold (Hak Milik) property in Indonesia?",
          answer: "No, foreigners cannot directly own freehold (Hak Milik) property in Indonesia. Foreigners are limited to Hak Pakai (Right to Use) for houses and SHMRS/Strata Title for apartments. The Hak Pakai title is valid for 30 years and can be renewed."
        },
        {
          question: "What is the difference between Hak Pakai and Hak Milik?",
          answer: "Hak Milik is freehold ownership available only to Indonesian citizens and certain Indonesian legal entities. It grants perpetual ownership rights. Hak Pakai is a 'Right to Use' title available to foreigners, valid for 30 years, renewable for 20 years, then another 30 years. While not ownership, it provides secure long-term rights to use and occupy the property."
        },
        {
          question: "Are nominee arrangements legal?",
          answer: "Nominee arrangements (using an Indonesian citizen's name to hold freehold property) are in a legal gray area and carry significant risks. Indonesian law doesn't explicitly criminalize them, but they offer no legal protection. If disputes arise, the foreign investor has no legal recourse. Most legal experts strongly advise against this practice. It's much safer to use proper legal structures like Hak Pakai or PT PMA."
        },
        {
          question: "What happens to my property when Hak Pakai expires?",
          answer: "Hak Pakai can be renewed before expiration. The initial term is 30 years, renewable for another 20 years, then another 30 years (total of up to 80 years). To renew, you must apply to the Land Office (BPN) before expiration, pay renewal fees, and meet ongoing eligibility requirements (valid residence permit, NPWP, etc.). If not renewed, rights revert to the state or original landowner."
        }
      ]
    },
    {
      category: "Financial Requirements",
      icon: DollarSign,
      color: "text-green-600",
      faqs: [
        {
          question: "What is the minimum investment for foreign property buyers?",
          answer: "Minimum investment requirements vary by property type:\n• Houses (Hak Pakai): IDR 5 billion minimum property value\n• Apartments/Condominiums (SHMRS): IDR 3 billion minimum\n• Tourist areas: Requirements vary by region, check local regulations\n\nThese minimums are set by government regulation and are subject to change."
        },
        {
          question: "Can foreigners get a mortgage (KPR) in Indonesia?",
          answer: "Getting a mortgage as a foreigner in Indonesia is very difficult. Most Indonesian banks do not offer KPR to foreign nationals. A few international banks may consider it with:\n• Down payment: 40-50% minimum (vs 20-30% for Indonesians)\n• Maximum loan period: 10-15 years (vs 20 years for locals)\n• Higher interest rates\n• Extensive documentation requirements\n\nMost foreign buyers pay cash. Some arrange financing in their home country."
        },
        {
          question: "What are the costs involved in buying property?",
          answer: "Beyond the purchase price, expect these costs:\n• BPHTB (land transfer tax): 5% of property value\n• Notary fees: 1-2% of property value\n• Legal fees: 1-2% (highly recommended)\n• Property inspection: IDR 5-10 million\n• Due diligence: IDR 10-20 million\n• Registration fees: IDR 1-3 million\n• Agent commission (if applicable): 3-5%\n\nTotal transaction costs typically range from 7-12% of property value."
        },
        {
          question: "Can I transfer funds from overseas to buy property?",
          answer: "Yes, but there are important considerations:\n• You must have an Indonesian bank account (IDR account)\n• Large transfers may require Bank Indonesia reporting\n• Declare the purpose as property purchase\n• Keep all transfer documentation for tax purposes\n• Consider exchange rate fluctuations\n• Some banks require proof of source of funds\n• Transfer fees vary (typically 0.1-0.5% plus fixed fees)\n\nConsult with your Indonesian bank before initiating large transfers."
        }
      ]
    },
    {
      category: "Documentation & Process",
      icon: FileText,
      color: "text-purple-600",
      faqs: [
        {
          question: "What documents do I need as a foreign buyer?",
          answer: "Essential documents:\n\nPersonal:\n• Valid passport (minimum 6 months validity)\n• KITAS or KITAP (Indonesian residence permit)\n• NPWP (Indonesian tax ID)\n• Proof of Indonesian address\n• Marriage certificate (if applicable, translated)\n\nFinancial:\n• Bank statements (3-6 months)\n• Proof of funds/source of funds declaration\n• Employment letter or business documents\n• Recent tax returns\n\nAll foreign documents must be translated to Indonesian by a sworn translator and notarized."
        },
        {
          question: "Do I need KITAS/KITAP to buy property?",
          answer: "Yes, a valid Indonesian residence permit (KITAS or KITAP) is mandatory for foreign property ownership under Hak Pakai. Types:\n\n• KITAS (Limited Stay Permit): Temporary, typically 1-2 years, renewable\n• KITAP (Permanent Stay Permit): Permanent residence, better for long-term property ownership\n\nYou must maintain valid residence status throughout property ownership. If your permit expires and isn't renewed, you may lose property rights."
        },
        {
          question: "How long does the buying process take?",
          answer: "Typical timeline:\n• Property search and inspection: 2-4 weeks\n• Legal due diligence: 1-2 weeks\n• Preliminary agreement: 1 week\n• Final deed preparation: 1-2 weeks\n• Title transfer and registration: 1-3 months\n\nTotal: 2-4 months on average. Factors affecting timeline:\n• Document completeness\n• Seller responsiveness\n• Land Office processing speed\n• Complexity of title verification\n• Whether financing is involved"
        },
        {
          question: "Should I hire a lawyer?",
          answer: "Absolutely yes. Hiring an experienced Indonesian property lawyer is strongly recommended:\n\nBenefits:\n• Title verification and due diligence\n• Contract review and negotiation\n• Protection from fraud or disputes\n• Ensure compliance with regulations\n• Navigate bureaucracy efficiently\n• Language and cultural barriers handled\n\nCosts: Typically 1-2% of property value, but invaluable for protecting a major investment. Choose lawyers experienced in foreign property transactions."
        }
      ]
    },
    {
      category: "Property Types & Locations",
      icon: Home,
      color: "text-orange-600",
      faqs: [
        {
          question: "Which areas are best for foreign investment?",
          answer: "Popular regions for foreign property investment:\n\n• Bali: Most foreigner-friendly, established legal framework, high tourism\n• Jakarta: Capital city, business hub, modern apartments\n• Yogyakarta: Cultural center, lower prices, growing expat community\n• Lombok: Emerging market, similar to early Bali\n• Bandung: Cool climate, proximity to Jakarta\n\nConsider:\n• Infrastructure and development\n• Expat community presence\n• Rental demand and tourism\n• Local regulations (some areas have additional restrictions)\n• Natural disaster risks\n• Accessibility"
        },
        {
          question: "Can I rent out my property?",
          answer: "Yes, foreigners can rent out property they own under Hak Pakai or SHMRS. Important considerations:\n\n• Short-term rentals: Check local regulations (some areas restrict Airbnb)\n• Tax obligations: Rental income is taxable (10% withholding tax for non-residents)\n• Property management: Consider hiring a local manager\n• Permits: Some areas require rental business permits\n• Insurance: Ensure adequate coverage\n• Maintenance: Budget for upkeep and repairs\n\nRental income can help offset ownership costs, especially in tourist areas."
        },
        {
          question: "What about commercial property investment?",
          answer: "Foreigners can invest in commercial property through a PT PMA (Foreign Investment Company):\n\nRequirements:\n• Establish PT PMA company in Indonesia\n• Minimum investment capital (varies by sector)\n• Obtain business licenses (NIB, etc.)\n• Property must be used for business purposes\n• Title type: Hak Guna Bangunan (Building Use Rights) - 30 years\n\nAdvantages:\n• Access to better locations\n• Potential tax benefits\n• Business development opportunities\n\nComplexity: Higher than residential purchase, requires business plan and ongoing compliance."
        },
        {
          question: "Are there restrictions on property location?",
          answer: "Yes, certain location restrictions apply:\n\nProhibited:\n• Border areas and military zones\n• Certain strategic areas (varies by region)\n• Some traditional/cultural land areas\n• Agricultural land\n\nRestricted:\n• Some tourist areas have additional requirements\n• Regional governments may impose local restrictions\n• Certain developments may limit foreign ownership to specific percentages\n\nAlways verify with local Land Office (BPN) and legal advisors before committing to a purchase."
        }
      ]
    },
    {
      category: "Nationality Eligibility",
      icon: Globe,
      color: "text-red-600",
      faqs: [
        {
          question: "Which countries are on the green list for investment?",
          answer: "Green list countries (fully allowed to invest):\n\nAmericas: United States, Canada, Brazil, Argentina, Mexico\nEurope: UK, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria, Sweden, Norway, Denmark, Finland, Ireland, Portugal\nAsia-Pacific: Singapore, Malaysia, Thailand, Philippines, Japan, South Korea, Australia, New Zealand, India\nMiddle East: UAE, Saudi Arabia, Kuwait, Qatar\n\nThese countries have full investment privileges with standard requirements. Status is updated by BKPM (Indonesia Investment Coordinating Board)."
        },
        {
          question: "What does yellow list status mean?",
          answer: "Yellow list countries have restricted sector access:\n\nCountries: China, Russia, Turkey, South Africa, Vietnam, Pakistan, Egypt, Indonesia (for specific sectors)\n\nImplications:\n• Can invest in real estate with standard requirements\n• May face restrictions in certain strategic sectors (mining, energy, defense)\n• Additional scrutiny for large investments\n• Some sectors require Indonesian partnership\n• Enhanced due diligence requirements\n\nFor residential property, yellow list doesn't significantly impact the process, but commercial investments may face more hurdles."
        },
        {
          question: "What if my country is on the red list?",
          answer: "Red list countries face high scrutiny:\n\nTypical restrictions:\n• North Korea, Iran: Severely restricted due to international sanctions\n• Countries under UN sanctions\n• High-risk jurisdictions for money laundering\n\nInvestment possibilities:\n• Individual assessments on case-by-case basis\n• May require government approval\n• Enhanced background checks\n• Source of funds verification is critical\n• Longer processing times\n• May need Indonesian sponsor or partner\n\nConsult with BKPM and legal advisors if from a red-list country. Some exceptions may apply based on individual circumstances."
        },
        {
          question: "Can I invest if I have dual citizenship?",
          answer: "Dual citizenship situations:\n\n• If one nationality is Indonesian: You're considered Indonesian and can own Hak Milik (freehold)\n• If one nationality is green-list: Use that nationality for smoother process\n• If one is yellow/red: Use the more favorable status\n\nImportant:\n• Indonesia doesn't officially recognize dual citizenship for adults\n• Choose which passport to use consistently\n• Declare your citizenship status accurately\n• Don't attempt to switch nationalities mid-transaction\n• Legal advisors can help determine best approach\n\nTransparency is crucial to avoid complications."
        }
      ]
    },
    {
      category: "Ongoing Obligations",
      icon: BookOpen,
      color: "text-indigo-600",
      faqs: [
        {
          question: "What are my ongoing obligations as a foreign property owner?",
          answer: "Annual obligations:\n\n• PBB (property tax): 0.1-0.3% of assessed value, paid annually\n• NPWP maintenance: Keep tax ID active\n• Residence permit: Maintain valid KITAS/KITAP\n• Property maintenance: Upkeep and repairs\n\nOccasional:\n• Hak Pakai renewal: Before 30-year expiration\n• Title revalidation: If required\n• Community fees: For apartments/gated communities\n• Utilities: Electricity, water (if self-managed)\n\nReporting:\n• Annual tax filing if generating rental income\n• Report address changes to authorities\n• Update Land Office of any property modifications"
        },
        {
          question: "Can I sell my property before Hak Pakai expires?",
          answer: "Yes, you can sell property under Hak Pakai at any time:\n\nBuyer options:\n• Another foreigner (meeting eligibility)\n• Indonesian citizen (can convert to Hak Milik)\n• PT PMA company\n\nSale process:\n• Similar to original purchase\n• Pay Capital Gains Tax (2.5% of sale price or 25% of profit)\n• Clear all outstanding fees and taxes\n• Transfer through notary\n• Update Land Office records\n\nConsiderations:\n• Market liquidity may be lower than Hak Milik properties\n• Remaining Hak Pakai term affects value\n• Agent commission typically 3-5%"
        },
        {
          question: "What happens if I lose my residence permit?",
          answer: "Losing residence permit status has serious implications:\n\nConsequences:\n• You may lose legal right to hold property\n• Property may need to be sold or transferred\n• Grace period varies (typically 1 year to resolve)\n\nOptions:\n• Renew/reinstate residence permit quickly\n• Transfer to eligible family member\n• Sell to eligible buyer\n• Convert to PT PMA structure (if commercial use)\n\nPrevention:\n• Track permit expiration dates carefully\n• Start renewal process 3-6 months before expiry\n• Maintain eligibility requirements\n• Keep immigration status compliant\n\nWork with immigration lawyer if facing permit issues."
        },
        {
          question: "Do I need insurance for my property?",
          answer: "Property insurance is not legally required but highly recommended:\n\nTypes of coverage:\n• Building insurance: Fire, natural disasters, structural damage\n• Contents insurance: Personal belongings and furnishings\n• Liability insurance: Guest injuries, third-party claims\n• Earthquake coverage: Critical in Indonesia (often separate policy)\n\nCosts:\n• Typically 0.1-0.3% of property value annually\n• Higher in disaster-prone areas\n• Discounts for security features\n\nConsiderations:\n• Foreign insurers vs local companies\n• Coverage limits and exclusions\n• Claim process and requirements\n• For rental properties: landlord-specific policies\n\nEssential for protecting your investment."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl -z-10" />
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Search className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">🔍 Knowledge Base</CardTitle>
          </div>
          <CardDescription className="text-base">Find instant answers to your investment questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Type your question here... 💭"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-primary/20 focus:border-primary/50 shadow-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredFAQs.map((category, idx) => {
          const Icon = category.icon;
          return (
            <Card key={idx} className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                  <Badge className="ml-auto bg-gradient-to-r from-primary to-accent text-primary-foreground">{category.faqs.length} topics</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}

        {filteredFAQs.length === 0 && (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="inline-block p-4 rounded-full bg-muted mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold mb-2">No results found for "{searchQuery}"</p>
              <p className="text-muted-foreground mb-4">Try different keywords or use our AI chat for personalized help</p>
              <Badge variant="secondary" className="text-sm">💬 Chat available in the "Ask AI" tab</Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
