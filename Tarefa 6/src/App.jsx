import { useEffect, useState } from "react";

const STORAGE_KEYS = {
  activeTab: "tarefa6.activeTab",
  todos: "tarefa6.todos",
  clickCount: "tarefa6.clickCount",
};

const tabs = [
  {
    id: "todo",
    label: "To-Do List",
    kicker: "FOCO",
    accent: "Tagueie, conclua, limpe.",
  },
  {
    id: "counter",
    label: "Contador de Cliques",
    kicker: "RITMO",
    accent: "Milestones visuais a cada 10.",
  },
  {
    id: "tic",
    label: "Jogo da Velha",
    kicker: "DUEL",
    accent: "Partida local para 2 pessoas.",
  },
  {
    id: "calc",
    label: "Calculadora",
    kicker: "NÚMEROS",
    accent: "Operações rápidas com feedback de erro.",
  },
  {
    id: "cep",
    label: "Buscador de CEP",
    kicker: "DADOS",
    accent: "Consulta direta via ViaCEP.",
  },
];

const calculatorButtons = [
  "AC",
  "DEL",
  "/",
  "*",
  "7",
  "8",
  "9",
  "-",
  "4",
  "5",
  "6",
  "+",
  "1",
  "2",
  "3",
  "=",
  "0",
  ".",
];

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function calculateWinner(board) {
  for (const pattern of winningPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: pattern };
    }
  }

  return { winner: null, line: [] };
}

function getSafeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialTab() {
  const storedTab = readStorage(STORAGE_KEYS.activeTab, "todo");
  return tabs.some((tab) => tab.id === storedTab) ? storedTab : "todo";
}

