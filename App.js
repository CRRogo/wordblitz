import './App.css';
import { DICTIONARY, DICTIONARY_EXTENDED } from './Dictionary.js'
import React, { useState, useEffect, useCallback } from 'react';

// Global constants seem fine, since they will never change, they have nothing to do with state or re-rendering events
const WORD_LENGTH = 5;
const NUM_GUESSES = 6;
const ROUND_TIME = 120;
const DEV_MODE = false;



function RestartButton({ gameData, setgameData, seconds, setSeconds }) {

  // Finding it easier to repeat some functions rather than make them available to both methods.. 
  // This is probably bad practice
  function getRandWord() {
    return DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)].toUpperCase();
  }

  const resetGame = () => {
    setSeconds(ROUND_TIME);
    var localGameData = gameData;
    localGameData.actualWord = getRandWord();
    localGameData.currRow = 0;
    localGameData.currCol = 0;
    localGameData.gameState = 0;
    localGameData.winCount = 0;
    localGameData.guessMatrix = [['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']];

    setgameData(JSON.parse(JSON.stringify(localGameData)))

  }

  return (<button onClick={() => resetGame()} className='btn btn-primary' style={{ visibility: seconds === 0 ? 'visible' : 'hidden' }}>New Game</button>)

}

function Timer({ timeleft }) {
  var minutes = parseInt(timeleft / 60, 10);
  var seconds = parseInt(timeleft % 60, 10);

  return (<div>Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div>)
}

function Wins({ gameData }) {
  return (<div>Score: {gameData.winCount} {DEV_MODE ? gameData.actualWord : ''}</div>)
}

function Alerts({ alert, seconds, gameData }) {
  const getColor = () => {
    if (alert.type === 'invalid') {
      return "message alert alert-danger";
    }
    else if (alert.type === 'success') {
      return "message alert alert-success";
    }
    else {
      return "message alert alert-secondary";
    }
  }

  if (seconds === 0) {
    alert.message = "Game over! Points: " + gameData.winCount + " (" + gameData.actualWord + ")";
    alert.type = "success"
  }
  if (seconds === ROUND_TIME) {
    alert.message = "Start typing to begin";
    alert.type = "default"
  }
  if (seconds === ROUND_TIME -  1) {
    alert.message = " ";
    alert.type = "default"
  }
  if (alert.message === "" || alert.message === null){
    alert.message = " "
  }

  return (<div className={getColor()} style={{ visibility: alert.message.length > 1 ? 'visible' : 'hidden' }}>{alert.message}&nbsp;</div>);
}

function Title() {
  return (
    <h1>Word Blitz</h1>
  )
}

function Button({ name, gameData, setgameData, inputHandler }) {

  const isPerfectlyMatched = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (thisLetter === gameData.actualWord.charAt(c) && thisLetter === gameData.guessMatrix[r][c]) {
          return true;
        }
      }
    }
    return false;
  }

  const isMatched = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (gameData.actualWord.includes(thisLetter) && thisLetter === gameData.guessMatrix[r][c]) {
          return true;
        }
      }
    }
    return false;
  }

  const isUsed = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (thisLetter === gameData.guessMatrix[r][c]) {
          return true;
        }
      }
    }
    return false;
  }

  const getColor = (thisLetter) => {
    if (thisLetter !== '' && isPerfectlyMatched(thisLetter)) {
      return "key btn btn-success";
    }
    else if (thisLetter !== '' && isMatched(thisLetter)) {
      return "key btn btn-warning";
    }
    else if (isUsed(thisLetter)) {
      return "key btn btn-dark";
    }
    else {
      return "key btn btn-secondary";
    }
  }


  return (
    <button className={getColor(name)} onClick={() => inputHandler(name)}>{name}</button>

  )
}

function SpecialButton({ name, gameData, setgameData, inputHandler }) {

  const displayString = (mode) => {
    if (mode === "Backspace") {
      // I can just return this svg like this?   apparently..  is this bad?
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-backspace" viewBox="0 0 16 16">
        <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z" />
        <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z" />
      </svg>
    }
    if (mode === "Enter") {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-left" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
    </svg>
    }

  }


  return (
    <button className="btn btn-secondary" onClick={() => inputHandler(name)}>{displayString(name)}</button>

  )
}


