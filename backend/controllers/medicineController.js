import User from '../models/User.js';
import { getMedicineAdvice, chatWithAI } from '../services/aiService.js';
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).send({ error: "Question is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ FIXED MODEL
      messages: [
        {
          role: "system",
          content: `
You are a healthcare AI assistant.

Give:
- Possible condition
- Medicines (OTC)
- Home remedies
- Diet advice
- When to see a doctor

Keep it short and safe.
`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    res.send({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).send({ error: error.message });
  }
};
// // @desc    Get medicine advice
// // @route   POST /api/medicine/advice
// // @access  Private
// export const getMedicineRecommendation = async (req, res) => {
//     try {
//         const { condition, symptoms } = req.body;

//         if (!condition) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide a condition or symptoms'
//             });
//         }

//         // Get user profile for safety checks
//         const user = await User.findById(req.user._id);
//         const userProfile = {
//             age: user.age,
//             gender: user.gender,
//             allergies: user.allergies,
//             medicalConditions: user.medicalConditions
//         };

//         const advice = await getMedicineAdvice(condition, symptoms || [], userProfile);

//         res.json({
//             success: true,
//             data: advice,
//             disclaimer: 'This information is for educational purposes only. Always consult a pharmacist or doctor before taking any medication. Never self-medicate for serious conditions.'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // @desc    Chat with AI health assistant
// // @route   POST /api/medicine/chat
// // @access  Private
// export const chat = async (req, res) => {
//     try {
//         const { message, conversationHistory } = req.body;

//         if (!message) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide a message'
//             });
//         }

//         // Get user profile for context
//         const user = await User.findById(req.user._id);
//         const userProfile = {
//             age: user.age,
//             gender: user.gender,
//             medicalConditions: user.medicalConditions
//         };

//         const response = await chatWithAI(message, conversationHistory || [], userProfile);

//         res.json({
//             success: true,
//             data: {
//                 message: response,
//                 disclaimer: 'This is AI-generated guidance, not medical advice. Consult a healthcare professional for proper diagnosis and treatment.'
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // @desc    Get general OTC medicine info
// // @route   GET /api/medicine/otc
// // @access  Public
// export const getOTCInfo = async (req, res) => {
//     const otcMedicines = [
//         {
//             category: 'Pain Relief',
//             medicines: [
//                 {
//                     name: 'Paracetamol (Acetaminophen)',
//                     uses: ['Fever', 'Mild pain', 'Headache'],
//                     commonBrands: ['Tylenol', 'Crocin', 'Dolo'],
//                     warnings: ['Do not exceed 4g per day', 'Avoid with liver problems', 'Avoid with alcohol']
//                 },
//                 {
//                     name: 'Ibuprofen',
//                     uses: ['Pain', 'Inflammation', 'Fever'],
//                     commonBrands: ['Advil', 'Brufen'],
//                     warnings: ['Take with food', 'Avoid if pregnant', 'Not for stomach ulcers']
//                 }
//             ]
//         },
//         {
//             category: 'Cold & Flu',
//             medicines: [
//                 {
//                     name: 'Antihistamines',
//                     uses: ['Runny nose', 'Sneezing', 'Allergies'],
//                     commonBrands: ['Benadryl', 'Cetirizine', 'Allegra'],
//                     warnings: ['May cause drowsiness', 'Avoid driving', 'Check with doctor if pregnant']
//                 }
//             ]
//         },
//         {
//             category: 'Digestive',
//             medicines: [
//                 {
//                     name: 'Antacids',
//                     uses: ['Heartburn', 'Acid reflux', 'Indigestion'],
//                     commonBrands: ['Tums', 'Digene', 'Gelusil'],
//                     warnings: ['Do not use long-term', 'May interact with other medicines']
//                 }
//             ]
//         },
//         {
//             category: 'Skin Care',
//             medicines: [
//                 {
//                     name: 'Hydrocortisone Cream',
//                     uses: ['Itching', 'Mild rashes', 'Insect bites'],
//                     commonBrands: ['Cortizone'],
//                     warnings: ['Use for max 7 days', 'Not for face', 'Avoid on broken skin']
//                 }
//             ]
//         }
//     ];

//     res.json({
//         success: true,
//         data: otcMedicines,
//         disclaimer: 'This is general information only. Always read the label and consult a pharmacist for specific advice.'
//     });
// };

// // @desc    Get telemedicine info
// // @route   GET /api/medicine/telemedicine
// // @access  Public
// export const getTelemedicineInfo = async (req, res) => {
//     const telemedicineServices = [
//         {
//             name: 'Consult Online',
//             description: 'Connect with verified doctors via video call',
//             availability: '24/7',
//             features: ['Video consultation', 'E-prescription', 'Follow-up care']
//         },
//         {
//             name: 'Emergency Helpline',
//             description: 'For medical emergencies',
//             number: '108 / 112',
//             note: 'Call immediately for life-threatening situations'
//         }
//     ];

//     res.json({
//         success: true,
//         data: telemedicineServices,
//         note: 'For medical emergencies, please call emergency services or visit the nearest hospital immediately.'
//     });
// };

// export default {
//     getMedicineRecommendation,
//     chat,
//     getOTCInfo,
//     getTelemedicineInfo
// };
