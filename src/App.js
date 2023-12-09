import { React } from 'react';
import { useState, useReducer } from 'react';
import './App.css';
import Calendar from './calendar';

/////////////////////////////////////////////
// Nifty containers
// CheckHideBox allows me to hide/show an element using a checkbox
// CountBox lets me produce a quantity of an element using a number input
// AddBox lets me produce list of an element with remove buttons and an add button

// A CheckHideBox takes in an object, props, with the following properties:
// name - a name for the checkbox and its ID
// label - the label for this checkbox
// content - that which is hidden by the checkbox
// style - the style object for the div hidden by the checkbox
// It returns a larger div with a labeled checkbox that shows or hides
// the given object
function CheckHideBox( {name, label, style, content, checkState, setCheckState, disabled} ) {

    const [props_state, set_props_state] = useState( {...{style}, ...{ "display": "none" } } );
    const content_div = <div style={props_state}>{content}</div>;
    const handleChecking = (event) => {
      if (event.target.checked) set_props_state( {...props_state, ...{ "display":"block" }});
      else set_props_state( {...props_state, ...{ "display":"none" }});
    }
    const cbox = ( <input type="checkbox" name={name} id={name+'_cbox'} value={checkState[name]}
    onClick={ (e) => { handleChecking(e); setCheckState(name, e.target.checked); } } disabled={disabled}></input> );
  
    return (
      <div className='checkHideBox'>
        {cbox}
        <label htmlFor={name}>{label}</label><br />
        {content_div}
      </div>
    )
  }

// A CountBox has the following inputs:
// name - name for the count thing
// label - text for its label
// theList - the list which it monitors
// handleCountChange - partial event handler, for changing states affected by the count - argument should be the count
// top_content - something that appears and is not repeated
// layer_content - a React function with one prop, ind (to be assigned to index) among others, to be repeated
// layer_content_props - the other layer content properties, as an object
// bottom_content - something that appears at base of list, a React function
// bottom_content_props - its properties as an object
function CountBox( { name, label, countList, handleCountChange, handleCountProps, topContent, layerContent, layer_state, layerContentHandlers, layerCheck } ) {
    return(<div>
        {topContent}
        <label htmlFor={name}>{label}</label>
        <input type="number" step="1" min="1" name={name} value={countList.length}
        onChange={(e) => handleCountChange(e.target.value, handleCountProps) }></input>
        {countList.map( (v, i) => { return(<div key={name + '_' + i}>{layerContent( {"num":i, "layer_state":layer_state, "layerContentHandlers":layerContentHandlers, "layerCheck":layerCheck } )}</div>); })}
    </div>)
}

function Recursept( { name, countList, topContent, layerContent, layer_state, addChangeEndHandlers }) {
    return(<div>
        {topContent}
        {countList.map( (v, i) => { return(<div key={name + '_' + i}>{layerContent( {"num":i, "layer_state":layer_state, "addChangeEndHandlers":addChangeEndHandlers} )}</div>); } )}
        <button onClick={addChangeEndHandlers[0]}>Add</button>
    </div>)
}

////////////////////////////
// Particular containers for this app
function StartDateBox( { theCalendar, changeStartYear, changeStartMonth, changeStartDay, changeStartSign} ) {
    return (<div>
        <input type="date" id="start_date" value={String(theCalendar["start_year"]).padStart(4,'0')+"-"+String(theCalendar["start_month"]).padStart(2,'0')+"-"+String(theCalendar["start_day"]).padStart(2,'0')}
          onChange={ (e) => { changeStartYear(1*e.target.value.slice(0,4)); changeStartMonth(1*e.target.value.slice(5,7)); changeStartDay(1*e.target.value.slice(8,10)); } }/>
        <select value={theCalendar["start_sign"]} onChange={(e) => changeStartSign(e.target.value)} name="direction"><option value="1">AD / CE</option><option value="-1">BC / BCE</option></select>
    </div>);
}

