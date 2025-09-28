# 🪟 Instalação no Windows - Dashboard 3A Frios

## ⚡ Guia Rápido (5 minutos)

### 1️⃣ Instalar Node.js
1. Acesse: https://nodejs.org/
2. Clique em **"Download Node.js (LTS)"** - versão recomendada
3. Execute o arquivo baixado (.msi)
4. Clique **"Next"** em tudo e **"Install"**
5. Reinicie o computador

### 2️⃣ Verificar se instalou corretamente
Abra o **Prompt de Comando** (cmd) e digite:
```cmd
node --version
npm --version
```
Se aparecer números de versão, está tudo certo! ✅

### 3️⃣ Instalar Git (se não tiver)
1. Acesse: https://git-scm.com/download/win
2. Baixe e execute o instalador
3. Clique **"Next"** em tudo (configurações padrão estão OK)

### 4️⃣ Baixar e executar o Dashboard
Abra o **Prompt de Comando** (cmd) e cole estes comandos um por vez:

```cmd
git clone https://github.com/SEU_USUARIO/dashboard-3a-frios.git
```

```cmd
cd dashboard-3a-frios
```

```cmd
npm install
```
⏳ *Aguarde... pode demorar alguns minutos*

```cmd
npm run dev
```

### 5️⃣ Abrir no navegador
Acesse: http://localhost:3000

🎉 **Pronto! O Dashboard está rodando!**

---

## 🔧 Se der algum erro...

### ❌ "node não é reconhecido como comando"
- **Solução**: Reinicie o computador e tente novamente
- Se não resolver, reinstale o Node.js

### ❌ "git não é reconhecido como comando"
- **Solução**: Instale o Git (passo 3) e reinicie o cmd

### ❌ "Port 3000 already in use"
- **Solução**: Use outra porta:
```cmd
npm run dev -- -p 3001
```
Depois acesse: http://localhost:3001

### ❌ Erro durante `npm install`
- **Solução**: Tente limpar e reinstalar:
```cmd
rmdir /s node_modules
del package-lock.json
npm install
```

---

## 📱 Para testar no celular (mesma rede WiFi)

1. No cmd, digite: `ipconfig`
2. Procure por "Endereço IPv4" (ex: 192.168.1.100)
3. No celular, acesse: `http://192.168.1.100:3000`

---

## 🛑 Para parar o servidor
No cmd onde está rodando, pressione: **Ctrl + C**

## 🔄 Para rodar novamente
```cmd
cd dashboard-3a-frios
npm run dev
```

---

💡 **Dica**: Salve este arquivo! Você pode precisar dele depois.