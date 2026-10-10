## **Appendix**

* Link to Google Sheet containing school schedules.  
* Preliminary Wireframes.  
* Google Sheet-based booking app script (Spreadsheet App, older)  
  * Booking App Google Sheet structure, sheets and headers  
    * 1\. Booking sheet  
      * This sheet is a primary for user input and operation  
      * Link: [https\://docs.google.com/spreadsheets/d/1y6OOsvWDqLptGcrdDO5RdAUiMp331W-R49jVPFMR\_Q4/](https://docs.google.com/spreadsheets/d/1y6OOsvWDqLptGcrdDO5RdAUiMp331W-R49jVPFMR_Q4/)  
      * Columns and Headers (some headers are in arrayformula):  
        Note: I think columns T-X is what I initiated the validation process, but it is not done.

| Column: | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **Header:** | **No** | **Subject** | **Teacher** | **Lab Title** | **Location** | **Date** | **Bell** | **Period** | **Assign** | **Notified Date** | **Coding Status** | **{Checkbox to run the script}** | **Day** | **TT Subject** | **Section** | **Array 2D Lookup** | **StartTime** | **EndTime** | **Note** | **Teacher 1st row** | **Day 1st row (for each teacher)** | **Period row** | **Result Row** | **Teacher Day st period** |
| **Formula:** | **\={"No";arrayformula(if(isblank(D2:D),,row(A2:A)))}** |  |  |  |  |  |  |  |  |  |  |  | **\={"Day";arrayformula(iferror(vlookup(E2:E,Calendar\!V:W,2,FALSE),""))}** | **\={"TT Subject";arrayformula(iferror(vlookup((match(C2:C,Valid\!B:B,0))+(match(M2:M,Valid\!C:C,0))+(left(H2:H,1)-1),Valid\!A:H,6),""))}** | **\={"Section";arrayformula(iferror(vlookup((match(C2:C,Valid\!B:B,0))+(match(M2:M,Valid\!C:C,0))+(if(left(H2:H,1)="2",2,H2:H)-1),Valid\!A:H,8),""))}** | **\={"Array 2D Lookup";arrayFormula(iferror(vlookup(H2:H,Bell\!1:18,match(G2:G,Bell\!1:1,0),0)))}** | **\={"StartTime";arrayformula(iferror(E2:E+(left(P2:P,find("-",P2:P)-1))))}** | **\={"EndTime";arrayformula(iferror(E2:E+right(P2:P,len(P2:P)-find("-",P2:P)),""))}** |  | **\={"Teacher 1st row";ARRAYFORMULA(match(C2:C,Valid\!B:B,0))}** | **\={"Day 1st row (for each teacher)";ARRAYFORMULA(match(M2:M,Valid\!C:C,0))}** | **\={"Period row";ARRAYFORMULA(if(left(H2:H,1)="2",2,H2:H)-1)}** | **\={"Result Row";ARRAYFORMULA(T2:T+U2:U+V2:V)}** | **\={"Teacher Day 1st period";ARRAYFORMULA(T2:T+U2:U)}** |

      * Column A, No \[Automate by Arrayformula\]: running numbers, use for taking log for that lab reservation entry taking all data from that row  
      * Column B, Subject \[User Input\]: data validated to subject list fron Info sheet  
      * Column C, Teacher \[User Input\]: Subject Teacher data validation upon list of teachers from Info sheet. Further data validation can be applied  (currently doesn’t have) using Subject column is under process to match subject to valid teacher  
      * Column D, Lab Title \[User Input\]: User input lab title for that lab reservation entry  
      * Column E, Location \[User Input\]: Which lab or classroom for that lab reservation entry. Data validation can be applied (currently doesn’t have) from this list (Bio1, Bio2, Chem1, Chem2, Physics1, Physics2, Classroom, 210, 215, 216, 217, 309, 310, Outside, Garden). Use as Location in creating Google Calendar Event using Google App Script  
      * Column F, Date \[User Input\]: Date for that lab reservation entry. Use as Date to pull A-E Day, TT Subject and Section using lookup in column M-O  
      * Column G, Bell \[User Input\]: Bell schedule for that lab reservation entry. Data validation applies to drop down list from range (Row 1 in Bell sheet, \=Bell\!\$1:\$1). Use to lookup for Array 2D Lookup, StartTime and EndTime from the Bell sheet  
      * Column H, Period \[User Input\]: Period for that lab reservation entry. Data validation applies to drop down list from range (Column A in Bell sheet, \=Bell\!\$A:\$A). Use to lookup for TT Subject, Section, Array 2D Lookup, StartTime and EndTime from the Bell sheet  
      * Column I, Assign \[User Input\]: For assigning TA/LT to be in charged of that lab reservation entry. Format is the name of TA/LT then if more than 1 assistants is needed a comma will separate each TA/LT name. Ex. “Mek” or “Fern, Mai”. Use for add invite to Google Calendar Event create by Google App Script. Data validation can be applied (currently doesn’t have).   
      * Column J, Notified Date \[User Input\]: Date the subject teacher notify TA/LT. For further analysis of which teacher tends to short notice to schedule the lab  
      * Column K, Coding Status \[Automate by Script\]: Has soft validation by Custom Formtting the whole row based on values in the cell. Ex, “Processed” \= Green, “Processing” \= Blue, “Input Error”. Values in this cell automate by Google App Script  
      * Column L, {Checkbox}: A checkbox in row \= 1, column \= 12 to trigger Google App Script. Mainly for mobile phone. For desktop users, there is a picture assigned the same script as a button.  
      * Column M, Day \[Automate by Arrayformula\]: Check what A-E day is for the date of that lab reservation entry by lookup the date value from column F in column V (Calendar sheet) then return column W (Calendar sheet)  
      * Column N, TT Subject \[Automate by Arrayformula\]: Lookup for which subject at that A-E day (from column M) and period (from column H) the subject teacher (from column C) teach from data in Valid sheet. And returns the subject. If the name of subject  is exactly matched the Subject input in column B, this cell will turn dark green by Custom Formatting (=ifs(isblank(\$B2),FALSE,\$K2="Booked",FALSE,\$N2\<\>\$B2,FALSE,\$N2=\$B2,TRUE)). Actually on the second thought, I think it should be red if the subject doesn’t match.  
      * Column O, Setion \[Automate by Arrayfomula\]: Lookup for the section at that period of the lab reservation entry from the Valid sheet using A-E day (from column M) and period (from column H) the subject teacher (from column C).  
      * Column P, Array 2D Lookup \[Automate by Arrayformula\]: Look up for the start-stop time value from Bell sheet of that period of the lab reservation entry using Bell (from column G) and Period (from column H)  
      * Column Q, Start Time \[Automate by Arrayformula\]: Cut the start time, before the hyphen “-”, from Array 2D Lookup (column P) value of that lab reservation entry combined with its date (column F) into Date/Time format for Start Time in creating Google Calendar Event using Google App Script.  
      * Column R, End Time \[Automate by Arrayformula\]: \[Automate by Arrayformula\]: Cut the end time, after the hyphen “-”, from Array 2D Lookup (column P) value of that lab reservation entry combined with its date (column F) into Date/Time format for Start Time in creating Google Calendar Event using Google App Script.  
      * Column S, Note \[User Input\]: Any comments, notes for that lab reservation entry. It will be included in the description of the Google Calendar Event using Google App Script  
      * Column T-X are under construction. The idea is to improve and validate the subject from Valid sheet  
    * 2\. Calendar sheet  
      * This sheet contains school calendar (unformatted), but I eventually sorted it into date, A-E day and bell schedule  
      * Columns and Headers (some headers are in arrayformula):  
        Note: Columns A-I are imported from another source. Columns K-W are for splitting the calendar values into date and A-E days, column X is automating Wed from Regular days for bell scheduling. Columns Y-Z are manually keyed to which shortened bell schedule they will use.

| Column: | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **Header:** |  | **MON** | **TUE** | **WED** | **THU** | **FRI** | **SAT** | **SUN** | **IMPORTANT DATES** |  | Get Month | Fill Month |  | Mon | Tue | Wed | Thu | Fri |  | Date | A-E |  | Extracted Date | A-E Day | Auto Bell | Manual Bell | Short Bell |
| **Formula:** |  |  |  |  |  |  |  |  |  |  | \={"Get Month";ArrayFormula(iferror(IF(DATEVALUE(A2:A),text(DATEVALUE(A2:A),"mmm YYYY")),""))} | \={"Fill Month";ArrayFormula(lookup(row(A2:A),row(A2:A)/if(K2:K\<\>"",TRUE,FALSE),K2:K))} |  | \={"Mon","Tue","Wed","Thu","Fri";arrayformula(ifna(text(to\_date(L2:L-1+REGEXEXTRACT(to\_text(B2:F),"\[0-9\]+")),"mmm-dd/yyyy") & "|" & REGEXEXTRACT(to\_text(B2:F),"\[A-E\]"),""))} |  |  |  |  |  | \={"Date | A-E";FILTER({N2:N;O2:O;P2:P;Q2:Q;R2:R},len({N2:N;O2:O;P2:P;Q2:Q;R2:R}))} |  | \={"Extracted Date","A-E Day";arrayformula(sort(split(T2:T,"|"),1,TRUE))} |  | \={"Auto Bell";arrayformula(if(weekday(V2:V)=4,"Wed","Regular"))} |  |  |

    * 3\. Bell sheet  
      * This sheet contains start-end time for each period of different bell schedules  
      * Columns and Headers (some row headers are in arrayformula):  
        Note: Row 13-18 have formula to split P4,5,6 into half  
        For example, the formula in A13 is ‘={"4A",arrayformula(if(isblank(B7:7),"",left(B7:7,find("-",B7:7)-1)&"-"\&text((left(B7:7,len(B7:7)-find("-",B7:7))+right(B7:7,len(B7:7)-find("-",B7:7)))/2,"hh:mm")))}’ and A14 is ‘={"4B",arrayformula(if(isblank(B7:7),"",text((left(B7:7,len(B7:7)-find("-",B7:7))+right(B7:7,len(B7:7)-find("-",B7:7)))/2,"hh:mm")&"-"\&right(B7:7,len(B7:7)-find("-",B7:7))))}’

| Period | Regular | Wed | 50m \+ Afternoon | Tray Making | Wai Kru | TOEFL | 40m \+ Afternoon | Battle of the Bands | WASC | Farewell | 40m \+ Morning |
| ----- | ----- | ----- | :---: | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| HR | 07:30-07:45 | 08:25-08:40 | 07:30-07:45 | 07:30-07:45 |  |  |  |  |  |  |  |
| 1 | 07:50-08:45 | 08:45-09:35 | 07:50-08:40 | 07:50-08:30 | 09:10-09:55 |  |  |  |  |  |  |
| 2-11 | 08:50-09:45 | 09:40-10:30 | 08:45-09:35 | 08:35-09:15 | 10:00-10:45 |  |  |  |  |  |  |
| 2-10/12 | 09:10-10:05 | 10:00-10:50 | 09:05-09:55 | 08:55-09:35 | 10:20-11:05 |  |  |  |  |  |  |
| 3 | 10:10-11:05 | 10:55-11:45 | 10:00-10:50 | 09:40-10:20 | 11:10-11:55 |  |  |  |  |  |  |
| 4 | 11:10-12:05 | 11:50-12:40 | 10:55-11:45 | 10:25-11:05 | 12:00-12:45 |  |  |  |  |  |  |
| 5 | 12:10-13:05 | 12:45-13:35 | 11:50-12:40 | 11:10-11:50 | 12:50-13:35 |  |  |  |  |  |  |
| 6 | 13:10-14:05 | 13:40-14:30 | 12:45-13:35 | 11:55-12:35 | 13:40-14:25 |  |  |  |  |  |  |
| 7 | 14:10-15:05 | 14:35-15:25 | 13:40-14:30 | 12:40-13:20 | 14:30-15:15 |  |  |  |  |  |  |
| 8 | 15:10-16:00 | 15:30-16:00 | 15:10-16:00 |  | 15:20-16:05 |  |  |  |  |  |  |
| Activity |  |  | 14:30-15:05 | 13:20-16:00 |  |  |  |  |  |  |  |
| 4A | 11:10-11:37 | 11:50-12:15 | 10:55-11:20 | 10:25-10:45 | 12:00-12:22 |  |  |  |  |  |  |
| 4B | 11:37-12:05 | 12:15-12:40 | 11:20-11:45 | 10:45-11:05 | 12:22-12:45 |  |  |  |  |  |  |
| 5A | 12:10-12:37 | 12:45-13:10 | 11:50-12:15 | 11:10-11:30 | 12:50-13:12 |  |  |  |  |  |  |
| 5B | 12:37-13:05 | 13:10-13:35 | 12:15-12:40 | 11:30-11:50 | 13:12-13:35 |  |  |  |  |  |  |
| 6A | 13:10-13:37 | 13:40-14:05 | 12:45-13:10 | 11:55-12:15 | 13:40-14:02 |  |  |  |  |  |  |
| 6B | 13:37-14:05 | 14:05-14:30 | 13:10-13:35 | 12:15-12:35 | 14:02-14:25 |  |  |  |  |  |  |

    * 4\. Info sheet  
      * This sheet contain basic information  
      * Columns A-B contain other source data that needed in the App Script  
      * Columns D-F are list of Science Teahcers, TA, LT and their email addresses  
      * Columns G-M are list of subject and teachers that teach those subjects  
      * Columns N-O are color coding for creating Google Calendar Events  
    * 5\. Valid sheet  
      * This sheets contains formatted \+ sorted teaching schedule imported from the TimeTable Google Sheet  
      * Columns and Headers:

| Column: | A | B | C | D | E | F | G | H |
| :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Header: | Row | Teacher | Day | Period | Subject | Class | Room | Section |

    * 6\. Logs sheet  
      * This sheet contains logs of created Google Calendar Event from Google App Script  
      * Each lab reservation entry is linked to its created Google Calenar Event  
      * Columns and Headers:  
        

| Column: | A | B | C | D | E | F | G | H | I | J |
| :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Header: | Event ID | Created Time | Title | Start Time | End Time | Description | Location | Color | Guests | Calendar |

  * Google App Script and trigger settings

Script: [Calendarize.gs](http://Calendarize.gs)

```js
var sheetName = SpreadsheetApp.getActiveSpreadsheet().getSheetName()
var ssC = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)

var cldObj = { 
              book: CalendarApp.getCalendarById("mahidol.edu_qqoq8j566dhh7sdr05j189d8b0@group.calendar.google.com"),
              mek: CalendarApp.getCalendarById("nattapat.poo@mahidol.ac.th"),
              fern: CalendarApp.getCalendarById("panisa.lue@mahidol.ac.th"),
              kris: CalendarApp.getCalendarById("thanaphat.cha@mahidol.ac.th"),
              mai: CalendarApp.getCalendarById("nattTenzin.yaw@mahidol.ac.th"),
              win: CalendarApp.getCalendarById("rawinsiwat.dec@mahidol.ac.th")
             }
var cldId = cldObj[sheetName.toLowerCase()]

function Booking(){
  if(cldId != null){
    // Get + Filter from booking sheet
    var data0 = ssC.getRange(2, 1, getLastRow(ssC,"D:D") - 1, ssC.getLastColumn() + 1).getValues(); //Get Data Range
Logger.log("data0 = " + data0)
    var data1 = data0.filter(function (item){return item[10] === ""}).map(function (e){e.pop(); return e});  //Remove non-blank Coding Status: result in empty array (to be processed)
Logger.log("data1 = " + data1)
    //Processing non-blank @ Coding Status
    var data2 = data1.map(function (g) {
      //Input variables
      var i_BookingID = g[0];
      var i_Subject = g[1];
      var i_Teacher = g[2];
      var i_LabTitle = g[3];
      var i_Location = g[4];
      var i_Date = g[5];
      var i_Bell = g[6];
      var i_Period = g[7];
      var i_Guests = g[8];
      var i_Day = g[12];
      var i_Section = g[14];
      var i_StartTime = g[16];
      var i_EndTime = g[17];
      var i_Note = g[18];
      var cellCoding = ssC.getRange(Number(i_BookingID), 11);

      //not empty => Create Event
      if(i_Date !== "" && i_Bell !== "" && i_Period !== "") {
        // Fetch data from ssInfo
        var ssInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Info');    //Spreadsheet = Info
        var sList = ssInfo.getRange(2, 7, getLastRow(ssInfo, "G:G") - 1, 2).getValues(); //Subject List Array
        var teList = ssInfo.getRange(2, 4, getLastRow(ssInfo, "D:D") - 1, 2).getValues(); //Teacher-Email List Array
        
        // Printing variables
        var title = "P" + i_Period + "_" + i_LabTitle + " [" + i_Teacher + "(" + i_Section + ")]";
        var startTime = new Date(i_StartTime);
        var endTime = new Date(i_EndTime);
        var description = "#" + i_BookingID + " P" + i_Period + " Day " + i_Day + " " + i_Subject + ":" + i_LabTitle + " [" + i_Teacher + "(" + i_Section + ")]" + '\n\n' + i_Note
        var guests = getEmailAdd(teList, i_Guests)

        // Creating Event
        var cldEvent = cldId.createEvent(title, startTime, endTime, {description: description, location: i_Location, guests: guests});
        // Set eventColor
        if(sheetName == 'Book'){
          var s_List = sList.map(function (a) { return a[1] }); //Subject Name List
          var c_List = sList.map(function (b) { return b[0] }); //Subject Color List
          var eventColor = c_List[s_List.indexOf(i_Subject)]
          if(eventColor != null){
            cldEvent.setColor(eventColor)
          }
        }else if(sheetName == 'Mek'){
          //cldEvent.setColor(10)     //Green
          cldEvent.setColor(5)      //Yellow
        }
      
        //Log Created Event Data
        var ssLogs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");      //Spreadsheet = Logs
        var cldEID = cldEvent.getId();
        var eventUrl = "https://www.google.com/calendar/event?eid=" + Utilities.base64Encode(cldEID.split('@')[0] + " " + cldEvent.getOriginalCalendarId()).replace(/\=/g, '');
        var logData = [eventUrl, cldEvent.getDateCreated(), cldEvent.getTitle(), cldEvent.getStartTime(), cldEvent.getEndTime(), cldEvent.getDescription(), cldEvent.getLocation(), cldEvent.getColor(),i_Guests,sheetName]
        ssLogs.getRange(ssLogs.getLastRow()+1,1,1,logData.length).setValues([logData]);

        //cellCoding.setValue("Processing");

        var richValue = SpreadsheetApp.newRichTextValue()
          .setText("Processed")
          .setLinkUrl(eventUrl)
          .build();
        cellCoding.setRichTextValue(richValue);        
      } else {
        cellCoding.setValue("Input Error");
      }
    })
    
    var showMsg = 'Script Run  Successfully with sheetName = ' + sheetName + '\\n There are ' + data2.length + ' events created'
    Browser.msgBox(showMsg)

  }
}

function boxTicked(e) {
  var range = e.range;
  var column = range.getColumn();
  var row = range.getRow();
  var inputValue = e.value;

  if(cldId != null && row == 1 && inputValue == 'TRUE') {
    range.uncheck()
    Booking()
  }
}

function getEmailAdd(teList, guests) {
  var t_List = teList.map(function (c) {return c[0] }); //Teacher Name List
  var e_List = teList.map(function (d) {return d[1] }); //Teacher Email List

  var guestNames = guests.split(",").map(function (name) {
    return name.trim(); // Trim whitespace around each name
  });

  var emailAddresses = [];

  var guestNames = guests.split(",").map(function (name) {
    return name.trim();
  });

  for (var i = 0; i < t_List.length; i++) {
    if(guestNames.includes(t_List[i])) {
      emailAddresses.push(e_List[i]);
    }
  }
  return emailAddresses.join(", ");
}

function getLastRow(sheet, rangeString) {
  var rng = sheet.getRange(rangeString).getValues();
  for (var i = rng.length - 1; i >= 0; i--) {
    if(rng[i][0] != null && rng[i][0] != '') {
      return i + 1;
    }
  }
}
```

* Trigger  
  Choose which function to run: “boxTicked”  
  Which runs at deployment: “Head”  
  Select event source: “From spreadsheet”  
  Select event type: “On edit”  
  * Google Calendar and settings  
    * Calendar ID: “mahidol.edu\_qqoq8j566dhh7sdr05j189d8b0@group.calendar.google.com”  
    * Sharable Link: [https\://calendar.google.com/calendar/u/0?cid=bWFoaWRvbC5lZHVfcXFvcThqNTY2ZGhoN3NkcjA1ajE4OWQ4YjBAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ](https://calendar.google.com/calendar/u/0?cid=bWFoaWRvbC5lZHVfcXFvcThqNTY2ZGhoN3NkcjA1ajE4OWQ4YjBAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ)  
    * Shared with:  
      * Subject teachers can see all event details  
      * TALT can make changes and manage sharing  
* Google Sheet Timetable 2025  
  * Structure, sheets and headers  
    * TimeTable sheet: This sheet contains visual format for all teachers, all A-E day and all periods. Data is pulled from other sheet using formula located in cell C2  
    * Link: [https\://docs.google.com/spreadsheets/d/1MmDEOspbdUk-9LOyspEpmHiapeenUl86fdgbNTUhM\_I/edit?gid=846435577](https://docs.google.com/spreadsheets/d/1MmDEOspbdUk-9LOyspEpmHiapeenUl86fdgbNTUhM_I/edit?gid=846435577)  
    * Formula: 

```
=BYCOL(C1:V1, LAMBDA(teacher_sheet_name,
  MAP(
    ARRAYFORMULA(LOOKUP(ROW(A2:A), ROW(A2:A)/(A2:A<>""), A2:A)),
    B2:B,
    LAMBDA(main_sheet_col_label, main_sheet_row_label,
      IF(OR(main_sheet_col_label="", main_sheet_row_label=""), "",
        IF(teacher_sheet_name="", "",
          INDEX(
            INDIRECT(teacher_sheet_name & "!A:F"),
            MATCH(main_sheet_row_label, INDIRECT(teacher_sheet_name & "!A:A"), 0),
            MATCH(main_sheet_col_label, INDIRECT(teacher_sheet_name & "!1:1"), 0)
          )
        )
      )
    )
  )
))
```

    * Structure  
      * Row 1 \= Teacher names, manually input. Values match individual teacher sheet names  
      * Column A \= A-E Day, most are merged  
      * Column B \= Periods from HR to P7  
    * Conditional Formatting  
  * Each teacher sheets  
    * Teaching schedule (Column A-F)  
      * Row 1 \= A-E Day labeling  
      * Column A \= Period labeling. From HR (Homeroom) to P8  
      * Each teaching block has 3 rows. Separate by an Ctrl+Enter (char(10))  
        * First row: Subject (should match Subject list in Info sheet in 10.1.1 Booking App Google Sheet)  
        * Second row: Room number  
        * Thrid row: Section  
        * Fourth row (only for Homeroom in Row3): Second Homeroom teacher  
        * LD (Lunch Duty): Doesn’t have section. Only 2 rows, first row specifies period and which half, second row indicates location (similar to room number)  
          * 1st Half, note by a letter “A” after the period  
            * 2 of Ctrl+Enter (char(10)) is inserted after 2 rows of data to visually placed the content at the top of the cell  
          * 2nd Half, note by a letter “B” after the period  
            * 2 of Ctrl+Enter (char(10)) is inserted before 2 rows of data to visually placed the content at the buttom of the cell  
          * Ex. “LD 5A” is Lunch Duty period 5 first half. “LD 6B” is Lunch Duty period 6 second half  
          * Lunch Duties will be only period 4,5 and 6  
      * Note: the second row is intentionally left blank because when lookup from Booking Google Sheet, it lookup the period 7 of earlier day (an above row)  
    * Data Table Format (Column H-O)  
      * Column headers and formula:

| Column: | H | I | J | K | L | M | N | O |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Header: | Teacher | Day | Period | Input | Subject | Class | Section | 2nd HR |
| Formula: | \={"Teacher"; ARRAYFORMULA(IF(C32:C="", "", GETSHEETNAME()))} | \={"Day", "Period", "Input";ARRAYFORMULA(SPLIT(FLATTEN(TRANSPOSE(B1:F1) & "|" & TRANSPOSE(A2:A10) & "|" & TRANSPOSE(B2:F10))),"|"))} |  |  | \={"Subject","Class","Section","2nd HR";ARRAYFORMULA(ifna(IF(E32:E="",{"","","",""},TO\_TEXT(SPLIT(E32:E, CHAR(10)))),""))} |  |  |  |

      * Column H, Teacher \[Automate by Arrayformula\]: Get teacher name from the sheetname using custom formula in Google App Script  
      * Column I-K, Day, Period, Input \[Automte by Arrayformula\]: Reformat visual 2D table (A-E vs HR-P8) into data table format with 3 columns: “Day”, “Period” and “Input”.  
      * Column L-O, Subject, Class, Section, 2nd HR \[Automate by Arrayformula\]: Split values from column K of that row into 4 columns: “Subject”, “Class”, “Section” and “2nd HR”.  
  * Index sheet: Consolidate all teachers data table from columns H-N of every teacher sheets into one  
    * Column headers:

| Column: | A | B | C | D | E | F | G |
| :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Header: | Teacher | Day | Period | Subject | Class | Room | Section |

    * Formula in A2:

```
={Dr.A!H2:N46;Bala!H2:N46;Emad!H2:N46;Fay!H2:N46;Laird!H2:N46;Leyla!H2:N46;May!H2:N46;Pusadee!H2:N46;Yeshey!H2:N46;Ronald!H2:N46;Shaini!H2:N46;Steban!H2:N46;Stephen!H2:N46;Tenzin!H2:N46;Turner!H2:N46;Kris!H2:N46;Mai!H2:N46;Fern!H2:N46;Mek!H2:N46;Win!H2:N46}
```

Custom formula:

```js
function GETSHEETNAME() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}
```

* Gemini Bell Schedule Tabulator  
  * This Custom Gems for Gemini which can convert table from document or pdf into 2 columns (periods and start-end time) so I can easily put the shortened schedules in to the Bell sheet of the Bookg App Google Sheet  
  * Link: [https\://gemini.google.com/gem/85e637233253](https://gemini.google.com/gem/85e637233253)  
  * Name: 🔔 Bell Tabulator  
  * Instruction: 

```
Your Role
You are a specialized School Schedule Converter. Your only job is to take school schedule information given to you in any format (image, text, PDF, etc.) and convert it into a specific two-column table suitable for pasting into Google Sheets.
Output Format (Strict)
Your output must always be a two-column, tab-separated table inside a code block. The format is rigid and must follow these rules exactly:
Column 1 Header: Period
Column 2 Header: Time
The labels in the Period column are fixed and must always be in this order:
HR
1
2-11
2-10/12
3
4
5
6
7
8
Logic for Extracting Times
To find the correct time for each period label, use the following logic:
HR: Find the time for "Homeroom".
1, 3, 4, 5, 6, 7: Find the time for the corresponding Period number (P1, P3, P4, etc.).
2-11: This is a special case. Look at the schedule block for Period 2 and find the class time specifically for Grade 11. Ignore their break time.
2-10/12: This is also a special case. Look at the schedule block for Period 2 and find the class time specifically for Grade 10 and Grade 12. Ignore their break time.
8: Find the time for the final slot of the day, which is usually "Activity and Club Hour" or a special event like "Town Hall".
Default Behavior
If the user provides a new schedule, use it.
If the user asks for a schedule without specifying which one, use the current day of the week to decide. If it's a Wednesday, provide the Wednesday Schedule. For any other weekday, provide the Regular Day Schedule.
Always state which schedule you are providing (e.g., "Here is the Regular Day schedule.").
Always present your final table in a markdown code block for easy copying.
```

