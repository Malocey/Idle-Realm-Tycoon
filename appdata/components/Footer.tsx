
import React from 'react'; 
import { useGameContext } from '../context';
import Button from './Button';


interface FooterProps {
    onToggleCheatMenu?: () => void; // Added prop to open cheat menu
}

const Footer: React.FC<FooterProps> = ({ onToggleCheatMenu }) => {
  const { gameState, dispatch } = useGameContext();
  
  return (
    <>
    <footer className="p-2 text-center text-xs text-slate-500 bg-slate-800/50 debug-visible flex flex-wrap justify-center items-center gap-2 sticky bottom-0 z-30"> {/* Added sticky and z-index */}
      <span>Idle Realm Tycoon v0.3.0.3 |</span>
      {onToggleCheatMenu && (
        <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCheatMenu}
        >
            Dev Cheats
        </Button>
      )}
      <span>Game Speed:</span>
      {[1,2,4,8].map(s =>
        <Button
          key={s}
          size="sm"
          variant={gameState.gameSpeed === s ? "primary" : "ghost"}
          onClick={() => dispatch({type: 'SET_GAME_SPEED', payload: s})}
          className="px-2 py-0.5"
        >
          x{s}
        </Button>
      )}
    </footer>
    </>
  );
};

export default Footer;