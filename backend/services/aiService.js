import axios from 'axios';
import groq from './groqClient.js';

const HF_TOKEN = process.env.HF_TOKEN || null;

const bodyPartKeywords = [
  'arm', 'leg', 'hand', 'foot', 'face', 'eye', 'ear', 'nose', 'mouth', 'throat',
  'knee', 'elbow', 'back', 'chest', 'abdomen', 'stomach', 'head', 'neck',
  'shoulder', 'wrist', 'ankle', 'finger', 'toe', 'skin', 'scalp', 'hip', 'jaw'
];

const isBodyPartDescription = (description = '') => {
  const normalized = description.toLowerCase();
  return bodyPartKeywords.some(keyword => normalized.includes(keyword));
};

const normalizeListField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/\n|\r|\u2022|\*|\-|\•/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  return [];
};

const normalizePossibleCauses = (value) => {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        return { condition: item, probability: 'Medium', description: '' };
      }
      return {
        condition: item.condition || item.text || 'Possible cause',
        probability: item.probability || 'Medium',
        description: item.description || ''
      };
    });
  }
  if (typeof value === 'string') {
    return normalizeListField(value).map(item => ({ condition: item, probability: 'Medium', description: '' }));
  }
  return [];
};

const normalizeBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['true', 'yes', 'y', '1'].includes(lowered)) return true;
    if (['false', 'no', 'n', '0'].includes(lowered)) return false;
  }
  return fallback;
};

const normalizeSeverity = (value) => {
  const safe = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (['mild', 'moderate', 'urgent'].includes(safe)) return safe;
  if (safe.includes('urgent') || safe.includes('severe')) return 'urgent';
  if (safe.includes('moderate') || safe.includes('medium')) return 'moderate';
  return 'moderate';
};

const normalizeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const extractSection = (text, heading) => {
  const regex = new RegExp(`${heading}[:\n]\s*([\s\S]*?)(?:\n\s*\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

const extractListFromText = (text) => {
  return text
    .split(/\n|\r|\u2022|\*|\-|\•/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && !/^(possible causes|recommended actions|home remedy suggestions|warning signs to watch|symptoms|medicine|consider seeing a doctor|urgent|mild|moderate)$/i.test(item));
};

const extractBooleanFromText = (text) => {
  const normalized = text.toLowerCase();
  if (normalized.includes('yes') || normalized.includes('recommend') || normalized.includes('should see a doctor') || normalized.includes('see a doctor') || normalized.includes('urgent')) return true;
  if (normalized.includes('no') || normalized.includes('not necessary') || normalized.includes('routine')) return false;
  return true;
};

// Helper function to call Hugging Face API with enhanced error handling
const callHuggingFace = async (model, inputs, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs, parameters: { max_new_tokens: 1024, temperature: 0.7 } },
        {
          headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {},
          timeout: 60000
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Hugging Face API Error (attempt ${attempt + 1}):`, error.message);
      if (attempt === maxRetries) return null;
      await new Promise(r => setTimeout(r, 2000)); // Wait before retry
    }
  }
  return null;
};

/**
 * Analyze health image - Professional medical assessment style using GROQ
 */
