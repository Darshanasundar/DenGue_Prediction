import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, AlertTriangle, Info, ThermometerSun, Droplets, CloudRain } from 'lucide-react';

// Predefined knowledge base for Dengue Expert Chatbot
const KNOWLEDGE_BASE = [
    {
        intent: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'greetings', 'morning', 'afternoon', 'evening'],
        responses: [
            "Hello! I am DengueAI, your expert assistant. I can answer questions about Dengue symptoms, prevention, treatment, and how our prediction model works. How can I help you today?",
            "Hi there! I'm here to provide information about Dengue fever and our outbreak forecasting system. What would you like to know?"
        ]
    },
    {
        intent: 'what_is_dengue',
        keywords: ['what is dengue', 'define dengue', 'about dengue', 'dengue fever'],
        responses: [
            "Dengue is a mosquito-borne viral infection transmitted primarily by the Aedes aegypti mosquito. It causes flu-like illness and occasionally develops into a potentially lethal complication called severe dengue.",
            "Dengue virus is transmitted by female mosquitoes mainly of the species Aedes aegypti. It is widespread throughout the tropics, with local variations in risk influenced by rainfall, temperature, and unplanned rapid urbanization."
        ]
    },
    {
        intent: 'symptoms_info',
        keywords: ['symptoms of', 'signs of', 'what are the symptoms', 'what are symptoms', 'know if i have', 'how to know'],
        responses: [
            "Common symptoms of Dengue include:\n• Sudden high fever (up to 104°F/40°C)\n• Severe headache\n• Pain behind the eyes\n• Severe joint and muscle pain\n• Fatigue, nausea, and vomiting\n• Skin rash (appears 2-5 days after onset of fever)\n\nIf you experience severe abdominal pain, persistent vomiting, rapid breathing, or bleeding, seek medical attention immediately, as these are warning signs of severe dengue."
        ]
    },
    {
        intent: 'user_has_symptoms',
        keywords: [
            'i have', 'i am feeling', 'i got', 'suffering from', 'experiencing',
            'fever', 'headache', 'pain', 'vomiting', 'nausea', 'rash',
            'days', 'sick', 'is it dengue', 'could it be dengue', 'do i have dengue'
        ],
        // Special logic: high weight for matching multiple user symptoms
        responses: [
            "Based on what you're describing (like fever and headache), these **could** be early signs of Dengue, especially if you live in or have visited a high-risk area recently. \n\n**However, I am an AI, not a doctor.** \n\nPlease monitor your temperature, stay highly hydrated (water, ORS, coconut water), and avoid aspirin/ibuprofen (use paracetamol instead). If these symptoms persist for more than 2 days or if you experience severe abdominal pain, vomiting, or bleeding, please visit a doctor or hospital immediately for a blood test (NS1 antigen or Dengue antibodies)."
        ]
    },
    {
        intent: 'prevention',
        keywords: ['prevent', 'stop', 'protect', 'avoid', 'repellent', 'mosquito net', 'water stagnation'],
        responses: [
            "To prevent Dengue, focus on mosquito control and bite prevention:\n1. Prevent mosquitoes from accessing egg-laying habitats by managing environmental modification.\n2. Dispose of solid waste properly and remove artificial man-made habitats that can hold water.\n3. Cover, empty and clean domestic water storage containers weekly.\n4. Apply appropriate insecticides to water storage outdoor containers.\n5. Use of personal household protection such as window screens, repellents, insecticide treated materials, coils, and vaporizers."
        ]
    },
    {
        intent: 'treatment',
        keywords: ['cure', 'treat', 'medicine', 'hospital', 'remedy', 'doctor', 'papaya', 'platelet'],
        responses: [
            "There is no specific medicine to treat dengue infection. If you think you may have dengue fever, you should use pain relievers with acetaminophen and avoid medicines with aspirin, which could worsen bleeding. You should also rest, drink plenty of fluids, and see your doctor. If you feel worse in the first 24 hours after your fever goes down, you should go immediately to the hospital to be checked for complications."
        ]
    },
    {
        intent: 'prediction_model',
        keywords: ['predict', 'forecast', 'model', 'how does it work', 'weather', 'climate', 'temperature', 'humidity', 'rainfall', 'machine learning', 'ai', 'risk level'],
        responses: [
            "Our Dengue Prediction Model uses Machine Learning (Random Forest) to forecast outbreak risks. It analyzes key meteorological factors that influence mosquito breeding and virus replication:\n\n• **Temperature**: Warmer temperatures accelerate mosquito development and the virus incubation period.\n• **Humidity**: High humidity helps mosquitoes live longer, increasing transmission chances.\n• **Rainfall**: Stagnant water from rainfall provides breeding grounds for Aedes mosquitoes.\n\nThe model outputs a Risk Level (Low, Moderate, High) and a confidence percentage for Indian cities based on real-time or estimated historical weather profiles."
        ]
    },
    {
        intent: 'peak_seasons',
        keywords: ['season', 'when', 'month', 'monsoon', 'summer', 'winter', 'time of year', 'time'],
        responses: [
            "In India, Dengue cases peak primarily during and immediately after the monsoon months (July to November). During this period, the combination of heavy rainfall, high humidity, and warm temperatures creates perfect breeding conditions for the Aedes mosquito. The post-monsoon period often sees the highest spike in cases."
        ]
    },
    {
        intent: 'platelets',
        keywords: ['platelet', 'blood count', 'drop'],
        responses: [
            "Dengue virus can suppress bone marrow function, leading to a drop in platelet count (thrombocytopenia). While a normal platelet count is 150,000 to 450,000 per microliter, dengue patients can see counts drop significantly. It requires medical monitoring, but not all patients require platelet transfusions unless there's active bleeding or the count drops below 10,000."
        ]
    },
    {
        intent: 'india_stats',
        keywords: ['data', 'statistics', 'india', 'cases', 'history', 'highest', 'states', 'dataset'],
        responses: [
            "India experiences significant Dengue outbreaks. Our dashboard visualizes historical data from 2019 to 2024. Certain states often report high numbers due to a combination of dense populations, rapid urbanization, and conducive tropical climates. You can view the specific state-wise breakdowns and yearly trends in the Historical Data section of the dashboard."
        ]
    },
    {
        intent: 'diet',
        keywords: ['eat', 'food', 'diet', 'drink', 'papaya', 'coconut', 'nutrition', 'meals', 'hungry', 'thirst'],
        responses: [
            "A proper diet is crucial during Dengue recovery. Drink plenty of fluids like water, coconut water, ORS, and fresh fruit juices (without added sugar) to stay hydrated. Foods rich in Vitamin C (like citrus fruits and amla) help build immunity. Papaya leaf extract is known to help improve platelet counts, though hydration remains the most critical factor. Avoid oily, spicy, and heavily processed foods."
        ]
    },
    {
        intent: 'emergency',
        keywords: ['emergency', 'ambulance', 'hospital', 'doctor', 'help', 'urgent', 'severe', 'call', 'number'],
        responses: [
            "If you or someone else is experiencing severe symptoms (like severe abdominal pain, persistent vomiting, mucosal bleeding, lethargy, or restlessness), seek immediate medical attention.\n\n**National Emergency Number in India: 112**\n**Ambulance Service: 108**\n\nPlease do not wait if you notice any of these warning signs."
        ]
    }
];

