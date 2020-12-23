const CARD_INFO_EN = [
  `No card selected.`,
  `
    <strong>Move</strong> or <strong>Start</strong><br>
    Move a stone forward by 1 field (click stone marked in red) or get a new stone from the box (click your box) to your starting field.
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 2 fields (click stone marked in red).
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 3 fields (click stone marked in red).
  `,
  `
    <strong>Move back</strong><br>
    Move a stone backwards by 4 fields (click stone marked in red).
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 5 fields (click stone marked in red).
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 7 fields (click stone marked in red).
  `,
  `
    <strong>Move individually</strong><br>
    Make 7 moves forward by 1 (click stone marked in red). You can use different stones, kick stones in the way etc, like moving 7 times with a "1" card. Each click will move the stone forward by one. You can bring your last stone into the house without using all 7 steps if you can then move the remaining steps for your teammate.
  `,
  `
    <strong>Move</strong> or <strong>skip player</strong><br>
    Move a stone forward by 8 fields (click stone marked in red) or skip the next player (click their box) and they will have to discard a card. You can only do that with a stone on the field and when the skipped player has at least one card.
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 9 fields (click stone marked in red).
  `,
  `
    <strong>Move</strong><br>
    Move a stone forward by 10 fields (click stone marked in red).
  `,
  "",
  `
    <strong>Move</strong><br>
    Move a stone forward by 12 fields (click stone marked in red).
  `,
  `
  <strong>Move</strong> or <strong>Start</strong><br>
  Move a stone forward by 13 fields (click stone marked in red) or get a new stone from the box (click your box) to your starting field.
  `,
  `
  <strong>Swap</strong><br>
  Swap two stones on the field (can't be in the box or house). Each stone can be of any player. Click the stones to swap. To use this card you need to have at least one stone on the field.
  `,
  `
  <strong>Tac</strong><br>
  Undo the last turn. You will then get to play the last non-Tac card. You can only use this if you can play said card.
  `
]

const CARD_INFO_DE = [
  `Keine Karte gewählt.`,
  `
    <strong>Bewegung</strong> oder <strong>Start</strong><br>
    Bewege einen Stein um 1 Feld vorwärts (dazu den rot markierten Stein klicken) oder bringe einen neuen Stein aufs Spielfeld.
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 2 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 3 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung rückwärts</strong><br>
    Bewege einen Stein um 4 Felder <strong>rückwärts</strong> (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 5 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 6 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung einzeln</strong><br>
    Bewege Steine 7 Mal um 1 Feld vorwärts (dazu den rot markierten Stein klicken). Die 7 Schritte können auf verschiedene Steine verteilt werden. Im Haus können Steine, die vor dem Zug noch nicht an finaler Position standen, auch rückwärts bewegt werden. Mit der 7 kann der letzte Stein ins Haus, ohne alle 7 Schritte zu verwenden, wenn du diese dann für den Mitspieler machen kannst.
  `,
  `
    <strong>Bewegung</strong> oder <strong>Spieler überspringen</strong><br>
    Bewege einen Stein um 8 Felder vorwärts (dazu den rot markierten Stein klicken) oder lasse den nächsten Spieler aussetzen und eine Karte abwerfen (nur möglich, falls dieser noch Karten hat). Auch zum Aussetzen lassen musst du einen Stein auf dem Feld haben.
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 9 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 10 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  "",
  `
    <strong>Bewegung</strong><br>
    Bewege einen Stein um 12 Felder vorwärts (dazu den rot markierten Stein klicken).
  `,
  `
  <strong>Bewegung</strong> oder <strong>Start</strong><br>
  Bewege einen Stein um 13 Felder vorwärts (dazu den rot markierten Stein klicken) oder bringe einen neuen Stein aufs Spielfeld.
  `,
  `
  <strong>Tausch</strong><br>
  Tausche zwei Steine auf dem Spielfeld. Diese können von beliebigen Spielern sein. Klicke dazu nacheinander die beiden Steine. Zur Nutzung dieser Karte musst du Steine auf dem Feld haben.
  `,
  `
  <strong>Tac</strong><br>
  Mache den letzten Zug rückgängig. Du musst dann die letzte nicht-Tac Karte spielen. Wenn du das nicht kannst, kannst du kein Tac nutzen.
  `
]

const CARD_INFO = navigator.language && navigator.language == 'de' ? CARD_INFO_DE : CARD_INFO_EN