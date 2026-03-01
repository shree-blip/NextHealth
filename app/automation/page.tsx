'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bot, Zap, Clock, ShieldCheck, Database, Calendar,
  PhoneOff, Users, Download, ArrowRight, Play,
  FileJson, Workflow, Star, CheckCircle, Sparkles,
  MessageSquare, Mail, BarChart3, Shield, Cpu,
  ChevronRight, ExternalLink
} from 'lucide-react';

const FadeIn = dynamic(() => import('@/components/FadeIn'));
const FAQ = dynamic(() => import('@/components/FAQ'));

/* ── Template data ─────────────────────────────────────── */
const templateData = {
  en: [
    {
      title: 'Patient Intake Automation',
      description: 'Auto-collect patient info via webhook, verify insurance, create EHR records, log to Google Sheets, and send confirmation emails + Slack alerts.',
      tags: ['Intake', 'Insurance', 'EHR'],
    },
    {
      title: 'Appointment Reminder & No-Show Recovery',
      description: 'Automated 24hr and 2hr SMS/email reminders via Twilio. Reduces no-show rates by up to 40% with zero staff effort.',
      tags: ['SMS', 'Reminders', 'No-Shows'],
    },
    {
      title: 'Google Review Collection',
      description: 'Sentiment-based routing: happy patients get a Google review request, others get a private feedback form. Automates reputation management.',
      tags: ['Reviews', 'Reputation', 'Google'],
    },
    {
      title: 'Insurance Verification Bot',
      description: 'Real-time eligibility checks, copay/deductible lookup, automatic pre-auth submission, and Slack alerts to front desk and billing.',
      tags: ['Insurance', 'Billing', 'Verification'],
    },
    {
      title: 'AI Chatbot Lead Capture',
      description: 'GPT-powered chatbot qualifies leads, extracts contact info, creates CRM entries, and sends urgent alerts for high-priority patients.',
      tags: ['AI', 'Chatbot', 'Lead Gen'],
    },
    {
      title: 'Social Media Auto-Poster',
      description: 'AI-generated captions from your content calendar. Auto-posts to Facebook & Instagram daily with team notifications.',
      tags: ['Social Media', 'AI Content', 'Marketing'],
    },
  ],
  es: [
    {
      title: 'Automatización de Admisión de Pacientes',
      description: 'Recopile información del paciente automáticamente vía webhook, verifique seguros, cree registros EHR, registre en Google Sheets y envíe correos de confirmación + alertas de Slack.',
      tags: ['Admisión', 'Seguros', 'EHR'],
    },
    {
      title: 'Recordatorio de Citas y Recuperación de Ausencias',
      description: 'Recordatorios automatizados de SMS/correo a 24h y 2h vía Twilio. Reduce las ausencias hasta un 40% sin esfuerzo del personal.',
      tags: ['SMS', 'Recordatorios', 'Ausencias'],
    },
    {
      title: 'Recolección de Reseñas de Google',
      description: 'Enrutamiento basado en sentimiento: pacientes satisfechos reciben solicitud de reseña en Google, otros reciben un formulario de retroalimentación privado.',
      tags: ['Reseñas', 'Reputación', 'Google'],
    },
    {
      title: 'Bot de Verificación de Seguros',
      description: 'Verificación de elegibilidad en tiempo real, consulta de copago/deducible, envío automático de pre-autorización y alertas de Slack a recepción y facturación.',
      tags: ['Seguros', 'Facturación', 'Verificación'],
    },
    {
      title: 'Chatbot IA para Captura de Leads',
      description: 'Chatbot con GPT que califica leads, extrae información de contacto, crea entradas CRM y envía alertas urgentes para pacientes prioritarios.',
      tags: ['IA', 'Chatbot', 'Generación de Leads'],
    },
    {
      title: 'Auto-Publicación en Redes Sociales',
      description: 'Subtítulos generados por IA desde su calendario de contenidos. Publica automáticamente en Facebook e Instagram con notificaciones al equipo.',
      tags: ['Redes Sociales', 'Contenido IA', 'Marketing'],
    },
  ],
};

const templateMeta = [
  { file: '/n8n-templates/patient-intake-automation.json', icon: Database, color: 'emerald', nodes: 7 },
  { file: '/n8n-templates/appointment-reminder-noshow.json', icon: Calendar, color: 'blue', nodes: 8 },
  { file: '/n8n-templates/google-review-collection.json', icon: Star, color: 'amber', nodes: 8 },
  { file: '/n8n-templates/insurance-verification-bot.json', icon: ShieldCheck, color: 'purple', nodes: 9 },
  { file: '/n8n-templates/ai-chatbot-lead-capture.json', icon: Bot, color: 'cyan', nodes: 10 },
  { file: '/n8n-templates/social-media-autoposter.json', icon: MessageSquare, color: 'pink', nodes: 9 },
];

