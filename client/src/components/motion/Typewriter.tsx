import { useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";

interface TypewriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function Typewriter({
  phrases,
  typingSpeed = 45,
  deletingSpeed = 25,
  pauseDuration = 2200,
  className = "",
}: TypewriterProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce || phrases.length === 0) {
      setDisplayText(phrases[0] || "");
      return;
    }

    const currentPhrase = phrases[currentPhraseIndex];

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [
    displayText,
    isDeleting,
    currentPhraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    shouldReduce,
  ]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      {!shouldReduce && (
        <span
          className="inline-block w-[2px] h-[1em] bg-ember-orange ml-0.5 animate-pulse"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
