import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- DADOS DE FALLBACK (Para caso o backend esteja offline) ---
const MOCK_PRODUCTS = [
  { _id: "1", name: "Estudante Essencial", category: "Estudante", price: 2200.00, cpu: "AMD Ryzen 3 3200G", ram: "8GB DDR4", storage: "SSD NVMe 256GB", description: "Eficiência energética e baixo custo." },
  { _id: "2", name: "Terminal de Vendas", category: "Comércio", price: 2800.00, cpu: "Intel Core i3-12100", ram: "16GB DDR4", storage: "SSD NVMe 512GB", description: "Confiabilidade para sistemas de gestão." },
  { _id: "3", name: "Profissional Gerência", category: "Gerência", price: 4500.00, cpu: "Ryzen 5 5600X", ram: "32GB DDR4", storage: "SSD NVMe 1TB", description: "Para análise de dados e multitarefas." },
  { _id: "4", name: "Científico Essencial", category: "Científico", price: 5800.00, cpu: "Ryzen 5 5600X", ram: "32GB DDR4", storage: "SSD NVMe 1TB", description: "Com GPU dedicada para aceleração." },
  { _id: "5", name: "Gamer Especial", category: "Gamer", price: 7500.00, cpu: "Ryzen 5 5700X", ram: "16GB DDR4", storage: "SSD NVMe 1TB", description: "Focado em 1440p com alto desempenho." },
  { _id: "6", name: "Gamer Pro", category: "Gamer", price: 15000.00, cpu: "Ryzen 7 7700X", ram: "32GB DDR5", storage: "SSD NVMe 2TB", description: "Para 4K, Streaming e performance máxima." }
];

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [user, setUser] = useState(null); // Usuário logado
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' }); // Feedback msg
  
  // Formulário
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    document: '',
    address: '',
    card: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/products')
      .then(response => {
        setProducts(response.data);
        setBackendStatus('online');
      })
      .catch(error => {
        console.warn('Backend offline. Usando dados locais.', error);
        setProducts(MOCK_PRODUCTS);
        setBackendStatus('offline');
      });
  };

  // --- LÓGICA DE CARRINHO ---
  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) removeFromCart(id);
    else setCart(cart.map(item => item._id === id ? { ...item, qty: parseInt(newQty) } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));

  const calculateTotal = () => cart.reduce((total, item) => total + (parseFloat(item.price) * item.qty), 0);

  // --- LÓGICA DE AUTENTICAÇÃO ---
  const handleAuthInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateRegister = () => {
    const { name, password, document, address, card } = formData;
    
    // Princípio de Integridade: Validações rigorosas
    if (name.length < 1 || name.length > 30) return "Nome deve ter entre 1 e 30 caracteres.";
    if (password.length < 6) return "Senha deve ter no mínimo 6 caracteres.";
    if (document.length < 7 || document.length > 11) return "Documento deve ter entre 7 e 11 caracteres.";
    if (address.length < 1 || address.length > 50) return "Endereço deve ter entre 1 e 50 caracteres.";
    if (!/^\d{16}$/.test(card)) return "O cartão deve conter exatamente 16 números (apenas dígitos).";
    
    return null;
  };

  const handleRegister = async () => {
    const error = validateRegister();
    if (error) {
      setAuthMsg({ type: 'error', text: error });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      setAuthMsg({ type: 'success', text: 'Cadastro realizado! Faça login.' });
      setAuthMode('login');
      setFormData({ name: '', password: '', document: '', address: '', card: '' }); // Limpa dados sensíveis
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao conectar com servidor.";
      setAuthMsg({ type: 'error', text: msg });
    }
  };

  const handleLogin = async () => {
    if (!formData.name || !formData.password) {
      setAuthMsg({ type: 'error', text: "Preencha nome e senha." });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        name: formData.name,
        password: formData.password
      });
      setUser(response.data.user);
      setAuthMsg({ type: 'success', text: `Bem-vindo(a), ${response.data.user.name}!` });
      setFormData({ name: '', password: '', document: '', address: '', card: '' });
    } catch (err) {
      setAuthMsg({ type: 'error', text: "Nome ou senha incorretos." });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMsg({ type: '', text: '' });
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      <header style={{ marginBottom: '30px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>🖥️ TechStore</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Alta Performance e Segurança</p>
        </div>
        {backendStatus === 'offline' && <span style={{ backgroundColor: '#e67e22', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>⚠️ Modo Offline</span>}
      </header>

      <div style={{ display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* --- VITRINE (ESQUERDA) --- */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          <h2 style={{ color: '#333', borderBottom: '2px solid #dfe6e9', paddingBottom: '10px', marginTop: 0 }}>Catálogo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: getCategoryColor(product.category), color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {product.category}
                </span>
                <h3 style={{ margin: '25px 0 10px 0', color: '#2d3436', fontSize: '1.1rem' }}>{product.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#636e72' }}>{product.description}</p>
                <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', margin: '15px 0', fontSize: '0.8rem', color: '#2d3436' }}>
                  <div>🧠 <strong>CPU:</strong> {product.cpu}</div>
                  <div>💾 <strong>RAM:</strong> {product.ram}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#27ae60' }}>
                    R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => addToCart(product)} style={btnStyle}>+ Carrinho</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- COLUNA DIREITA (LOGIN + CARRINHO) --- */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          
          {/* 1. ÁREA DE LOGIN / CADASTRO (ACIMA DO CARRINHO) */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '20px', borderTop: '5px solid #3498db' }}>
            <h2 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.3rem', marginBottom: '15px' }}>
              🔐 Área do Cliente
            </h2>

            {/* Mensagens de Feedback (Disponibilidade) */}
            {authMsg.text && (
              <div style={{ 
                padding: '10px', 
                borderRadius: '6px', 
                marginBottom: '15px', 
                backgroundColor: authMsg.type === 'error' ? '#ffeaea' : '#d4edda',
                color: authMsg.type === 'error' ? '#e74c3c' : '#155724',
                border: `1px solid ${authMsg.type === 'error' ? '#ffcccc' : '#c3e6cb'}`
              }}>
                {authMsg.text}
              </div>
            )}

            {user ? (
              // VIEW LOGADO
              <div style={{textAlign: 'center'}}>
                <p style={{fontSize: '1.1rem'}}>Olá, <strong>{user.name}</strong>!</p>
                <button onClick={handleLogout} style={{...btnStyle, backgroundColor: '#e74c3c', width: '100%'}}>Sair</button>
              </div>
            ) : (
              // VIEW LOGIN / CADASTRO
              <div>
                {authMode === 'login' ? (
                  <>
                    <input name="name" placeholder="Nome do Usuário" value={formData.name} onChange={handleAuthInput} style={inputStyle} />
                    <input name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleAuthInput} style={inputStyle} />
                    
                    <button onClick={handleLogin} style={{...btnStyle, width: '100%', marginBottom: '10px'}}>Entrar</button>
                    
                    <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
                      Novo por aqui? <span onClick={() => {setAuthMode('register'); setAuthMsg({type:'', text:''})}} style={linkStyle}>Cadastre-se</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}>
                      <small style={{color: '#666'}}>Preencha todos os campos:</small>
                      <input name="name" placeholder="Nome e Sobrenome (1-30 chars)" value={formData.name} onChange={handleAuthInput} style={inputStyle} maxLength={30} />
                      <input name="password" type="password" placeholder="Senha (Min 6 chars)" value={formData.password} onChange={handleAuthInput} style={inputStyle} />
                      <input name="document" placeholder="Documento (7-11 chars)" value={formData.document} onChange={handleAuthInput} style={inputStyle} maxLength={11} />
                      <input name="address" placeholder="Endereço (1-50 chars)" value={formData.address} onChange={handleAuthInput} style={inputStyle} maxLength={50} />
                      <input name="card" placeholder="Cartão (16 números)" value={formData.card} onChange={handleAuthInput} style={inputStyle} maxLength={16} />
                    </div>

                    <button onClick={handleRegister} style={{...btnStyle, backgroundColor: '#27ae60', width: '100%', marginBottom: '10px'}}>Finalizar Cadastro</button>
                    
                    <div style={{textAlign: 'center', fontSize: '0.9rem'}}>
                      Já tem conta? <span onClick={() => {setAuthMode('login'); setAuthMsg({type:'', text:''})}} style={linkStyle}>Fazer Login</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. CARRINHO DE COMPRAS */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' }}>
            <h2 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              🛒 Seu Pedido
            </h2>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#b2bec3' }}>
                <p>Seu carrinho está vazio.</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ borderBottom: '1px solid #f1f2f6', padding: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{item.name}</strong>
                        <small>R$ {item.price.toLocaleString('pt-BR')}</small>
                      </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button onClick={() => updateQty(item._id, item.qty - 1)} style={miniBtnStyle}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)} style={miniBtnStyle}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '2px solid #f1f2f6', paddingTop: '20px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
                    <strong>Total:</strong>
                    <strong style={{ color: '#27ae60' }}>R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  {user ? (
                    <button style={{...btnStyle, width: '100%', backgroundColor: '#27ae60'}}>Finalizar Compra</button>
                  ) : (
                    <div style={{color: '#e67e22', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '6px'}}>
                      Faça login para finalizar.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS E HELPERS ---
const getCategoryColor = (category) => ({ 'Gamer': '#8e44ad', 'Estudante': '#f1c40f', 'Comércio': '#e67e22', 'Gerência': '#34495e', 'Científico': '#1abc9c' }[category] || '#95a5a6');

const btnStyle = { padding: '10px 15px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const miniBtnStyle = { width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
const linkStyle = { color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' };

export default App;