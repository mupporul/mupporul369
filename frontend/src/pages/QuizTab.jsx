import { useEffect, useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import "./QuizTab.css";

const QUIZ_QUESTION_COUNT = 10;

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function arraysMatchAsSet(a, b) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

function buildQuestionPool(temples) {
  return temples.flatMap((group) =>
    group.data.map((row) => ({
      id: row.id,
      temple: row.temple,
      planets: group.planets,
    })),
  );
}

/**
 * Quiz tab for matching temple names to correct planet combinations.
 *
 * @param {{ temples: Array, loading: boolean, error: string|null }} props
 * @returns {JSX.Element}
 */
export default function QuizTab({ temples, loading, error }) {
  const { t } = useLang();
  const pool = useMemo(() => buildQuestionPool(temples), [temples]);
  const allPlanets = useMemo(() => {
    const unique = new Set(temples.flatMap((group) => group.planets));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [temples]);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedPlanets, setSelectedPlanets] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  function resetQuiz() {
    const randomQuestions = shuffle(pool).slice(0, QUIZ_QUESTION_COUNT);
    setQuestions(randomQuestions);
    setIndex(0);
    setSelectedPlanets([]);
    setIsLocked(false);
    setIsCorrect(null);
    setScore(0);
  }

  useEffect(() => {
    if (pool.length > 0) {
      resetQuiz();
    }
  }, [pool.length]);

  function togglePlanet(planet) {
    if (isLocked) return;
    setSelectedPlanets((prev) =>
      prev.includes(planet)
        ? prev.filter((item) => item !== planet)
        : [...prev, planet],
    );
  }

  function handleLock() {
    if (isLocked || !questions[index]) return;

    const answer = questions[index].planets;
    const correct = arraysMatchAsSet(selectedPlanets, answer);
    setIsCorrect(correct);
    setIsLocked(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (index >= questions.length - 1) return;
    setIndex((prev) => prev + 1);
    setSelectedPlanets([]);
    setIsLocked(false);
    setIsCorrect(null);
  }

  if (loading) {
    return (
      <p className="quiz-tab__status" role="status">
        {t.loading}
      </p>
    );
  }

  if (error) {
    return (
      <p className="quiz-tab__status quiz-tab__status--error">
        {t.errorPrefix}: {error}
      </p>
    );
  }

  if (pool.length === 0 || questions.length === 0) {
    return (
      <p className="quiz-tab__status" role="status">
        {t.quizEmpty}
      </p>
    );
  }

  const current = questions[index];
  const finished = index === questions.length - 1 && isLocked;

  return (
    <section className="quiz-tab" aria-label={t.quizTabAriaLabel}>
      <header className="quiz-tab__header">
        <p className="quiz-tab__progress">
          {t.quizQuestionLabel} {index + 1}/{questions.length}
        </p>
        <p className="quiz-tab__score">
          {t.quizScoreLabel}: {score}
        </p>
      </header>

      <div className="quiz-card">
        <p className="quiz-card__prompt">{t.quizTemplePrompt}</p>
        <h2 className="quiz-card__temple">{toTitleCase(current.temple)}</h2>

        <div
          className="quiz-card__planets"
          role="group"
          aria-label={t.quizPlanetsAriaLabel}
        >
          {allPlanets.map((planet) => {
            const active = selectedPlanets.includes(planet);
            return (
              <button
                key={planet}
                className={`quiz-card__planet-btn${active ? " quiz-card__planet-btn--active" : ""}`}
                type="button"
                onClick={() => togglePlanet(planet)}
                disabled={isLocked}
                aria-pressed={active}
              >
                {planet}
              </button>
            );
          })}
        </div>

        <div className="quiz-card__actions">
          <button
            type="button"
            className="quiz-card__lock-btn"
            onClick={handleLock}
            disabled={isLocked || selectedPlanets.length === 0}
          >
            {t.quizLockBtn}
          </button>

          {isLocked && !finished && (
            <button
              type="button"
              className="quiz-card__next-btn"
              onClick={handleNext}
            >
              {t.quizNextBtn}
            </button>
          )}

          {finished && (
            <button
              type="button"
              className="quiz-card__next-btn"
              onClick={resetQuiz}
            >
              {t.quizRestartBtn}
            </button>
          )}
        </div>

        {isLocked && (
          <div
            className={`quiz-card__result${isCorrect ? " quiz-card__result--ok" : " quiz-card__result--bad"}`}
          >
            <p className="quiz-card__result-mark">{isCorrect ? "✓✓✓" : "✗✗"}</p>
            <p className="quiz-card__result-text">
              {isCorrect ? t.quizCorrect : t.quizWrong}
            </p>
            {!isCorrect && (
              <p className="quiz-card__answer">
                {t.quizAnswerLabel}: {current.planets.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