const howItWorksData = {
  en: [
    { step: '01', title: 'Download a Template', description: 'Choose from our free, HIPAA-ready N8N workflow templates. Each one solves a specific operational bottleneck.', icon: Download },
    { step: '02', title: 'Import into N8N', description: 'Open your N8N instance (cloud or self-hosted), go to Workflows → Import, and paste the JSON. All nodes are pre-configured.', icon: FileJson },
    { step: '03', title: 'Connect Your Tools', description: 'Plug in your EHR API keys, Twilio credentials, Google Sheets, and Slack workspace. Each node has clear setup instructions.', icon: Workflow },
    { step: '04', title: 'Activate & Scale', description: 'Toggle the workflow on and watch it run 24/7. Monitor executions, tweak triggers, and scale across locations.', icon: Zap },
  ],
  es: [
    { step: '01', title: 'Descarga una Plantilla', description: 'Elija entre nuestras plantillas de flujo de trabajo N8N gratuitas y compatibles con HIPAA. Cada una resuelve un cuello de botella operativo específico.', icon: Download },
    { step: '02', title: 'Importar en N8N', description: 'Abra su instancia de N8N (nube o auto-hospedado), vaya a Flujos de trabajo → Importar, y pegue el JSON. Todos los nodos están preconfigurados.', icon: FileJson },
    { step: '03', title: 'Conecte sus Herramientas', description: 'Conecte sus claves API de EHR, credenciales de Twilio, Google Sheets y Slack. Cada nodo tiene instrucciones claras de configuración.', icon: Workflow },
    { step: '04', title: 'Activar y Escalar', description: 'Active el flujo de trabajo y véalo funcionar 24/7. Monitoree ejecuciones, ajuste disparadores y escale a múltiples ubicaciones.', icon: Zap },
  ],
};

const faqsData = {
  en: [
    { q: 'What is N8N and why do you use it?', a: 'N8N is a powerful, open-source workflow automation platform (similar to Zapier or Make, but self-hostable). We use it because it gives healthcare practices full control over their data — you can self-host it on HIPAA-compliant infrastructure, meaning patient data never touches third-party servers. It\'s also free to self-host, with a generous cloud plan available.' },
    { q: 'Are these templates really free?', a: 'Yes, 100% free. Download the JSON files and import them directly into your N8N instance. We provide these templates to demonstrate the power of healthcare automation. If you need help customizing them for your specific EHR, workflows, or compliance requirements, our team offers professional implementation services.' },
    { q: 'Will AI automation replace my front desk staff?', a: 'No. Our automation systems are designed to augment your staff, not replace them. By handling repetitive, high-volume tasks like answering basic FAQs, verifying insurance, and scheduling routine appointments, we free your front desk to focus on high-value, empathetic patient care and complex administrative duties. It\'s about eliminating burnout, not jobs.' },
    { q: 'How does the AI chatbot handle complex medical questions?', a: 'Our HIPAA-compliant AI agents are strictly programmed with guardrails. They are trained on your specific clinic\'s protocols and FAQs. If a patient asks a complex medical question or indicates a severe emergency, the AI is programmed to immediately escalate the conversation to a human staff member or direct the patient to call 911, ensuring absolute clinical safety.' },
    { q: 'Can your automation integrate with our existing EHR?', a: 'Yes. We have experience integrating with major Electronic Health Record (EHR) systems including Epic, Cerner, Athenahealth, and specialized urgent care platforms like DocuTAP. We utilize secure, HIPAA-compliant APIs to ensure that appointment data, consent forms, and insurance information flow seamlessly from the digital front door directly into your patient charts.' },
    { q: 'What is the ROI of implementing clinical automation?', a: 'The ROI is typically realized in three areas: 1) Recaptured Revenue: By eliminating missed calls and providing 24/7 booking, you capture patients who would have otherwise gone to a competitor. 2) Operational Efficiency: Reducing manual data entry saves an average of 15-20 staff hours per week. 3) Reduced No-Shows: Automated SMS and email reminders significantly decrease appointment no-show rates.' },
    { q: 'Is the automated patient intake process secure?', a: 'Security is our highest priority. All data collected during the automated intake process—including digital consent forms, ID uploads, and insurance cards—is encrypted in transit and at rest. We utilize SOC 2 Type II compliant servers and sign Business Associate Agreements (BAAs) to guarantee strict adherence to HIPAA regulations.' },
    { q: 'Do I need coding experience to use these templates?', a: 'No coding is required. N8N uses a visual drag-and-drop workflow editor. Our templates come pre-built — you just need to connect your credentials (API keys, email accounts, etc.) using the built-in credential manager. Each template includes node-by-node documentation.' },
  ],
  es: [
    { q: '¿Qué es N8N y por qué lo usan?', a: 'N8N es una potente plataforma de automatización de flujos de trabajo de código abierto (similar a Zapier o Make, pero auto-hospedable). La usamos porque les da a las prácticas médicas control total sobre sus datos — puede auto-hospedarla en infraestructura compatible con HIPAA, lo que significa que los datos de los pacientes nunca tocan servidores de terceros. También es gratuita para auto-hospedar.' },
    { q: '¿Estas plantillas son realmente gratuitas?', a: 'Sí, 100% gratuitas. Descargue los archivos JSON e impórtelos directamente en su instancia de N8N. Proporcionamos estas plantillas para demostrar el poder de la automatización en salud. Si necesita ayuda para personalizarlas para su EHR, flujos de trabajo o requisitos de cumplimiento específicos, nuestro equipo ofrece servicios profesionales de implementación.' },
    { q: '¿La automatización con IA reemplazará a mi personal de recepción?', a: 'No. Nuestros sistemas de automatización están diseñados para complementar a su personal, no reemplazarlo. Al manejar tareas repetitivas y de alto volumen como responder preguntas frecuentes, verificar seguros y programar citas rutinarias, liberamos a su recepción para enfocarse en la atención al paciente de alto valor. Se trata de eliminar el agotamiento, no los empleos.' },
    { q: '¿Cómo maneja el chatbot de IA preguntas médicas complejas?', a: 'Nuestros agentes de IA compatibles con HIPAA están programados estrictamente con barreras de seguridad. Están entrenados en los protocolos y preguntas frecuentes específicos de su clínica. Si un paciente hace una pregunta médica compleja o indica una emergencia grave, la IA escala inmediatamente la conversación a un miembro del personal humano o dirige al paciente a llamar al 911.' },
    { q: '¿Puede su automatización integrarse con nuestro EHR existente?', a: 'Sí. Tenemos experiencia integrando con los principales sistemas de Registros Electrónicos de Salud (EHR) incluyendo Epic, Cerner, Athenahealth y plataformas especializadas de atención urgente como DocuTAP. Utilizamos APIs seguras y compatibles con HIPAA para garantizar que los datos fluyan sin problemas a sus registros de pacientes.' },
    { q: '¿Cuál es el ROI de implementar automatización clínica?', a: 'El ROI se realiza típicamente en tres áreas: 1) Ingresos Recuperados: Al eliminar llamadas perdidas y proporcionar reservas 24/7, captura pacientes que habrían ido a la competencia. 2) Eficiencia Operativa: Reducir la entrada manual de datos ahorra un promedio de 15-20 horas de personal por semana. 3) Reducción de Ausencias: Los recordatorios automatizados por SMS y correo reducen significativamente las tasas de ausencia.' },
    { q: '¿Es seguro el proceso de admisión automatizado de pacientes?', a: 'La seguridad es nuestra prioridad más alta. Todos los datos recopilados durante el proceso de admisión automatizado — incluyendo formularios de consentimiento digital, carga de identificación y tarjetas de seguro — están encriptados en tránsito y en reposo. Utilizamos servidores compatibles con SOC 2 Tipo II y firmamos Acuerdos de Asociado Comercial (BAAs).' },
    { q: '¿Necesito experiencia en programación para usar estas plantillas?', a: 'No se requiere programación. N8N usa un editor visual de arrastrar y soltar. Nuestras plantillas vienen pre-construidas — solo necesita conectar sus credenciales (claves API, cuentas de correo, etc.) usando el administrador de credenciales incorporado. Cada plantilla incluye documentación nodo por nodo.' },
  ],
};

