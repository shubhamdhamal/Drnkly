import { useNavigate } from 'react-router-dom';
import { Wine, ArrowRight } from 'lucide-react';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"
        style={{
          animation: 'gradientShift 8s ease infinite'
        }}
      />

      {/* Animated circles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${100 + i * 40}px`,
            height: `${100 + i * 40}px`,
            border: '1px solid rgba(0,0,0,0.05)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `float ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 max-w-md w-11/12 text-center px-4">
        {/* Logo */}
    

        {/* Title */}
        <img
  src="/finallogo.png"
  alt="Drnkly Logo"
  className="h-24 md:h-32 lg:h-40 mx-auto object-contain"
/>

<h1 
  className="text-4xl font-bold text-gray-900 mb-4"
  style={{
    animation: 'slideUp 0.8s ease-out',
    letterSpacing: '1px'
  }}
>
  ONLINE LIQUOR DELIVERY
</h1>


        {/* Subtitle */}
        <p 
          className="text-xl text-gray-600 mb-12"
          style={{
            animation: 'slideUp 0.8s ease-out 0.2s both'
          }}
        >
          Premium drinks delivered to your doorstep
        </p>

        {/* Get Started Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="group relative w-full bg-gray-900 text-white py-4 px-8 rounded-full text-lg font-semibold 
                   transition-all duration-300 hover:bg-gray-800 hover:shadow-xl"
          style={{
            animation: 'slideUp 0.8s ease-out 0.4s both'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span>Get Started</span>
            <ArrowRight 
              size={20} 
              className="transform group-hover:translate-x-1 transition-transform"
            />
          </div>
        </button>

        {/* Animated Promotion */}
        <div 
          className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white transform hover:scale-105 transition-transform cursor-pointer"
          style={{
            animation: 'slideUp 0.8s ease-out 0.6s both',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <h2 
            className="text-2xl font-bold mb-2"
            style={{
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            GET 180 ML FREE
          </h2>
          <p 
            className="text-gray-300"
            style={{
              animation: 'float 3s ease-in-out infinite 0.5s'
            }}
          >
            On Your First Order
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"
        style={{
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />
    </div>
  );
}

export default Welcome;