function LetterBox(props) {

  var thisLetter = props.gameData.guessMatrix[props.row][props.column];

  // handling for special wordle yellow coloring rules.
  const redundantYellow = () =>{
    var perfectMatches = 0;
    var numThisLetter = 0;
    var imperfectMatches = 0;
    var perfectMatchLocations = [];
    for (let i=0; i < WORD_LENGTH; i++){
      //console.log(thisLetter + " === " + props.gameData.guessMatrix[props.row][i] + " === " + props.gameData.actualWord.charAt(i))
      if(thisLetter !== '' && thisLetter === props.gameData.guessMatrix[props.row][i] && thisLetter === props.gameData.actualWord.charAt(i)){
        //console.log("increment perfectMatches");
        perfectMatches++;
        perfectMatchLocations.push(i);
      }
      if(thisLetter !== '' && thisLetter === props.gameData.guessMatrix[props.row][i]){
        numThisLetter++;
      }
    }

    imperfectMatches = numThisLetter - perfectMatches;

    var imperfectPreceeding = 0;
    for (let i=0; i < props.column; i++){
      if(thisLetter !== '' && thisLetter === props.gameData.guessMatrix[props.row][i] && thisLetter !== props.gameData.actualWord.charAt(props.column)){
        imperfectPreceeding++;
      }
    }

    var numOfThisLetterInWord = props.gameData.actualWord.split(thisLetter).length - 1;

//console.log("RedundantYellow row: " + props.row + " perfectMatches:"+ perfectMatches + " numThisLetter:"+ numThisLetter + " imperfectMatches:"+ imperfectMatches + " imperfectPreceeding:" + imperfectPreceeding)
    if(imperfectPreceeding + perfectMatches >= numOfThisLetterInWord){
      // This one is redundant,
      return true;
    }
    else return false;
  }

  const getColor = () => {
    if (props.gameData.currRow > props.row && thisLetter === props.gameData.actualWord.charAt(props.column)) {
      return "letterbox alert alert-success";
    }
    else if (props.gameData.currRow > props.row && thisLetter !== '' && props.gameData.actualWord.includes(thisLetter)) {
      // Special secret worlde rules... if the letter is already accounted for... 
      if (redundantYellow()){
        return "letterbox alert alert-dark";
      }
      else {
        return "letterbox alert alert-warning";
      }
    }
    else if (props.gameData.currRow > props.row && thisLetter !== '' && !props.gameData.actualWord.includes(thisLetter)) {
      return "letterbox alert alert-dark";
    }
    else {
      return "letterbox alert alert-secondary";
    }
  }

  // I cant concatinate the response of getColor to "alert alert-"
  return (
    <div className="col">
      <div className={getColor()}>{thisLetter}</div>
    </div>
  )
}

function GuessRow(props) {
  return (

    <div className="row">
      <LetterBox row={props.row} column="0" gameData={props.gameData} />
      <LetterBox row={props.row} column="1" gameData={props.gameData} />
      <LetterBox row={props.row} column="2" gameData={props.gameData} />
      <LetterBox row={props.row} column="3" gameData={props.gameData} />
      <LetterBox row={props.row} column="4" gameData={props.gameData} />
    </div>
  )
}

