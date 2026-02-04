import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';

const socket = io(import.meta.env.VITE_API_URL);

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [goal, setGoal] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'Coding', description: '' });

  useEffect(() => {
    if (!user) {
      navigate('/'); 
      return;
    }

    // 1. Fetch Goal on Load
    const fetchGoal = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/goals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setGoal(res.data);
      } catch (err) {
        console.error("Error fetching goal:", err);
      }
    };
    fetchGoal();

    // 2. Socket Listeners
    socket.emit('join_room', user._id);

    // Match Found
    socket.on('match_found', (data) => {
      alert(`MATCH FOUND! You are paired with ${data.partnerName}`);
      setGoal((prev) => ({
        ...prev,
        status: 'MATCHED', 
        partnerId: 'partner_linked'
      }));
    });

    // Partner Left (New Feature)
    socket.on('partner_left', () => {
      alert('Your partner has disconnected. We are looking for a new one!');
      setGoal((prev) => ({
        ...prev,
        status: 'SEARCHING',
        partnerId: null
      }));
    });

    return () => {
      socket.off('match_found');
      socket.off('partner_left');
    };
  }, [user, navigate]);

  // Create Goal
  const createGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/goals`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoal(res.data.goal);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating goal');
    }
  };

  // End Chat (New Feature)
  const endChat = async () => {
    if(!window.confirm("Are you sure you want to end this chat?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoal(null); // Go back to Form
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hey, {user?.name} 👋</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="text-sm text-gray-500 hover:text-red-500 font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          
          {!goal ? (
            /* VIEW 1: CREATE GOAL FORM */
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What is your focus today?</h2>
              <p className="text-gray-500 mb-6">Set a goal to find your perfect accountability partner.</p>
              
              <form onSubmit={createGoal} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                  <input 
                    placeholder="e.g. Master React Hooks" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Coding">💻 Coding</option>
                    <option value="Fitness">💪 Fitness</option>
                    <option value="Productivity">📚 Productivity</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Find a Buddy
                </button>
              </form>
            </div>
          ) : (
            /* VIEW 2: ACTIVE GOAL STATUS */
            <div className="w-full">
               <div className="border-b pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Current Goal</span>
                    <h2 className="text-3xl font-bold text-gray-800 mt-1">{goal.title}</h2>
                  </div>
                  
                  {/* END CHAT BUTTON */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                      goal.status === 'MATCHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {goal.status}
                    </span>
                    
                    <button 
                      onClick={endChat}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      {goal.status === 'MATCHED' ? 'End Chat' : 'Cancel Search'}
                    </button>
                  </div>
               </div>
              
              {goal.status === 'SEARCHING' ? (
                 <div className="text-center py-10 bg-yellow-50 rounded-xl border border-yellow-200 border-dashed">
                   <div className="animate-spin text-4xl mb-4">⏳</div>
                   <h3 className="text-xl font-bold text-yellow-800">Looking for a partner...</h3>
                   <p className="text-yellow-600">We are searching for someone in <strong>{goal.category}</strong>.</p>
                 </div>
              ) : (
                 <div className="h-[500px] flex flex-col">
                   <ChatWindow socket={socket} user={user} />
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;