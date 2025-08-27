import React, { useState } from 'react';

const LoginTest = () => {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const createUsers = async () => {
    setLoading(true);
    setMessage('Creating users...');
    
    try {
      const response = await fetch('/api/test/create-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Users created successfully!');
        setUsers(data.users);
      } else {
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUsers = async () => {
    setLoading(true);
    setMessage('Checking users...');
    
    try {
      const response = await fetch('/api/test/check-users');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Found ${data.count} users in database`);
        setUsers(data.users);
      } else {
        setMessage('❌ Error: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async (email, password) => {
    setLoading(true);
    setMessage(`Testing login for ${email}...`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Login successful for ${email} (${data.user.role})`);
        // Store token for testing
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setMessage(`❌ Login failed for ${email}: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🔧 Login System Test & Debug
          </h1>
          
          {/* Status Message */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Status:</h3>
            <p className={`text-sm ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
              {message || 'Ready to test...'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={createUsers}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? '⏳ Working...' : '👥 Create Test Users'}
            </button>
            
            <button
              onClick={checkUsers}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? '⏳ Working...' : '🔍 Check Existing Users'}
            </button>
          </div>

          {/* Test Login Buttons */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Test Login:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => testLogin('admin@hostelhaven.com', 'Admin@123!')}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                👨‍💼 Test Admin Login
              </button>
              
              <button
                onClick={() => testLogin('warden@hostelhaven.com', 'Warden@123!')}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                👮‍♂️ Test Warden Login
              </button>
              
              <button
                onClick={() => testLogin('student@hostelhaven.com', 'Student@123!')}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🎓 Test Student Login
              </button>
            </div>
          </div>

          {/* Users List */}
          {users.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Users in Database:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {users.map((user, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-gray-600">{user.email}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'warden' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">📋 Login Credentials:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Admin:</strong> admin@hostelhaven.com / Admin@123!</div>
              <div><strong>Warden:</strong> warden@hostelhaven.com / Warden@123!</div>
              <div><strong>Student:</strong> student@hostelhaven.com / Student@123!</div>
            </div>
          </div>

          {/* Go to Main App */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🏠 Go to Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
