from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
import hashlib # Para confidencialidade da senha

app = Flask(__name__)
CORS(app) # Habilita CORS

# Conexão com MongoDB
client = MongoClient('mongodb://mongo:27017/')
db = client.ecommerce

# --- DADOS PARA POPULAR O BANCO (SEED) ---
default_products = [
    {
        "name": "Estudante Essencial",
        "category": "Estudante",
        "price": 2200.00,
        "cpu": "AMD Ryzen 3 3200G / i3-10100",
        "ram": "8GB DDR4",
        "storage": "SSD NVMe 256GB",
        "description": "Eficiência energética e baixo custo para tarefas básicas e videochamadas."
    },
    {
        "name": "Terminal de Vendas Essencial",
        "category": "Comércio",
        "price": 2800.00,
        "cpu": "Intel Core i3-12100",
        "ram": "16GB DDR4",
        "storage": "SSD NVMe 512GB",
        "description": "Confiabilidade para sistemas de gestão (ERP/PDV) e múltiplos monitores."
    },
    {
        "name": "Profissional de Gerência",
        "category": "Gerência",
        "price": 4500.00,
        "cpu": "Ryzen 5 5600X / i5-12400F",
        "ram": "32GB DDR4",
        "storage": "SSD NVMe 1TB",
        "description": "Ideal para gerenciar grandes volumes de dados e multitarefas pesadas."
    },
    {
        "name": "Científico Essencial",
        "category": "Científico",
        "price": 5800.00,
        "cpu": "Ryzen 5 5600X",
        "ram": "32GB DDR4",
        "storage": "SSD NVMe 1TB",
        "description": "Com GPU dedicada (RTX 3050/RX 6600) para aceleração em softwares científicos."
    },
    {
        "name": "Gamer Especial",
        "category": "Gamer",
        "price": 7500.00,
        "cpu": "Ryzen 5 5700X / i5-12600K",
        "ram": "16GB DDR4 3200MHz",
        "storage": "SSD NVMe 1TB",
        "description": "Focado em jogos 1440p com taxas de quadros elevadas."
    },
    {
        "name": "Gamer Pro",
        "category": "Gamer",
        "price": 15000.00,
        "cpu": "Ryzen 7 7700X / i7-13700K",
        "ram": "32GB DDR5 6000MHz",
        "storage": "SSD NVMe 2TB Alta Vel.",
        "description": "Para 4K, Streaming e performance máxima com RTX 4080/RX 7900."
    }
]

def seed_database():
    """Verifica se o banco está vazio e insere os produtos padrão"""
    try:
        if db.products.count_documents({}) == 0:
            db.products.insert_many(default_products)
            print("--- Banco de dados populado com sucesso! ---")
    except Exception as e:
        print(f"Erro ao popular banco: {e}")

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validação básica no backend (Integridade)
    required_fields = ['name', 'password', 'document', 'address', 'card']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Campo {field} é obrigatório"}), 400

    # Verifica duplicidade de documento (Chave Primária Lógica)
    if db.users.find_one({"document": data['document']}):
        return jsonify({"error": "Documento já cadastrado no sistema."}), 409

    # Hash da senha (Confidencialidade)
    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    
    user_doc = {
        "name": data['name'],
        "password": hashed_password, # Salva o hash, não a senha real
        "document": data['document'],
        "address": data['address'],
        "card": data['card'][-4:] # Salva apenas os últimos 4 dígitos por segurança extra (simulado)
    }
    
    db.users.insert_one(user_doc)
    return jsonify({"message": "Cadastro realizado com sucesso!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Busca usuário pelo nome (conforme solicitado) e senha
    # Nota: Em sistemas reais, login geralmente é por email ou documento.
    # Aqui seguiremos o pedido: "nome e senha"
    
    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    
    user = db.users.find_one({
        "name": data['name'],
        "password": hashed_password
    })
    
    if user:
        return jsonify({
            "message": "Login realizado com sucesso",
            "user": {"name": user['name'], "document": user['document']}
        }), 200
    else:
        return jsonify({"error": "Nome ou senha incorretos"}), 401

# --- ROTAS DE PRODUTOS ---

@app.route('/products', methods=['GET'])
def get_products():
    products = list(db.products.find({}))
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify(products), 200

@app.route('/products/<id>', methods=['DELETE'])
def delete_product(id):
    try:
        result = db.products.delete_one({"_id": ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Produto removido"}), 200
        return jsonify({"error": "Produto não encontrado"}), 404
    except:
        return jsonify({"error": "ID inválido"}), 400

if __name__ == '__main__':
    seed_database()
    app.run(host='0.0.0.0', port=5000, debug=True)