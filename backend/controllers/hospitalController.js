// @desc    Search nearby hospitals
// @route   GET /api/hospitals/nearby
// @access  Public
export const getNearbyHospitals = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, type = 'hospital' } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        // If Google Maps API key is available, use real API
        if (process.env.GOOGLE_MAPS_API_KEY) {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
                `location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.status === 'OK') {
                const hospitals = data.results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    address: place.vicinity,
                    rating: place.rating || 0,
                    totalRatings: place.user_ratings_total || 0,
                    location: place.geometry.location,
                    openNow: place.opening_hours?.open_now,
                    types: place.types,
                    photoUrl: place.photos?.[0] ?
                        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                        : null
                }));

                return res.json({
                    success: true,
                    data: hospitals
                });
            }
        }

        // Return sample data if no API key
        const sampleHospitals = [
            {
                id: '1',
                name: 'City General Hospital',
                address: '123 Healthcare Ave',
                rating: 4.5,
                totalRatings: 342,
                location: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 },
                openNow: true,
                types: ['hospital', 'health'],
                distance: '1.2 km',
                phone: '+91 1234567890',
                specialties: ['Emergency', 'General Medicine', 'Surgery']
            },
            {
                id: '2',
                name: 'LifeCare Medical Center',
                address: '456 Wellness Blvd',
                rating: 4.8,
                totalRatings: 567,
                location: { lat: parseFloat(lat) - 0.01, lng: parseFloat(lng) + 0.02 },
                openNow: true,
                types: ['hospital', 'doctor'],
                distance: '2.5 km',
                phone: '+91 9876543210',
                specialties: ['Cardiology', 'Neurology', 'Orthopedics']
            },
            {
                id: '3',
                name: 'Wellness Clinic',
                address: '789 Health Street',
                rating: 4.2,
                totalRatings: 128,
                location: { lat: parseFloat(lat) + 0.02, lng: parseFloat(lng) - 0.01 },
                openNow: false,
                types: ['clinic', 'doctor'],
                distance: '3.1 km',
                phone: '+91 5555555555',
                specialties: ['Dermatology', 'Pediatrics', 'General Practice']
            },
            {
                id: '4',
                name: 'Emergency Care Hospital',
                address: '321 Urgent Care Lane',
                rating: 4.6,
                totalRatings: 890,
                location: { lat: parseFloat(lat) - 0.015, lng: parseFloat(lng) - 0.02 },
                openNow: true,
                types: ['hospital', 'emergency'],
                distance: '4.0 km',
                phone: '+91 1111111111',
                specialties: ['Emergency Care', 'Trauma', 'ICU']
            }
        ];

        res.json({
            success: true,
            data: sampleHospitals,
            note: 'Sample data - Add GOOGLE_MAPS_API_KEY for real hospital data'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get hospital details
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (process.env.GOOGLE_MAPS_API_KEY) {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?` +
                `place_id=${id}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.status === 'OK') {
                const place = data.result;
                return res.json({
                    success: true,
                    data: {
                        id: place.place_id,
                        name: place.name,
                        address: place.formatted_address,
                        phone: place.formatted_phone_number,
                        website: place.website,
                        rating: place.rating,
                        totalRatings: place.user_ratings_total,
                        location: place.geometry.location,
                        openingHours: place.opening_hours?.weekday_text,
                        reviews: place.reviews?.slice(0, 5)
                    }
                });
            }
        }

        // Sample data
        res.json({
            success: true,
            data: {
                id,
                name: 'Sample Hospital',
                address: '123 Healthcare Ave, Medical City',
                phone: '+91 1234567890',
                website: 'https://hospital.example.com',
                rating: 4.5,
                totalRatings: 342,
                openingHours: [
                    'Monday: 24 hours',
                    'Tuesday: 24 hours',
                    'Wednesday: 24 hours',
                    'Thursday: 24 hours',
                    'Friday: 24 hours',
                    'Saturday: 24 hours',
                    'Sunday: 24 hours'
                ],
                specialties: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics'],
                facilities: ['ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Blood Bank']
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get emergency contacts
// @route   GET /api/hospitals/emergency
// @access  Public
export const getEmergencyContacts = async (req, res) => {
    const emergencyContacts = [
        {
            name: 'Emergency Ambulance',
            number: '108',
            description: 'Free ambulance service',
            available: '24/7'
        },
        {
            name: 'National Emergency Number',
            number: '112',
            description: 'Police, Fire, Medical emergencies',
            available: '24/7'
        },
        {
            name: 'Poison Control',
            number: '1800-11-1234',
            description: 'Poison emergency helpline',
            available: '24/7'
        },
        {
            name: 'Mental Health Helpline',
            number: '9152987821',
            description: 'iCall - Mental health support',
            available: 'Mon-Sat 8AM-10PM'
        }
    ];

    res.json({
        success: true,
        data: emergencyContacts
    });
};

// @desc    Get specialists by type
// @route   GET /api/hospitals/specialists
// @access  Public
export const getSpecialists = async (req, res) => {
    const { specialty, lat, lng } = req.query;

    const specialistTypes = [
        { id: 'dermatologist', name: 'Dermatologist', icon: '🧴', description: 'Skin specialists' },
        { id: 'cardiologist', name: 'Cardiologist', icon: '❤️', description: 'Heart specialists' },
        { id: 'neurologist', name: 'Neurologist', icon: '🧠', description: 'Brain & nerves' },
        { id: 'orthopedic', name: 'Orthopedic', icon: '🦴', description: 'Bones & joints' },
        { id: 'pediatrician', name: 'Pediatrician', icon: '👶', description: 'Child specialists' },
        { id: 'gynecologist', name: 'Gynecologist', icon: '👩', description: 'Women health' },
        { id: 'ophthalmologist', name: 'Ophthalmologist', icon: '👁️', description: 'Eye specialists' },
        { id: 'ent', name: 'ENT Specialist', icon: '👂', description: 'Ear, Nose, Throat' },
        { id: 'psychiatrist', name: 'Psychiatrist', icon: '🧘', description: 'Mental health' },
        { id: 'general', name: 'General Physician', icon: '👨‍⚕️', description: 'General medicine' }
    ];

    if (!specialty) {
        return res.json({
            success: true,
            data: specialistTypes
        });
    }

    // Return specialist type info
    const specialistInfo = specialistTypes.find(s => s.id === specialty);

    res.json({
        success: true,
        data: {
            type: specialistInfo || { id: specialty, name: specialty },
            note: 'Use nearby hospitals endpoint with specialty filter for actual doctors'
        }
    });
};

export default {
    getNearbyHospitals,
    getHospitalDetails,
    getEmergencyContacts,
    getSpecialists
};