const statsData = {
  en: [
    { value: '40%', label: 'Reduction in No-Shows' },
    { value: '24/7', label: 'Patient Availability' },
    { value: '15-20hrs', label: 'Staff Hours Saved/Week' },
    { value: '3x', label: 'Review Collection Rate' },
  ],
  es: [
    { value: '40%', label: 'Reducción de Ausencias' },
    { value: '24/7', label: 'Disponibilidad del Paciente' },
    { value: '15-20hrs', label: 'Horas de Personal Ahorradas/Semana' },
    { value: '3x', label: 'Tasa de Recolección de Reseñas' },
  ],
};

/* ── UI text translations ─────────────────────────────── */
const ui = {
  en: {
    heroBadge: 'Free N8N Templates — Download & Deploy Today',
    heroTitle1: 'Healthcare',
    heroTitle2: 'Automation',
    heroTitle3: 'That Actually Works',
    heroDesc: 'Stop losing patients to missed calls and administrative bottlenecks. Download our free, plug-and-play N8N automation templates built specifically for medical practices — from patient intake to review collection.',
    browseTemplates: 'Browse Free Templates',
    customImpl: 'Get Custom Implementation',
    whatIsAutomation: 'WHAT IS AUTOMATION?',
    n8nTitle1: 'N8N: Your Clinic\'s',
    n8nTitle2: 'Invisible Workforce',
    n8nDesc1p1: ' is an open-source workflow automation platform. Think of it as a visual programming tool where you connect different apps and services with drag-and-drop — no coding required.',
    n8nDesc2p1: 'Unlike Zapier or Make, N8N can be ',
    n8nDesc2bold: 'self-hosted on HIPAA-compliant infrastructure',
    n8nDesc2p2: ', meaning your patient data never leaves your control. It\'s free to self-host and connects to 400+ services including EHRs, Twilio, Google Workspace, Slack, and OpenAI.',
    n8nDesc3p1: 'Each ',
    n8nDesc3bold: 'automation template',
    n8nDesc3p2: ' we provide is a complete JSON workflow file. Import it into N8N, connect your credentials, and activate — your automated workflow runs 24/7 without human intervention.',
    n8nTags: ['Open Source', 'HIPAA-Ready', 'Self-Hostable', '400+ Integrations', 'No Code'],
    n8nImgAlt: 'N8N workflow automation visual builder',
    n8nImgCaption: 'Visual drag-and-drop workflow builder — connect your EHR, SMS, email, and AI tools',
    bottleneckTitle: 'The Cost of Administrative Bloat',
    bottleneckP1: 'In modern healthcare, the most significant point of failure isn\'t clinical — it\'s operational. Clinics across Texas spend thousands on marketing to drive patient volume, only to lose those patients at the front desk.',
    bottleneckP2: 'When a patient calls an Urgent Care and is placed on hold for 5 minutes, they hang up and call the competitor. Front-desk staff are overwhelmed — simultaneously checking in patients, answering phones, verifying insurance, and entering data into the EHR.',
    bottleneckP3Start: 'Our automation suite acts as an ',
    bottleneckP3Bold: 'invisible, infinitely scalable administrative team',
    bottleneckP3End: '. We intercept digital inquiries, automate the mundane, and deliver fully vetted, scheduled patients directly to your clinical staff.',
    bottleneckCards: [
      { title: 'Missed Calls = Lost Revenue', desc: 'The average clinic misses 20% of inbound calls. Our AI ensures zero missed opportunities.' },
      { title: 'Staff Burnout', desc: 'Reduce cognitive load by automating repetitive Q&A and scheduling tasks.' },
      { title: 'Data Entry Errors', desc: 'Digital intake forms eliminate handwriting transcription errors and ensure clean EHR data.' },
      { title: '24/7 Availability', desc: 'Patients get sick at 2 AM. Allow them to book appointments asynchronously, anytime.' },
    ],
    agentsTitle: 'Intelligent Workflows',
    agentsDesc: 'We deploy specialized AI agents designed specifically for the rigorous demands of healthcare environments.',
    agentCards: [
      { title: 'Conversational AI', desc: 'Advanced NLP-powered chatbots understand patient intent, answer questions about hours, insurance, and services. Complex medical questions are seamlessly routed to human triage nurses.' },
      { title: 'Automated Scheduling', desc: 'Patients view real-time availability and book directly via website or SMS. Calendar invites, pre-visit instructions, and automated reminders drastically reduce no-shows.' },
      { title: 'Digital Patient Intake', desc: 'Eliminate the clipboard. Secure SMS links let patients complete forms, upload ID, and verify insurance before arrival — reducing wait times by up to 40%.' },
    ],
    stepsTitle1: 'Get Started in ',
    stepsTitle2: '4 Simple Steps',
    stepsDesc: 'From download to deployment in under 30 minutes. No coding required.',
    templatesBadge: '100% Free — No Signup Required',
    templatesTitle1: 'Plug-and-Play ',
    templatesTitle2: 'N8N Templates',
    templatesDesc: 'Download ready-to-import JSON workflow files. Each template is a complete automation — just connect your credentials and activate.',
    downloadBtn: 'Download JSON Template',
    customCta: 'Need a custom workflow for your specific EHR or practice?',
    customCtaBtn: 'Request Custom Template',
    useCasesTitle1: 'Real-World ',
    useCasesTitle2: 'Automation in Action',
    useCasesDesc: 'See how our N8N workflows transform daily clinic operations into effortless, automated processes.',
    uc1Label: 'USE CASE #1',
    uc1Title: 'Zero-Touch Patient Intake',
    uc1Desc: 'A new patient submits their information online. N8N automatically verifies their insurance coverage, creates a record in your EHR, logs everything to a tracking spreadsheet, and sends a welcome email — all in under 3 seconds. Your front desk never has to touch it.',
    uc1Items: ['Webhook captures patient form data', 'Insurance eligibility checked in real-time', 'EHR record created automatically', 'Confirmation email + Slack notification sent'],
    uc2Label: 'USE CASE #2',
    uc2Title: 'Intelligent Review Collection',
    uc2Desc: 'After a visit, the system waits 2 hours then analyzes the patient\'s satisfaction. Happy patients (4-5 stars) receive a Google review request via SMS and email. Below-threshold patients are routed to a private feedback form, protecting your online reputation.',
    uc2Items: ['Post-visit trigger with smart delay', 'Sentiment analysis routes patients appropriately', 'Happy patients → Google review link', 'Concerns → private feedback form (never public)'],
    uc3Label: 'USE CASE #3',
    uc3Title: 'AI-Powered Lead Capture',
    uc3Desc: 'A GPT-4 powered chatbot on your website qualifies every visitor. It collects contact info, identifies service interest and urgency, creates CRM entries, and sends urgent Slack alerts for high-priority patients — all without human intervention.',
    uc3Items: ['GPT-4 powered with healthcare guardrails', 'Extracts name, phone, email, service interest', 'High-urgency leads → instant Slack alert', 'Automatic CRM entry + follow-up email'],
    communityBadge: 'INSPIRED BY THE COMMUNITY',
    communityTitle1: 'The AI Automation ',
    communityTitle2: 'Movement',
    communityP1: 'Our templates are inspired by the growing AI automation community. Communities like the AI Automation Society (270K+ members) are proving that plug-and-play workflows can transform any business — from agent marketing teams to personal assistant bots and automated content generators.',
    communityP2Start: 'We\'ve taken this same approach and built healthcare-specific templates that are ',
    communityP2Bold1: 'HIPAA-compliant',
    communityP2Bold2: 'battle-tested',
    communityP2End: ', and designed for the unique regulatory requirements of medical practices.',
    communityCards: [
      { label: 'Agent Marketing Teams', desc: 'AI agents that manage your entire marketing pipeline autonomously' },
      { label: 'Personal Assistant Bots', desc: 'Delegate scheduling, research, and communications to AI' },
      { label: 'Content Generators', desc: 'Auto-create social posts, blog drafts, and patient education' },
    ],
    faqTitle: 'Automation FAQ',
    faqDesc: 'Common questions about N8N templates and healthcare automation.',
    ctaTitle: 'Ready to Automate Your Practice?',
    ctaDesc: 'Download our free templates to get started, or contact our team for a full automation audit and custom implementation tailored to your practice.',
    ctaBtn1: 'Download Free Templates',
    ctaBtn2: 'Schedule Automation Audit',
  },
  es: {
    heroBadge: 'Plantillas N8N Gratuitas — Descargue e Implemente Hoy',
    heroTitle1: 'Automatización',
    heroTitle2: 'Médica',
    heroTitle3: 'Que Realmente Funciona',
    heroDesc: 'Deje de perder pacientes por llamadas perdidas y cuellos de botella administrativos. Descargue nuestras plantillas de automatización N8N gratuitas y listas para usar, diseñadas específicamente para prácticas médicas.',
    browseTemplates: 'Ver Plantillas Gratuitas',
    customImpl: 'Obtener Implementación Personalizada',
    whatIsAutomation: '¿QUÉ ES LA AUTOMATIZACIÓN?',
    n8nTitle1: 'N8N: La Fuerza Laboral',
    n8nTitle2: 'Invisible de su Clínica',
    n8nDesc1p1: ' es una plataforma de automatización de flujos de trabajo de código abierto. Piense en ella como una herramienta de programación visual donde conecta diferentes aplicaciones y servicios con arrastrar y soltar — sin necesidad de programación.',
    n8nDesc2p1: 'A diferencia de Zapier o Make, N8N puede ',
    n8nDesc2bold: 'auto-hospedarse en infraestructura compatible con HIPAA',
    n8nDesc2p2: ', lo que significa que los datos de sus pacientes nunca salen de su control. Es gratuito para auto-hospedar y se conecta a más de 400 servicios incluyendo EHRs, Twilio, Google Workspace, Slack y OpenAI.',
    n8nDesc3p1: 'Cada ',
    n8nDesc3bold: 'plantilla de automatización',
    n8nDesc3p2: ' que proporcionamos es un archivo JSON de flujo de trabajo completo. Impórtelo en N8N, conecte sus credenciales y active — su flujo automatizado funciona 24/7 sin intervención humana.',
    n8nTags: ['Código Abierto', 'Compatible con HIPAA', 'Auto-Hospedable', '400+ Integraciones', 'Sin Código'],
    n8nImgAlt: 'Constructor visual de automatización de flujos de trabajo N8N',
    n8nImgCaption: 'Constructor visual de arrastrar y soltar — conecte su EHR, SMS, correo y herramientas de IA',
    bottleneckTitle: 'El Costo de la Burocracia Administrativa',
    bottleneckP1: 'En la atención médica moderna, el punto de falla más significativo no es clínico — es operativo. Las clínicas en Texas gastan miles en marketing para impulsar el volumen de pacientes, solo para perder a esos pacientes en la recepción.',
    bottleneckP2: 'Cuando un paciente llama a una clínica de atención urgente y lo ponen en espera por 5 minutos, cuelga y llama a la competencia. El personal de recepción está abrumado — atendiendo pacientes, contestando teléfonos, verificando seguros e ingresando datos al EHR simultáneamente.',
    bottleneckP3Start: 'Nuestra suite de automatización actúa como un ',
    bottleneckP3Bold: 'equipo administrativo invisible e infinitamente escalable',
    bottleneckP3End: '. Interceptamos consultas digitales, automatizamos lo mundano y entregamos pacientes completamente evaluados y programados directamente a su personal clínico.',
    bottleneckCards: [
      { title: 'Llamadas Perdidas = Ingresos Perdidos', desc: 'La clínica promedio pierde el 20% de las llamadas entrantes. Nuestra IA asegura cero oportunidades perdidas.' },
      { title: 'Agotamiento del Personal', desc: 'Reduzca la carga cognitiva automatizando tareas repetitivas de preguntas y respuestas y programación.' },
      { title: 'Errores de Entrada de Datos', desc: 'Los formularios digitales de admisión eliminan errores de transcripción y aseguran datos EHR limpios.' },
      { title: 'Disponibilidad 24/7', desc: 'Los pacientes se enferman a las 2 AM. Permítales reservar citas de forma asincrónica, en cualquier momento.' },
    ],
    agentsTitle: 'Flujos de Trabajo Inteligentes',
    agentsDesc: 'Desplegamos agentes de IA especializados diseñados específicamente para las demandas rigurosas de los entornos de salud.',
    agentCards: [
      { title: 'IA Conversacional', desc: 'Chatbots avanzados con NLP comprenden la intención del paciente, responden preguntas sobre horarios, seguros y servicios. Las preguntas médicas complejas se derivan a enfermeras de triaje.' },
      { title: 'Programación Automatizada', desc: 'Los pacientes ven disponibilidad en tiempo real y reservan directamente por sitio web o SMS. Invitaciones de calendario, instrucciones previas a la visita y recordatorios automatizados reducen drásticamente las ausencias.' },
      { title: 'Admisión Digital de Pacientes', desc: 'Elimine el portapapeles. Enlaces SMS seguros permiten a los pacientes completar formularios, subir identificación y verificar seguros antes de llegar — reduciendo tiempos de espera hasta un 40%.' },
    ],
    stepsTitle1: 'Comience en ',
    stepsTitle2: '4 Simples Pasos',
    stepsDesc: 'De la descarga al despliegue en menos de 30 minutos. Sin programación requerida.',
    templatesBadge: '100% Gratis — Sin Registro Requerido',
    templatesTitle1: 'Plantillas ',
    templatesTitle2: 'N8N Listas para Usar',
    templatesDesc: 'Descargue archivos JSON de flujo de trabajo listos para importar. Cada plantilla es una automatización completa — solo conecte sus credenciales y active.',
    downloadBtn: 'Descargar Plantilla JSON',
    customCta: '¿Necesita un flujo de trabajo personalizado para su EHR o práctica?',
    customCtaBtn: 'Solicitar Plantilla Personalizada',
    useCasesTitle1: 'Automatización en ',
    useCasesTitle2: 'Acción Real',
    useCasesDesc: 'Vea cómo nuestros flujos de trabajo N8N transforman las operaciones diarias de la clínica en procesos automatizados sin esfuerzo.',
    uc1Label: 'CASO DE USO #1',
    uc1Title: 'Admisión de Pacientes Sin Contacto',
    uc1Desc: 'Un nuevo paciente envía su información en línea. N8N verifica automáticamente su cobertura de seguro, crea un registro en su EHR, registra todo en una hoja de cálculo y envía un correo de bienvenida — todo en menos de 3 segundos.',
    uc1Items: ['Webhook captura datos del formulario del paciente', 'Elegibilidad de seguro verificada en tiempo real', 'Registro EHR creado automáticamente', 'Correo de confirmación + notificación de Slack enviados'],
    uc2Label: 'CASO DE USO #2',
    uc2Title: 'Recolección Inteligente de Reseñas',
    uc2Desc: 'Después de una visita, el sistema espera 2 horas y analiza la satisfacción del paciente. Los pacientes satisfechos (4-5 estrellas) reciben una solicitud de reseña de Google por SMS y correo. Los pacientes por debajo del umbral son dirigidos a un formulario de retroalimentación privado.',
    uc2Items: ['Disparador post-visita con retraso inteligente', 'Análisis de sentimiento enruta pacientes apropiadamente', 'Pacientes satisfechos → enlace de reseña de Google', 'Preocupaciones → formulario privado (nunca público)'],
    uc3Label: 'CASO DE USO #3',
    uc3Title: 'Captura de Leads con IA',
    uc3Desc: 'Un chatbot con GPT-4 en su sitio web califica a cada visitante. Recopila información de contacto, identifica interés en servicios y urgencia, crea entradas CRM y envía alertas urgentes de Slack para pacientes prioritarios — todo sin intervención humana.',
    uc3Items: ['GPT-4 con barreras de seguridad médicas', 'Extrae nombre, teléfono, correo, interés en servicios', 'Leads de alta urgencia → alerta instantánea de Slack', 'Entrada CRM automática + correo de seguimiento'],
    communityBadge: 'INSPIRADO POR LA COMUNIDAD',
    communityTitle1: 'El Movimiento de ',
    communityTitle2: 'Automatización con IA',
    communityP1: 'Nuestras plantillas están inspiradas por la creciente comunidad de automatización con IA. Comunidades como AI Automation Society (270K+ miembros) están demostrando que los flujos de trabajo plug-and-play pueden transformar cualquier negocio.',
    communityP2Start: 'Hemos tomado este mismo enfoque y construido plantillas específicas para salud que son ',
    communityP2Bold1: 'compatibles con HIPAA',
    communityP2Bold2: 'probadas en batalla',
    communityP2End: ', y diseñadas para los requisitos regulatorios únicos de las prácticas médicas.',
    communityCards: [
      { label: 'Equipos de Marketing con IA', desc: 'Agentes de IA que gestionan todo su pipeline de marketing de forma autónoma' },
      { label: 'Bots de Asistente Personal', desc: 'Delegue programación, investigación y comunicaciones a la IA' },
      { label: 'Generadores de Contenido', desc: 'Cree automáticamente publicaciones sociales, borradores de blog y educación del paciente' },
    ],
    faqTitle: 'Preguntas Frecuentes sobre Automatización',
    faqDesc: 'Preguntas comunes sobre plantillas N8N y automatización en salud.',
    ctaTitle: '¿Listo para Automatizar su Práctica?',
    ctaDesc: 'Descargue nuestras plantillas gratuitas para comenzar, o contacte a nuestro equipo para una auditoría completa de automatización e implementación personalizada.',
    ctaBtn1: 'Descargar Plantillas Gratuitas',
    ctaBtn2: 'Programar Auditoría de Automatización',
  },
};