export const analyzeHealthImage = async (imagePath, userDescription = '') => {
  try {
    const normalizedDescription = (userDescription || '').trim();

    if (!normalizedDescription || !isBodyPartDescription(normalizedDescription)) {
      return {
        analysisStatus: 'invalid',
        analysisMessage: 'Analysis Results Invalid',
        possibleCauses: [],
        symptoms: [],
        medicine: [],
        recommendedActions: [],
        advice: [],
        homeRemedySuggestions: [],
        warningSignsToWatch: [],
        shouldSeeDoctor: false,
        urgencyNote: '',
        severityLevel: 'mild',
        severityScore: 0
      };
    }

    const prompt = `You are a healthcare AI assistant. Based on the following body-part image description, return ONLY a JSON object with these exact fields:
{
  "analysisStatus": "valid",
  "analysisMessage": "Analysis Results Generated",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "medicine": ["medicine1 with dosage", "medicine2 with dosage"],
  "possibleCauses": [{"condition": "cause1", "probability": "High", "description": "description"}, {"condition": "cause2", "probability": "Medium", "description": "description"}],
  "severityLevel": "mild|moderate|urgent",
  "severityScore": 5,
  "recommendedActions": ["action1", "action2", "action3"],
  "homeRemedySuggestions": ["remedy1", "remedy2", "remedy3"],
  "shouldSeeDoctor": true|false,
  "urgencyNote": "brief urgency description",
  "warningSignsToWatch": ["sign1", "sign2", "sign3"]
}

If the input is a valid body-part image, provide comprehensive analysis with:
- symptoms: Array of 2-4 specific symptoms observed
- medicine: Array of 2-4 relevant over-the-counter medicines with suggested dosage
- possibleCauses: Array of 2-3 likely causes with probability levels
- recommendedActions: Array of 3-4 actionable steps to take
- homeRemedySuggestions: Array of 3-4 home remedies
- shouldSeeDoctor: true if concerning, false if minor
- warningSignsToWatch: Array of 2-3 warning signs

If NOT a body-part image, return:
{
  "analysisStatus": "invalid",
  "analysisMessage": "Analysis Results Invalid",
  "symptoms": [],
  "medicine": [],
  "possibleCauses": [],
  "severityLevel": "mild",
  "severityScore": 0,
  "recommendedActions": [],
  "homeRemedySuggestions": [],
  "shouldSeeDoctor": false,
  "urgencyNote": "",
  "warningSignsToWatch": []
}

Return ONLY the JSON object with no additional text.
Image path: ${imagePath || 'not available'}
Description: ${normalizedDescription}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant that provides general guidance and safety-aware advice. Do not provide diagnoses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const analysisText = completion.choices?.[0]?.message?.content?.trim() || '';
    let groqAnalysis = {};
    let parsedSuccessfully = false;

    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : analysisText;

    try {
      groqAnalysis = JSON.parse(jsonText);
      parsedSuccessfully = true;
    } catch (parseError) {
      console.warn('GROQ image analysis response could not be parsed as JSON:', parseError.message, 'raw response:', analysisText);
    }

    if (!parsedSuccessfully) {
      const possibleCausesText = extractSection(analysisText, 'Possible Causes') || extractSection(analysisText, 'Possible cause');
      const recommendedActionsText = extractSection(analysisText, 'Recommended Actions') || extractSection(analysisText, 'Recommended actions');
      const homeRemedyText = extractSection(analysisText, 'Home Remedy Suggestions') || extractSection(analysisText, 'Home remedies');
      const warningSignsText = extractSection(analysisText, 'Warning Signs to Watch') || extractSection(analysisText, 'Watch for These Signs');
      const symptomsText = extractSection(analysisText, 'Symptoms');
      const medicineText = extractSection(analysisText, 'Medicine Suggestions');
      const doctorText = extractSection(analysisText, 'Consider seeing a doctor');
      const urgencyText = extractSection(analysisText, 'Urgency Note') || extractSection(analysisText, 'Urgency');

      groqAnalysis = {
        analysisStatus: analysisText.toLowerCase().includes('analysis results invalid') ? 'invalid' : 'valid',
        analysisMessage: analysisText.toLowerCase().includes('analysis results invalid') ? 'Analysis Results Invalid' : 'Analysis Results Generated',
        possibleCauses: possibleCausesText ? normalizeListField(possibleCausesText) : [],
        symptoms: symptomsText ? normalizeListField(symptomsText) : [],
        medicine: medicineText ? normalizeListField(medicineText) : [],
        recommendedActions: recommendedActionsText ? normalizeListField(recommendedActionsText) : [],
        advice: recommendedActionsText ? normalizeListField(recommendedActionsText) : [],
        homeRemedySuggestions: homeRemedyText ? normalizeListField(homeRemedyText) : [],
        warningSignsToWatch: warningSignsText ? normalizeListField(warningSignsText) : [],
        shouldSeeDoctor: extractBooleanFromText(doctorText || analysisText),
        urgencyNote: urgencyText || '',
        severityLevel: normalizeSeverity(analysisText),
        severityScore: normalizeNumber(analysisText.match(/\d+/)?.[0], 5)
      };
    }

    return {
      analysisStatus: groqAnalysis.analysisStatus === 'invalid' ? 'invalid' : 'valid',
      analysisMessage: groqAnalysis.analysisMessage || groqAnalysis.message || 'Analysis Results Generated',
      possibleCauses: normalizePossibleCauses(groqAnalysis.possibleCauses),
      symptoms: normalizeListField(groqAnalysis.symptoms),
      medicine: normalizeListField(groqAnalysis.medicine),
      recommendedActions: normalizeListField(groqAnalysis.recommendedActions),
      advice: normalizeListField(groqAnalysis.advice),
      homeRemedySuggestions: normalizeListField(groqAnalysis.homeRemedySuggestions),
      warningSignsToWatch: normalizeListField(groqAnalysis.warningSignsToWatch),
      shouldSeeDoctor: normalizeBoolean(groqAnalysis.shouldSeeDoctor, true),
      urgencyNote: typeof groqAnalysis.urgencyNote === 'string' ? groqAnalysis.urgencyNote : '',
      severityLevel: normalizeSeverity(groqAnalysis.severityLevel),
      severityScore: normalizeNumber(groqAnalysis.severityScore, 5)
    };
  } catch (error) {
    console.error('Image Analysis Error:', error);
    throw error;
  }
};

/**
 * Analyze symptoms - Comprehensive clinical assessment
 */
export const analyzeSymptoms = async (symptoms, userProfile = {}) => {
  try {
    const symptomList = symptoms.map(s => `${s.name} (severity: ${s.severity}/10)`).join(', ');
    const age = userProfile.age || 'Adult';
    const gender = userProfile.gender || 'Not specified';
    const allergies = userProfile.allergies?.join(', ') || 'No known allergies';
    const conditions = userProfile.medicalConditions?.join(', ') || 'None reported';

    const enhancedPrompt = `
You are an experienced physician providing a thorough clinical assessment. 

PATIENT INFORMATION:
- Age: ${age}
- Gender: ${gender}
- Known Allergies: ${allergies}
- Existing Conditions: ${conditions}

PRESENTING SYMPTOMS:
${symptomList}

Provide a comprehensive clinical assessment including:
1. Most likely diagnoses (differential diagnosis)
2. Clinical reasoning for each possibility
3. Recommended next steps
4. Red flag symptoms to monitor
5. Self-care recommendations
6. When to seek emergency care

Remember: This is educational guidance only, not a diagnosis. Always recommend professional consultation for proper evaluation.
`;

    const result = await callHuggingFace('mistralai/Mistral-7B-Instruct-v0.2', enhancedPrompt);

    // Determine urgency based on symptom severity
    const avgSeverity = symptoms.reduce((acc, s) => acc + s.severity, 0) / symptoms.length;
    const hasHighSeverity = symptoms.some(s => s.severity >= 7);

    let urgencyLevel = 'routine';
    if (hasHighSeverity || avgSeverity >= 7) urgencyLevel = 'urgent';
    else if (avgSeverity >= 5) urgencyLevel = 'soon';

    // Build comprehensive response
    const aiResponse = result?.[0]?.generated_text || '';

    return {
      clinicalAssessment: {
        patientSummary: `${age} ${gender} presenting with ${symptoms.length} symptom(s)`,
        symptomAnalysis: symptoms.map(s => ({
          symptom: s.name,
          severity: s.severity,
          clinicalSignificance: s.severity >= 7 ? 'High' : s.severity >= 4 ? 'Moderate' : 'Mild'
        }))
      },

   possibleConditions: [
  {
          condition: "Primary clinical consideration",
          probability: hasHighSeverity ? "High" : "Medium",
          description: "Based on symptom constellation and severity profile. Formal diagnosis requires clinical examination and potentially diagnostic testing.",
    matchingSymptoms: symptoms.map(s => s.name),
          clinicalReasoning: "Symptom pattern suggests need for comprehensive evaluation"
        },
        {
          condition: "Alternative diagnosis to consider",
          probability: "Medium",
          description: "Differential diagnosis should include multiple possibilities until proper evaluation is completed.",
          matchingSymptoms: symptoms.slice(0, Math.ceil(symptoms.length / 2)).map(s => s.name),
          clinicalReasoning: "Cannot exclude without proper clinical workup"
  } 
      ],

      recommendations: [
        "Document symptom onset, duration, and any triggering factors",
        "Track symptom progression with daily notes or symptom diary",
        "Monitor vital signs if possible (temperature, pulse, blood pressure)",
        "Ensure adequate hydration and nutrition",
        "Get sufficient rest to support immune function",
        "Avoid self-medicating with multiple OTC medications without guidance"
      ],

      shouldSeeDoctor: avgSeverity >= 4 || hasHighSeverity,
      urgencyLevel: urgencyLevel,

      urgencyGuidance: {
        routine: "Schedule appointment within 1-2 weeks if symptoms persist",
        soon: "Seek medical evaluation within 24-72 hours",
        urgent: "Contact healthcare provider today or visit urgent care",
        emergency: "Call emergency services or go to nearest emergency room immediately"
      }[urgencyLevel],

      suggestedSpecialist: determineSpecialist(symptoms),

      selfCareTips: [
        "Rest in a comfortable, well-ventilated environment",
        "Stay well-hydrated (8-10 glasses of water daily)",
        "Eat light, nutritious meals even if appetite is reduced",
        "Avoid alcohol and caffeine which can worsen some symptoms",
        "Practice stress-reduction techniques if applicable",
        "Keep a symptom journal to share with your healthcare provider"
      ],

      redFlagSymptoms: [
        "Chest pain, pressure, or tightness",
        "Difficulty breathing or shortness of breath at rest",
        "Sudden severe headache (worst headache of life)",
        "Confusion or altered mental status",
        "Uncontrolled bleeding",
        "Signs of stroke: facial drooping, arm weakness, speech difficulty",
        "High fever (>103°F/39.4°C) not responding to medication",
        "Severe abdominal pain",
        "Signs of dehydration in setting of inability to keep fluids down"
      ],

      warningSymptoms: [
        "Symptoms worsening despite home treatment",
        "New symptoms developing",
        "Fever lasting more than 3 days",
        "Inability to perform daily activities",
        "Symptoms interfering with sleep",
        "Return of symptoms after initial improvement"
      ],

      aiAnalysis: aiResponse ? aiResponse.substring(0, 500) : "AI analysis unavailable - using clinical protocols",

      disclaimer: "This assessment is for educational purposes only. It does not replace professional medical evaluation. Symptom presentation can vary significantly, and proper diagnosis requires history, physical examination, and often diagnostic testing. Please consult a qualified healthcare provider."
    };
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    throw error;
  }
};

// Helper to determine appropriate specialist
function determineSpecialist(symptoms) {
  const symptomNames = symptoms.map(s => s.name.toLowerCase());

  if (symptomNames.some(s => s.includes('headache') || s.includes('dizzy') || s.includes('numbness'))) {
    return 'Neurologist';
  }
  if (symptomNames.some(s => s.includes('chest') || s.includes('heart') || s.includes('palpitation'))) {
    return 'Cardiologist';
  }
  if (symptomNames.some(s => s.includes('stomach') || s.includes('nausea') || s.includes('abdomen'))) {
    return 'Gastroenterologist';
  }
  if (symptomNames.some(s => s.includes('joint') || s.includes('muscle') || s.includes('back'))) {
    return 'Orthopedist or Rheumatologist';
  }
  if (symptomNames.some(s => s.includes('skin') || s.includes('rash') || s.includes('itch'))) {
    return 'Dermatologist';
  }
  if (symptomNames.some(s => s.includes('cough') || s.includes('breathing') || s.includes('wheeze'))) {
    return 'Pulmonologist';
  }
  if (symptomNames.some(s => s.includes('anxiety') || s.includes('depression') || s.includes('sleep'))) {
    return 'Psychiatrist or Psychologist';
  }
  return 'Primary Care Physician / General Practitioner';
}

/**
 * Get medicine advice - Evidence-based OTC recommendations
 */
export const getMedicineAdvice = async (condition, symptoms, userProfile = {}) => {
  try {
    const age = userProfile.age || 'Adult';
    const allergies = userProfile.allergies || [];
    const conditions = userProfile.medicalConditions || [];

    return {
      clinicalContext: `OTC medication guidance for ${condition}`,
      patientConsiderations: {
        age: age,
        allergies: allergies.length ? allergies : ['No known drug allergies reported'],
        conditions: conditions.length ? conditions : ['No chronic conditions reported'],
        importantNote: "Always verify no contraindications with your pharmacist or physician"
      },

      otcSuggestions: [
        {
          name: "Acetaminophen (Tylenol, Paracetamol)",
          category: "Analgesic/Antipyretic",
          indication: "Pain relief, fever reduction",
          dosage: {
            adult: "325-650mg every 4-6 hours as needed (max 3000mg/day)",
            caution: "Reduce dose in elderly; max 2000mg/day with liver concerns"
          },
          mechanism: "Reduces pain signals and lowers body temperature set-point",
          warnings: [
            "Do not exceed maximum daily dose - risk of liver damage",
            "Avoid alcohol while taking",
            "Check all medications for hidden acetaminophen",
            "Contraindicated in severe liver disease"
          ],
          interactions: ["Warfarin - may increase bleeding risk", "Alcohol - increased liver toxicity risk"]
        },
        {
          name: "Ibuprofen (Advil, Motrin)",
          category: "NSAID - Anti-inflammatory",
          indication: "Pain, inflammation, fever",
          dosage: {
            adult: "200-400mg every 4-6 hours as needed (max 1200mg/day OTC)",
            caution: "Take with food to reduce GI upset"
          },
          mechanism: "Blocks prostaglandin synthesis, reducing inflammation and pain",
          warnings: [
            "Take with food or milk to protect stomach",
            "Avoid in kidney disease, heart failure, or GI bleeding history",
            "Not recommended in third trimester of pregnancy",
            "May worsen asthma in some individuals"
          ],
          interactions: ["Blood thinners - increased bleeding risk", "ACE inhibitors - reduced effectiveness", "Aspirin - may reduce cardioprotective effects"]
        },
        {
          name: "Diphenhydramine (Benadryl)",
          category: "Antihistamine",
          indication: "Allergic reactions, itching, sleep aid",
          dosage: {
            adult: "25-50mg every 4-6 hours as needed (max 300mg/day)",
            caution: "May cause significant drowsiness"
          },
          mechanism: "Blocks histamine H1 receptors, reducing allergic response",
          warnings: [
            "Causes drowsiness - do not drive or operate machinery",
            "Use caution in elderly - may cause confusion",
            "Avoid with glaucoma or urinary retention",
            "May interact with many medications"
          ],
          interactions: ["CNS depressants - additive sedation", "Anticholinergic drugs - additive effects"]
        }
      ],

      prescriptionNote: {
        when: "Prescription medication may be needed if:",
        criteria: [
          "OTC medications provide inadequate relief",
          "Symptoms persist beyond 7-10 days",
          "Underlying condition requires specific treatment",
          "Risk of drug interactions with current medications",
          "Suspicion of bacterial infection requiring antibiotics"
        ]
      },

      generalGuidance: [
        "Always read and follow package directions carefully",
        "Start with lowest effective dose",
        "Do not combine multiple products with same active ingredient",
        "Keep a list of all medications to show your healthcare provider",
        "Store medications properly and check expiration dates",
        "When in doubt, consult a pharmacist - they are medication experts"
      ],

      whenToAvoid: [
        "Known allergy to the medication or similar drugs",
        "Specific contraindications based on your health conditions",
        "Potential interactions with your current medications",
        "Pregnancy or breastfeeding (consult provider first)",
        "Symptoms suggesting serious underlying condition"
      ],

      seeDoctor: true,
      doctorReasons: [
        "Symptoms not improving after 3-5 days of appropriate OTC treatment",
        "Symptoms worsening despite treatment",
        "Need for stronger or prescription-only medications",
        "Uncertainty about appropriate self-treatment",
        "Presence of underlying conditions affecting treatment choice",
        "Multiple symptoms requiring comprehensive evaluation"
      ],

      disclaimer: "This OTC medication guidance is for educational purposes only. Individual responses to medications vary. Consult a pharmacist or physician before starting any new medication, especially with existing health conditions or other medications."
    };
  } catch (error) {
    console.error('Medicine Advice Error:', error);
    throw error;
  }
};

/**
 * Get home remedies - Evidence-informed natural approaches
 */
export const getHomeRemedies = async (condition, symptoms = []) => {
  try {
    const prompt = `As a healthcare professional, provide evidence-based natural remedies and lifestyle modifications for: ${condition}. Include scientific rationale where applicable. Focus on safe, well-established approaches.`;

    const result = await callHuggingFace('mistralai/Mistral-7B-Instruct-v0.2', prompt);

    return {
      condition: condition,
      clinicalContext: "Evidence-informed complementary approaches - Use alongside, not instead of, medical care when needed",

      remedies: [
        {
          name: "Warm Saltwater Gargle",
          description: "Osmotic action helps reduce throat swelling and flush irritants",
          instructions: "Dissolve 1/2 teaspoon salt in 8oz warm water. Gargle for 30 seconds, 3-4 times daily.",
          ingredients: ["Table salt or sea salt", "Warm water (not hot)"],
          evidenceLevel: "Moderate - supported by clinical studies",
          effectiveness: "High for sore throat relief",
          precautions: ["Do not swallow", "Avoid with sodium-restricted diet"]
        },
        {
          name: "Honey and Warm Lemon Water",
          description: "Honey has antimicrobial properties; vitamin C supports immune function",
          instructions: "Mix 1-2 tablespoons honey in warm water with fresh lemon juice. Drink 2-3 times daily.",
          ingredients: ["Raw honey (not for children under 1 year)", "Fresh lemon", "Warm water"],
          evidenceLevel: "Moderate - honey shown effective for cough in studies",
          effectiveness: "Medium-High for cough and throat soothing",
          precautions: ["Never give honey to infants under 12 months", "Monitor blood sugar in diabetics"]
        },
        {
          name: "Ginger Tea",
          description: "Contains gingerols with anti-inflammatory and anti-nausea properties",
          instructions: "Slice fresh ginger (1 inch piece), simmer in 2 cups water for 10-15 minutes. Strain and add honey if desired.",
          ingredients: ["Fresh ginger root", "Water", "Honey (optional)", "Lemon (optional)"],
          evidenceLevel: "Good - multiple studies support anti-nausea and anti-inflammatory effects",
          effectiveness: "High for nausea; Medium for cold symptoms",
          precautions: ["May interact with blood thinners", "Limit to 4g/day ginger"]
        },
        {
          name: "Steam Inhalation",
          description: "Moistens airways, loosens congestion, provides temporary relief",
          instructions: "Lean over a bowl of hot (not boiling) water, drape towel over head, breathe deeply for 5-10 minutes. Optional: add 2-3 drops eucalyptus oil.",
          ingredients: ["Hot water", "Large bowl", "Towel", "Eucalyptus or peppermint oil (optional)"],
          evidenceLevel: "Moderate - provides symptomatic relief",
          effectiveness: "High for congestion relief",
          precautions: ["Keep face 12+ inches from water to avoid burns", "Supervise children closely", "Not recommended for asthmatics with essential oils"]
        },
        {
          name: "Cold/Warm Compress",
          description: "Cold reduces inflammation; warmth increases blood flow and relaxes muscles",
          instructions: "Cold: Apply ice wrapped in cloth for 15-20 min. Warm: Use warm towel or heating pad for 15-20 min. Alternate as needed.",
          ingredients: ["Ice pack or frozen vegetables", "Warm towel or heating pad", "Protective cloth"],
          evidenceLevel: "Strong - well-established for pain and inflammation",
          effectiveness: "High for musculoskeletal issues",
          precautions: ["Never apply ice directly to skin", "Check temperature of heating pad", "Avoid heat on acute injuries first 48 hours"]
        }
      ],

      dietTips: [
        {
          tip: "Anti-inflammatory nutrition",
          rationale: "Reduces systemic inflammation and supports immune function",
          foods: ["Fatty fish (salmon, mackerel)", "Leafy greens", "Berries", "Nuts", "Olive oil", "Turmeric"],
          frequency: "Incorporate daily"
        },
        {
          tip: "Hydration optimization",
          rationale: "Supports all body functions, thins mucus, aids detoxification",
          foods: ["Water (8-10 glasses)", "Herbal teas", "Broths", "Water-rich fruits (watermelon, cucumber)"],
          frequency: "Throughout the day"
        },
        {
          tip: "Immune-supporting foods",
          rationale: "Provides nutrients essential for immune function",
          foods: ["Citrus fruits (Vitamin C)", "Garlic and onions", "Yogurt with probiotics", "Zinc-rich foods (pumpkin seeds, chickpeas)"],
          frequency: "Daily"
        }
      ],

      lifestyleChanges: [
        "Prioritize quality sleep (7-9 hours for adults)",
        "Practice stress management (meditation, deep breathing, gentle exercise)",
        "Maintain regular, moderate physical activity when able",
        "Ensure adequate ventilation in living spaces",
        "Wash hands frequently with soap for at least 20 seconds",
        "Avoid smoking and limit alcohol consumption",
        "Consider humidifier in dry environments"
      ],

      hygieneTips: [
        "Wash hands before eating and after using restroom",
        "Disinfect frequently-touched surfaces",
        "Use separate towels when ill to prevent spread",
        "Change pillowcases frequently during illness",
        "Practice respiratory hygiene - cover coughs and sneezes"
      ],

      avoidList: [
        { item: "Sugar and refined carbohydrates", reason: "May suppress immune function and promote inflammation" },
        { item: "Excessive dairy", reason: "May increase mucus production in some individuals" },
        { item: "Alcohol", reason: "Dehydrating and may interfere with immune response and medications" },
        { item: "Processed foods", reason: "High in inflammatory ingredients and low in nutrients" },
        { item: "Caffeine in excess", reason: "Can be dehydrating and affect sleep quality" }
      ],

      warnings: [
        "Natural remedies complement but do not replace medical treatment when needed",
        "Check for allergies before trying any new remedy",
        "Some remedies may interact with medications - consult pharmacist if taking prescription drugs",
        "Stop any remedy that causes adverse effects",
        "Children, pregnant women, and those with chronic conditions should consult healthcare provider first"
      ],

      whenToSeeDoctor: [
        "Symptoms persist beyond 7-10 days without improvement",
        "High fever (>102°F/39°C) lasting more than 3 days",
        "Difficulty breathing or chest pain",
        "Symptoms suddenly worsen after improvement",
        "Cannot keep fluids down for more than 24 hours",
        "Signs of dehydration (dark urine, dizziness, extreme thirst)",
        "Underlying conditions that may be affected"
      ],

      aiSuggestion: result?.[0]?.generated_text || "Personalized AI suggestions unavailable",

      disclaimer: "Home remedies are meant to support comfort and wellbeing for mild, self-limiting conditions. They are not a substitute for professional medical care. When in doubt, consult a healthcare provider. Stop any remedy that causes discomfort or adverse effects."
    };
  } catch (error) {
    console.error('Home Remedies Error:', error);
    throw error;
  }
};

/**
 * Chat with AI health assistant - Professional, empathetic communication
 */
export const chatWithAI = async (message, conversationHistory = [], userProfile = {}) => {
  try {
    const systemPrompt = `You are a knowledgeable, empathetic healthcare AI assistant. 
    
Your communication style:
- Professional yet warm and accessible
- Evidence-informed but not overly technical
- Always supportive and non-judgmental
- Clear about your limitations as an AI
- Encourage professional consultation when appropriate

Key principles:
- Never diagnose conditions - provide educational information
- Always recommend seeing a doctor for concerning symptoms
- Acknowledge the person's concerns with empathy
- Provide practical, actionable guidance when appropriate
- Be clear about when emergency care is needed

${userProfile.age ? `User context: ${userProfile.age} years old` : ''}
${userProfile.medicalConditions?.length ? `Known conditions: ${userProfile.medicalConditions.join(', ')}` : ''}

Respond to: ${message}

Provide a helpful, professional response that balances being informative with appropriate caution.`;

    const result = await callHuggingFace('mistralai/Mistral-7B-Instruct-v0.2', systemPrompt);

    if (result && result[0]?.generated_text) {
      // Clean up and format the response
      let response = result[0].generated_text;
      // Remove the prompt if it's included in response
      if (response.includes('Respond to:')) {
        response = response.split('Respond to:')[1] || response;
      }
      return response.trim();
    }

    // Professional fallback response
    return `Thank you for reaching out about your health concern. While I can provide general health information and guidance, I want to be clear that I'm an AI assistant and cannot provide medical diagnoses or replace professional medical advice.

Based on your message, here are some general thoughts:

**General Guidance:**
• If you're experiencing concerning symptoms, it's always best to consult with a healthcare provider who can properly evaluate your specific situation.
• Keep track of your symptoms, including when they started, what makes them better or worse, and any associated symptoms.
• Don't hesitate to seek medical attention if you're worried - it's always better to be safe.

**When to Seek Immediate Care:**
• Difficulty breathing or shortness of breath
• Chest pain or pressure
• Sudden severe symptoms
• Signs of a serious allergic reaction
• Any symptom that feels like an emergency to you

Is there something specific about general health or wellness I can help you understand better? I'm here to provide educational information and support.`;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return "I apologize, but I'm experiencing a temporary issue. For any health concerns, please consult with a healthcare professional. If you're experiencing an emergency, please call emergency services or go to your nearest emergency room.";
  }
};

export default {
  analyzeHealthImage,
  analyzeSymptoms,
  getMedicineAdvice,
  getHomeRemedies,
  chatWithAI
};
