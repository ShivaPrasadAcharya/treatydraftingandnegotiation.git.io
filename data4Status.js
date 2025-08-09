var data4Status = `s.no,year,month,day of month,day of week,benchstatus
99,२०८१,०४,२३,बुधवार,bench held
100,२०८१,०४,३०,बुधवार,bench not held
101,२०८१,०५,०५,बुधवार,bench held
102,२०८१,०५,१२,बुधवार,holiday
103,२०८१,०५,१९,बुधवार,bench held`;

// Dataset metadata
var data4StatusInfo = {
    name: "STATUS",
    description: "status of the bench held by the Constitutional Bench Supreme Court of Nepal",
    emoji: "🔗",
    columns: 6,
    primaryKey: "benchstatus",
    rowColors: {
        "holiday": "red",
        "bench not held": "blue",
        "bench held": "default"
    }
};