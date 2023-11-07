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
// one_content - any extra content to appear just once
// content - the div to be repeated so many times
// it outputs a div containining divs called {name}_1, etc. contain copies of content_div
function CountBox( props ) {
  
  // const [count, set_count] = useState(props["count"]);
  const [go_children, set_children] = useState([]);

  const handleChange = (event) => {
    let cur_count = go_children.length;
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
    // set_count(event.target.value);
  }

  return(<div>
    <label for={props["name"]}>{props["label"]}</label>
    <input type="number" step="1" min="0" name={props["name"]} // value={count}
      id={props["name"]} onChange={handleChange}></input>
    {props["one_content"]}
    {go_children}
  </div>);
}

// Recursept produces a div with a button for copying itself at the end of itself
// It takes the following parameters:
// end and recur - the words to put on the button
// content - the rest of the content of the div
function Recursept( props ) {
  const [next, set_next] = useState({"recurring":false, "next":<></>});

  const switch_recur = () => {
    if (next["recurring"]) {
      set_next({"recurring":false, "next":<></>});
    } else {
      set_next({"recurring":true, "next": <Recursept end={props["end"]} content={props["content"]} recur={props["recur"]}/>})
    }
  }

  return ( <div>
    {props["content"]}
    <button onClick={switch_recur}>{next["recurring"] ? props["recur"] : props["end"]}</button>
    {next["next"]}
  </div>);
}

// App is where the app is written
function App() {
  const start_date_input = <div>
    <label for="year_text">Year:  </label>
    <input type="text" id="year_text" name="year_text"></input>
    <label for="month_text">Month:  </label>
    <input type="text" id="month_text" name="month_text"></input>
    <label for="day_text">Day:  </label>
    <input type="text" id="day_text" name="day_text"></input>
  </div>;

  const leap_add = <span>every <input type="number" /> years</span>
  const leap_input = <div><h2>Frequency:</h2>
    <Recursept end="." recur="except" content = {leap_add}/>
  </div>

  const year_len_input = <div>
    <label for="year_days">Days in non-leap year:</label>
    <input type="number" name="year_days" id="year_days" min="1"></input>
    <CheckHideBox name="leap years" label="Leap years" content = {leap_input}/>
  </div>
  
  const month_table_heads = <div><span>Name</span><span>Days</span><span>Leap days</span></div>

  const month_inputs = <div><input type="text"/><input type="number"/><input type="number"/></div>

  const week_day = <input type="text"></input>

  const date_input = <span><input type="date" /><input type="text"/></span>

  return (
    <div className="App">
      <CheckHideBox name="start_date" label="Change start date" content = {start_date_input}/>
      <CheckHideBox name="year_len" label="Change year length" content = {year_len_input}/>
      <CheckHideBox name="months" label="Change months"
        content = {<CountBox name="months" label="Month count:  " count="12" content = {month_inputs} one_content={month_table_heads}/> } />
      <CheckHideBox name="weeks" label="Rename week days"
        content = {<CountBox name="week_days" label = "Days in week:  " count="5" content = {week_day}/> } />
      <div>
        <h2>Traditional days</h2>
        <span>Date</span><span>Significance</span>
        <Recursept id="first_date" end="+" recur="end" content = {date_input} />
      </div>
      <div>
        <h2>New days</h2>
        <li id="output_dates"></li>
      </div>
    </div>
  );
}

export default App;
