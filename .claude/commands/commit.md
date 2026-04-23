Analise as alterações não commitadas neste repositório e crie commits individuais por arquivo ou por grupo lógico de mudanças relacionadas.

Execute os seguintes passos:

1. Rode `git status` para ver os arquivos modificados
2. Rode `git diff` para entender o que mudou em cada arquivo
3. Agrupe arquivos com mudanças relacionadas (ex: componente + seu CSS, ou arquivos de uma mesma feature)
4. Para cada grupo, execute `git add <arquivos>` e `git commit -m "<mensagem>"` com uma mensagem descritiva em português no formato: `<tipo>: <descrição curta>` (ex: `feat: adicionando tela de login`, `fix: corrigindo cálculo de saldo`, `style: ajustando layout do dashboard`)
5. Confirme ao final quais commits foram criados