/* ── Color helpers ─────────────────────────────────────── */
const colorMap: Record<string, { bg: string; bgLight: string; text: string; border: string; borderLight: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-500/20', bgLight: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-500/30', borderLight: 'border-emerald-200', ring: 'ring-emerald-500/20' },
  blue:    { bg: 'bg-blue-500/20',    bgLight: 'bg-blue-50',    text: 'text-blue-500',    border: 'border-blue-500/30',    borderLight: 'border-blue-200',    ring: 'ring-blue-500/20' },
  amber:   { bg: 'bg-amber-500/20',   bgLight: 'bg-amber-50',   text: 'text-amber-500',   border: 'border-amber-500/30',   borderLight: 'border-amber-200',   ring: 'ring-amber-500/20' },
  purple:  { bg: 'bg-purple-500/20',  bgLight: 'bg-purple-50',  text: 'text-purple-500',  border: 'border-purple-500/30',  borderLight: 'border-purple-200',  ring: 'ring-purple-500/20' },
  cyan:    { bg: 'bg-cyan-500/20',    bgLight: 'bg-cyan-50',    text: 'text-cyan-500',    border: 'border-cyan-500/30',    borderLight: 'border-cyan-200',    ring: 'ring-cyan-500/20' },
  pink:    { bg: 'bg-pink-500/20',    bgLight: 'bg-pink-50',    text: 'text-pink-500',    border: 'border-pink-500/30',    borderLight: 'border-pink-200',    ring: 'ring-pink-500/20' },
};

