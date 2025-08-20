const mongoose = require('mongoose');

const talentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Basic Information
  artisticName: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  biography: {
    type: String,
    maxlength: 1000
  },
  
  // Physical Characteristics
  height: {
    type: Number, // in cm
    min: 100,
    max: 250
  },
  weight: {
    type: Number, // in kg
    min: 30,
    max: 200
  },
  eyeColor: {
    type: String,
    enum: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'other']
  },
  hairColor: {
    type: String,
    enum: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'other']
  },
  
  // Location
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Iran'
  },
  
  // Skills and Languages
  skills: [{
    type: String,
    trim: true
  }],
  languages: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      required: true
    }
  }],
  
  // Images
  headshot: {
    url: String,
    publicId: String
  },
  portfolio: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contact Information
  phoneNumber: {
    type: String,
    trim: true
  },
  socialMedia: {
    instagram: String,
    telegram: String,
    website: String
  },
  
  // Status
  availabilityStatus: {
    type: String,
    enum: ['available', 'limited', 'unavailable'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Stats
  profileViews: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  successfulCastings: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
talentProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate age virtual field
talentProfileSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
talentProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TalentProfile', talentProfileSchema);