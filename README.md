
# Plataforma de Agendamento de Consulta Online para Profissionais Autônomos de Saúde Domiciliar

## Resumo
A Plataforma de Agendamento de Consulta Online para Profissionais Autônomos de Saúde Domiciliar foi desenvolvida para facilitar a organização de consultas domiciliares, integrando funcionalidades de cadastro, autenticação segura, agendamento, notificações automáticas e gestão de horários. A solução é projetada para atender tanto a profissionais de saúde quanto a clientes, promovendo acessibilidade e eficiência. Utilizando tecnologias modernas como Node.js, PostgreSQL, EJS e Bootstrap, o sistema garante segurança, escalabilidade e uma interface responsiva, adaptada para dispositivos móveis e desktops. O projeto integra pagamentos online com o PayPal REST SDK, oferece autenticação baseada em JSON Web Tokens (JWT). Com metodologia ágil, priorizou-se entregas incrementais e validação contínua, proporcionando uma experiência prática e segura. Esta plataforma contribui para a digitalização do setor de saúde domiciliar, otimizando o tempo e garantindo maior praticidade para profissionais e pacientes.


Palavras-chave: agendamento, saúde domiciliar, gestão de consultas, digitalização, acessibilidade.



## Funcionalidades

- **Cadastro e Login**: Permite o cadastro e autenticação de clientes e profissionais de saúde.
- **Gerenciamento de Perfil**: Profissionais gerenciam seus horários disponíveis e bloqueiam indisponibilidades.
- **Agendamento de Consultas**: Exibe disponibilidade de horários dos profissionais.
- **Recuperação de Senha**: Fluxo completo de recuperação de senha, incluindo solicitação de redefinição, envio de código por e-mail, verificação do código e redefinição da senha.
- **Sistema de Pagamentos**: Integração com métodos de pagamento seguros, como cartões de crédito.
- **Notificações e Lembretes**: Lembretes automáticos enviados para clientes e profissionais antes das consultas. Notificações para cancelamentos ou alterações de agendamentos.
- **Gestão de Horários**: Profissionais definem e visualizam sua agenda de atendimentos.
- **Interface de Usuário Intuitiva**: Interface amigável e fácil de usar para que os usuários possam navegar e gerenciar suas informações de  com facilidade.

## Tecnologias Utilizadas

## Backend

- **Node.js e Express.js**: Para a construção da API e gerenciamento de rotas.
- **PostgreSQL**: Banco de dados relacional.
- **Bibliotecas**: bcrypt, jsonwebtoken, multer, moment-timezone e nodemailer

## Frontend

- Renderização de páginas dinâmicas utilizando EJS.
- Bootstrap para uma interface responsiva.
-  HTML, CSS,

## Autenticação e Segurança:

- JSON Web Tokens (JWT) para autenticação segura.
- Criptografia de senhas com Bcrypt.

- **Integração de Pagamentos**: PayPal REST SDK.
- **Gerenciamento de Sessões**: Uso de express-session e cookie-parser.


## Conclusão

A plataforma de agendamento de consultas online para profissionais autônomos de saúde domiciliar contribui para melhorar a organização e acessibilidade dos serviços de saúde. Ao permitir que clientes agendem consultas de forma prática e segura, a solução promove eficiência e conveniência para ambos os lados. Este projeto representa um avanço na digitalização do setor de saúde domiciliar, podendo ser expandido no futuro para incluir novas funcionalidades, como gestão de prontuários e feedbacks de profissionais.