function YearLengthBox( { theCalendar, changeYearProps, leap_input, checks, changeCheck} ) {
    return (<div>
        <input type="checkbox" name="match_cbox" id="match_cbox" checked={checks["match"]}
            onChange={ e => changeCheck("match", e.target.checked) }/>
        <label htmlFor='match_cbox'>Match to month cycle length</label><br/>
        <label htmlFor="year_days">Days in non-leap year:</label>
        <input type="number" name="year_days" id="year_days" min="1" value={theCalendar["year_len"]}
            onChange={ (e) => { changeYearProps[0](e.target.value); } } disabled={checks["match"]}/>
        <label htmlFor='leap_days'>Leap days:</label>
        <input type="number" name="leap_days" id="leap_days" value = {theCalendar["leap_days"]}
            onChange={ (e) => { changeYearProps[1](e.target.value); } } disabled={checks["match"]} />
        <label htmlFor='zero_cbox'>Have a year zero</label>
        <input type="checkbox" name="zero_cbox" id="zero_cbox" checked={theCalendar["year_zero"]}
            onChange={ (e) => { changeYearProps[2](e.target.checked); } }/>
        <CheckHideBox name="leap" label="Change leap year occurence" checkState={checks} setCheckState={changeCheck} content = {leap_input} disabled={checks["match"]}/>
    </div>);
}

function LeapFreqBox( { num, layer_state, addChangeEndHandlers }) {
    return (<div>every <input type="number" min={num > 0 ? layer_state[num - 1] : 1 }
        step={num > 0 ? layer_state[num - 1] : 1 }
        value={layer_state[num]} onChange={ (e) => addChangeEndHandlers[1](num, e.target.value)}/> years
        <button onClick={ () => { (num === layer_state.length - 1) ? addChangeEndHandlers[0]() : addChangeEndHandlers[2](num); } }>
            {num === layer_state.length - 1 ? "." : ", except"}</button>
    </div>);
}

function MonthPropBox( { num, layer_state, layerContentHandlers, layerCheck } ) {
    return (<div><input type="text" className='name_text' value={layer_state["months"][num]} onChange={ (e) => { layerContentHandlers[0](num, e.target.value); }}/>
        <input type="number" min="0" value={layer_state["month_lens"][num]} onChange={ (e) => { layerContentHandlers[1](num, e.target.value, layerCheck); } }/>
        <input type="number" min={-1*layer_state["month_lens"][num]} value={layer_state["month_leaps"][num]} onChange={ (e) => { layerContentHandlers[2](num, e.target.value, layerCheck); } }/>
    </div>);
}

function WeekNameBox( { num, layer_state, layerContentHandlers} ) {
    return (<input type="text" value={layer_state[num]} onChange={ (e) => { layerContentHandlers[0](num, e.target.value); } }></input>);
}

function MegaButton( {text, onClick} ) {
    return(<button className="mega_button" onClick={onClick}><h2>{text}</h2></button>)
}

function DateBox( { num, layer_state, addChangeEndHandlers} ) {
    return(<div className='date_input_div'>
        <input type="date" value={layer_state[num]["date"]} onChange={(e) => addChangeEndHandlers[1](num, e.target.value)} />
        <select value={layer_state[num]["sign"]} onChange={(e) => addChangeEndHandlers[2](num, e.target.value)} name="direction"><option value="1">AD / CE</option><option value="-1">BC / BCE</option></select>
        <button onClick={() => addChangeEndHandlers[4](num)}>Remove</button>
        <input type="text" value={layer_state[num]["significance"]} onChange={(e) => addChangeEndHandlers[3](num, e.target.value)} />
    </div>);
}
    