/* ── Page component ─────────────────────────────────────── */
export default function AutomationPage() {
  const { theme, language } = useSitePreferences();
  const isDark = theme === 'dark';
  const isEs = language === 'es';

  const t = ui[language];
  const templates = templateData[language].map((tpl, i) => ({ ...tpl, ...templateMeta[i] }));
  const howItWorks = howItWorksData[language];
  const faqs = faqsData[language];
  const automationStats = statsData[language];

  return (
    <main className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Navbar />

      {/* ───── Hero Section ───── */}
      <section className={`relative pt-32 pb-24 overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
        <div className="absolute inset-0">
          <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} blur-[140px] rounded-full animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-[600px] h-[600px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} blur-[140px] rounded-full`} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <Sparkles className="h-4 w-4" />
              {t.heroBadge}
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.heroTitle1} <span className="text-emerald-500">{t.heroTitle2}</span>
              <br />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{t.heroTitle3}</span>
            </h1>

            <p className={`text-lg sm:text-xl max-w-3xl mx-auto mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#templates"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Download className="h-5 w-5" />
                {t.browseTemplates}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all border ${isDark ? 'border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400' : 'border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}
              >
                {t.customImpl}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {automationStats.map((stat, i) => (
              <div key={i} className={`text-center p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{stat.value}</div>
                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── What is N8N? Explainer ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
                <Cpu className="h-3.5 w-3.5" /> {t.whatIsAutomation}
              </div>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.n8nTitle1}<br />
                <span className="text-emerald-500">{t.n8nTitle2}</span>
              </h2>
              <div className={`space-y-5 text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <p>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>N8N</strong>{t.n8nDesc1p1}
                </p>
                <p>
                  {t.n8nDesc2p1}<strong className={isDark ? 'text-white' : 'text-slate-900'}>{t.n8nDesc2bold}</strong>{t.n8nDesc2p2}
                </p>
                <p>
                  {t.n8nDesc3p1}<strong className={isDark ? 'text-white' : 'text-slate-900'}>{t.n8nDesc3bold}</strong>{t.n8nDesc3p2}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {t.n8nTags.map((tag) => (
                  <span key={tag} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className={`relative rounded-3xl overflow-hidden border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <Image
                  src="/11.png"
                  alt={t.n8nImgAlt}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
                <div className={`absolute bottom-0 inset-x-0 p-6 ${isDark ? 'bg-gradient-to-t from-slate-900/90' : 'bg-gradient-to-t from-white/90'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t.n8nImgCaption}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ───── The Operational Bottleneck ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.bottleneckTitle}</h2>
              <div className={`space-y-6 text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <p>{t.bottleneckP1}</p>
                <p>{t.bottleneckP2}</p>
                <p>
                  {t.bottleneckP3Start}<strong className={isDark ? 'text-white' : 'text-slate-900'}>{t.bottleneckP3Bold}</strong>{t.bottleneckP3End}
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: PhoneOff, color: 'text-red-500', ...t.bottleneckCards[0] },
                { icon: Users, color: 'text-orange-500', ...t.bottleneckCards[1] },
                { icon: Database, color: 'text-blue-500', ...t.bottleneckCards[2] },
                { icon: Clock, color: 'text-emerald-500', ...t.bottleneckCards[3] },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <item.icon className={`h-8 w-8 ${item.color} mb-4`} />
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ───── AI Agents & Workflows ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.agentsTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.agentsDesc}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Bot, color: 'text-blue-500', ...t.agentCards[0] },
              { icon: Calendar, color: 'text-emerald-500', ...t.agentCards[1] },
              { icon: ShieldCheck, color: 'text-purple-500', ...t.agentCards[2] },
            ].map((item, i) => (
              <FadeIn key={i} delay={0.1 * (i + 1)}>
                <div className={`p-8 rounded-3xl border h-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <item.icon className={`h-10 w-10 ${item.color} mb-6`} />
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.stepsTitle1}<span className="text-emerald-500">{t.stepsTitle2}</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.stepsDesc}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <FadeIn key={i} delay={0.1 * (i + 1)}>
                <div className={`relative p-8 rounded-3xl border h-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-5xl font-extrabold text-emerald-500/20 mb-4">{step.step}</div>
                  <step.icon className="h-8 w-8 text-emerald-500 mb-4" />
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Free N8N Templates ───── */}
      <section id="templates" className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <Download className="h-4 w-4" />
              {t.templatesBadge}
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.templatesTitle1}<span className="text-emerald-500">{t.templatesTitle2}</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.templatesDesc}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl, i) => {
              const c = colorMap[tpl.color] || colorMap.emerald;
              return (
                <FadeIn key={i} delay={0.05 * (i + 1)}>
                  <div className={`group relative p-6 rounded-3xl border h-full flex flex-col transition-all hover:shadow-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${isDark ? c.bg : c.bgLight}`}>
                        <tpl.icon className={`h-6 w-6 ${c.text}`} />
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {tpl.nodes} nodes
                      </span>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tpl.title}</h3>
                    <p className={`text-sm leading-relaxed mb-4 flex-grow ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{tpl.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${isDark ? `${c.bg} ${c.text}` : `${c.bgLight} ${c.text}`}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={tpl.file}
                      download
                      className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadBtn}
                    </a>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* CTA under templates */}
          <FadeIn className="mt-12 text-center">
            <div className={`inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.customCta}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {t.customCtaBtn}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───── Automation Use Cases with Images ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.useCasesTitle1}<span className="text-emerald-500">{t.useCasesTitle2}</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.useCasesDesc}
            </p>
          </FadeIn>

          {/* Use Case 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <FadeIn direction="right">
              <div className={`relative rounded-3xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-lg'}`}>
                <Image
                  src="/12.png"
                  alt="Automated patient intake workflow"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                {t.uc1Label}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.uc1Title}
              </h3>
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.uc1Desc}
              </p>
              <ul className="space-y-3">
                {t.uc1Items.map((item) => (
                  <li key={item} className={`flex items-start gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          {/* Use Case 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <FadeIn direction="right" className="order-2 lg:order-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                {t.uc2Label}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.uc2Title}
              </h3>
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.uc2Desc}
              </p>
              <ul className="space-y-3">
                {t.uc2Items.map((item) => (
                  <li key={item} className={`flex items-start gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="left" className="order-1 lg:order-2">
              <div className={`relative rounded-3xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-lg'}`}>
                <Image
                  src="/14.png"
                  alt="Google review collection automation workflow"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </FadeIn>
          </div>

          {/* Use Case 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div className={`relative rounded-3xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-lg'}`}>
                <Image
                  src="/13.png"
                  alt="AI chatbot lead capture automation"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
                {t.uc3Label}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.uc3Title}
              </h3>
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.uc3Desc}
              </p>
              <ul className="space-y-3">
                {t.uc3Items.map((item) => (
                  <li key={item} className={`flex items-start gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ───── Community / Inspiration ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Sparkles className="h-3.5 w-3.5" /> {t.communityBadge}
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.communityTitle1}<span className="text-emerald-500">{t.communityTitle2}</span>
            </h2>
            <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.communityP1}
            </p>
            <p className={`text-lg leading-relaxed mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.communityP2Start}<strong className={isDark ? 'text-white' : 'text-slate-900'}>{t.communityP2Bold1}</strong>, <strong className={isDark ? 'text-white' : 'text-slate-900'}>{t.communityP2Bold2}</strong>{t.communityP2End}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {[
                { icon: Workflow, ...t.communityCards[0] },
                { icon: Bot, ...t.communityCards[1] },
                { icon: Sparkles, ...t.communityCards[2] },
              ].map((item, i) => (
                <div key={i} className={`p-6 rounded-2xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
                  <item.icon className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                  <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.label}</h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───── FAQ Section ───── */}
      <section className={`py-24 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.faqTitle}</h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.faqDesc}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <FAQ faqs={faqs} />
          </FadeIn>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/20 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              {t.ctaTitle}
            </h2>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-10">
              {t.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
              >
                <Download className="h-5 w-5" />
                {t.ctaBtn1}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                {t.ctaBtn2}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
