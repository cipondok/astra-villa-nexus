
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";

const PropertySampleData = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const sampleProperties = [
    {
      title: "Luxury Villa in Seminyak",
      description: "Beautiful 4-bedroom villa with private pool and garden. Modern design with traditional Balinese touches. Perfect for families or groups.",
      property_type: "villa",
      listing_type: "rent",
      price: 2500000,
      location: "Seminyak, Bali",
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 350,
      status: "active",
      approval_status: "approved"
    },
    {
      title: "Modern Apartment in Central Jakarta",
      description: "Contemporary 2-bedroom apartment in the heart of Jakarta. Great city views and close to business district.",
      property_type: "apartment",
      listing_type: "sale",
      price: 850000000,
      location: "Central Jakarta",
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 85,
      status: "active",
      approval_status: "approved"
    },
    {
      title: "Traditional House in Yogyakarta",
      description: "Charming traditional Javanese house with spacious courtyard. Rich cultural heritage and authentic architecture.",
      property_type: "house",
      listing_type: "sale",
      price: 450000000,
      location: "Yogyakarta",
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 200,
      status: "pending_approval",
      approval_status: "pending"
    },
    {
      title: "Beachfront Townhouse in Canggu",
      description: "Stunning beachfront townhouse with direct beach access. Perfect for surfers and beach lovers.",
      property_type: "townhouse",
      listing_type: "rent",
      price: 3500000,
      location: "Canggu, Bali",
      bedrooms: 3,
      bathrooms: 3,
      area_sqm: 180,
      status: "active",
      approval_status: "approved"
    },
    {
      title: "Commercial Space in Surabaya",
      description: "Prime commercial space in busy shopping district. Perfect for retail or office use.",
      property_type: "commercial",
      listing_type: "lease",
      price: 15000000,
      location: "Surabaya",
      bedrooms: null,
      bathrooms: 2,
      area_sqm: 120,
      status: "active",
      approval_status: "approved"
    },
    {
      title: "Investment Land in Ubud",
      description: "Prime development land with rice field views. Great potential for resort or residential development.",
      property_type: "land",
      listing_type: "sale",
      price: 750000000,
      location: "Ubud, Bali",
      bedrooms: null,
      bathrooms: null,
      area_sqm: 2500,
      status: "pending_approval",
      approval_status: "pending"
    },
    {
      title: "Family House in Bandung",
      description: "Comfortable family home in quiet residential area. Great for families with children.",
      property_type: "house",
      listing_type: "sale",
      price: 650000000,
      location: "Bandung",
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 180,
      status: "sold",
      approval_status: "approved"
    },
    {
      title: "Studio Apartment in Denpasar",
      description: "Cozy studio apartment perfect for young professionals. Modern amenities and good location.",
      property_type: "apartment",
      listing_type: "rent",
      price: 800000,
      location: "Denpasar, Bali",
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 35,
      status: "rejected",
      approval_status: "rejected"
    }
  ];

  useEffect(() => {
    const addSampleProperties = async () => {
      if (!user || user.email !== 'mycode103@gmail.com') return;

      try {
        // Check if properties already exist
        const { data: existingProperties } = await supabase
          .from('properties')
          .select('id')
          .limit(1);

        if (existingProperties && existingProperties.length > 0) {
          console.log('Properties already exist, skipping sample data creation');
          return;
        }

        // Get the admin user ID
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'mycode103@gmail.com')
          .single();

        if (!adminProfile) {
          showError("Error", "Admin profile not found");
          return;
        }

        // Insert sample properties
        const propertiesToInsert = sampleProperties.map(property => ({
          ...property,
          owner_id: adminProfile.id
        }));

        const { error } = await supabase
          .from('properties')
          .insert(propertiesToInsert);

        if (error) {
          showError("Error", `Failed to add sample properties: ${error.message}`);
        } else {
          showSuccess("Success", "Sample properties added successfully");
        }
      } catch (error: any) {
        showError("Error", `Failed to add sample properties: ${error.message}`);
      }
    };

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(addSampleProperties, 1000);
    return () => clearTimeout(timer);
  }, [user, showSuccess, showError]);

  return null; // This component doesn't render anything
};

export default PropertySampleData;