/////////////////////////////
// Task reducers:  calendarReducer for edits to the calendar object;
// dateReducer for edits to the list of dates.
function calendarReducer(calendar, action) {
  switch (action.type) {
    case 'change_start_day':
        return {...calendar, ...{ "start_day":action.value} };
    case 'change_start_month':
        return {...calendar, ...{ "start_month":action.value } };
    case 'change_start_year':
        return {...calendar, ...{ "start_year":action.value } };
    case 'change_start_sign':
        return {...calendar, ...{ "start_sign":action.value } };
    case 'change_year_length':
        return {...calendar, ...{ "year_len":action.value } };
    case 'change_year_zero':
        return {...calendar, ...{ "year_zero":action.value } };
    case 'change_leap_days':
        return {...calendar, ...{ "leap_days":action.value } };
    case 'add_leap_freq':
        return {...calendar, ...{ "leap_freqs":([...calendar["leap_freqs"], calendar["leap_freqs"][calendar["leap_freqs"].length - 1]*2]) }};
    case 'end_leap_freq':
        return {...calendar, ...{ "leap_freqs":(calendar["leap_freqs"].slice(0,action.index + 1))}};
    case 'change_leap_freq':
        return {...calendar, ...{ "leap_freqs":(calendar["leap_freqs"].map( (v, i) => i === action.index ? action.value : v))}};
    case 'change_month_count':
        if (action.count > calendar["month_lens"].length) {
            let def = action.count - calendar["month_lens"].length;
            return {...calendar, ...{ "month_lens":([...calendar["month_lens"], new Array(def).fill(0)]),
                "months":([...calendar["months"], new Array(def).fill("")]),
                "month_leaps":([...calendar["month_leaps"], new Array(def).fill(0)]),
                "year_len":(action.year ? calendar["month_lens"].reduce( (prev, cur, ind) => ind === action.index ? prev + Number(action.value) : prev + Number(cur), 0) : calendar["year_len"]),
                "leap_days":(action.year ? calendar["month_leaps"].reduce( (prev, cur, ind) => ind === action.index ? prev + Number(action.value) : prev + Number(cur), 0): calendar["leap_days"]) }}; }
        else return {...calendar, ...{ "month_lens":(calendar["month_lens"].slice(0, action.count)),
            "months":(calendar["months"].slice(0, action.count)),
            "month_leaps":(calendar["month_leaps"].slice(0, action.count))}};
    case 'change_month_name':
        return {...calendar, ...{ "months":(calendar["months"].map( (v, i) => i === action.index ? action.value : v))}};
    case 'change_month_length':
        return {...calendar, ...{ "month_lens":(calendar["month_lens"].map( (v, i) => i === action.index ? action.value : v)),
            "year_len":(action.year ? calendar["month_lens"].reduce( (prev, cur, ind) => ind === action.index ? prev + Number(action.value) : prev + Number(cur), 0) : calendar["year_len"]) }};
    case 'change_month_leap':
        return {...calendar, ...{ "month_leaps":(calendar["month_leaps"].map( (v, i) => i === action.index ? action.value : v)),
            "leap_days":(action.year ? calendar["month_leaps"].reduce( (prev, cur, ind) => ind === action.index ? prev + Number(action.value) : prev + Number(cur), 0): calendar["leap_days"])}};
    case 'add_month_leap_freq':
        return {...calendar, ...{ "month_cycle_leap_freqs":([...calendar["month_cycle_leap_freqs"], calendar["month_cycle_leap_freqs"][calendar["month_cycle_leap_freqs"].length - 1]*2]) }};
    case 'end_month_leap_freq':
        return {...calendar, ...{ "month_cycle_leap_freqs":(calendar["month_cycle_leap_freqs"].slice(0,action.index + 1))}};
    case 'change_month_leap_freq':
        return {...calendar, ...{ "month_cycle_leap_freqs":(calendar["month_cycle_leap_freqs"].map( (v, i) => i === action.index ? action.value : v))}};
    case 'change_week_length':
        if (action.count > calendar["weekdays"].length)
            return {...calendar, ...{ "weekdays":([...calendar["weekdays"], new Array(action.count - calendar["weekdays"].length).fill("")])}};
        else return {...calendar, ...{ "weekdays":(calendar["weekdays"].slice(0, action.count))}};
    case 'change_weekday_name':
        return {...calendar, ...{ "weekdays":(calendar["weekdays"].map( (v, i) => i === action.index ? action.value : v))}};
    case 'change_whole_calendar':
        return {...calendar, ...action.object};
    default: {
        throw Error('Unknown action: ' + action.type);
    }
  }
}

