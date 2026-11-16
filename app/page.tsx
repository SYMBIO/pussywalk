import { Game } from './game'
import { gameMarkup } from './game-markup'

export default function Home() {
  return (
    <>
      <div id="app" dangerouslySetInnerHTML={{ __html: gameMarkup }} />
      <Game />
    </>
  )
}
