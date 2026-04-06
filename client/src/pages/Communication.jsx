import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { Send, Hash, MessageSquare, Users, Bell, Phone, Video, MoreVertical, Search, Plus, Loader2, Check, CheckCheck } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import '../styles/theme.css';

const API_URL = 'http://localhost:5000/api/communication';

const Communication = () => {
  const { isMobile } = useSelector((state) => state.layout);
  const { user } = useSelector((state) => state.auth);
  
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const { 
    messages, 
    setMessages, 
    sendMessage, 
    emitTyping, 
    isTyping, 
    typingUser 
  } = useSocket(activeChannel?._id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch all channels for the user
  const fetchChannels = async (selectChannelId = null) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get(`${API_URL}/channels`, config);
      setChannels(data);
      
      if (selectChannelId) {
        const selected = data.find(c => c._id === selectChannelId);
        if (selected) setActiveChannel(selected);
      } else if (data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchChannels();
  }, [user]);

  // User Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { q: searchQuery }
        };
        const { data } = await axios.get('http://localhost:5000/api/auth/search', config);
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleStartDM = async (recipientId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data: channel } = await axios.post(`${API_URL}/dm`, { recipientId }, config);
      
      setSearchQuery('');
      setShowSearchResults(false);
      
      // Refresh channels and set active
      await fetchChannels(channel._id);
      if (isMobile) setIsChatOpen(true);
    } catch (error) {
      console.error('Error starting DM:', error);
    }
  };

  // Fetch messages for active channel
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChannel) return;
      
      setMessagesLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { channelId: activeChannel._id }
        };
        const { data } = await axios.get(`${API_URL}/messages`, config);
        setMessages(data);
        setMessagesLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessagesLoading(false);
      }
    };

    if (user && activeChannel) fetchMessages();
  }, [activeChannel, user]);

  const handleSelectChannel = (channel) => {
    setActiveChannel(channel);
    if (isMobile) setIsChatOpen(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChannel) return;

    const msgData = {
      sender: user._id,
      content: messageText,
      channel: activeChannel._id,
      messageType: 'text'
    };

    sendMessage(msgData);
    setMessageText('');
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    emitTyping({ room: activeChannel._id, user: user.name });
  };

  if (loading) {
    return (
      <Layout title="Communication Hub">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent)" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Communication Hub / Real-time Messaging">
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(320px, 1fr) 3fr', // More generous sidebar
        gap: isMobile ? '0' : '24px',
        height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 160px)',
        padding: isMobile ? '0' : '0 12px 12px 0'
      }}>
        {/* Sidebar Channels */}
        {(!isMobile || !isChatOpen) && (
          <div className="glass-card" style={{
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(79, 142, 247, 0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--text)' }}>Discussions</h2>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={16} />
                <input
                  type="text"
                  placeholder="Find student or tutor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 40px', 
                    borderRadius: '14px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg)', 
                    color: 'var(--text)', 
                    fontSize: '13px', 
                    outline: 'none',
                    transition: 'var(--transition)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                {isSearching && <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.length >= 2 && (
                <div style={{
                  position: 'absolute', top: '100%', left: '16px', right: '16px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '16px', marginTop: '12px', zIndex: 50,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {searchResults.length === 0 && !isSearching ? (
                    <div style={{ padding: '20px', fontSize: '13px', color: 'var(--text3)', textAlign: 'center' }}>No users found in your courses</div>
                  ) : (
                    searchResults.map(result => (
                      <div 
                        key={result._id} 
                        onClick={() => handleStartDM(result._id)}
                        style={{ 
                          padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', 
                          cursor: 'pointer', transition: 'var(--transition)', borderBottom: '1px solid var(--border)' 
                        }}
                        className="table-row-hover"
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{result.name.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>{result.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{result.role}</p>
                        </div>
                        <Plus size={14} color="var(--accent)" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '1.5px', marginBottom: '16px', paddingLeft: '12px', opacity: 0.6 }}>
                  Announcements & Channels
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {channels.filter(c => c.type !== 'direct').map((chan) => (
                    <div key={chan._id} onClick={() => handleSelectChannel(chan)} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: activeChannel?._id === chan._id ? 'linear-gradient(90deg, rgba(79, 142, 247, 0.15) 0%, transparent 100%)' : 'transparent',
                      color: activeChannel?._id === chan._id ? 'var(--accent)' : 'var(--text2)',
                      fontSize: '15px',
                      fontWeight: activeChannel?._id === chan._id ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      borderLeft: activeChannel?._id === chan._id ? '4px solid var(--accent)' : '4px solid transparent'
                    }}>
                      <Hash size={18} style={{ opacity: activeChannel?._id === chan._id ? 1 : 0.5 }} /> {chan.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '1.5px', marginBottom: '16px', paddingLeft: '12px', opacity: 0.6 }}>
                  Direct Messages
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {channels.filter(c => c.type === 'direct').map((dm) => {
                    const otherMember = dm.members?.find(m => m._id !== user._id);
                    const isActive = activeChannel?._id === dm._id;
                    return (
                      <div key={dm._id} onClick={() => handleSelectChannel(dm)} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        padding: '14px 16px', 
                        borderRadius: '12px', 
                        background: isActive ? 'linear-gradient(90deg, rgba(79, 142, 247, 0.15) 0%, transparent 100%)' : 'transparent',
                        borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '14px', 
                            background: isActive ? 'var(--accent)' : 'var(--bg3)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '14px', 
                            fontWeight: '800',
                            color: isActive ? 'white' : 'var(--text2)',
                            boxShadow: isActive ? '0 4px 12px rgba(79, 142, 247, 0.3)' : 'none'
                          }}>
                            {(otherMember?.name || 'U').charAt(0)}
                          </div>
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '-2px', 
                            right: '-2px', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            background: '#10b981', // Mobile online indicator
                            border: '2.5px solid var(--bg2)' 
                          }}></div>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{ fontWeight: '700', fontSize: '15px', color: isActive ? 'var(--accent)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {otherMember?.name || dm.name}
                          </p>
                          <p style={{ fontSize: '12px', color: isActive ? 'var(--text2)' : 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>
                            {dm.lastMessage?.content || 'Say hi! 👋'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Window */}
        {(!isMobile || isChatOpen) && (
          <div className="glass-card" style={{
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'var(--shadow-xl)',
            background: 'var(--bg2)'
          }}>
            {/* Header */}
            {!activeChannel ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(79, 142, 247, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <MessageSquare size={56} style={{ opacity: 0.2 }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>Select a conversation</h3>
                <p style={{ maxWidth: '300px', lineHeight: '1.6' }}>Choose a channel or direct message to start communicating with your peers and tutors.</p>
              </div>
            ) : (
              <>
                <div style={{
                  padding: isMobile ? '16px' : '20px 28px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isMobile && <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>}
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '900', fontSize: '18px'
                      }}>
                        {activeChannel?.type === 'direct' ? (activeChannel.members?.find(m => m._id !== user._id)?.name || 'U').charAt(0) : <Hash size={24} />}
                      </div>
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', border: '3px solid var(--bg2)' }}></div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {activeChannel?.type === 'direct' ? (activeChannel.members?.find(m => m._id !== user._id)?.name || activeChannel.name) : activeChannel?.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Active Now</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="chat-action-btn"><Phone size={18} /></button>
                    <button className="chat-action-btn"><Video size={18} /></button>
                    <button className="chat-action-btn"><Search size={18} /></button>
                    <button className="chat-action-btn"><MoreVertical size={18} /></button>
                  </div>
                </div>

                {/* Messages List */}
                <div style={{
                  flex: 1,
                  padding: isMobile ? '20px 16px' : '32px 40px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  background: 'var(--bg)',
                  backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
                  backgroundSize: '32px 32px'
                }}>
                  {messagesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <Loader2 className="animate-spin" size={32} color="var(--accent)" />
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                      const isFirst = i === 0 || (messages[i - 1].sender?._id || messages[i - 1].sender) !== (msg.sender?._id || msg.sender);
                      const isLast = i === messages.length - 1 || (messages[i + 1].sender?._id || messages[i + 1].sender) !== (msg.sender?._id || msg.sender);
                      const showAvatar = isLast; // Show avatar only for the last message in a cluster
                      
                      return (
                        <div key={i} style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          flexDirection: isMine ? 'row-reverse' : 'row',
                          marginBottom: isLast ? '12px' : '-16px',
                          alignItems: 'flex-end',
                          transition: 'all 0.3s ease'
                        }}>
                          {/* Avatar */}
                          <div style={{ width: '36px', visibility: showAvatar ? 'visible' : 'hidden' }}>
                            <div style={{ 
                              width: '36px', height: '36px', borderRadius: '12px', 
                              background: isMine ? 'var(--accent2)' : 'var(--accent)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              color: 'white', fontWeight: 'bold', fontSize: '14px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}>
                              {(msg.sender?.name || (isMine ? 'Me' : 'U')).charAt(0)}
                            </div>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: isMine ? 'flex-end' : 'flex-start', 
                            maxWidth: '75%',
                            position: 'relative'
                          }}>
                            {isFirst && !isMine && (
                                <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '800', marginBottom: '6px', marginLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                  {msg.sender?.name || 'User'}
                                </span>
                            )}
                            <div 
                              className={`chat-bubble ${isMine ? 'mine' : 'theirs'} ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}
                              style={{ 
                                background: isMine ? 'linear-gradient(135deg, #4f8ef7 0%, #2b59c3 50%, #1e3a8a 100%)' : 'rgba(255,255,255,0.06)', 
                                backdropFilter: isMine ? 'none' : 'blur(16px)',
                                border: isMine ? 'none' : '1px solid rgba(255,255,255,0.12)',
                                color: isMine ? 'white' : 'var(--text)',
                                padding: '12px 16px', 
                                borderRadius: isMine 
                                  ? `${isFirst ? '20px' : '20px'} 20px ${isLast ? '4px' : '20px'} ${isFirst ? '20px' : '20px'}`
                                  : `20px 20px 20px ${isLast ? '4px' : '20px'}`, 
                                fontSize: '14px', 
                                lineHeight: '1.6',
                                boxShadow: isMine ? '0 8px 25px rgba(43, 89, 195, 0.25)' : '0 8px 32px rgba(0,0,0,0.2)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                borderBottomRightRadius: isMine && isLast ? '4px' : '20px',
                                borderBottomLeftRadius: !isMine && isLast ? '4px' : '20px',
                                transition: 'var(--transition)'
                              }}
                            >
                              <span style={{ letterSpacing: '0.2px' }}>{msg.content}</span>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end', 
                                gap: '4px',
                                opacity: 0.6,
                                fontSize: '10px',
                                alignSelf: 'flex-end',
                                marginTop: '4px',
                                fontWeight: '600'
                              }}>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isMine && (
                                  <span style={{ display: 'flex', alignItems: 'center' }}>
                                    {msg.status === 'read' ? (
                                      <CheckCheck size={13} color="#fff" style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.4))' }} />
                                    ) : msg.status === 'delivered' ? (
                                      <CheckCheck size={13} style={{ opacity: 0.6 }} />
                                    ) : (
                                      <Check size={13} style={{ opacity: 0.6 }} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '12px', fontWeight: '800', marginLeft: '48px', animation: 'fadeIn 0.3s ease' }}>
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                      {typingUser} is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Modern Input Bar */}
                <div style={{ padding: '24px 32px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
                  <form onSubmit={handleSendMessage} style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button type="button" className="input-round-btn"><Plus size={20} /></button>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text"
                        value={messageText}
                        onChange={handleTyping}
                        placeholder={`Message ${activeChannel?.type === 'direct' ? (activeChannel.members?.find(m => m._id !== user._id)?.name || 'user') : '#' + activeChannel?.name}...`}
                        style={{ 
                          width: '100%', 
                          padding: '18px 24px', 
                          borderRadius: '24px', 
                          border: '2px solid transparent', 
                          background: 'var(--bg)', 
                          color: 'var(--text)', 
                          fontSize: '15px', 
                          outline: 'none',
                          transition: 'var(--transition)',
                          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                      />
                    </div>
                    <button type="submit" className="premium-btn" disabled={!messageText.trim()} style={{ 
                      width: '56px', height: '56px', borderRadius: '50%', padding: '0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: messageText.trim() ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--bg3)',
                      opacity: messageText.trim() ? 1 : 0.5,
                      boxShadow: '0 8px 20px rgba(79, 142, 247, 0.3)'
                    }}>
                      <Send size={22} color="white" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-bubble {
          position: relative;
          max-width: 100%;
          word-break: break-word;
        }
        .chat-bubble.mine.last::after {
          content: "";
          position: absolute;
          bottom: 0;
          right: -8px;
          width: 20px;
          height: 20px;
          background: #1e3a8a;
          clip-path: polygon(0 0, 0% 100%, 100% 100%);
          z-index: -1;
        }
        .chat-bubble.theirs.last::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: -8px;
          width: 20px;
          height: 20px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          clip-path: polygon(100% 0, 0 100%, 100% 100%);
          z-index: -1;
          border-left: 1px solid rgba(255,255,255,0.12);
        }
        .chat-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important;
        }
        .chat-action-btn:hover {
          background: var(--accent);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 142, 247, 0.4);
        }
        .input-round-btn:hover {
          background: var(--bg);
          color: var(--accent);
          transform: rotate(90deg);
        }
        .typing-indicator span {
          height: 6px; width: 6px; background: var(--accent); border-radius: 50%; display: inline-block;
          animation: bounce 1.3s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </Layout>
  );
};

export default Communication;
