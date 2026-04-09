export interface AutomationData {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  heroDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  icon: string;
  problemStatement: string;
  steps: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  hipaaNote: string;
  integrations: string[];
  impact: { value: string; label: string }[];
  faqs: { q: string; a: string }[];
  relatedService: { slug: string; label: string };
  relatedAutomations: { slug: string; label: string }[];
}

export const automations: AutomationData[] = [
  {
    slug: 'ai-chatbot',
    title: 'Healthcare AI Chatbot Automation | NextGen Health',
    metaDescription: 'HIPAA-compliant AI chatbot for healthcare websites. Automate patient enquiries, appointment scheduling, and FAQ responses 24/7.',
    h1: 'AI Chatbot for Healthcare — 24/7 Patient Support',
    heroDescription: 'Never miss a patient enquiry again. Our AI chatbot handles questions, schedules appointments, and provides instant support around the clock — all HIPAA-compliant.',
    primaryKeyword: 'AI chatbot healthcare',
    secondaryKeywords: ['healthcare chatbot', 'medical practice chatbot', 'automated patient support'],
    icon: '🤖',
    problemStatement: 'Clinics lose potential patients outside office hours. Front desk staff are overwhelmed with repetitive questions about hours, insurance, and services. Every unanswered call or delayed response is a patient who books with a competitor instead. An AI chatbot ensures no patient enquiry goes unanswered — at any hour.',
    steps: [
      { title: 'Widget Installation', description: 'Our HIPAA-compliant chatbot widget is added to your website in minutes, styled to match your brand.' },
      { title: 'Practice-Specific Training', description: 'The AI is trained on your specific services, FAQs, insurance plans, hours, and providers for accurate responses.' },
      { title: 'Real-Time Patient Interaction', description: 'The chatbot answers questions instantly — from "Do you accept Blue Cross?" to "What are your Saturday hours?"' },
      { title: 'Smart Escalation', description: 'Complex questions are seamlessly escalated to your staff via email or SMS with full conversation context.' },
      { title: 'Appointment Booking', description: 'Qualified leads are directed to your online scheduling system to book appointments directly from the chat.' },
    ],
    benefits: [
      { title: '24/7 Patient Support', description: 'Never lose a patient to after-hours silence. The chatbot handles enquiries nights, weekends, and holidays.' },
      { title: 'Reduced Front Desk Load', description: 'Automate answers to the 80% of questions that are repetitive, freeing staff for higher-value tasks.' },
      { title: 'Increased Appointment Bookings', description: 'Convert website visitors into booked appointments with instant, guided scheduling assistance.' },
      { title: 'Multi-Language Support', description: 'Serve patients in English, Spanish, and other languages automatically — expanding your accessible patient base.' },
      { title: 'Instant Response Time', description: 'Patients get answers in seconds, not minutes or hours. Speed dramatically improves conversion rates.' },
      { title: 'Data-Driven Insights', description: 'Analytics on common questions reveal patient concerns and content gaps on your website.' },
    ],
    hipaaNote: 'Our chatbot is designed for HIPAA compliance. No Protected Health Information (PHI) is collected or stored through the chat interface. All data is encrypted in transit (TLS 1.3) and at rest. The chatbot handles general enquiries only — clinical questions are escalated to staff through secure, HIPAA-compliant channels.',
    integrations: ['Website (any platform)', 'Online scheduling systems', 'CRM / patient management', 'Email notifications', 'SMS alerts', 'Google Analytics'],
    impact: [
      { value: '67%', label: 'Reduction in missed enquiries' },
      { value: '3x', label: 'More after-hours bookings' },
      { value: '45%', label: 'Decrease in front desk call volume' },
      { value: '<5s', label: 'Average response time' },
    ],
    faqs: [
      { q: 'Is the chatbot HIPAA-compliant?', a: 'Yes. Our chatbot does not collect or store PHI. It handles general enquiries (hours, services, insurance, directions) and directs clinical questions to your staff through encrypted channels. All infrastructure is hosted on HIPAA-compliant servers.' },
      { q: 'How long does setup take?', a: 'Initial setup takes 3-5 business days. This includes widget installation, AI training on your practice information, and testing. After launch, the chatbot improves continuously based on patient interactions.' },
      { q: 'Can the chatbot book appointments?', a: 'Yes. The chatbot can direct patients to your online scheduling system or collect preferred appointment details and send them to your scheduling team. Direct EHR integration is available for supported systems.' },
      { q: 'What if the chatbot can\'t answer a question?', a: 'The chatbot gracefully escalates to your staff via email or SMS with full conversation context. During business hours, live handoff to a human agent is also supported.' },
      { q: 'How accurate are the responses?', a: 'The AI is trained exclusively on your practice information, so accuracy is very high for in-scope questions. We continuously monitor and refine responses based on patient interactions and your feedback.' },
    ],
    relatedService: { slug: 'website-design-dev', label: 'Website Design & Development' },
    relatedAutomations: [
      { slug: 'patient-intake', label: 'Patient Intake Automation' },
      { slug: 'appointment-reminders', label: 'Appointment Reminders' },
    ],
  },
  {
    slug: 'patient-intake',
    title: 'Automated Patient Intake for Healthcare | NextGen Health',
    metaDescription: 'Automate patient intake forms and data entry. HIPAA-compliant workflows that save time and reduce errors for your clinic.',
    h1: 'Automate Patient Intake — Save Time, Reduce Errors',
    heroDescription: 'Eliminate manual data entry and paper forms. Our automated intake workflows get patient information into your EHR accurately and instantly — before they even arrive.',
    primaryKeyword: 'automate patient intake',
    secondaryKeywords: ['patient intake automation', 'digital patient intake', 'automated patient registration'],
    icon: '📋',
    problemStatement: 'Manual patient intake is the bottleneck of every clinic. Paper forms are slow, illegible, and require duplicate data entry. Errors in insurance information lead to claim denials. Patients hate filling out clipboards in the waiting room. Digital intake automation solves all of this — patients complete forms on their phone before they arrive, and data flows directly into your EHR.',
    steps: [
      { title: 'Digital Form Creation', description: 'We build custom intake forms branded to your practice — demographics, medical history, insurance, and consent — accessible on any device.' },
      { title: 'Pre-Visit Distribution', description: 'Patients receive a secure link via email or SMS to complete forms before their appointment, reducing wait room time.' },
      { title: 'Data Validation', description: 'N8N automation workflows validate submitted data in real time — flagging missing fields, invalid insurance IDs, and inconsistencies.' },
      { title: 'EHR Integration', description: 'Validated data is pushed directly into your EHR/EMR system automatically, eliminating manual data entry entirely.' },
      { title: 'Confirmation & Notification', description: 'Patients receive a confirmation email. Staff are notified of completed intakes and any flagged issues requiring attention.' },
    ],
    benefits: [
      { title: 'Eliminate Manual Data Entry', description: 'Patient information flows directly from the form to your EHR — no re-typing, no transcription errors.' },
      { title: 'Reduce Wait Room Time', description: 'Patients complete forms before they arrive. Check-in takes minutes, not 15+ minutes with a clipboard.' },
      { title: 'Fewer Claim Denials', description: 'Validated insurance information before the visit reduces claim denials by catching errors upfront.' },
      { title: 'Better Patient Experience', description: 'A modern, mobile-friendly intake process signals a modern, patient-centric practice.' },
      { title: 'Staff Time Savings', description: 'Front desk staff reclaim 2-3 hours daily previously spent on data entry and form processing.' },
      { title: 'Compliance Built In', description: 'Digital consent capture and HIPAA-compliant data handling are built into every workflow.' },
    ],
    hipaaNote: 'All patient data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain Business Associate Agreements (BAAs) with all form and data processing providers. Data routing follows the HIPAA Minimum Necessary standard — only required fields are transmitted to each system.',
    integrations: ['Custom digital intake forms', 'EHR/EMR systems (Epic, Athena, eClinicalWorks, etc.)', 'Email & SMS delivery', 'Insurance verification APIs', 'Practice management systems'],
    impact: [
      { value: '80%', label: 'Reduction in data entry time' },
      { value: '35%', label: 'Fewer claim denials' },
      { value: '12 min', label: 'Average time saved per patient' },
      { value: '95%', label: 'Patient form completion rate' },
    ],
    faqs: [
      { q: 'Which EHR systems do you integrate with?', a: 'We support integration with most major EHR/EMR systems including Epic, Athena, eClinicalWorks, DrChrono, AdvancedMD, and many others. Custom integrations are available for less common systems via API or HL7/FHIR.' },
      { q: 'How do patients access the intake forms?', a: 'Patients receive a secure link via email or SMS (sent automatically when they book). They can complete forms on any device — phone, tablet, or computer. In-office tablet kiosks are also supported for walk-in patients.' },
      { q: 'Is patient data secure?', a: 'Absolutely. All data is encrypted end-to-end. We maintain BAAs with every vendor in the data chain. Access is role-based and audited. Our infrastructure meets or exceeds HIPAA Security Rule requirements.' },
      { q: 'Can we customise the forms?', a: 'Yes. Every form is custom-built for your practice — your branding, your fields, your consent language. We can create specialty-specific forms (dental, ophthalmology, mental health) with the exact information you need.' },
    ],
    relatedService: { slug: 'email-drip-campaigns', label: 'Email Drip Campaigns' },
    relatedAutomations: [
      { slug: 'insurance-verification', label: 'Insurance Verification' },
      { slug: 'appointment-reminders', label: 'Appointment Reminders' },
    ],
  },
  {
    slug: 'review-collection',
    title: 'Automated Review Collection for Healthcare | NextGen Health',
    metaDescription: 'Automatically collect Google reviews from happy patients. HIPAA-compliant review request workflows for clinics.',
    h1: 'Automate Review Collection — Build Your Online Reputation',
    heroDescription: 'Turn every satisfied patient into a Google review — automatically. Our smart review workflows route happy patients to Google and unhappy patients to private feedback, protecting your reputation.',
    primaryKeyword: 'automate review collection healthcare',
    secondaryKeywords: ['automated Google reviews', 'patient review automation', 'healthcare reputation management'],
    icon: '⭐',
    problemStatement: 'Most satisfied patients never leave reviews — not because they wouldn\'t, but because nobody asks at the right moment. Manual follow-up is inconsistent and time-consuming. Meanwhile, unhappy patients are motivated to share negative experiences. This creates a review profile that doesn\'t reflect your true patient satisfaction. Automated review collection fixes this imbalance.',
    steps: [
      { title: 'Visit Detection', description: 'When a patient visit is completed in your scheduling system, our workflow is automatically triggered — no staff action required.' },
      { title: 'Timed Follow-Up', description: 'A personalised email or SMS is sent at the optimal time (typically 2-4 hours post-visit) asking about their experience.' },
      { title: 'Sentiment Routing', description: 'Happy patients (4-5 stars) are directed to your Google Business Profile review page. Unhappy patients are directed to a private feedback form.' },
      { title: 'Review Monitoring', description: 'All reviews are tracked in a dashboard. New reviews trigger alerts. Response templates are provided for rapid replies.' },
      { title: 'Analytics & Reporting', description: 'Monthly reports show review volume trends, sentiment analysis, and your Google rating trajectory.' },
    ],
    benefits: [
      { title: 'Consistent Review Flow', description: 'Automated outreach ensures every patient is asked — not just the ones staff remember to ask.' },
      { title: 'Negative Feedback Capture', description: 'Unhappy patients submit feedback privately, giving you a chance to resolve issues before they go public.' },
      { title: 'Higher Google Rating', description: 'By routing satisfied patients to Google, your average rating climbs to 4.7-4.9 stars within months.' },
      { title: 'SEO Boost', description: 'More Google reviews improve your Local Pack ranking, driving more organic patient traffic.' },
      { title: 'Zero Staff Effort', description: 'Once configured, the system runs entirely on autopilot — no front desk involvement required.' },
      { title: 'Multi-Location Support', description: 'Separate review workflows for each location ensure reviews go to the correct Google Business Profile.' },
    ],
    hipaaNote: 'No Protected Health Information is included in review requests. Only the patient\'s name and appointment confirmation are used to trigger the workflow. Messages do not mention diagnoses, treatments, or clinical details. Patients can opt out at any time.',
    integrations: ['EHR / scheduling systems', 'Google Business Profile', 'Email & SMS providers', 'Review monitoring dashboard', 'Practice management software'],
    impact: [
      { value: '340%', label: 'Increase in monthly Google reviews' },
      { value: '4.8★', label: 'Average rating achieved in 6 months' },
      { value: '92%', label: 'Of negative feedback captured privately' },
      { value: '#1', label: 'Most-reviewed clinic in local area' },
    ],
    faqs: [
      { q: 'Is it legal to ask patients for reviews?', a: 'Yes. Asking for reviews is legal and encouraged by Google. The key rules: don\'t offer incentives for reviews, don\'t ask patients to say specific things, and don\'t make review requests that include PHI. Our system follows all guidelines.' },
      { q: 'How do you route unhappy patients?', a: 'After a visit, patients are asked a simple satisfaction question (1-5 stars). Patients rating 4-5 stars are directed to Google. Patients rating 1-3 are directed to a private feedback form that goes to your management team, giving you an opportunity to resolve the issue.' },
      { q: 'Will this work with my existing scheduling system?', a: 'Yes. We integrate with most scheduling and EHR systems via API, webhook, or Zapier/N8N connectors. Even if your system doesn\'t have an API, we can often use email-based triggers as a fallback.' },
      { q: 'How quickly will I see results?', a: 'Most practices see a 3-5x increase in monthly reviews within the first 30 days. Within 3-6 months, your Google rating typically improves by 0.3-0.5 stars as positive reviews accumulate.' },
    ],
    relatedService: { slug: 'google-business-profile', label: 'Google Business Profile Management' },
    relatedAutomations: [
      { slug: 'patient-intake', label: 'Patient Intake' },
      { slug: 'recall-campaigns', label: 'Recall Campaigns' },
    ],
  },
  {
    slug: 'appointment-reminders',
    title: 'Automated Appointment Reminders for Clinics | NextGen Health',
    metaDescription: 'Reduce no-shows with automated appointment reminders. SMS, email, and phone reminders for healthcare practices.',
    h1: 'Automated Appointment Reminders — Reduce No-Shows',
    heroDescription: 'Cut no-shows by up to 60% with intelligent multi-channel reminders. Our automated system sends the right message at the right time via SMS, email, and phone.',
    primaryKeyword: 'appointment reminder automation',
    secondaryKeywords: ['automated appointment reminders healthcare', 'reduce no-shows clinic', 'patient reminder system'],
    icon: '⏰',
    problemStatement: 'No-shows cost the average healthcare practice $150K+ per year. Manual reminder calls are labour-intensive, inconsistent, and limited to business hours. Many patients simply forget — not because they don\'t want to come, but because modern life is busy. Automated multi-channel reminders (SMS + email + phone) at strategic intervals dramatically reduce no-shows while freeing staff time.',
    steps: [
      { title: 'Appointment Detection', description: 'When an appointment is booked in your scheduling system, the reminder sequence is automatically triggered.' },
      { title: '7-Day Reminder', description: 'A confirmation email is sent 7 days before the appointment with date, time, provider, and preparation instructions.' },
      { title: '2-Day Reminder', description: 'An SMS and email reminder 2 days before, with a one-tap confirm or reschedule option.' },
      { title: '2-Hour Reminder', description: 'A final SMS reminder 2 hours before the appointment with directions and check-in instructions.' },
      { title: 'No-Response Escalation', description: 'Patients who haven\'t confirmed are flagged for staff follow-up. The open slot is optionally offered to waitlisted patients.' },
    ],
    benefits: [
      { title: 'Reduce No-Shows by 40-60%', description: 'Multi-touch reminders at strategic intervals keep your practice top-of-mind and appointments attended.' },
      { title: 'Patient Self-Service', description: 'Confirm or reschedule with one tap — no phone calls needed. Patients appreciate the convenience.' },
      { title: 'Fill Cancelled Slots', description: 'When a patient cancels, waitlisted patients are automatically notified to fill the gap.' },
      { title: 'Save Staff Hours', description: 'Eliminate manual reminder calls — reclaim 10+ hours per week for your front desk team.' },
      { title: 'Multi-Channel Delivery', description: 'SMS, email, and automated phone calls ensure the message reaches patients on their preferred channel.' },
      { title: 'Preparation Instructions', description: 'Include fasting requirements, what to bring, parking info, and telehealth links in reminder messages.' },
    ],
    hipaaNote: 'Reminder messages contain only the Minimum Necessary PHI: patient first name and appointment date/time. No diagnoses, treatments, or clinical details are included. All messages are sent through HIPAA-compliant messaging providers with signed BAAs.',
    integrations: ['EHR / scheduling systems', 'SMS gateways (Twilio, etc.)', 'Email providers', 'Automated phone call systems', 'Waitlist management'],
    impact: [
      { value: '58%', label: 'Reduction in no-show rate' },
      { value: '$150K', label: 'Annual revenue recovered' },
      { value: '10+ hrs', label: 'Staff time saved weekly' },
      { value: '94%', label: 'Message delivery rate' },
    ],
    faqs: [
      { q: 'How much can I reduce no-shows?', a: 'Most practices see a 40-60% reduction in no-shows within the first month. The multi-touch approach (7 days, 2 days, 2 hours) combined with easy confirm/reschedule options drives the highest show rates. We\'ve seen practices go from 20% no-show to under 8%.' },
      { q: 'Can patients reschedule from the reminder?', a: 'Yes. SMS reminders include a link to reschedule online. This converts potential no-shows into rescheduled appointments rather than lost revenue. Cancelled slots are automatically offered to waitlisted patients.' },
      { q: 'What scheduling systems do you integrate with?', a: 'We support most major healthcare scheduling systems including those built into Epic, Athena, eClinicalWorks, and standalone platforms like Zocdoc and Acuity. Custom integrations are available via API.' },
      { q: 'Are SMS reminders HIPAA-compliant?', a: 'Yes, when done correctly. Our messages contain only the minimum necessary information (name, date, time) with no clinical details. All SMS is sent through HIPAA-compliant providers with BAAs in place. Patients can opt out at any time.' },
    ],
    relatedService: { slug: 'email-drip-campaigns', label: 'Email Drip Campaigns' },
    relatedAutomations: [
      { slug: 'patient-intake', label: 'Patient Intake' },
      { slug: 'recall-campaigns', label: 'Recall Campaigns' },
    ],
  },
  {
    slug: 'insurance-verification',
    title: 'Automated Insurance Verification for Healthcare | NextGen Health',
    metaDescription: 'Automate insurance eligibility verification before patient visits. Reduce claim denials and front desk workload.',
    h1: 'Automate Insurance Verification — Fewer Denials, Faster Revenue',
    heroDescription: 'Verify insurance eligibility automatically before every visit. Catch coverage issues before the patient arrives, reduce claim denials, and accelerate your revenue cycle.',
    primaryKeyword: 'insurance verification automation',
    secondaryKeywords: ['automated eligibility check', 'insurance verification workflow', 'pre-visit insurance verification'],
    icon: '🛡️',
    problemStatement: 'Manual insurance verification eats hours of staff time daily. Eligibility is checked inconsistently, resulting in claim denials that cost $25-50 each to rework — if they\'re recovered at all. When a patient arrives with inactive or incorrect insurance, the visit becomes a revenue risk. Automated pre-visit verification catches these issues 24-48 hours before the appointment.',
    steps: [
      { title: 'Appointment Trigger', description: 'When a patient books an appointment, the verification workflow is automatically initiated — no staff action needed.' },
      { title: 'Data Extraction', description: 'Insurance information is pulled from the patient\'s intake form or existing EHR record automatically.' },
      { title: 'Eligibility Check', description: 'Automated queries are sent to payer portals or clearinghouses to verify active coverage, copay amounts, and deductible status.' },
      { title: 'Results Logged', description: 'Verification results are logged directly in your EHR/practice management system for the provider and billing team.' },
      { title: 'Issue Alerts', description: 'If coverage is inactive, benefits exhausted, or prior auth needed, staff receive an immediate alert with next steps.' },
    ],
    benefits: [
      { title: 'Reduce Claim Denials', description: 'Catch inactive coverage, wrong plan details, and prior auth needs before the visit — not after billing.' },
      { title: 'Faster Revenue Cycle', description: 'Clean claims get paid faster. Automated verification means fewer rework loops and shorter days in A/R.' },
      { title: 'Save Staff Hours', description: 'Eliminate hours of daily phone calls to insurance companies and manual portal lookups.' },
      { title: 'Better Patient Experience', description: 'No surprise bills or coverage denials. Patients know their financial responsibility before they arrive.' },
      { title: 'Batch Verification', description: 'Verify all appointments for the next day (or week) in a single automated batch run.' },
      { title: 'Real-Time Alerts', description: 'Staff are notified immediately when an issue is found, with enough lead time to resolve it before the visit.' },
    ],
    hipaaNote: 'PHI is handled via encrypted channels throughout the verification process. Business Associate Agreements (BAAs) are maintained with all insurance data providers and clearinghouses. The HIPAA Minimum Necessary standard is enforced — only required data elements are transmitted for eligibility verification.',
    integrations: ['EHR / practice management systems', 'Insurance payer portals', 'Clearinghouses (Availity, Change Healthcare)', 'Patient intake forms', 'Billing systems'],
    impact: [
      { value: '72%', label: 'Reduction in claim denials' },
      { value: '3 hrs', label: 'Daily staff time saved' },
      { value: '$45K', label: 'Annual revenue recovered' },
      { value: '99%', label: 'Pre-visit verification rate' },
    ],
    faqs: [
      { q: 'Which insurance payers do you support?', a: 'We support all major commercial payers (Blue Cross, Aetna, UHC, Cigna, Humana, etc.), Medicare, Medicaid, and most regional plans. Coverage verification is done through clearinghouse connections that support 2,000+ payer IDs.' },
      { q: 'How far in advance are appointments verified?', a: 'By default, verification runs 48 hours before each appointment, giving your team time to resolve any issues. Rush verifications for same-day appointments are also supported.' },
      { q: 'What happens if a patient\'s insurance is inactive?', a: 'Your front desk receives an immediate alert with details. They can contact the patient before the visit to update insurance information, discuss self-pay options, or reschedule if needed — avoiding day-of surprises.' },
      { q: 'Does this replace our billing team?', a: 'No — it empowers them. Automated verification handles the repetitive eligibility check so your billing team can focus on complex cases, prior authorisations, and denial management that requires human expertise.' },
    ],
    relatedService: { slug: 'analytics-reporting', label: 'Analytics & Reporting' },
    relatedAutomations: [
      { slug: 'patient-intake', label: 'Patient Intake' },
      { slug: 'appointment-reminders', label: 'Appointment Reminders' },
    ],
  },
  {
    slug: 'recall-campaigns',
    title: 'Automated Patient Recall Campaigns | NextGen Health',
    metaDescription: 'Bring patients back for follow-up visits automatically. HIPAA-compliant recall campaigns via email and SMS.',
    h1: 'Automated Patient Recall Campaigns — Keep Patients Coming Back',
    heroDescription: 'Re-engage inactive patients and fill your schedule with automated recall campaigns. Multi-touch email and SMS outreach brings patients back for follow-ups, annuals, and preventive care.',
    primaryKeyword: 'patient recall automation',
    secondaryKeywords: ['healthcare recall campaigns', 'automated patient follow-up', 'patient reactivation'],
    icon: '🔄',
    problemStatement: 'Patients forget to schedule follow-ups. Annual physical reminders get lost. Patients who haven\'t visited in 6+ months drift away permanently. This represents massive lost revenue and worse health outcomes. Automated recall campaigns re-engage inactive patients with personalised, multi-touch outreach that brings them back — without your staff lifting a finger.',
    steps: [
      { title: 'Patient Identification', description: 'Your EHR flags patients overdue for follow-ups, annuals, screenings, or those inactive for 90+ days.' },
      { title: 'Personalised Outreach', description: 'N8N triggers a personalised recall sequence tailored to the patient\'s care needs — annual physical, dental cleaning, eye exam, etc.' },
      { title: 'Multi-Touch Sequence', description: 'A coordinated series: friendly email → follow-up SMS → final phone call for non-responders, spaced over 2-3 weeks.' },
      { title: 'Easy Booking', description: 'Every message includes a direct link to book online. One-tap scheduling removes friction and increases conversion.' },
      { title: 'Non-Responder Flagging', description: 'Patients who don\'t respond after the full sequence are flagged for manual staff outreach or marked for the next campaign cycle.' },
    ],
    benefits: [
      { title: 'Reactivate Inactive Patients', description: 'Bring back patients who haven\'t visited in 6-12+ months — they\'re already in your system, they just need a nudge.' },
      { title: 'Fill Schedule Gaps', description: 'Recall campaigns generate a predictable flow of appointments that fill schedule gaps and reduce revenue volatility.' },
      { title: 'Improve Health Outcomes', description: 'Patients who return for preventive care and follow-ups have better health outcomes — and higher lifetime value.' },
      { title: 'Fully Automated', description: 'Set it once and the system runs continuously. No staff intervention required for routine recall outreach.' },
      { title: 'Personalised Messaging', description: 'Messages reference the specific care the patient is due for, making them relevant and actionable.' },
      { title: 'Measureable ROI', description: 'Track exactly how many patients return and the revenue generated by each campaign cycle.' },
    ],
    hipaaNote: 'Recall messaging uses the Minimum Necessary standard — only the patient\'s first name and type of care due are referenced. No diagnoses, results, or clinical details are included. Patients can opt out of recall communications at any time via a one-click unsubscribe.',
    integrations: ['EHR / practice management systems', 'Email marketing platforms', 'SMS gateways', 'Online scheduling systems', 'Patient CRM'],
    impact: [
      { value: '28%', label: 'Of inactive patients reactivated' },
      { value: '$8K', label: 'Monthly revenue recovered per provider' },
      { value: '3x', label: 'ROI on recall campaigns' },
      { value: '85%', label: 'Message open rate (SMS)' },
    ],
    faqs: [
      { q: 'How do you identify which patients to recall?', a: 'We work with your EHR to identify patients based on criteria you define: last visit date, overdue preventive care, incomplete treatment plans, or custom filters. Common segments include "no visit in 6+ months", "annual physical due", and "missed follow-up appointment".' },
      { q: 'How many patients typically come back?', a: 'Industry benchmarks show 15-30% reactivation rates for well-designed recall campaigns. Our multi-touch approach (email → SMS → phone) typically achieves 25-35% reactivation, especially for patients who\'ve been inactive for less than 12 months.' },
      { q: 'Can we customise the recall messages?', a: 'Absolutely. Every message is customised to your practice brand, tone, and the specific care type. We create separate message templates for annual physicals, dental cleanings, eye exams, specialist follow-ups, and more.' },
      { q: 'What\'s the difference between recall and appointment reminders?', a: 'Appointment reminders notify patients about an already-booked appointment. Recall campaigns reach out to patients who DON\'T have an appointment booked — prompting them to schedule one. Both are important, and they complement each other.' },
    ],
    relatedService: { slug: 'email-drip-campaigns', label: 'Email Drip Campaigns' },
    relatedAutomations: [
      { slug: 'appointment-reminders', label: 'Appointment Reminders' },
      { slug: 'review-collection', label: 'Review Collection' },
    ],
  },
  {
    slug: 'social-media-scheduling',
    title: 'Healthcare Social Media Scheduling Automation | NextGen Health',
    metaDescription: 'Automate your healthcare social media posting. Schedule, publish, and track content across platforms automatically.',
    h1: 'Automate Healthcare Social Media Posting',
    heroDescription: 'Stay consistent on social media without the daily effort. Our automation schedules, publishes, and tracks your healthcare content across all platforms — hands-free.',
    primaryKeyword: 'healthcare social media automation',
    secondaryKeywords: ['social media scheduling healthcare', 'automated social posts clinic'],
    icon: '📱',
    problemStatement: 'Consistent social media posting is essential for healthcare practices but incredibly time-consuming. Content creation, scheduling, and publishing across multiple platforms eats hours every week. Posts get missed, content goes stale, and engagement drops. Automation ensures your practice maintains a professional, consistent social media presence without the daily grind.',
    steps: [
      { title: 'Content Calendar Setup', description: 'We create a monthly content calendar with post categories (educational, promotional, community, testimonials) tailored to your practice.' },
      { title: 'Content Creation & Approval', description: 'Posts are created by our team (or yours) and queued for approval through a simple dashboard.' },
      { title: 'Automated Scheduling', description: 'Approved content is automatically scheduled to publish at optimal times based on your audience engagement data.' },
      { title: 'Multi-Platform Publishing', description: 'N8N workflows publish simultaneously to Facebook, Instagram, LinkedIn, and other platforms — formatted for each.' },
      { title: 'Performance Tracking', description: 'Engagement metrics are tracked and compiled into weekly/monthly reports showing what content resonates most.' },
    ],
    benefits: [
      { title: 'Consistent Posting Schedule', description: 'Never miss a posting day again. Automation ensures content goes out on schedule, even during busy weeks.' },
      { title: 'Multi-Platform Management', description: 'Manage Facebook, Instagram, LinkedIn, and more from a single workflow — no logging into multiple platforms.' },
      { title: 'Optimal Timing', description: 'Posts are published when your audience is most active, maximising reach and engagement automatically.' },
      { title: 'Content Variety', description: 'Automated rotation between post types (educational, promotional, social proof) keeps your feed diverse and engaging.' },
      { title: 'Time Savings', description: 'Reclaim 5-10 hours per week previously spent on manual social media management.' },
      { title: 'Performance Insights', description: 'Automated reports show which content types and topics drive the most engagement and patient enquiries.' },
    ],
    hipaaNote: 'Social media content never contains Protected Health Information. All patient testimonials and case studies shared on social media require written consent. Our workflows include compliance checkpoints to ensure no PHI is inadvertently published.',
    integrations: ['Facebook / Meta Business Suite', 'Instagram', 'LinkedIn', 'Content management dashboard', 'Analytics platforms', 'Canva / design tools'],
    impact: [
      { value: '5-10 hrs', label: 'Saved weekly on social media' },
      { value: '180%', label: 'Increase in social engagement' },
      { value: '100%', label: 'On-schedule posting rate' },
      { value: '3x', label: 'More content published monthly' },
    ],
    faqs: [
      { q: 'Do you create the social media content?', a: 'We offer both options. Our team can create a full content calendar for your practice, or if you have an in-house team, we set up the automation infrastructure for scheduling and publishing. Most clients use a hybrid approach — we create the strategy and templates, they customise for their specific practice.' },
      { q: 'Which social media platforms do you support?', a: 'We support Facebook, Instagram (feed + Stories + Reels), LinkedIn, Twitter/X, TikTok, and Google Business Profile posts. Content is automatically reformatted for each platform\'s specifications.' },
      { q: 'Can I review posts before they go live?', a: 'Absolutely. Our workflow includes an approval step where you (or a designated team member) review and approve every post before it\'s scheduled. You can also approve batches in advance for hands-off operation.' },
      { q: 'How do you ensure healthcare compliance?', a: 'Every post goes through a compliance checklist: no PHI, proper disclaimers for treatment claims, patient consent verified for testimonials, and platform-specific advertising policies for health content. We build these checks directly into the workflow.' },
    ],
    relatedService: { slug: 'social-media-marketing', label: 'Social Media Marketing' },
    relatedAutomations: [
      { slug: 'review-collection', label: 'Review Collection' },
      { slug: 'reporting-dashboards', label: 'Reporting Dashboards' },
    ],
  },
  {
    slug: 'reporting-dashboards',
    title: 'Automated Marketing Reports for Healthcare | NextGen Health',
    metaDescription: 'Get automated marketing performance reports for your clinic. Real-time dashboards with SEO, ads, and social media data.',
    h1: 'Automated Marketing Reporting Dashboards',
    heroDescription: 'See all your marketing performance in one place — updated automatically. Our dashboards aggregate SEO, Google Ads, social media, and patient acquisition data into clear, actionable reports.',
    primaryKeyword: 'automated marketing reports healthcare',
    secondaryKeywords: ['healthcare marketing dashboards', 'automated reporting clinic'],
    icon: '📊',
    problemStatement: 'Manual reporting is the time sink nobody talks about. Pulling data from Google Analytics, Google Ads, social media, and your CRM to build a monthly report takes hours. By the time it\'s compiled, it\'s already outdated. Decision-makers lack real-time visibility into what\'s working and what isn\'t. Automated dashboards solve this by aggregating all data sources into a live, always-current view.',
    steps: [
      { title: 'Data Source Connection', description: 'We connect your marketing data sources: GA4, Google Search Console, Google Ads, Meta Ads, social platforms, and your CRM/EHR.' },
      { title: 'Dashboard Configuration', description: 'Custom dashboards are built showing the KPIs that matter to your practice: leads, bookings, cost per patient, ROI, and more.' },
      { title: 'Automated Data Aggregation', description: 'N8N workflows pull data from all sources automatically — daily, weekly, or in real time depending on the source.' },
      { title: 'Report Generation', description: 'Weekly and monthly PDF reports are auto-generated with charts, trend analysis, and performance summaries.' },
      { title: 'Stakeholder Delivery', description: 'Reports are automatically emailed to practice owners, marketing managers, and other stakeholders on schedule.' },
    ],
    benefits: [
      { title: 'Real-Time Visibility', description: 'See your marketing performance anytime — no waiting for monthly reports. Data updates daily or in real time.' },
      { title: 'All Data in One Place', description: 'SEO, ads, social media, website, and patient data in a single dashboard — no more tab-switching.' },
      { title: 'Automated Report Delivery', description: 'Stakeholders receive polished PDF reports automatically. No manual compilation, no forgotten sends.' },
      { title: 'Actionable Insights', description: 'Dashboards highlight trends, anomalies, and opportunities — not just data dumps.' },
      { title: 'Custom KPIs', description: 'Track the metrics that matter to your practice: cost per new patient, lead-to-appointment rate, revenue per campaign, etc.' },
      { title: 'Time Savings', description: 'Eliminate 5-8 hours monthly spent on manual report creation and data compilation.' },
    ],
    hipaaNote: 'Marketing dashboards contain only aggregate, anonymised data. No individual patient records, names, or PHI are displayed. Data connections use read-only API access with encrypted credentials. All dashboard access is role-based and password-protected.',
    integrations: ['Google Analytics 4', 'Google Search Console', 'Google Ads', 'Meta Ads Manager', 'Social media platforms', 'CRM / EHR systems'],
    impact: [
      { value: '100%', label: 'Data accuracy (automated)' },
      { value: '8 hrs', label: 'Monthly time saved on reporting' },
      { value: 'Real-time', label: 'Dashboard refresh frequency' },
      { value: '1 click', label: 'To view all marketing KPIs' },
    ],
    faqs: [
      { q: 'What data sources do you connect?', a: 'We support all major marketing platforms: GA4, Google Search Console, Google Ads, Meta Ads, LinkedIn Ads, Facebook Insights, Instagram Insights, and most CRM/practice management systems. Custom data sources can be integrated via API.' },
      { q: 'Can I access the dashboard on mobile?', a: 'Yes. Dashboards are responsive and accessible on any device — phone, tablet, or desktop. You can check your marketing performance from anywhere, anytime.' },
      { q: 'How often is data updated?', a: 'Google Ads and social media data updates daily. Google Analytics updates within 24-48 hours. Google Search Console data has a 2-3 day lag (this is a Google limitation). CRM data can be synced in real time via API.' },
      { q: 'Can multiple people access the dashboard?', a: 'Yes. We provide role-based access for practice owners, marketing managers, and team members. Each user sees the KPIs relevant to their role. Read-only access is available for stakeholders who need visibility without edit permissions.' },
    ],
    relatedService: { slug: 'analytics-reporting', label: 'Analytics & Reporting' },
    relatedAutomations: [
      { slug: 'social-media-scheduling', label: 'Social Media Scheduling' },
      { slug: 'review-collection', label: 'Review Collection' },
    ],
  },
];

export function getAutomationBySlug(slug: string): AutomationData | undefined {
  return automations.find((a) => a.slug === slug);
}

export function getAllAutomationSlugs(): string[] {
  return automations.map((a) => a.slug);
}
