import { useState, useEffect } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Gamepad2, Trophy, RotateCcw, Clock, Star, Eye, AlertTriangle } from 'lucide-react'

type CardType = {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

type Difficulty = 'easy' | 'medium' | 'hard'
type SymbolSet = 'emoji' | 'hieroglyphics' | 'cuneiform'

function App() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [lastFlippedCard, setLastFlippedCard] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [symbolSet, setSymbolSet] = useState<SymbolSet>('emoji')
  const [peekActive, setPeekActive] = useState(false)
  const [peekUsed, setPeekUsed] = useState(false)
  const [peekTimeLeft, setPeekTimeLeft] = useState(3)

  const allEmojis = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄'],
    fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🥭'],
    vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚚', '🚛', '✈️']
  }
  
  const cuneiform = ['𓀀', '𓀁', '𓀂', '𓀃', '𓀄', '𓀅', '𓀆', '𓀇', '𓀈', '𓀉', '𓀊', '𓀋', '𓀌', '𓀍', '𓀎', '𓀏', '𓀐', '𓀑', '𓀒', '𓀓', '𓀔', '𓀕', '𓀖', '𓀗']
  
  const hieroglyphics = ['𒀀', '𒀁', '𒀂', '𒀃', '𒀄', '𒀅', '𒀆', '𒀇', '𒀈', '𒀉', '𒀊', '𒀋', '𒀌', '𒀍', '𒀎', '𒀏', '𒀐', '𒀑', '𒀒', '𒀓', '𒀔', '𒀕']

  const getSymbolsForDifficulty = (): string[] => {
    let symbols: string[] = []
    
    if (symbolSet === 'emoji') {
      const categories = Object.values(allEmojis)
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      symbols = randomCategory
    } else if (symbolSet === 'hieroglyphics') {
      symbols = hieroglyphics
    } else if (symbolSet === 'cuneiform') {
      symbols = cuneiform
    }
    
    switch(difficulty) {
      case 'easy':
        return symbols.slice(0, 6)
      case 'hard':
        return symbols.slice(0, 12)
      case 'medium':
      default:
        return symbols.slice(0, 8)
    }
  }

  const initializeGame = () => {
    const symbolsToUse = getSymbolsForDifficulty()
    
    const initialCards = [...symbolsToUse, ...symbolsToUse]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }))

    setCards(initialCards)
    setFlippedCards([])
    setLastFlippedCard(null)
    setMoves(0)
    setGameWon(false)
    setScore(0)
    setTimer(0)
    setIsPlaying(true)
    setPeekUsed(false)
    setPeekActive(false)
    setPeekTimeLeft(3)
  }
  
  const activatePeek = () => {
    if (peekUsed || peekActive) return
    
    setPeekActive(true)
    setPeekUsed(true)
    
    const countdownInterval = setInterval(() => {
      setPeekTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setPeekActive(false)
          return 3
        }
        return prev - 1
      })
    }, 1000)
    
    setTimeout(() => {
      setPeekActive(false)
      clearInterval(countdownInterval)
      setPeekTimeLeft(3)
    }, 3000)
  }

  const handleCardClick = (id: number) => {
    if (peekActive) return
    
    if (gameWon || cards[id].flipped || cards[id].matched || flippedCards.length >= 2) {
      return
    }
    
    if (lastFlippedCard === id) {
      return
    }

    const updatedCards = [...cards]
    updatedCards[id].flipped = true
    setCards(updatedCards)
    
    setLastFlippedCard(id)
    
    const updatedFlippedCards = [...flippedCards, id]
    setFlippedCards(updatedFlippedCards)

    if (updatedFlippedCards.length === 2) {
      setMoves(moves + 1)
      
      const [firstCardId, secondCardId] = updatedFlippedCards
      const firstCard = updatedCards[firstCardId]
      const secondCard = updatedCards[secondCardId]

      if (firstCard.emoji === secondCard.emoji) {
        updatedCards[firstCardId].matched = true
        updatedCards[secondCardId].matched = true
        setCards(updatedCards)
        setFlippedCards([])
        setLastFlippedCard(null)
        
        const difficultyMultiplier = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
        const symbolSetMultiplier = symbolSet === 'emoji' ? 1 : symbolSet === 'hieroglyphics' ? 1.5 : 2
        const movesPenalty = Math.max(0, 20 - moves) / 10
        
        const pointsEarned = Math.round(difficultyMultiplier * symbolSetMultiplier * (1 + movesPenalty))
        setScore(score + pointsEarned)
        
        if (updatedCards.every(card => card.matched)) {
          setGameWon(true)
          setIsPlaying(false)
        }
      } else {
        setTimeout(() => {
          updatedCards[firstCardId].flipped = false
          updatedCards[secondCardId].flipped = false
          setCards(updatedCards)
          setFlippedCards([])
          setLastFlippedCard(null)
        }, 1000)
      }
    }
  }

  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    setTimeout(initializeGame, 100)
  }
  
  const changeSymbolSet = (newSymbolSet: SymbolSet) => {
    setSymbolSet(newSymbolSet)
    setTimeout(initializeGame, 100)
  }

  useEffect(() => {
    let interval: number | undefined
    
    if (isPlaying && !gameWon) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, gameWon])

  useEffect(() => {
    initializeGame()
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center p-4">
      <header className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 size={32} className="text-purple-600" />
          <h1 className="text-3xl font-bold text-purple-800">記憶ゲーム</h1>
          <Gamepad2 size={32} className="text-purple-600" />
        </div>
        <p className="text-gray-600">カードをめくって、ペアを見つけよう！</p>
        <p className="text-xs text-gray-500 mt-1">※直前に開いたカードは再度開けません</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-3">
        <Button 
          variant={difficulty === 'easy' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeDifficulty('easy')}
          className={difficulty === 'easy' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          簡単
        </Button>
        <Button 
          variant={difficulty === 'medium' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeDifficulty('medium')}
          className={difficulty === 'medium' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          普通
        </Button>
        <Button 
          variant={difficulty === 'hard' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeDifficulty('hard')}
          className={difficulty === 'hard' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          難しい
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <Button 
          variant={symbolSet === 'emoji' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeSymbolSet('emoji')}
          className={symbolSet === 'emoji' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          絵文字
        </Button>
        <Button 
          variant={symbolSet === 'hieroglyphics' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeSymbolSet('hieroglyphics')}
          className={symbolSet === 'hieroglyphics' ? 'bg-amber-600 hover:bg-amber-700' : ''}
        >
          象形文字
        </Button>
        <Button 
          variant={symbolSet === 'cuneiform' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => changeSymbolSet('cuneiform')}
          className={symbolSet === 'cuneiform' ? 'bg-stone-600 hover:bg-stone-700' : ''}
        >
          楔形文字
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <Badge variant="outline" className="text-sm px-3 py-1 bg-white flex items-center gap-1">
          <Clock size={14} /> {formatTime(timer)}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-white flex items-center gap-1">
          <RotateCcw size={14} /> 移動: {moves}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-white flex items-center gap-1">
          <Star size={14} /> スコア: {score}
        </Badge>
        
        <Button
          variant="outline"
          size="sm"
          onClick={activatePeek}
          disabled={peekUsed || peekActive}
          className={`flex items-center gap-1 ${peekActive ? 'bg-yellow-200' : ''} ${peekUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Eye size={14} />
          {peekActive ? `チラ見せ中 (${peekTimeLeft}秒)` : 'チラ見せチャンス'}
        </Button>
      </div>
      
      {peekActive && (
        <div className="mb-4 flex items-center justify-center gap-2 text-amber-600">
          <AlertTriangle size={16} />
          <p className="text-sm">全てのカードが一時的に表示されています！</p>
        </div>
      )}

      <div className={`grid gap-3 max-w-3xl mx-auto ${
        difficulty === 'easy' ? 'grid-cols-3 md:grid-cols-4' : 
        difficulty === 'medium' ? 'grid-cols-4 md:grid-cols-4' : 
        'grid-cols-4 md:grid-cols-6'
      }`}>
        {cards.map((card) => (
          <Card 
            key={card.id} 
            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center cursor-pointer transition-all duration-300 ${
              card.flipped || card.matched 
                ? 'bg-white shadow-md' 
                : difficulty === 'easy' ? 'bg-green-500 hover:bg-green-400' :
                  difficulty === 'medium' ? 'bg-blue-500 hover:bg-blue-400' :
                  'bg-red-500 hover:bg-red-400'
            } ${card.matched ? 'border-2 border-green-500' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.flipped || card.matched || peekActive) ? (
              <span className={`text-3xl ${symbolSet === 'hieroglyphics' ? 'text-amber-800' : symbolSet === 'cuneiform' ? 'text-stone-800' : ''}`}>
                {card.emoji}
              </span>
            ) : null}
          </Card>
        ))}
      </div>

      {gameWon && (
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy size={32} className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-purple-800">おめでとう！</h2>
            <Trophy size={32} className="text-yellow-500" />
          </div>
          <p className="mb-2 text-gray-600">
            {moves}回の移動で全てのペアを見つけました！
          </p>
          <p className="mb-4 text-gray-600">
            タイム: {formatTime(timer)}
          </p>
          <Button 
            onClick={initializeGame}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RotateCcw className="mr-2" />
            もう一度プレイ
          </Button>
        </div>
      )}

      {!gameWon && (
        <Button 
          onClick={initializeGame}
          className="mt-8 bg-purple-600 hover:bg-purple-700"
        >
          <RotateCcw className="mr-2" />
          リセット
        </Button>
      )}
    </div>
  )
}

export default App
