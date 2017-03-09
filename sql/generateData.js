var fs = require('fs');
var util = require('util');
var data = JSON.parse(fs.readFileSync('./sql/test_assignment.json'));


for (var i = 0 ; i < data.length; i++) {
    var course = data[i];
    var courseFullName = course.Name.split(":");
    var courseName = courseFullName[0].trim();
    var courseDescription = courseFullName[1].trim();
    console.log(util.format('INSERT INTO `Course`(code, name, description, credits) VALUES(%s, \'%s\', \'%s\', %s);'), i + 1, courseName, courseDescription, course.Credits);

    var classes = course.Classes;
    for (var j = 0 ; j < classes.length; j++) {
        var claz = classes[j];
        var day = claz.Day;
        var start = extractDateTime(claz.StartTime);
        var end = extractDateTime(claz.EndTime);
        console.log(util.format('INSERT INTO `Class`(courseCode, day, startTime, endTime) VALUES(%s, \'%s\', \'%s\', \'%s\');'), i + 1, day, start, end)
    }
}

function extractDateTime(string) {
    return string.substring(string.indexOf("'") + 1, string.lastIndexOf("'"));
}


