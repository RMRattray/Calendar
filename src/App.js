import { useState } from 'react';
import { React } from 'react';
import './App.css';

// A CheckHideBox takes in an object, props, with the following properties:
// name - a name for the checkbox and its ID
// label - the label for this checkbox
// content - that which is hidden by the checkbox
// style - the style object for the div hidden by the checkbox
// It returns a larger div with a labeled checkbox that shows or hides
// the given object
function CheckHideBox( props ) {

  const [props_state, set_props_state] = useState( { ...props, ...{ "style": { "display": "none" } } } );
  const content_div = <div style={props_state["style"]}>{props_state["content"]}</div>;
  const handleChecking = (event) => {
    if (event.target.checked) {
      set_props_state( {...props_state, ...{ "style": { ...props_state["style"], ...{ "display":"block" }}}});
    }
    else {
      set_props_state( {...props_state, ...{ "style": { ...props_state["style"], ...{ "display":"none" }}}});
    }
  }
  const cbox = ( <input type="checkbox" name={props_state["name"]} id={props_state["name"]}
  onClick={handleChecking}></input> );

  return (
    <div>
      {cbox}
      <label for={props_state["name"]}>{props_state["label"]}</label><br />
      {content_div}
    </div>
  )
}

// Count Box produces a varying number of copies of a given div
// and a step number input to control that quantity
// It takes in the following parameters:
// count - an initial count of the number
// name - a name for the counter, its ID, and the IDs of wrapper divs cloning the content one
// label - a label to go beside the counter
// content - the div to be repeated so many times
// it outputs a div containining divs called {name}_1, etc. contain copies of content_div
function CountBox( props ) {
  
  const [count, set_count] = useState(props["count"]);
  const [go_children, set_children] = useState([]);

  console.log(`Initial count: ${count}`);

  const handleChange = (event) => {
    let cur_count = go_children.length;
    console.log(`count: ${count}\tcur_count: ${cur_count}\tevent_value: ${event.target.value}`);
    if (cur_count > event.target.value) {
      set_children(go_children.slice(0, event.target.value));
    }
    if (cur_count < event.target.value) {
      let extras = [];
      while (cur_count < event.target.value) {
        extras.push( <div key={cur_count * 1 - 1} id={(cur_count * 1- 1) + "_" + props["name"]}>{props["content"]}</div>);
        ++cur_count;
      }
      set_children([...go_children, ...extras]);
    }
    set_count(event.target.value);
  }

  const go_div = <div>
    <input type="number" step="1" min="0" name={props["name"]} // value={count}
      id={props["name"]} onChange={handleChange}></input>
    <label for={props["name"]}>{props["label"]}</label>
    {go_children}
  </div>
  
  return go_div;
}

// App is where the app is written
function App() {
  const date_input = <div>
    <label for="year_text">Year:</label>
    <input type="text" id="year_text" name="year_text"></input>
    <label for="month_text">Month:</label>
    <input type="text" id="month_text" name="month_text"></input>
    <label for="day_text">Day:</label>
    <input type="text" id="day_text" name="day_text"></input>
  </div>;

  const year_len_input = <div>
    <label for="year_days">Days in non-leap year:</label>
    <input type="number" name="year_days" id="year_days" min="1"></input>
  </div>

  const week_day = <input type="text"></input>

  return (
    <div className="App">
      <CheckHideBox name="start_date" label="Change start date" content = {date_input}/>
      <CheckHideBox name="year_len" label="Change year length" content = {year_len_input}/>
      <CountBox name="week_days" label = "Days in week:  " count="5" content = {week_day}/>
      <p>
        Editing <code>src/App.js</code> and saving <em>will</em> cause it to reload!
      </p>
    </div>
  );
}

export default App;