function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [todos, setTodos] = useState(() => readStorage(STORAGE_KEYS.todos, []));
  const [todoInput, setTodoInput] = useState("");

  const [clickCount, setClickCount] = useState(() =>
    readStorage(STORAGE_KEYS.clickCount, 0)
  );

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const [display, setDisplay] = useState("0");
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [calcError, setCalcError] = useState("");

  const [cepInput, setCepInput] = useState("");
  const [cepStatus, setCepStatus] = useState("idle");
  const [cepMessage, setCepMessage] = useState("Digite um CEP com 8 dígitos.");
  const [cepData, setCepData] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activeTab, JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.clickCount,
      JSON.stringify(clickCount)
    );
  }, [clickCount]);

  const milestoneReached = clickCount !== 0 && clickCount % 10 === 0;
  const { winner, line } = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  function addTodo() {
    const value = todoInput.trim();
    if (!value) {
      return;
    }

    setTodos((current) => [
      {
        id: getSafeId(),
        text: value,
        done: false,
      },
      ...current,
    ]);
    setTodoInput("");
  }

  function toggleTodo(todoId) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  function removeTodo(todoId) {
    setTodos((current) => current.filter((todo) => todo.id !== todoId));
  }

  function clearCompletedTodos() {
    setTodos((current) => current.filter((todo) => !todo.done));
  }

  function handleSquareClick(index) {
    if (board[index] || winner) {
      return;
    }

    setBoard((current) =>
      current.map((value, cellIndex) =>
        cellIndex === index ? (isXNext ? "X" : "O") : value
      )
    );
    setIsXNext((current) => !current);
  }

  function resetBoard() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  function handleCalculatorInput(value) {
    if (calcError) {
      setCalcError("");
      setDisplay("0");
    }

    if (value === "AC") {
      setDisplay("0");
      setCalcError("");
      setJustEvaluated(false);
      return;
    }

    if (value === "DEL") {
      setDisplay((current) =>
        current.length <= 1 || current === "Erro" ? "0" : current.slice(0, -1)
      );
      setJustEvaluated(false);
      return;
    }

    if (value === "=") {
      evaluateExpression();
      return;
    }

    if (/[+\-*/]/.test(value)) {
      setDisplay((current) => {
        if ((current === "0" || current === "Erro") && value !== "-") {
          return "0";
        }

        if (current === "0" && value === "-") {
          return value;
        }

        const replaced = /[+\-*/]+$/.test(current)
          ? current.replace(/[+\-*/]+$/, value)
          : `${current}${value}`;
        setJustEvaluated(false);
        return replaced;
      });
      return;
    }

    if (value === ".") {
      setDisplay((current) => {
        const tokens = current.split(/[+\-*/]/);
        const currentToken = tokens[tokens.length - 1];
        if (currentToken.includes(".")) {
          return current;
        }

        if (justEvaluated) {
          setJustEvaluated(false);
          return "0.";
        }

        if (/[+\-*/]$/.test(current)) {
          return `${current}0.`;
        }

        return current === "0" ? "0." : `${current}.`;
      });
      return;
    }

    setDisplay((current) => {
      if (justEvaluated) {
        setJustEvaluated(false);
        return value;
      }

      return current === "0" ? value : `${current}${value}`;
    });
  }

  function evaluateExpression() {
    try {
      const sanitized = display.replace(/[^0-9+\-*/.]/g, "");
      if (!sanitized || /[+\-*/.]$/.test(sanitized)) {
        throw new Error("Expressão incompleta.");
      }

      const result = Function(`"use strict"; return (${sanitized})`)();
      if (!Number.isFinite(result)) {
        throw new Error("Divisão por zero não é permitida.");
      }

      setDisplay(String(result));
      setCalcError("");
      setJustEvaluated(true);
    } catch (error) {
      setDisplay("Erro");
      setCalcError(error.message || "Não foi possível calcular.");
      setJustEvaluated(false);
    }
  }

  async function searchCep() {
    const digits = cepInput.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepStatus("error");
      setCepData(null);
      setCepMessage("Use exatamente 8 dígitos para consultar o CEP.");
      return;
    }

    try {
      setCepStatus("loading");
      setCepData(null);
      setCepMessage("Consultando ViaCEP...");

      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) {
        throw new Error("A consulta não retornou uma resposta válida.");
      }

      const data = await response.json();
      if (data.erro) {
        throw new Error("CEP não encontrado.");
      }

      setCepData(data);
      setCepStatus("success");
      setCepMessage("Endereço localizado com sucesso.");
    } catch (error) {
      setCepStatus("error");
      setCepData(null);
      setCepMessage(error.message || "Falha de rede ao consultar o CEP.");
    }
  }

  function renderPanel() {
    if (activeTab === "todo") {
      return (
        <section className="panel panel-grid">
          <div className="panel-copy">
            <p className="eyebrow">Organize o caos</p>
            <h2>To-Do List com persistência local</h2>
            <p>
              Capture tarefas, marque entregas concluídas e limpe o que já saiu
              do caminho sem perder o histórico ao recarregar a página.
            </p>
          </div>

          <div className="panel-surface">
            <div className="input-row">
              <input
                type="text"
                placeholder="Adicionar nova tarefa"
                value={todoInput}
                onChange={(event) => setTodoInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addTodo();
                  }
                }}
              />
              <button className="solid-button" onClick={addTodo}>
                Adicionar
              </button>
            </div>

            <div className="todo-summary">
              <span>{todos.length} itens</span>
              <span>{todos.filter((todo) => todo.done).length} concluídas</span>
              <button className="ghost-button" onClick={clearCompletedTodos}>
                Limpar concluídas
              </button>
            </div>

            <div className="todo-list">
              {todos.length === 0 ? (
                <div className="empty-state">
                  Sua lista está vazia. Comece com uma tarefa importante.
                </div>
              ) : (
                todos.map((todo) => (
                  <article
                    className={`todo-item ${todo.done ? "done" : ""}`}
                    key={todo.id}
                  >
                    <button
                      className="check-button"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.done ? "✓" : ""}
                    </button>
                    <p>{todo.text}</p>
                    <button
                      className="danger-button"
                      onClick={() => removeTodo(todo.id)}
                    >
                      Remover
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "counter") {
      return (
        <section className="panel panel-grid">
          <div className="panel-copy">
            <p className="eyebrow">Energia acumulada</p>
            <h2>Contador de Cliques com milestones</h2>
            <p>
              A contagem fica salva localmente e ganha um destaque visual a cada
              múltiplo de 10 para marcar o ritmo.
            </p>
          </div>

          <div className="panel-surface counter-surface">
            <div className={`counter-display ${milestoneReached ? "pulse" : ""}`}>
              <span>Clicks</span>
              <strong>{clickCount}</strong>
            </div>

            {milestoneReached ? (
              <p className="counter-badge">Milestone desbloqueado: {clickCount}</p>
            ) : (
              <p className="counter-badge subtle">Chegue ao próximo múltiplo de 10.</p>
            )}

            <div className="counter-actions">
              <button className="solid-button" onClick={() => setClickCount((value) => value + 1)}>
                +1
              </button>
              <button className="ghost-button" onClick={() => setClickCount((value) => value - 1)}>
                -1
              </button>
              <button className="danger-button" onClick={() => setClickCount(0)}>
                Resetar
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "tic") {
      return (
        <section className="panel panel-grid">
          <div className="panel-copy">
            <p className="eyebrow">Duelos rápidos</p>
            <h2>Jogo da Velha para dois jogadores</h2>
            <p>
              Alternância local entre X e O, com destaque para a linha
              vencedora e reinício imediato da partida.
            </p>
          </div>

          <div className="panel-surface">
            <div className="game-status">
              {winner ? `Vitória de ${winner}` : isDraw ? "Empate" : `Vez de ${isXNext ? "X" : "O"}`}
            </div>

            <div className="board">
              {board.map((value, index) => (
                <button
                  className={`cell ${line.includes(index) ? "winner" : ""}`}
                  key={index}
                  onClick={() => handleSquareClick(index)}
                >
                  {value}
                </button>
              ))}
            </div>

            <button className="solid-button" onClick={resetBoard}>
              Reiniciar partida
            </button>
          </div>
        </section>
      );
    }

    if (activeTab === "calc") {
      return (
        <section className="panel panel-grid">
          <div className="panel-copy">
            <p className="eyebrow">Matemática expressa</p>
            <h2>Calculadora com operações básicas</h2>
            <p>
              Monte expressões simples, apague caracteres, limpe tudo e receba
              feedback explícito para estados inválidos.
            </p>
          </div>

          <div className="panel-surface">
            <div className={`calculator-screen ${calcError ? "error" : ""}`}>
              <span>Resultado</span>
              <strong>{display}</strong>
              <small>{calcError || "Use +, -, *, / e ponto decimal."}</small>
            </div>

            <div className="calculator-grid">
              {calculatorButtons.map((button) => (
                <button
                  className={`calc-button ${
                    button === "="
                      ? "equals"
                      : ["+", "-", "*", "/"].includes(button)
                        ? "operator"
                        : ""
                  }`}
                  key={button}
                  onClick={() => handleCalculatorInput(button)}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="panel panel-grid">
        <div className="panel-copy">
          <p className="eyebrow">Consulta instantânea</p>
          <h2>Buscador de CEP com ViaCEP</h2>
          <p>
            Digite o CEP com 8 dígitos para buscar o endereço e tratar casos de
            erro, CEP inexistente e falhas de conexão.
          </p>
        </div>

        <div className="panel-surface">
          <div className="input-row">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex.: 01001000"
              value={cepInput}
              onChange={(event) =>
                setCepInput(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchCep();
                }
              }}
            />
            <button className="solid-button" onClick={searchCep}>
              Buscar
            </button>
          </div>

          <div className={`status-banner ${cepStatus}`}>
            {cepStatus === "loading" ? "Carregando" : cepStatus || "idle"}: {cepMessage}
          </div>

          {cepData && (
            <div className="cep-card">
              <div>
                <span>CEP</span>
                <strong>{cepData.cep}</strong>
              </div>
              <div>
                <span>Logradouro</span>
                <strong>{cepData.logradouro || "Não informado"}</strong>
              </div>
              <div>
                <span>Bairro</span>
                <strong>{cepData.bairro || "Não informado"}</strong>
              </div>
              <div>
                <span>Cidade</span>
                <strong>{cepData.localidade}</strong>
              </div>
              <div>
                <span>UF</span>
                <strong>{cepData.uf}</strong>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="shell">
      <div className="background-grid" />

      <header className="masthead">
        <div className="brand-block">
          <p className="eyebrow">Desenvolvimento Web</p>
          <h1>Tarefa 6</h1>
          <p className="lead">
            Um hub visual intenso com cinco microapps em uma única experiência.
          </p>
        </div>

        <nav className="tab-list" aria-label="Funcionalidades">
          {tabs.map((tab) => (
            <button
              className={`tab-chip ${activeTab === tab.id ? "active" : ""}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.kicker}</span>
              <strong>{tab.label}</strong>
              <small>{tab.accent}</small>
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {renderPanel()}
      </main>
    </div>
  );
}

export default App;
