import { useState } from 'react';
import './App.css';

function StartDateBox( props ) {

  const [props_state, set_props_state] = useState( props );
  const content_div = <div style={props_state["style"]}>{props_state["content"]}</div>;
  const handleChecking = (event) => {
    if (event.target.checked) {
      set_props_state( {...props_state, ...{ "style": { ...props_state["style"], ...{ "display":"block" }}}});
    }
    else {
      set_props_state( {...props_state, ...{ "style": { ...props_state["style"], ...{ "display":"none" }}}});
    }
  }
  const cbox = ( <input type="checkbox" name={props_state["name"]} onClick={handleChecking}></input> );

  return (
    <div>
      {cbox}
      <label for="my_check">Change start date</label><br />
      {content_div}
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <StartDateBox param_name="Start date" content='<label for="year_text">Year:</label>
    <input type="text" id="year_text" name="year_text"></input>
    <label for="month_text">Month:</label>
    <input type="text" id="month_text" name="month_text"></input>
    <label for="day_text">Day:</label>
    <input type="text" id="day_text" name="day_text"></input>'
     />
        <p>
          Editing <code>src/App.js</code> and saving <em>will</em> cause it to reload!
        </p>
      </header>
    </div>
  );
}

export default App;
