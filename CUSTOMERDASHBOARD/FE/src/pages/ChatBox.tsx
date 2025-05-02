// import React, { useState } from 'react';
// import { X, Send } from 'lucide-react';

// const FAQ_DATA = [
//   {
//     q: "shop timings|दुकान वेळ|timing|वेळ",
//     a: "Our shop is open from 10 AM to 10 PM every day.\nआमचं दुकान दररोज सकाळी १० ते रात्री १० वाजेपर्यंत उघडं असतं."
//   },
//   {
//     q: "location|address|दुकान कुठे|पत्ता",
//     a: "We have multiple stores across the city. Please check your nearest store using the location selector.\nशहरात आमची अनेक दुकाने आहेत. कृपया लोकेशन सिलेक्टर वापरून तुमच्या जवळचं दुकान तपासा."
//   },
//   {
//     q: "brands|ब्रँड्स|विकता",
//     a: "We offer a wide selection of premium brands including:\n\n🥃 Whiskey: Jack Daniel's, Glenfiddich, Chivas Regal\n🍷 Wine: Sula, Grover, Jacob's Creek\n🍺 Beer: Kingfisher, Heineken, Corona\n\nआम्ही प्रीमियम ब्रँड्सची विस्तृत निवड देतो."
//   },
//   {
//     q: "delivery|डिलिव्हरी|होम डिलिव्हरी",
//     a: "Yes, we offer home delivery! 🚚\n\n• Delivery Hours: 10 AM to 10 PM\n• Minimum Order: ₹500\n• Free delivery on orders above ₹2000\n\nहो, आम्ही होम डिलिव्हरी देतो! 🚚"
//   },
//   {
//     q: "payment|पेमेंट|payment methods|पैसे",
//     a: "We accept multiple payment methods:\n\n💳 Credit/Debit Cards\n📱 UPI (GPay, PhonePe)\n💰 Cash on Delivery\n\nआम्ही विविध पेमेंट पद्धती स्वीकारतो."
//   },
//   {
//     q: "age|वय|legal age|कायदेशीर वय",
//     a: "Legal drinking age is 21 years. Valid ID proof is mandatory.\n\nकायदेशीर वय २१ वर्षे आहे. वैध ओळखपत्र आवश्यक आहे."
//   },
//   {
//     q: "offers|ऑफर|discount|सूट",
//     a: "🎉 Current Offers:\n\n• 10% off on premium whiskey\n• Buy 2 get 1 free on selected wines\n• Special weekend discounts\n\nCheck our app regularly for new offers!"
//   },
//   {
//     q: "return|refund|परतावा|रिफंड",
//     a: "Returns accepted only for damaged or incorrect products within 24 hours.\n\nनुकसान झालेल्या किंवा चुकीच्या प्रॉडक्टसाठी २४ तासांच्या आत परतावा स्वीकारला जातो."
//   },
//   {
//     q: "hello|hi|hey|नमस्कार|हाय",
//     a: "Hello! 👋 Welcome to Liquor Shop. How can I help you today?\n\nनमस्कार! 👋 लिकर शॉपमध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?"
//   },
//   {
//     q: "bye|goodbye|thank|धन्यवाद|बाय",
//     a: "Thank you for chatting with us! 🙏 Have a great day!\n\nचॅट केल्याबद्दल धन्यवाद! 🙏 आपला दिवस चांगला जावो!"
//   }
// ];

// interface ChatBoxProps {
//   isChatOpen: boolean;
//   setIsChatOpen: (val: boolean) => void;
// }

// interface Message {
//   text: string;
//   isBot: boolean;
// }

// const ChatBox: React.FC<ChatBoxProps> = ({ isChatOpen, setIsChatOpen }) => {
//   const [chatMessages, setChatMessages] = useState<Message[]>([
//     {
//       text: "Hello! 👋 Welcome to Liquor Shop. How can I help you today?\n\nनमस्कार! लिकर शॉपमध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?",
//       isBot: true
//     },
//     {
//       text: "You can ask me about:\n\n🕒 Shop timings\n🚚 Delivery\n💳 Payment methods\n🎁 Offers\n📜 Age requirements",
//       isBot: true
//     }
//   ]);
//   const [chatInput, setChatInput] = useState('');

//   const generateAIResponse = (input: string): string => {
//     const lowerInput = input.toLowerCase();
//     const isGreeting = /\b(hello|hi|hey|नमस्कार|हाय)\b/i.test(lowerInput);
//     const isFarewell = /\b(bye|goodbye|thank|धन्यवाद|बाय)\b/i.test(lowerInput);

//     let matchedFAQ;
//     if (isGreeting) {
//       matchedFAQ = FAQ_DATA.find(faq => faq.q.includes("hello"));
//     } else if (isFarewell) {
//       matchedFAQ = FAQ_DATA.find(faq => faq.q.includes("bye"));
//     } else {
//       matchedFAQ = FAQ_DATA.find(faq =>
//         faq.q.split('|').some(keyword => lowerInput.includes(keyword))
//       );
//     }

//     if (matchedFAQ) return matchedFAQ.a;

//     if (lowerInput.includes('price') || lowerInput.includes('cost')) {
//       return "Prices vary by brand and size. Please check our app or visit the store for current prices.";
//     }

//     if (lowerInput.includes('cancel') || lowerInput.includes('रद्द')) {
//       return "Orders can be cancelled within 5 minutes of placing them. Contact support.";
//     }

//     return "I'm not sure about that. Try asking:\n• Shop timings\n• Delivery\n• Offers\n• Payment methods\n• Age requirements.";
//   };

//   const handleSendMessage = () => {
//     if (!chatInput.trim()) return;

//     const userMessage = { text: chatInput, isBot: false };
//     setChatMessages(prev => [...prev, userMessage]);

//     const aiResponse = generateAIResponse(chatInput);
//     setTimeout(() => {
//       setChatMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
//     }, 500);

//     setChatInput('');
//   };

//   if (!isChatOpen) return null;

//   return (
//     <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50">
//       <div className="p-4 bg-red-600 text-white rounded-t-lg flex justify-between items-center">
//         <h3 className="font-semibold">Liquor Shop Support</h3>
//         <button onClick={() => setIsChatOpen(false)}>
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {chatMessages.map((msg, i) => (
//           <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
//             <div className={`max-w-[80%] p-3 rounded-lg ${msg.isBot ? 'bg-gray-100 text-gray-800' : 'bg-red-600 text-white'}`}>
//               <p className="whitespace-pre-line">{msg.text}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="p-4 border-t">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={chatInput}
//             onChange={(e) => setChatInput(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Type your question..."
//             className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <button onClick={handleSendMessage} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
//             <Send className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
