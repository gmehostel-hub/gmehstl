import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rajuPhoto from './raju.jpg';
import manojPhoto from './manoj.jpg';

// Feature Icon Components (simple SVGs for a clean look)
const FeatureIcon = ({ children }) => (
  <div className="bg-blue-100 text-blue-600 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
    {children}
  </div>
);

const RoomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const LibraryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
);

const PlacementIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  const developers = [
    {
      name: 'Raju Jadhav',
      photo: rajuPhoto,
      phone: '+918217596321',
      email: 'raajjadh75@gmail.com',
      linkedin: 'https://www.linkedin.com/in/raaj-jadhav',
      description: 'I’m a passionate and self-driven Computer Science student with hands-on experience in full-stack web development, database systems, and backend technologies. I enjoy building real-world projects that solve practical problems, and I\'m constantly learning and exploring new tools and frameworks.',
    },
    {
      name: 'Manoj T B',
      photo: manojPhoto,
      phone: '+918088028712',
      email: 'manojtbmanu2@gmail.com',
      linkedin: 'https://www.linkedin.com/in/manoj-tb-34a001330',
      description: 'I\'m a passionate developer with hands-on experience in building full-stack web applications using the MERN stack (MongoDB, Express.js, React.js, Node.js). I enjoy creating practical, user-friendly solutions and have a strong foundation in programming with Python, C++, and Java. I\'m always eager to learn new technologies and contribute to impactful projects.',
    },
  ];

  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-lg z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            gmebh
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors duration-300">Features</a>
            <a href="#developers" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors duration-300">Developers</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors duration-300">Contact</a>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-gray-600 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isMenuOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 h-full bg-white w-4/5 max-w-sm shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <nav className="flex flex-col space-y-2 pt-6 flex-grow">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md px-4 py-3 text-base font-medium transition-colors">Features</a>
            <a href="#developers" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md px-4 py-3 text-base font-medium transition-colors">Developers</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md px-4 py-3 text-base font-medium transition-colors">Contact</a>
          </nav>
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/login');
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-grow">
        <main className="container mx-auto px-6">
          {/* Hero Section */}
          <section className="text-center py-20 md:py-32">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Govt. Medical<br />And Engineering<br />Boys Hostel
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                An integrated platform for students, wardens, and administrators. Manage rooms, library, placements, and more with unparalleled efficiency.
              </p>
              <div className="mt-10">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Access Your Dashboard
                </button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Our platform provides a comprehensive suite of tools to manage hostel life effectively.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="text-center">
                <FeatureIcon><RoomIcon /></FeatureIcon>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Room Management</h3>
                <p className="text-gray-600">
                  Effortlessly assign rooms, manage student accommodations, and view occupancy details in real-time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <FeatureIcon><LibraryIcon /></FeatureIcon>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Library System</h3>
                <p className="text-gray-600">
                  A digital library for tracking books, managing fines, and promoting a reading culture.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <FeatureIcon><PlacementIcon /></FeatureIcon>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Placement Cell</h3>
                <p className="text-gray-600">
                  Monitor placement activities, track student progress, and celebrate their career achievements.
                </p>
              </div>
            </div>
          </section>

          {/* Developers Section */}
          <section id="developers" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Meet Our Developers</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                The minds behind the platform, dedicated to creating a seamless experience for you.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {developers.map((dev, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                  <img src={dev.photo} alt={dev.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100 shadow-md" />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{dev.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 px-4">{dev.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex justify-center space-x-4">
                      <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                      <a href={`mailto:${dev.email}`} className="text-gray-500 hover:text-red-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.5h-20v13h20v-13zm-2 11h-16v-9.25l8 4.62 8-4.62v9.25zM22 4.5c0-.276-.224-.5-.5-.5h-19c-.276 0-.5.224-.5.5v.5l10 5.75 10-5.75v-.5z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-gray-600 mb-8">
                Access our management portal to explore rooms, facilities, and start your application process.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Access Portal
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-20" id="contact">
          <div className="container mx-auto px-6 py-10 text-center text-gray-600">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
            <p className="mb-2">
              <strong>Phone:</strong> <a href="tel:+919449433464" className="text-blue-600 hover:underline">+91 9449433464</a>
            </p>
            <p className="mb-6">
              <strong>Email:</strong> <a href="mailto:maheshasbg@gmail.com" className="text-blue-600 hover:underline">maheshasbg@gmail.com</a>
            </p>
            <p>&copy; {new Date().getFullYear()} gmebh. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
