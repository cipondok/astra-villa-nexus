import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAlert } from "@/contexts/AlertContext";

const ContentSampleData = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { showSuccess, showError } = useAlert();

  const sampleContent = [
    {
      title: "Welcome to Property Hub",
      slug: "welcome-property-hub",
      type: "page",
      status: "published",
      content: {
        body: "Welcome to Property Hub - your ultimate destination for finding the perfect property. Whether you're looking to buy, sell, or rent, we're here to help you every step of the way.",
        sections: [
          {
            type: "hero",
            title: "Find Your Dream Property",
            subtitle: "Discover thousands of properties across Indonesia"
          }
        ]
      },
      seo_title: "Property Hub - Find Your Dream Property in Indonesia",
      seo_description: "Discover thousands of properties for sale and rent across Indonesia. Your trusted partner in real estate.",
      seo_keywords: ["property", "real estate", "Indonesia", "buy", "sell", "rent"],
      featured_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
    },
    {
      title: "How to Buy Your First Home",
      slug: "how-to-buy-first-home",
      type: "blog",
      status: "published",
      content: {
        body: "Buying your first home is an exciting milestone. Here's a comprehensive guide to help you navigate the process successfully.",
        sections: [
          {
            type: "content",
            title: "Step 1: Determine Your Budget",
            content: "Before you start looking, it's crucial to understand how much you can afford."
          },
          {
            type: "content",
            title: "Step 2: Get Pre-approved for a Mortgage",
            content: "Getting pre-approved shows sellers you're serious and gives you a clear budget."
          }
        ]
      },
      seo_title: "First Time Home Buyer Guide - Complete Guide 2024",
      seo_description: "Learn how to buy your first home with our comprehensive guide. Tips, tricks, and expert advice for first-time buyers.",
      seo_keywords: ["first home", "home buying", "real estate tips", "mortgage", "property guide"],
      featured_image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
    },
    {
      title: "Property Investment Trends 2024",
      slug: "property-investment-trends-2024",
      type: "blog",
      status: "published",
      content: {
        body: "The Indonesian property market continues to evolve. Here are the key trends shaping property investment in 2024.",
        sections: [
          {
            type: "content",
            title: "Emerging Markets",
            content: "Secondary cities are showing strong growth potential for investors."
          },
          {
            type: "content",
            title: "Sustainable Properties",
            content: "Green buildings and eco-friendly developments are gaining popularity."
          }
        ]
      },
      seo_title: "Property Investment Trends 2024 - Indonesia Real Estate Market",
      seo_description: "Discover the latest property investment trends in Indonesia for 2024. Expert insights and market analysis.",
      seo_keywords: ["property investment", "real estate trends", "Indonesia property", "investment opportunities"],
      featured_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    },
    {
      title: "About Property Hub",
      slug: "about-us",
      type: "page",
      status: "published",
      content: {
        body: "Property Hub is Indonesia's leading property platform, connecting buyers, sellers, and renters with their perfect properties.",
        sections: [
          {
            type: "content",
            title: "Our Mission",
            content: "To revolutionize the property market in Indonesia by providing transparent, efficient, and user-friendly property services."
          },
          {
            type: "content",
            title: "Our Values",
            content: "Trust, transparency, innovation, and customer satisfaction are at the core of everything we do."
          }
        ]
      },
      seo_title: "About Property Hub - Leading Property Platform in Indonesia",
      seo_description: "Learn about Property Hub, Indonesia's trusted property platform connecting buyers, sellers, and renters.",
      seo_keywords: ["about property hub", "property platform", "real estate company", "Indonesia"],
      featured_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    },
    {
      title: "Frequently Asked Questions",
      slug: "faq",
      type: "faq",
      status: "published",
      content: {
        faqs: [
          {
            question: "How do I list my property?",
            answer: "Simply create an account, verify your details, and use our easy listing form to add your property."
          },
          {
            question: "Are there any fees for listing?",
            answer: "Basic listings are free. We offer premium features for enhanced visibility at competitive rates."
          },
          {
            question: "How long does verification take?",
            answer: "Property verification typically takes 24-48 hours during business days."
          }
        ]
      },
      seo_title: "FAQ - Property Hub Frequently Asked Questions",
      seo_description: "Find answers to common questions about using Property Hub platform.",
      seo_keywords: ["FAQ", "property hub help", "property listing questions"],
      featured_image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800"
    },
    {
      title: "New Property Regulations 2024",
      slug: "property-regulations-2024",
      type: "news",
      status: "published",
      content: {
        body: "The Indonesian government has announced new property regulations that will take effect in 2024.",
        sections: [
          {
            type: "content",
            title: "Key Changes",
            content: "New foreign ownership rules and improved property transfer processes."
          }
        ]
      },
      seo_title: "New Property Regulations 2024 - Indonesia Real Estate Updates",
      seo_description: "Stay updated with the latest property regulations in Indonesia for 2024.",
      seo_keywords: ["property regulations", "Indonesia property law", "real estate news"],
      featured_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    },
    {
      title: "Premium Property Showcase",
      slug: "premium-properties",
      type: "page",
      status: "draft",
      content: {
        body: "Discover our collection of premium properties featuring luxury amenities and prime locations.",
        sections: [
          {
            type: "gallery",
            title: "Featured Premium Properties",
            description: "Handpicked selection of the finest properties available."
          }
        ]
      },
      seo_title: "Premium Properties - Luxury Real Estate in Indonesia",
      seo_description: "Explore premium and luxury properties in Indonesia's most desirable locations.",
      seo_keywords: ["premium properties", "luxury real estate", "high-end properties"],
      featured_image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
    },
    {
      title: "Property Market Analysis Q4 2023",
      slug: "market-analysis-q4-2023",
      type: "blog",
      status: "archived",
      content: {
        body: "A comprehensive analysis of the Indonesian property market performance in Q4 2023.",
        sections: [
          {
            type: "content",
            title: "Market Performance",
            content: "Overall market showed steady growth with regional variations."
          }
        ]
      },
      seo_title: "Property Market Analysis Q4 2023 - Indonesia Real Estate Report",
      seo_description: "Detailed analysis of Indonesian property market performance in Q4 2023.",
      seo_keywords: ["market analysis", "property market", "real estate report", "Q4 2023"],
      featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
    }
  ];

  useEffect(() => {
    const addSampleContent = async () => {
      // Only run for admins to avoid RLS issues
      if (!user || !isAdmin) {
        console.log('User not admin, skipping sample content creation');
        return;
      }

      try {
        console.log('Starting sample content creation process...');
        
        // Skip the problematic existence check and proceed directly to insertion
        // We'll handle duplicate errors gracefully in the catch block
        console.log('Creating sample content for admin...');

        // Insert sample content with the user's ID as author
        const contentToInsert = sampleContent.map(content => ({
          ...content,
          author_id: user.id
        }));

        // Try to insert each piece of content individually to avoid conflicts
        let successCount = 0;
        let skipCount = 0;

        for (const content of contentToInsert) {
          try {
            const { error: insertError } = await supabase
              .from('cms_content')
              .insert([content]);

            if (insertError) {
              // If it's a duplicate key error, skip it silently
              if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
                skipCount++;
                console.log(`Content with slug "${content.slug}" already exists, skipping...`);
              } else {
                console.error('Error inserting individual content:', insertError);
              }
            } else {
              successCount++;
            }
          } catch (err) {
            console.error('Error with individual content insert:', err);
          }
        }

        if (successCount > 0) {
          console.log(`Sample content creation completed: ${successCount} new items, ${skipCount} skipped`);
          showSuccess("Success", `Added ${successCount} new sample content items`);
        } else if (skipCount > 0) {
          console.log('All sample content already exists');
        }

      } catch (error: any) {
        console.error('Unexpected error during sample content creation:', error);
        // Don't show error for duplicate content
        if (!error.message?.includes('duplicate')) {
          showError("Error", `Failed to add sample content: ${error.message}`);
        }
      }
    };

    // Add a small delay to ensure the component is mounted and user is loaded
    const timer = setTimeout(addSampleContent, 1500);
    return () => clearTimeout(timer);
  }, [user, showSuccess, showError]);

  return null; // This component doesn't render anything
};

export default ContentSampleData;
