"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const CONFETTI_DURATION_MS = 6000;

export function useSessionCompletion() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const completeSession = useCallback(() => {
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      router.refresh();
      router.push("/playground");
    }, CONFETTI_DURATION_MS);
  }, [router]);

  return { showConfetti, completeSession };
}

export function ConfettiOverlay({ show }: { show: boolean }) {
  const { width, height } = useWindowSize();

  if (!show) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
    />
  );
}
