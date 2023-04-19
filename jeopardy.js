const JEO_URL = "https://jservice.io/api/";
const CAT_ROW = 6;
const CLUES_COLUMN = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",h
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

 async function getCategoryIds() {
  // ask for 100 categories [most we can ask for], so we can pick random
  let response = await axios.get(`${JEO_URL}categories?count=100`);
  let catIds = response.data.map(c => c.id);
  return _.sampleSize(catIds, CAT_ROW);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  let response = await axios.get(`${JEO_URL}category?id=${catId}`);
  let cat = response.data;
  let allClues = cat.clues;
  let randomClues = _.sampleSize(allClues, CLUES_COLUMN);
  let clues = randomClues.map(c => ({
    question: c.question,
    answer: c.answer,
    showing: null,
  }));

  return {title : cat.title, clues}
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  // Add row with headers for categories
  $("#jeo thead").empty();
  let tr = $("<tr>");
  for (let catIdx = 0; catIdx < CAT_ROW; catIdx++) {
    tr.append($("<th>").text(categories[catIdx].title));
  }
  $("#jeo thead").append(tr);

  // Add rows with questions for each category
  $("#jeo tbody").empty();
  for (let clueIdx = 0; clueIdx < CLUES_COLUMN; clueIdx++) {
    let tr = $("<tr>");
    for (let catIdx = 0; catIdx < CAT_ROW; catIdx++) {
      tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
    }
    $("#jeo tbody").append(tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

 function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return
  }

  // Update text of cell
  $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#jeo").hide();
  $(".spin").show();
  $("#restart").text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $(".spin").hide();
  $("#jeo").show();
  $("#restart").text("Restart");
}


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

 async function setupAndStart() {
  let catIds = await getCategoryIds();

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */

$("#restart").on("click", showLoadingView);
$("#restart").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */

$(async function () {
  setupAndStart();
  $("#jeo").on("click", "td", handleClick);
}
);



const colors = ["navy", "cornflowerblue"];
let currentColorIndex = 0;

// Function to change the h1 element's color using jQuery
function changeColor() {
  $("h1").css("color", colors[currentColorIndex]);
  currentColorIndex = (currentColorIndex + 1) % colors.length;
}

// Change the h1 element's color every 1 second
setInterval(changeColor, 1000);
