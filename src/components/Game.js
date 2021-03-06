import React, { Component } from 'react';
import Board from './Board';
import Timer from './Timer';
import Controls from './Controls';
import WinnerModal from './WinnerModal';
import listCountries from '../countries.js';
import _ from 'lodash';
import flipSound from '../flipSound.wav';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      cardsArray: [],
      numCardToCheck: 0,
      askQuiz: true,
      clickNewGame: false,
      clickSolve: false,
      endtime: {
        m: 15, s: 60
      },
      numHints: 3
    };
  }

  FirstCard = true;
  prevCard = '';
  currentCard = '';
  Correct_Card = 0;
  clickNewGame = false;
  flipCardSound = new Audio(flipSound);


  createCardsArray = () => {
    const tempArray = _.shuffle(listCountries);
    let cardsArray = [];
    for (let i = 0; i < this.props.cardsNum / 2; i++) {
      cardsArray.push(tempArray[i]);
      let clone = _.clone(tempArray[i], true);
      cardsArray.push(clone);
    }
    return _.shuffle(_.map(cardsArray, obj => ({ ...obj, isMatch: false, isCorrect: false })));
  }

  // Solve the game and stop the clock
  solve = () => {
    let tempArr = this.state.cardsArray;
    tempArr.forEach(card => {
      card.isMatch = true;
      card.isCorrect = true;
    });
    this.setState({
      cardsArray: tempArr,
      clickSolve: true
    });
    this.Correct_Card = 0;

    setTimeout(() => {
      this.setState({ clickSolve: false });
    }, 2000);
  }

  // Click on the "new game" button
  newGame = () => {
    // restart game
    this.setState({
      cardsArray: this.createCardsArray(),
      askQuiz: true,
      numCardToCheck: 0,
      clickNewGame: true,
      numHints: 3
    });
    this.FirstCard = true;
    this.Correct_Card = 0;

    setTimeout(() => {
      this.setState({ clickNewGame: false });
    }, 3000);
  }

  // function to flip card, check match and end of game
  turnCard = (obj) => {
    this.flipCardSound.play();
    let tempArr = this.state.cardsArray.map((card, index) => {
      if (index === obj.index) {
        card.isMatch = true;
        return card;
      }
      return card;
    });
    this.setState(prevState => ({
      cardsArray: tempArr,
      numCardToCheck: prevState.numCardToCheck + 1
    }));
    if (this.FirstCard) {
      this.prevCard = obj;
      this.FirstCard = false;
      this.setState({ askQuiz: false });
    }
    // second card
    else {
      this.currentCard = obj;
      this.FirstCard = true;
      // no match!
      if (this.prevCard.name !== this.currentCard.name) {
        setTimeout(() => {
          this.flipCardSound.play();
          let tempArr = this.state.cardsArray.map((card, index) => {
            if (index === this.prevCard.index || index === this.currentCard.index) {
              card.isMatch = false;
              return card;
            }
            return card;
          });
          this.setState({
            cardsArray: tempArr,
            numCardToCheck: 0,
            askQuiz: true
          });
        }, 2000);
      }
      // match!
      else {
        this.setState({
          numCardToCheck: 0,
          askQuiz: true
        });
        this.Correct_Card++;
        // check if it the end of the game!
        if (this.Correct_Card === this.state.cardsArray.length / 2) {
          // stop clock
          this.setState({ clickSolve: true });

          setTimeout(() => {
            this.setState({ clickSolve: false });
          }, 2000);
        }
      }
    }
  }

  // flip back card after wrong answer
  flippedCardBack = (indexOfCardClicked) => {
    let tempArr = this.state.cardsArray.map((card, index) => {
      if (index === indexOfCardClicked) {
        card.isMatch = false;
        return card;
      }
      return card;
    });
    this.FirstCard = true;
    this.setState({
      cardsArray: tempArr,
      askQuiz: true,
      numCardToCheck: 0
    });
  }

  // update match card of user correct answer
  noQuizOnSecondCard = (cardFromBoard) => {
    let tempArr = this.state.cardsArray.map((card) => {
      if (card.name === cardFromBoard) {
        card.isCorrect = true;
        return card;
      }
      return card;
    });
    this.setState({ cardsArray: tempArr });
  }

  updateTime = (item) => {
    this.setState({ endtime: item });
  }

  updateNumHints = () => {
    let currentHints = this.state.numHints;
    this.setState({ numHints: currentHints - 1 });
    console.log(currentHints-1);

  }

  componentDidMount() {
    this.setState({ cardsArray: this.createCardsArray() });
  }

  render() {
    return (
      <div className="Game">
        <div className="container-fluid" style={{ paddingTop: '25px' }}>
          <div className="row justify-content-center">
            <div className="col-sm-7 col-8">
              <Board
                cardsArray={this.state.cardsArray}
                numCardToCheck={this.state.numCardToCheck}
                turnCard={this.turnCard}
                flippedCardBack={this.flippedCardBack}
                askQuiz={this.state.askQuiz}
                noQuizOnSecondCard={this.noQuizOnSecondCard}
                updateNumHints={this.updateNumHints}
                numHints={this.state.numHints} />
              {this.Correct_Card === (this.state.cardsArray.length / 2) && <WinnerModal saveGame={this.props.saveGame}
                endtime={this.state.endtime} time={this.props.time} newGame={this.newGame} />}
            </div>
            <div className="col col-sm-2 col-sm-offset-1" style={{ textAlign: 'center' }}>
              <h1 className="matchTheFlag text-center" style={{ fontSize: '50px', marginBottom: '30px' }}>Match The Flag</h1>
              <Timer time={this.props.time} solve={this.solve} newGame={this.newGame} clickNewGame={this.state.clickNewGame} clickSolve={this.state.clickSolve} showSettings={this.props.showSettings} updateTime={this.updateTime}/>
              <br />
              <p style={{ textShadow: '2px 2px 2px rgba(0, 0, 0, 0.54)' }}>You have <span style={{ fontSize: '25px' }}>{this.state.numHints}</span> more Hints!</p>
              <Controls funSolve={this.solve} newGame={this.newGame}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