function dateReducer(dateList, action) {
    switch (action.type) {
        case 'add_date':
            return [...dateList, {"date":'0001-01-01', "sign":"1", "significance":""} ];
        case 'remove_date':
            return dateList.filter( (val, ind) => ind !== action.index);
        case 'change_date':
            return dateList.map( (val, ind) => ind === action.index ? {...val, ...{ "date":(action.value) }} : val);
        case 'change_sign':
            return dateList.map( (val, ind) => ind === action.index ? {...val, ...{ "sign":(action.value) }} : val);
        case 'change_significance':
            return dateList.map( (val, ind) => ind === action.index ? {...val, ...{ "significance":(action.value) }} : val);
        case 'populate':
            return [...dateList, ...someDefaultDates];    
        default: throw Error('Unknown action: ' + action.type);
    }
}

const someDefaultDates = [
    {"date":'0585-05-28', "sign":"-1", "significance":"Eclipse of Thales"},
    {"date":'1722-02-22', "sign":"1", "significance":"George Washington's birthday"},
    {"date":'1919-05-29', "sign":"1", "significance":"Eddington experiment"},
    {"date":'1970-01-01', "sign":"1", "significance":"Unix epoch date"},
    {"date":'1991-06-23', "sign":"1", "significance":"Sonic the Hedgehog's birthday"},
    {"date":(new Date(Date.now()).toISOString().slice(0,10)), "sign":"1", "significance":"today"},
    {"date":'2112-09-03', "sign":"1", "significance":"Doraemon's birthday"}
]

