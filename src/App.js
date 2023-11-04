import logo from './logo.svg';
import './App.css';

function StartDateBox() {

  let cbox = ( <input type="checkbox" name="my_check"></input> );
  let primary_content = ( <div></div> );
  if (cbox.checked) {
    primary_content = <div><label for="year_text">Year:</label>
    <input type="text" id="year_text" name="year_text"></input>
    <label for="month_text">Month:</label>
    <input type="text" id="month_text" name="month_text"></input>
    <label for="day_text">Day:</label>
    <input type="text" id="day_text" name="day_text"></input></div>;
  }
  return (
    <div>
      {cbox}
      <label for="my_check">Change start date</label><br />
      
      {primary_content}
      
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <StartDateBox />
        <p>
          Editing <code>src/App.js</code> and saving <em>will</em> cause it to reload!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