function App() {

  function getRandWord() {
    return DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)].toUpperCase();
  }

  function isValidWord(word) {
    return DICTIONARY_EXTENDED.includes(word.toLowerCase());
  }

  // Using 1 megaobject to control everything about the state of the game.  
  // It seems like for a bigger app you might want to isolate things, but this makes my life easy for now
  const [gameData, setgameData] = useState(
    {
      actualWord: getRandWord(),
      currRow: 0,
      currCol: 0,
      gameState: 0,
      winCount: 0,
      guessMatrix:
        [['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']]
    });

  const [seconds, setSeconds] = useState(ROUND_TIME);
  const [alert, setAlert] = useState({ message: "", type: "" });



  // TIMER STUFF
  const [intervalID, setIntervalID] = useState(null)
  const hasTimerEnded = seconds <= 0
  const isTimerRunning = intervalID != null
  const update = () => {
    setSeconds(seconds => seconds - 1)
  }
  const startTimer = useCallback(() => {
    if (!hasTimerEnded && !isTimerRunning) {
      setSeconds(seconds => seconds - 1)
      setIntervalID(setInterval(update, 1000))
    }
  }, [hasTimerEnded, isTimerRunning])
  /*const stopTimer = () => {
    clearInterval(intervalID)
    setIntervalID(null)
  }*/
  // clear interval when the timer ends
  useEffect(() => {
    if (hasTimerEnded) {
      clearInterval(intervalID)
      setIntervalID(null)
    }
  }, [hasTimerEnded, intervalID])



  // useCallback fixed issues here.   this is complex, do more research on this.
  // https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook
  // This turned out to be a mega function to accept input.  Should probably avoid this.
  const acceptInput = useCallback((input) => {

    function newRound() {
      var localGameData = gameData;
      localGameData.actualWord = getRandWord();
      localGameData.currRow = 0;
      localGameData.currCol = 0;
      localGameData.guessMatrix = [['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']];

      setgameData(JSON.parse(JSON.stringify(localGameData)))

    }

    //console.log(gameData.currRow);
    var localGameData = gameData;

    if(seconds < 1){
      // game is over
      return;
    }

    if (input === "Enter") {
      if (localGameData.currCol === (WORD_LENGTH)) {

        // Check win condition here (everything matches)
        var perfLetters = 0;
        var word = "";
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (localGameData.guessMatrix[localGameData.currRow][i] === localGameData.actualWord.charAt(i)) {
            perfLetters++;
          }
          word += localGameData.guessMatrix[localGameData.currRow][i];
        }

        //console.log(word);
        if (!isValidWord(word)) {
          setAlert({ message: "" + word + " is not in the word list", type: "invalid" });
          return;
        }

        if (perfLetters === WORD_LENGTH) {
          gameData.winCount++;
          newRound();
          setAlert({ message: "You got it!: " + word, type: "success" });
          //console.log("You Win");
          return;
        }
        else if (localGameData.currRow === (NUM_GUESSES - 1)) {
          setSeconds(0);
          //console.log("You Lose")
        }

        localGameData.currRow++;
        localGameData.currCol = 0;
      }
      else {
        //Handle invalid enter push.
        setAlert({ message: "Type a full word", type: "invalid" });
      }



    } else if (input === "Backspace" && localGameData.currCol > 0) {
      localGameData.currCol--;
      localGameData.guessMatrix[localGameData.currRow][localGameData.currCol] = '';
    }
    else if (/^[A-Z]$/i.test(input) && localGameData.currCol < WORD_LENGTH) {
      localGameData.guessMatrix[localGameData.currRow][localGameData.currCol] = input.toUpperCase();
      localGameData.currCol++;
      if (!isTimerRunning) startTimer();
    }
    // We need a new reference to this object, or react wont re-render it...  Better solutions??
    setgameData(JSON.parse(JSON.stringify(localGameData)))
    //console.log(input + " being set to: " + localGameData.currRow + localGameData.currCol)

    //console.log(localGameData)

  }, [gameData, startTimer, isTimerRunning])

  // UseEffect calling this function (in additon to the button) caused all kinds of problems with the state, 
  // this useCallback fixed them.   this is complex, do more research on this.
  // https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook
  useEffect(() => {
    function handlekeydownEvent(event) {
      const { key } = event;
      acceptInput(key);
    }

    document.addEventListener('keydown', handlekeydownEvent)
    return () => {
      document.removeEventListener('keydown', handlekeydownEvent)
    }
  }, [acceptInput])





  return (
    <div className="App">
      <header className="App-header">

        <div className="container">
          <div className='row'>
            <div className='col'>
              <Title />
            </div>
            <div className='col'>
              <RestartButton gameData={gameData} seconds={seconds} setgameData={setgameData} setSeconds={setSeconds} />
            </div>
          </div>
        </div>
        <Alerts alert={alert} seconds={seconds} gameData={gameData} />

        <div className="container">
          <div className='row'>
            <div className='col'>
              <Wins gameData={gameData} />
            </div>
            <div className='col'>
              <Timer gameData={gameData} timeleft={seconds} />
            </div>
          </div>
        </div>


        <div className="container" id="letterBoxHolder">
          <GuessRow row="0" gameData={gameData} />
          <GuessRow row="1" gameData={gameData} />
          <GuessRow row="2" gameData={gameData} />
          <GuessRow row="3" gameData={gameData} />
          <GuessRow row="4" gameData={gameData} />
          <GuessRow row="5" gameData={gameData} />
        </div>

        <div className="container" id="keyboard">
          <div className="keyrow">
            <Button name="Q" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="W" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="E" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="R" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="T" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="Y" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="U" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="I" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="O" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="P" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
          <div className="keyrow">
            <Button name="A" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="S" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="D" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="F" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="G" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="H" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="J" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="K" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="L" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
          <div className="keyrow">
            <SpecialButton name="Enter" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="Z" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="X" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="C" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="V" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="B" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="N" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <Button name="M" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <SpecialButton name="Backspace" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
        </div>


      </header>
    </div>
  );
}

export default App;
