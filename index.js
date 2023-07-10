const express = require('express');
const crypt = require('crypto');
const app = express();
const port = 4000;
​
app.use(express.json());
​
const contas = [
  { numero: 12345, saldo: 1000, user: 'jorge', token: [] },
  { numero: 54321, saldo: 500, user: 'maria', token: [] },
  { numero: 98765, saldo: 2500, user: 'teresa', token: [] },
];
​
// Rota para cadastrar uma conta
app.post('/contas', (req, res) => {
  const { numero, saldo, user } = req.body;
​
  if (!numero || !saldo || !user) {
    return res.status(400).send('É necessário fornecer número, saldo e usuário.');
  }
​
  const existingAccount = contas.find((conta) => conta.user === user);
​
  if (existingAccount) {
    return res.status(409).send('Essa conta já está cadastrada.');
  }
​
  contas.push({ numero, saldo, user, token: [] });
  return res.sendStatus(200);
});
​
// Rota para autenticar e obter um token
app.post('/auth', (req, res) => {
  const { user } = req.body;
​
  if (!user) {
    return res.status(400).send('É necessário fornecer o usuário.');
  }
​
  const account = contas.find((conta) => conta.user === user);
​
  if (!account) {
    return res.status(401).send('Conta não encontrada.');
  }
​
  const token = crypt.randomUUID() // Função para gerar um token único
​
  account.token.push(token);
  return res.status(200).json({ token });
});
​
// Rota para realizar o débito entre contas
app.post('/transfer', (req, res) => {
  const { origin, destination, amount } = req.body;
  const token = req.headers['authentication-headers'];
​
  if (!token) {
    return res.status(401).send('Token de autenticação não fornecido.');
  }
​
  const account = contas.find((conta) => conta.token.includes(token));
​
  if (!account) {
    return res.status(401).send('Token de autenticação inválido.');
  }
​
  if (!origin || !destination || !amount) {
    return res.status(400).send('É necessário fornecer a conta de origem, conta de destino e valor da transferência.');
  }
​
  const originAccount = contas.find((conta) => conta.numero === origin);
  const destinationAccount = contas.find((conta) => conta.numero === destination);
​
  if (!originAccount || !destinationAccount) {
    return res.status(400).send('Conta de origem ou destino não encontrada.');
  }
​
  if (originAccount.saldo < amount) {
    return res.status(400).send('Saldo insuficiente para a transferência.');
  }
​
  originAccount.saldo -= amount;
  destinationAccount.saldo += amount;
​
  return res.sendStatus(200);
});
​
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
