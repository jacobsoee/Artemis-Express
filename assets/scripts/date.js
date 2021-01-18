let unix_dates = document.getElementsByClassName("dato")

for (let i = 0; i < unix_dates.length; i++) {
    let unix_timestamp = parseInt(unix_dates[i].innerHTML, 10);
    let fullDate = new Date(unix_timestamp);
    let months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let year = fullDate.getFullYear();
    let month = months[fullDate.getMonth()];
    let date = fullDate.getDate();
    let hour = fullDate.getHours();
    let min = fullDate.getMinutes();
    let sec = fullDate.getSeconds();
    let time = date + '/' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec;
    unix_dates[i].innerHTML = time;

}