import { ITurn, IPlayer, ICardView, Color, IGameMode } from "../lib/game";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import classnames from "classnames";
import Button from "./Button";
import { useGameView } from "../hooks/game";
import { emoji } from "../lib/emoji"

const Card = ({
  pushTurn,
  selfPlayer,
  cardView,
  index,
  mode,
}: {
  pushTurn: (turn: ITurn) => void;
  selfPlayer: IPlayer;
  cardView: ICardView;
  index: number;
  mode: IGameMode;
}) => {
  const gameView = useGameView();
  const [w, setW] = useState(cardView);
  const [revealing, setRevealing] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const showConfirmationModal = selfPlayer?.spymaster && mode === "classic";

  useEffect(() => {
    if (cardView.revealed && !w.revealed) {
      setRevealing(true);
      setTimeout(() => setRevealing(false), 300);
    }

    setW(cardView);
  }, [w, cardView]);

  const onConfirm = () => {
    if (!w.revealed && selfPlayer) {
      pushTurn({
        type: "click",
        value: index,
        from: selfPlayer.id,
      });
    }
  };

  const colorStyles = {
    "z-40": revealing,
    "border cursor-pointer": !w.revealed,
    "border-4": w.revealed,
    "border-gray-600 bg-gray-200 hover:bg-gray-100": !w.shown,
    "border-red-800 bg-red-700 text-red-300":
      w.revealed && w.shown && w.color === Color.Red,
    "border-blue-800 bg-blue-700 text-blue-300":
      w.revealed && w.shown && w.color === Color.Blue,
    "border-yellow-800 bg-yellow-100 text-yellow-800":
      w.revealed && w.shown && w.color === Color.Neutral,
    "border-black bg-gray-800 text-gray-200":
      w.revealed && w.shown && w.color === Color.Black,
    "border-green-800 bg-green-700 text-green-300":
      w.revealed && w.shown && w.color === Color.Green,
    "border-red-800 bg-red-200 text-red-900 hover:bg-red-300":
      !w.revealed && w.shown && w.color === Color.Red,
    "border-blue-800 bg-blue-200 text-blue-900 hover:bg-blue-300":
      !w.revealed && w.shown && w.color === Color.Blue,
    "border-yellow-800 bg-yellow-100 text-yellow-800 hover:bg-yellow-200":
      !w.revealed && w.shown && w.color === Color.Neutral,
    "border-black bg-gray-700 text-gray-100 hover:bg-gray-600":
      !w.revealed && w.shown && w.color === Color.Black,
    "border-green-800 bg-green-200 text-green-800 hover:bg-green-300":
      !w.revealed && w.shown && w.color === Color.Green,
    "lg:text-base text-xs": w.word.length > 7,
    "text-4xl": gameView.game.options.language === "emoji",
  };

  const variants = {
    initial: { scale: 1 },
    revealing: { scale: 1.1 },
  };

  return (
    <div className="relative lg:h-16 md:h-12 h-10 overflow-visible select-none">
      <motion.div
        variants={variants}
        initial="initial"
        animate={revealing ? "revealing" : "initial"}
        onClick={() => {
          if (showConfirmationModal) {
            setModalOpen(true);
          } else {
            onConfirm();
          }
        }}
        className={classnames(
          "font-bold rounded flex flex-col items-center justify-center absolute w-full h-full shadow",
          colorStyles
        )}
      >
        <div
          dangerouslySetInnerHTML={{ __html: emoji.replace_unified(w.word) }}
        />
        {w.duetMarker && (
          <div className="absolute top-0 right-0 m-2 rounded-full w-3 h-3 border-2 border-yellow-800 bg-yellow-300"></div>
        )}
      </motion.div>
      {modalOpen && (
        <ConfirmationModal
          onConfirm={() => onConfirm()}
          onClose={() => setModalOpen(false)}
        />
      )}
      <style jsx global>{`
        .emoji {
          height: 32px;
          width: 32px;
          display: inline-block;
          background-size: contain;
          margin-bottom: -3px;
        }
      `}</style>
    </div>
  );
};

export default Card;

const ConfirmationModal = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed h-screen w-screen top-0 left-0 z-50 lg:p-6 p-4 flex items-center justify-center"
      style={{ backgroundColor: "rgba(74, 85, 104, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded shadow-lg overflow-y-scroll max-w-3xl mx-auto text-base"
        onClick={(e) => e.stopPropagation()}
      >
        Are you sure you want to reveal this card?
        <Button
          className="ml-2"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Yes
        </Button>
        <Button className="ml-2" color="red" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
