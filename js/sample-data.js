// Default sample dummy biodata for new users and demo mode
export const sampleBiodata = {
  slug: "rahul-sharma",
  status: "draft",
  template: "classic",
  auspiciousMotto: "॥ श्री गणेशाय नमः ॥",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  personal: {
    fullName: "Rahul Sharma",
    gender: "Male",
    dob: "1997-04-15",
    age: "27",
    height: "5 ft 10 in (178 cm)",
    weight: "72 kg",
    bloodGroup: "B+",
    complexion: "Fair",
    maritalStatus: "Never Married",
    motherTongue: "Hindi",
    religion: "Hindu",
    caste: "Brahmin",
    gotra: "Kaushik",
    currentCity: "New Delhi",
    nativePlace: "Jaipur, Rajasthan"
  },

  contact: {
    phone: "+91 98765 43210",
    phonePublic: true,
    whatsapp: "+91 98765 43210",
    whatsappPublic: true,
    email: "rahul.sharma@example.com",
    emailPublic: false,
    address: "Rohini, New Delhi - 110085",
    addressPublic: false,
    homeMapUrl: "https://maps.google.com/?q=Rohini,+New+Delhi,+Delhi+110085",
    isCurrentSameAsHome: true,
    currentAddress: "",
    currentAddressPublic: false,
    currentMapUrl: "",
    contactPerson: "Shri Suresh Sharma",
    contactPersonRelation: "Father"
  },

  education: [
    {
      degree: "B.Tech in Computer Science",
      institution: "Delhi Technological University (DTU)",
      year: "2019",
      description: "First Class Distinction"
    },
    {
      degree: "Senior Secondary (XII - CBSE)",
      institution: "Delhi Public School, R.K. Puram",
      year: "2015",
      description: "Science Stream (PCM) - 94%"
    }
  ],

  career: {
    profession: "Software Engineer",
    company: "Microsoft India",
    designation: "Senior Software Engineer",
    location: "Noida / Gurugram (Hybrid)",
    annualIncome: "₹28 - 32 LPA",
    incomePublic: true,
    experience: "5+ Years"
  },

  family: {
    fatherName: "Shri Suresh Sharma",
    fatherProfession: "Retired Class-I Gazetted Officer, Central Govt.",
    motherName: "Smt. Sunita Sharma",
    motherProfession: "Homemaker",
    familyType: "Nuclear Family",
    familyValues: "Moderate & Traditional",
    nativePlace: "Jaipur, Rajasthan",
    additionalInfo: "Well-settled, respected family rooted in cultural values and mutual respect."
  },

  siblings: [
    {
      relation: "Brother",
      name: "Aman Sharma",
      age: "24",
      maritalStatus: "Unmarried",
      profession: "Data Analyst at Deloitte"
    },
    {
      relation: "Sister",
      name: "Pooja Sharma",
      age: "29",
      maritalStatus: "Married",
      profession: "Architect, living in Bengaluru"
    }
  ],

  lifestyle: {
    diet: "Vegetarian",
    smoking: "No",
    drinking: "No",
    hobbies: "Photography, Badminton, Reading, Weekend road trips",
    interests: "Technology, Classical Music, Travel",
    languages: "English, Hindi"
  },

  horoscope: {
    enabled: true,
    rashi: "Mesh (Aries)",
    nakshatra: "Ashwini",
    gotra: "Kaushik",
    manglik: "Non-Manglik",
    birthTime: "08:45 AM",
    birthPlace: "Jaipur, Rajasthan"
  },

  preferences: {
    preferredAge: "23 - 27 Years",
    preferredHeight: "5 ft 2 in - 5 ft 8 in",
    education: "Graduate / Post-Graduate in professional field",
    profession: "Working professional or career-oriented",
    location: "Delhi NCR / North India / Flexible",
    lifestyle: "Vegetarian, simple and family-oriented",
    expectations: "Looking for an educated, kind, and understanding life partner who values both modern independence and cultural roots."
  },

  about: "Warm greetings! I am a calm, ambitious, and family-oriented software engineer who values honesty, kindness, and continuous personal growth. Outside work, I enjoy photography, exploring new cafes, reading, and spending quality time with family and close friends. I believe marriage is a beautiful journey built on mutual respect, companionship, and shared dreams.",

  photos: [
    { src: "assets/images/profile.svg", caption: "Profile Photograph", isPrimary: true },
    { src: "assets/images/gallery1.svg", caption: "Casual Portrait" },
    { src: "assets/images/gallery2.svg", caption: "Outdoor" },
    { src: "assets/images/family.svg", caption: "With Family" }
  ]
};