// Fallback message when intent is not matched
const FALLBACK_RESPONSES = [
    "I'm not exactly sure how to answer that. I'm trained to provide information on Dengue symptoms, prevention, treatments, and our predictive weather model. Could you try rephrasing your question?",
    "That's an interesting question, but it's outside my current knowledge base regarding Dengue forecasting and health info. Can I help you understand how weather impacts outbreak risks instead?",
    "I didn't quite catch that. Try asking me about 'Dengue symptoms', 'How to prevent it', or 'How the prediction model works'."
];

const AiChatbot = () => {
    // Dynamic Greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const [messages, setMessages] = useState([
        { id: 1, text: `${getGreeting()}! I am DengueAI. Ask me anything about Dengue fever, its symptoms, prevention, diet tips, or how our predictive model uses weather data to forecast risks.`, sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const findBestResponse = (text) => {
        const lowerText = text.toLowerCase();

        let bestMatch = null;
        let maxScore = 0;

        for (const kb of KNOWLEDGE_BASE) {
            let score = 0;
            let matchedKeywords = [];
            for (const keyword of kb.keywords) {
                if (lowerText.includes(keyword)) {
                    // Give more weight to longer multi-word keywords
                    score += keyword.includes(' ') ? 3 : 1;
                    matchedKeywords.push(keyword);
                }
            }

            // Special boost for user describing personal symptoms
            if (kb.intent === 'user_has_symptoms' &&
                (matchedKeywords.includes('i have') || matchedKeywords.includes('i am feeling') || matchedKeywords.includes('is it dengue')) &&
                (matchedKeywords.includes('fever') || matchedKeywords.includes('headache') || matchedKeywords.includes('pain') || matchedKeywords.includes('days'))) {
                score += 10; // Massive boost if they combine "I have" with actual symptoms
            }

            // High boost if asking explicitly "what are symptoms"
            if (kb.intent === 'symptoms_info' && (matchedKeywords.includes('symptoms of') || matchedKeywords.includes('what are symptoms'))) {
                score += 5;
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = kb;
            }
        }

        if (bestMatch && maxScore > 0) {
            // Pick a random response from the matched intent
            const randomIndex = Math.floor(Math.random() * bestMatch.responses.length);
            return bestMatch.responses[randomIndex];
        }

        // Return a random fallback response
        return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            text: inputValue.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const responseText = findBestResponse(newUserMsg.text);
            const newBotMsg = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newBotMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000); // 1-2s delay
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            setMessages([{ id: Date.now(), text: "Chat history cleared. How can I help you regarding Dengue today?", sender: 'bot', timestamp: new Date() }]);
        }
    };

    const formatMessage = (text) => {
        // Simple formatter to handle newlines and bold texts
        return text.split('\\n').map((line, i) => {
            const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
            return (
                <span key={i} className="block mb-1">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-surface/50 rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden animate-fade-in text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                            DengueAI Expert
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-xs text-slate-400 font-medium tracking-wide border border-transparent">Online & Ready</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleClearChat}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-slate-700 border border-slate-600'}`}>
                            {msg.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-300" />}
                        </div>
                        <div
                            className={`p-3 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/20'
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-md shadow-black/20'
                                }`}
                        >
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {formatMessage(msg.text)}
                            </div>
                            <div className={`text-[10px] mt-2 opacity-60 ${msg.sender === 'user' ? 'text-right object-right' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-700 border border-slate-600">
                            <Bot className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm flex items-center gap-1.5 w-max">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide py-1">
                    <button onClick={() => setInputValue("What are the symptoms of Dengue?")} className="whitespace-nowrap px-4 py-2 bg-slate-800/80 hover:bg-indigo-600/50 hover:text-white hover:border-indigo-400 border border-slate-700/50 rounded-full text-xs font-medium text-indigo-300 transition-all shadow-sm">Symptoms?</button>
                    <button onClick={() => setInputValue("What should I eat during Dengue?")} className="whitespace-nowrap px-4 py-2 bg-slate-800/80 hover:bg-emerald-600/50 hover:text-white hover:border-emerald-400 border border-slate-700/50 rounded-full text-xs font-medium text-emerald-300 transition-all shadow-sm">Diet guide</button>
                    <button onClick={() => setInputValue("How to prevent Dengue?")} className="whitespace-nowrap px-4 py-2 bg-slate-800/80 hover:bg-amber-600/50 hover:text-white hover:border-amber-400 border border-slate-700/50 rounded-full text-xs font-medium text-amber-300 transition-all shadow-sm">Prevention tips</button>
                    <button onClick={() => setInputValue("How does the prediction model work?")} className="whitespace-nowrap px-4 py-2 bg-slate-800/80 hover:bg-blue-600/50 hover:text-white hover:border-blue-400 border border-slate-700/50 rounded-full text-xs font-medium text-blue-300 transition-all shadow-sm">Prediction tech</button>
                    <button onClick={() => setInputValue("Emergency contacts")} className="whitespace-nowrap px-4 py-2 bg-slate-800/80 hover:bg-red-600/50 hover:text-white hover:border-red-400 border border-slate-700/50 rounded-full text-xs font-medium text-red-300 transition-all shadow-sm">Emergencies</button>
                </div>
                <form onSubmit={handleSendMessage} className="relative flex items-center mt-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything about Dengue..."
                        className="w-full bg-slate-800 border-2 border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-4 pr-12 outline-none text-slate-200 placeholder-slate-500 transition-colors shadow-inner font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className={`absolute right-2 p-2 rounded-lg transition-all ${inputValue.trim() && !isTyping
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-500">DengueAI responses are for informational purposes only and do not replace professional medical advice.</p>
                </div>
            </div>
        </div>
    );
};

export default AiChatbot;
