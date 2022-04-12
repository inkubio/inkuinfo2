import {api_key, calendar_id} from "./secret.js";

const monthNames = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
                    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];
const weekdays = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];

const updateEvents = new Event('updateEvents');

let state = {
    _data: {},
    set data(val) {
        //let valueChanged = JSON.stringify(this._data) !== JSON.stringify(val)
        this._data = val
        window.dispatchEvent(updateEvents)
    },
    get data() {
        return this._data
    },
}

let start_date = Date.now()

async function loadEvents() {
    let calendar_url = new URL("https://www.googleapis.com/calendar/v3/calendars/" + calendar_id + "/events")
    let minDate = new Date(start_date);
    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    let params = {
        key: api_key,
        timeMin: minDate.toISOString(),
        maxResults: 6,
        orderBy: "startTime",
        singleEvents: true,
    }
    calendar_url.search = new URLSearchParams(params).toString()
    state.data = await fetch(calendar_url)
        .then(response => response.json())
        .then(data => data["items"])
    setTimeout(loadEvents, 10*1000)
}
function updateCalendar() {
    if ('content' in document.createElement('template')) {
        let calendar_items = state.data;

        let events = ["#event1", "#event2", "#event3", "#event4", "#event5", "#event6"];
        events.forEach((e, i) => {
            let event = document.querySelector(e);
            event.innerHTML = "";

            let template = document.querySelector("#event");

            let clone = template.content.cloneNode(true);

            let month = clone.querySelector(".month");
            let day = clone.querySelector(".day");
            let weekday = clone.querySelector(".weekday");

            let start_time = clone.querySelector(".start_time_field");
            let end_time = clone.querySelector(".end_time_field");

            let name = clone.querySelector(".name");
            let location = clone.querySelector(".location");

            let item = calendar_items[i]

            // If calendar item does not exist return
            if (item == null) {
                return
            }

            let start_date = new Date(item.start.dateTime || item.start.date)
            let end_date = new Date(item.end.dateTime || item.end.date)

            month.textContent = monthNames[start_date.getMonth()];

            // If this field exist, it is a whole day event (no time defined)
            let isWholeDay = !!item.start.date;

            // Formatting time and day differently depending if it is a whole day event
            if (isWholeDay) {
                day.textContent = (end_date.getTime() - start_date.getTime() === 24*60*60*1000) ? start_date.getDate()
                    : start_date.getDate() + " - " + (end_date.getDate()-1);
                start_time.textContent = "";
                end_time.textContent = "";
            } else {
                day.textContent = start_date.getDate() === end_date.getDate() ? start_date.getDate()
                    : start_date.getDate() + " - " + end_date.getDate();
                start_time.textContent = ("0" + start_date.getHours()).slice(-2) + ":"
                    + ("0" + start_date.getMinutes()).slice(-2) + " - ";

                end_time.textContent = ("0" + end_date.getHours()).slice(-2) + ":"
                    + ("0" + end_date.getMinutes()).slice(-2)
            }

            weekday.textContent = weekdays[start_date.getDay()]

            name.textContent = item["summary"]
            location.textContent = item["location"]?.split(",")[0]

            // Update with new data
            event.appendChild(clone);
        })

    } else {
        console.log("HTML Templates not supported")
    }
}

function updateClock() {
    let clock = document.querySelector("#clock")
    let date = new Date(Date.now())
    clock.textContent = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
}

window.addEventListener('DOMContentLoaded', loadEvents)
window.addEventListener('updateEvents', updateCalendar)

setTimeout(loadEvents, 10*1000)
setInterval(updateClock, 1000)