//////////////////////////////////////
// App itself
export default function App() {
    // useReducers and event handling functions
    const [theCalendar, calendar_dispatch] = useReducer(calendarReducer, new Calendar());
    const [checks, setChecks] = useState( { "instruct":true, "date":false, "year":false, "leap":false, "month":false, "week":false, "moc_diff":false, "match":true } );
    function changeCheck(which, val) {
        var copy = {...checks}
        copy[which] = val;
        setChecks(copy);
    }
    const [dateList, date_dispatch] = useReducer(dateReducer, []);
    const [newDateList, setNewDateList] = useState(<ul></ul>);
    const [uploadedFile, setUploadedFile] = useState([]);

    function changeStartDay(val) { calendar_dispatch( { type:'change_start_day', value:Number(val) }); }
    function changeStartMonth(val) { calendar_dispatch( { type:'change_start_month', value:Number(val) }); }
    function changeStartYear(val) { calendar_dispatch( { type:'change_start_year', value:Number(val) }); }
    function changeStartSign(val) { calendar_dispatch( { type:'change_start_sign', value:Number(val) }); }
    function changeYearLength(val) { calendar_dispatch( { type:'change_year_length', value:Number(val) }); }
    function changeLeapDays(val) { calendar_dispatch( { type:'change_leap_days', value:Number(val) }); }
    function changeYearZero(val) { calendar_dispatch( { type:'change_year_zero', value:val }); }
    function addLeapFreq() { calendar_dispatch( { type:'add_leap_freq' }); }
    function endLeapFreq(ind) { calendar_dispatch( { type:'end_leap_freq', index:Number(ind) }); }
    function changeLeapFreq(ind, val) { calendar_dispatch( { type:'change_leap_freq', index:Number(ind), value:Number(val) }); }
    function changeMonthCount(ct, yr) { calendar_dispatch( {type:'change_month_count', count:Number(ct), year:Number(yr) }); }
    function changeMonthName(ind, val) { calendar_dispatch( { type:'change_month_name', index:Number(ind), value:val }); }
    function changeMonthLength(ind, val, yr) { calendar_dispatch( { type:'change_month_length', index:Number(ind), value:Number(val), year:yr }); }
    function changeMonthLeap(ind, val, yr) { calendar_dispatch( { type:'change_month_leap', index:Number(ind), value:Number(val), year:yr }); }
    function addMonthCycleLeapFreq() { calendar_dispatch( { type:'add_month_leap_freq' }); }
    function endMonthCycleLeapFreq(ind) { calendar_dispatch( { type:'end_month_leap_freq', index:Number(ind) }); }
    function changeMonthCycleLeapFreq(ind, val) { calendar_dispatch( { type:'change_month_leap_freq', index:Number(ind), value:Number(val) }); }
    function changeWeekLength(ct) { calendar_dispatch( {type:'change_week_length', count:Number(ct) }); }
    function changeWeekdayName(ind, val) { calendar_dispatch( { type:'change_weekday_name', index:Number(ind), value:val }); }
    function changeWholeCalendar(obj) { calendar_dispatch( { type:'change_whole_calendar', object:obj }); }

    function addDate() { date_dispatch( { type:'add_date' })};
    function removeDate(ind) { date_dispatch( { type:'remove_date', index:ind })};
    function changeDate(ind, val) { date_dispatch( { type:'change_date', index:ind, value:val })};
    function changeDateSign(ind, val) { date_dispatch( { type:'change_sign', index:ind, value:val })};
    function changeDateSignificance(ind, val) { date_dispatch( { type:'change_significance', index:ind, value:val })};
    function populateDates() { date_dispatch( { type:'populate'} ) };

    // Functionality for buttons at the bottom
    function getRightCalendar() {
        return (new Calendar( // Because we don't revert the calendar properties when the checkboxes are unclicked,
        checks["date"] ? theCalendar["start_year"] : 1, // if conversion occurs now, make the calendar
        checks["date"] ? theCalendar["start_month"] : 1, // have its old properties.
        checks["date"] ? theCalendar["start_day"] : 1,
        checks["date"] ? theCalendar["start_sign"] : 1,
        checks["year"] ? theCalendar["year_len"] : 365,
        checks["year"] ? theCalendar["year_zero"] : false,
        checks["year"] ? theCalendar["leap_days"] : 1,
        checks["year"] && checks["leap"] ? theCalendar["leap_freqs"] : checks["year"] && checks["match"] ? theCalendar["month_cycle_leap_freqs"] : [4, 100, 400],
        checks["month"] ? theCalendar["months"] : ['January','February','March','April','May','June','July','August','September','October','November','December'],
        checks["month"] ? theCalendar["month_lens"] : [31,28,31,30,31,30,31,31,30,31,30,31],
        checks["month"] ? theCalendar["month_leaps"] : [0,1,0,0,0,0,0,0,0,0,0,0],
        (checks["month"] && checks["moc_diff"]) ? theCalendar["month_cycle_leap_freqs"] : (checks["year"] && checks["leap"]) ? theCalendar["leap_freqs"] : [4, 100, 400],
        checks["week"] ? theCalendar["weekdays"] : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        ));
    }
    function convertDates() {
        const myCal = getRightCalendar();
        myCal.calc_stats(); // Conversion method is a method of the calendar object described in calendar.js
        setNewDateList(<ul>
            {dateList.map( (v, i) => { return(<li key={i}><strong>{v["significance"]}</strong>{": " + myCal.convert_date(Number(v["date"].slice(8)),Number(v["date"].slice(5,7)),Number(v["date"].slice(0,4)),Number(v["sign"]))}</li>); } )}
        </ul>);
    }

    function downloadCalendar() {
        const myCalendar = getRightCalendar();
        const myBlob = new Blob([JSON.stringify(myCalendar)], {type:'application/json'});
        const myFile = new File([myBlob], 'calendar.json', {type:'application/json'});

        const link = document.createElement('a');
        const url = URL.createObjectURL(myFile);
      
        link.href = url;
        link.download = myFile.name;
        document.body.appendChild(link);
        link.click();
      
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    function uploadCalendar() {
        if (uploadedFile.length < 1) alert("No file detected.");
        const myReader = new FileReader();
        try {
            myReader.readAsText(uploadedFile[0]);
            myReader.addEventListener("load",
                () => {
                    const parsed = JSON.parse(myReader.result);
                    changeWholeCalendar(parsed);
                }
            )
        } catch (error) {
            alert(error);
        }
    }

  // Here is where the app is actually put together
    return ( <div className='App'>
        <CheckHideBox label="Notes:" name="instruct" checkState={checks} setCheckState={changeCheck}
            content={<ul>
                <li>Start date, and dates to be converted, are given using the proleptic Gregorian calendar.</li>
                <li>Your start date will be the day that corresponds to the first day of the Year 1 and of the 
                  first month cycle in your calendar, even if you opt to include a Year 0.  It will be presumed to be 
                  the first day of the week (Monday, if you do not change the weekday names).
                </li>
                <li>The length of the year does not have to align with the cycle of months.  Changes to the month cycle 
                  do not affect the length of the year unless the relevant box is checked.
                </li>
                <li>Similarly, leap month cycles and leap years need not be the same.  After all,
                  the motion of the Moon and the revolution of Earth around the Sun are as independent of each other 
                  as they are independent of the rotation of the Earth about its axis.
                </li>
                <li>The number of leap days in a leap month cycle or leap year need not be one (it may even be negative).
                  However, there are not leap weeks.
                </li>
              </ul>}/>
        <CheckHideBox label="Change start date:" name="date" checkState={checks} setCheckState={changeCheck}
            content={<StartDateBox theCalendar={theCalendar}
            changeStartDay={changeStartDay} changeStartMonth={changeStartMonth} changeStartYear={changeStartYear} changeStartSign={changeStartSign}/>}/>
        <CheckHideBox label="Change year length:" name="year" checkState={checks} setCheckState={changeCheck}
            content={<YearLengthBox theCalendar={theCalendar} checks={checks} changeCheck={changeCheck}
            changeYearProps={[changeYearLength, changeLeapDays, changeYearZero]} leap_input={<Recursept name="leap" countList={theCalendar["leap_freqs"]}
                topContent={<p>Leap years occur </p>} layerContent={LeapFreqBox} layer_state={theCalendar["leap_freqs"]} addChangeEndHandlers={[addLeapFreq, changeLeapFreq, endLeapFreq]}/>}/>} />
        <CheckHideBox label="Change months:" name="month" checkState={checks} setCheckState={changeCheck}
            content={<div><CountBox label="Month count:" name="month"
            handleCountChange={changeMonthCount} countList={theCalendar["months"]} handleCountProps={checks["match"]}
            topContent={<div><span className='name_text'>Name</span><span className='number_head'>Days</span><span className='number_head'>Leapdays</span></div>}
            layerContent={MonthPropBox} layer_state={theCalendar} layerContentHandlers={[changeMonthName, changeMonthLength, changeMonthLeap]} layerCheck={checks["match"]}
            /> <CheckHideBox label="Month cycle leaps different from years':" name="moc_diff" checkState={checks} setCheckState={changeCheck}
                content = {<Recursept name="mo_cycle_leap" countList={theCalendar["month_cycle_leap_freqs"]} 
                topContent={<p>Month cycles leap</p>} layerContent={LeapFreqBox} layer_state={theCalendar["month_cycle_leap_freqs"]}
                addChangeEndHandlers={[addMonthCycleLeapFreq, changeMonthCycleLeapFreq, endMonthCycleLeapFreq]}
            />}
        /></div>} />
        <CheckHideBox label="Change weeks:" name="week" checkState={checks} setCheckState={changeCheck}
            content={<CountBox label="Days in week:" name="week"
            handleCountChange={changeWeekLength} countList={theCalendar["weekdays"]}
            layerContent={WeekNameBox} layer_state={theCalendar["weekdays"]} layerContentHandlers={[changeWeekdayName]}/>}
        />
        <div className='half_div'>
            <Recursept name="dates" countList={dateList} topContent={<div>
                <h3>Dates in Gregorian calendar</h3>
            </div>}
            layerContent={DateBox} layer_state={dateList} addChangeEndHandlers={[addDate, changeDate, changeDateSign, changeDateSignificance, removeDate]}/>
        </div>
        <div className='half_div'>
            <h3>Dates in new calendar</h3>
            {newDateList}
        </div>
        <div>
            <div className='button_border_div'><button onClick={populateDates}>Populate dates</button></div>
            <div className='button_border_div'><MegaButton onClick={convertDates} text="Convert dates!"/></div>
            <div className='button_border_div'><button onClick={downloadCalendar}>Download calendar</button></div>
            <div className='button_border_div'>
                Upload calendar:<br/>
                <input type='file' accept="application/json" files={uploadedFile}
                onChange={ (e) => {setUploadedFile(e.target.files); }}/>
            <button onClick={uploadCalendar}>Apply upload</button></div>
        </div>
    </div> );
}